<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\UserNotification;
use App\Models\User;
use Illuminate\Support\Facades\Log;


class UserNotificationController extends Controller
{
    /**
     * Hiển thị danh sách thông báo của người dùng
     */
    public function index(Request $request)
    {
        $query = UserNotification::query();
        
        // Lọc theo user_id
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }
        
        // Lọc theo type
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }
        
        // Lọc theo trạng thái đọc
        if ($request->has('is_read')) {
            $query->where('is_read', $request->is_read);
        }
        
        // Tìm kiếm
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%");
            });
        }
        
        // Sắp xếp
        $sortField = $request->get('sort_field', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortField, $sortOrder);
        
        // Phân trang
        $perPage = $request->get('per_page', 20);
        $notifications = $query->paginate($perPage);
        
        return response()->json([
            'success' => true,
            'data' => $notifications
        ]);
    }
    
    /**
     * Tạo ID mới cho notification
     */
    private function generateNotificationId()
    {
        $lastNotification = UserNotification::orderBy('id', 'desc')->first();
        
        if ($lastNotification) {
            return $lastNotification->id + 1;
        } else {
            return 1;
        }
    }
    
    /**
     * Tạo thông báo hệ thống khi thao tác với người dùng
     * Phương thức này sẽ được gọi từ các controller khác
     */
    public static function createSystemNotification($userId, $title, $content, $type = 'system')
    {
        try {
            $notificationId = (new self())->generateNotificationId();
            
            $notification = UserNotification::create([
                'id' => $notificationId,
                'user_id' => $userId,
                'type' => $type,
                'title' => $title,
                'content' => $content,
                'is_read' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            
            return $notification;
        } catch (\Exception $e) {
            Log::error('Lỗi khi tạo thông báo hệ thống: ' . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Tạo thông báo tạo người dùng mới
     * Được gọi từ UserController sau khi tạo user thành công
     */
    public static function notifyUserCreated($user, $createdBy = null)
    {
        $title = "Tài khoản mới được tạo";
        $content = "Tài khoản {$user->username} ({$user->email}) đã được tạo thành công.";
        
        if ($createdBy) {
            $content .= " Được tạo bởi: {$createdBy}.";
        }
        
        // Tạo thông báo cho admin (R01) và manager (R02)
        $adminUsers = User::whereIn('role_id', ['R01', 'R02'])->get();
        
        foreach ($adminUsers as $adminUser) {
            self::createSystemNotification($adminUser->id, $title, $content, 'system');
        }
        
        // Tạo thông báo cho chính user đó nếu họ là staff/customer/shipper
        if (in_array($user->role_id, ['R03', 'R04', 'R05'])) {
            self::createSystemNotification($user->id, "Chào mừng bạn đến với hệ thống", "Tài khoản '+$user->id+' đã được tạo thành công. Vui lòng kiểm tra email để xác thực tài khoản.", 'system');
        }
    }
        
    /**
     * Tạo thông báo xóa người dùng
     * Được gọi từ UserController sau khi xóa user thành công
     */
    public static function notifyUserDeleted($userData, $deletedBy = null)
    {
        $title = "Tài khoản đã bị xóa";
        $content = "Tài khoản {$userData['username']} ({$userData['email']}) đã bị xóa khỏi hệ thống.";
        
        if ($deletedBy) {
            $content .= " Xóa bởi: {$deletedBy}.";
        }
        
        // Tạo thông báo cho admin/manager
        $adminUsers = User::whereIn('role_id', ['R01', 'R02'])->get();
        
        foreach ($adminUsers as $adminUser) {
            self::createSystemNotification($adminUser->id, $title, $content, 'system');
        }
    }
    
    /**
     * Tạo thông báo thay đổi trạng thái người dùng
     */
    public static function notifyUserStatusChanged($user, $newStatus, $changedBy = null)
    {
        $statusText = $newStatus ? 'kích hoạt' : 'vô hiệu hóa';
        $title = "Trạng thái tài khoản thay đổi";
        $content = "Tài khoản {$user->username} đã được {$statusText}.";
        
        if ($changedBy) {
            $content .= " Thay đổi bởi: {$changedBy}.";
        }
        
        // Tạo thông báo cho admin/manager
        $adminUsers = User::whereIn('role_id', ['R01', 'R02'])->get();
        
        foreach ($adminUsers as $adminUser) {
            self::createSystemNotification($adminUser->id, $title, $content, 'system');
        }
        
        // Tạo thông báo cho chính user đó nếu bị vô hiệu hóa
        if (!$newStatus) {
            self::createSystemNotification($user->id, "Tài khoản '+$user->id+' bị vô hiệu hóa", "Tài khoản '+$user->id+' đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên để biết thêm chi tiết.", 'system');
        }
    }
    
    /**
     * Đánh dấu thông báo đã đọc
     */
    public function markAsRead($id)
    {
        $notification = UserNotification::find($id);
        
        if (!$notification) {
            return response()->json([
                'success' => false,
                'message' => 'Thông báo không tồn tại'
            ], 404);
        }
        
        // Kiểm tra quyền: chỉ user sở hữu hoặc admin có thể đánh dấu đọc
        $user = auth()->user();
        if ($user->role_id !== 'R01' && $user->id !== $notification->user_id) {
            return response()->json([
                'success' => false,
                'message' => 'Không có quyền thực hiện thao tác này'
            ], 403);
        }
        
        $notification->update([
            'is_read' => true,
            'updated_at' => now()
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Đã đánh dấu thông báo là đã đọc',
            'data' => $notification
        ]);
    }
    
    
    /**
     * Xóa thông báo
     */
    public function destroy($id)
    {
        $notification = UserNotification::find($id);
        
        if (!$notification) {
            return response()->json([
                'success' => false,
                'message' => 'Thông báo không tồn tại'
            ], 404);
        }
        
        // Kiểm tra quyền: chỉ user sở hữu hoặc admin có thể xóa
        $user = auth()->user();
        if ($user->role_id !== 'R01' && $user->id !== $notification->user_id) {
            return response()->json([
                'success' => false,
                'message' => 'Không có quyền thực hiện thao tác này'
            ], 403);
        }
        
        $notification->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Xóa thông báo thành công'
        ]);
    }

    /**
     * Tạo thông báo xóa thông tin người dùng (giữ nguyên thông báo cũ)
     */
    public static function notifyUserInfoDeleted($userData, $deletedBy = null)
    {
        try {
            Log::info('Bắt đầu tạo thông báo xóa user info', $userData);
            
            $title = "Thông tin người dùng đã bị xóa";
            
            $content = "Thông tin cá nhân của người dùng đã bị xóa:\n";
            $content .= "• User ID: {$userData['id']}\n";
            $content .= "• Tên đăng nhập cũ: {$userData['username']}\n";
            
            if ($userData['full_name']) {
                $content .= "• Họ tên: {$userData['full_name']}\n";
            }
            
            $content .= "• Email cũ: {$userData['email']}\n";
            $content .= "• Vai trò: {$userData['role_id']}\n\n";
            
            $content .= "LƯU Ý: Các thông báo cũ của người dùng này VẪN ĐƯỢC GIỮ NGUYÊN trong hệ thống.";
            
            if ($deletedBy) {
                $content .= "\n\nThao tác bởi: {$deletedBy}";
            }
            
            Log::info('Nội dung thông báo đã tạo', ['content' => $content]);
            
            // Tạo thông báo cho admin/manager
            $adminUsers = User::whereIn('role_id', ['R01', 'R02'])->get();
            
            Log::info('Tìm admin/manager', ['count' => $adminUsers->count()]);
            
            foreach ($adminUsers as $adminUser) {
                Log::info('Tạo thông báo cho admin', [
                    'admin_id' => $adminUser->id,
                    'admin_username' => $adminUser->username
                ]);
                
                $result = self::createSystemNotification($adminUser->id, $title, $content, 'system');
                
                Log::info('Kết quả tạo thông báo', [
                    'admin_id' => $adminUser->id,
                    'result' => $result ? 'thành công' : 'thất bại'
                ]);
            }
            
            Log::info('Hoàn tất tạo thông báo');
            
        } catch (\Exception $e) {
            Log::error('Lỗi khi tạo thông báo xóa user info: ' . $e->getMessage());
        }
    }
    
    /**
     * Đếm số thông báo chưa đọc
     */
    public function countUnread(Request $request)
    {
        $userId = $request->user_id ?? auth()->id();
        
        $count = UserNotification::where('user_id', $userId)
                                ->where('is_read', false)
                                ->count();
        
        return response()->json([
            'success' => true,
            'data' => [
                'user_id' => $userId,
                'unread_count' => $count
            ]
        ]);
    }
    
    /**
     * Lấy thông báo của người dùng hiện tại
     */
    public function myNotifications(Request $request)
    {
        $userId = auth()->id();
        
        $query = UserNotification::where('user_id', $userId)
                                ->orderBy('created_at', 'desc');
        
        // Lọc theo type
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }
        
        // Lọc theo trạng thái đọc
        if ($request->has('is_read')) {
            $query->where('is_read', $request->is_read);
        }
        
        $perPage = $request->get('per_page', 20);
        $notifications = $query->paginate($perPage);
        
        return response()->json([
            'success' => true,
            'data' => $notifications
        ]);
    }
}