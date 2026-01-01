<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Role;
use App\Http\Controllers\UserNotificationController;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class UserController extends Controller
{
    public function __construct()
    {
        // Middleware xác thực có thể được thêm vào đây nếu cần
        // $this->middleware('auth:sanctum');
    }
    
    /**
     * Hiển thị danh sách người dùng
     */
    public function index(Request $request)
    {
        $query = User::with(['role', 'profile']);
        
        // Lọc theo role
        if ($request->has('role_id')) {
            $query->where('role_id', $request->role_id);
        }
        
        // Lọc theo trạng thái
        if ($request->has('is_active')) {
            $query->where('is_active', $request->is_active);
        }
        
        // Tìm kiếm
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('username', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('id', 'like', "%{$search}%")
                  ->orWhereHas('profile', function($q2) use ($search) {
                      $q2->where('full_name', 'like', "%{$search}%")
                         ->orWhere('phone', 'like', "%{$search}%");
                  });
            });
        }
        
        // Sắp xếp
        $sortField = $request->get('sort_field', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortField, $sortOrder);
        
        // Phân trang
        $perPage = $request->get('per_page', 15);
        $users = $query->paginate($perPage);
        
        return response()->json([
            'success' => true,
            'data' => $users
        ]);
    }
    
    /**
     * Hiển thị chi tiết người dùng
     */
    public function show($id)
    {
        $user = User::with(['role', 'profile', 'addresses', 'orders'])
                    ->find($id);
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Người dùng không tồn tại'
            ], 404);
        }
        
        return response()->json([
            'success' => true,
            'data' => $user
        ]);
    }
    
    /**
     * Tạo ID mới dựa trên role
     */
    private function generateUserId($roleId)
    {
        // Prefix dựa trên role
        $prefixes = [
            'R01' => 'AD',  // Admin
            'R02' => 'MN',  // Manager
            'R03' => 'ST',  // Staff
            'R04' => 'CT',  // Customer
            'R05' => 'SP',  // Shipper
        ];
        
        $prefix = $prefixes[$roleId] ?? 'US'; // Mặc định US nếu không tìm thấy
        
        // Tìm user cuối cùng có cùng prefix
        $lastUser = User::where('id', 'like', $prefix . '%')
                       ->orderBy('id', 'desc')
                       ->first();
        
        if ($lastUser) {
            // Lấy số từ ID cũ và tăng lên
            $lastNumber = (int) substr($lastUser->id, strlen($prefix));
            $newNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
        } else {
            $newNumber = '0001';
        }
        
        return $prefix . $newNumber;
    }
    
    /**
     * Tạo người dùng mới
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'username' => 'required|string|min:3|max:16|unique:users',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:6',
            'role_id' => 'required|exists:roles,id',
            'full_name' => 'nullable|string|max:50',
            'phone' => 'nullable|string|size:10',
            'birthday' => 'nullable|date',
            'gender' => 'nullable|in:Nam,Nữ,Khác',
            'is_active' => 'boolean'
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        try {
            DB::beginTransaction();
            
            // Tạo ID tự động
            $userId = $this->generateUserId($request->role_id);
            
            // Tạo user
            $user = User::create([
                'id' => $userId,
                'username' => $request->username,
                'password_hash' => bcrypt($request->password),
                'email' => $request->email,
                'role_id' => $request->role_id,
                'is_active' => $request->is_active ?? true,
            ]);
            
            // Tạo profile nếu có thông tin
            if ($request->hasAny(['full_name', 'phone', 'birthday', 'gender'])) {
                $user->profile()->create([
                    'full_name' => $request->full_name,
                    'phone' => $request->phone,
                    'birthday' => $request->birthday,
                    'gender' => $request->gender,
                ]);
            }
            
            // Lấy thông tin người tạo (nếu có xác thực)
            $createdBy = auth()->check() ? auth()->user()->username : 'System';
            
            // Tạo thông báo hệ thống
            UserNotificationController::notifyUserCreated($user, $createdBy);
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'Tạo người dùng thành công',
                'data' => $user->load(['role', 'profile'])
            ], 201);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi tạo người dùng: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Cập nhật người dùng
     */
    public function update(Request $request, $id)
    {
        $user = User::find($id);
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Người dùng không tồn tại'
            ], 404);
        }
        
        $validator = Validator::make($request->all(), [
            'username' => 'sometimes|string|min:3|max:16|unique:users,username,' . $id . ',id',
            'email' => 'sometimes|email|unique:users,email,' . $id . ',id',
            'password' => 'sometimes|string|min:6',
            'role_id' => 'sometimes|exists:roles,id',
            'full_name' => 'nullable|string|max:50',
            'phone' => 'nullable|string|size:10',
            'birthday' => 'nullable|date',
            'gender' => 'nullable|in:Nam,Nữ,Khác',
            'is_active' => 'boolean'
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        try {
            DB::beginTransaction();
            
            // Lưu thông tin cũ để so sánh
            $oldUserData = $user->toArray();
            $oldProfileData = $user->profile ? $user->profile->toArray() : [];
            
            // Kiểm tra nếu thay đổi role thì cần tạo ID mới
            if ($request->has('role_id') && $request->role_id != $user->role_id) {
                $newId = $this->generateUserId($request->role_id);
                $request->merge(['id' => $newId]);
            }
            
            // Cập nhật user
            $updateData = $request->only(['username', 'email', 'role_id', 'is_active']);
            
            if ($request->has('password')) {
                $updateData['password_hash'] = bcrypt($request->password);
            }
            
            if ($request->has('id')) {
                $updateData['id'] = $request->id;
            }
            
            $user->update($updateData);
            
            // Cập nhật hoặc tạo profile
            if ($request->hasAny(['full_name', 'phone', 'birthday', 'gender'])) {
                $profileData = $request->only(['full_name', 'phone', 'birthday', 'gender']);
                
                if ($user->profile) {
                    $user->profile->update($profileData);
                } else {
                    $user->profile()->create($profileData);
                }
            }
            
            // Lấy thông tin người cập nhật
            $updatedBy = auth()->check() ? auth()->user()->username : 'System';
            
            // Xác định các trường thay đổi
            $changes = [];
            foreach ($updateData as $key => $value) {
                if (isset($oldUserData[$key]) && $oldUserData[$key] != $value) {
                    $changes[$key] = $value;
                }
            }
            
            // Tạo thông báo hệ thống
            UserNotificationController::notifyUserUpdated($user, $updatedBy, $changes);
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'Cập nhật người dùng thành công',
                'data' => $user->fresh()->load(['role', 'profile'])
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi cập nhật người dùng: ' . $e->getMessage()
            ], 500);
        }
    }
    
  
    public function destroy($id)
    {
        $user = User::find($id);
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Người dùng không tồn tại'
            ], 404);
        }
        
        // Không cho xóa admin
        if ($user->role_id === 'R01') {
            return response()->json([
                'success' => false,
                'message' => 'Không thể xóa thông tin tài khoản quản trị viên'
            ], 403);
        }
        
        try {
            DB::beginTransaction();
            
            // Lưu thông tin user TRƯỚC KHI xóa (để tạo thông báo)
            $userData = [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'role_id' => $user->role_id,
                'full_name' => $user->profile ? $user->profile->full_name : null
            ];
            
            // Lấy thông tin người xóa
            $deletedBy = auth()->check() ? auth()->user()->username : 'System';
            
            // 1. Xóa thông tin profile TRƯỚC (vì có khóa ngoại)
            if ($user->profile) {
                $user->profile->delete();
            }
            
            UserNotificationController::notifyUserInfoDeleted($userData, $deletedBy);

            $user->update([
                'username' => 'deleted_user_' . $user->id, // Đổi username để tránh trùng
                'email' => 'deleted_' . time() . '_' . $user->email, // Đánh dấu email đã xóa
                'password_hash' => '', // Xóa password
                'is_active' => false, // Vô hiệu hóa tài khoản
                'role_id' => 'R04', // Đặt về role customer mặc định (hoặc giữ nguyên)
            ]);
          
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'Đã xóa thông tin người dùng thành công. Các thông báo và dữ liệu liên quan vẫn được giữ nguyên.',
                'data' => [
                    'user_id' => $userData['id'],
                    'deleted_info' => ['profile', 'email', 'password', 'username'],
                    'preserved_data' => ['user_notifications', 'orders', 'addresses', 'reviews', 'messages']
                ]
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi xóa thông tin người dùng: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Xóa hoàn toàn người dùng (xóa cả thông báo và tất cả dữ liệu liên quan)
     * CHỈ DÙNG KHI CẦN THIẾT
     */
    public function forceDestroy($id)
    {
        // Chỉ admin mới được thực hiện
        if (!auth()->check() || auth()->user()->role_id !== 'R01') {
            return response()->json([
                'success' => false,
                'message' => 'Chỉ quản trị viên mới có quyền xóa hoàn toàn người dùng'
            ], 403);
        }
        
        $user = User::find($id);
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Người dùng không tồn tại'
            ], 404);
        }
        
        try {
            DB::beginTransaction();
            
            // Lưu thông tin trước khi xóa (cho log)
            $userData = [
                'username' => $user->username,
                'email' => $user->email,
                'role_id' => $user->role_id
            ];
            
            // 1. Xóa tất cả thông báo của user trước
            \App\Models\UserNotification::where('user_id', $id)->delete();
            
            // 2. Xóa profile
            if ($user->profile) {
                $user->profile->delete();
            }
            
            // 3. Xóa user
            $user->delete();
            
            // 4. Tạo thông báo cho admin về việc xóa hoàn toàn
            $deletedBy = auth()->user()->username;
            UserNotificationController::notifyUserForceDeleted($userData, $deletedBy);
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'Đã xóa hoàn toàn người dùng và tất cả dữ liệu liên quan'
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi xóa hoàn toàn người dùng: ' . $e->getMessage()
            ], 500);
        }
    }
        
    /**
     * Kích hoạt/Vô hiệu hóa người dùng
     */
    public function toggleStatus($id)
    {
        $user = User::find($id);
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Người dùng không tồn tại'
            ], 404);
        }
        
        $newStatus = !$user->is_active;
        $user->update(['is_active' => $newStatus]);
        
        // Lấy thông tin người thay đổi
        $changedBy = auth()->check() ? auth()->user()->username : 'System';
        
        // Tạo thông báo hệ thống
        UserNotificationController::notifyUserStatusChanged($user, $newStatus, $changedBy);
        
        return response()->json([
            'success' => true,
            'message' => $user->is_active ? 'Đã kích hoạt người dùng' : 'Đã vô hiệu hóa người dùng',
            'data' => $user
        ]);
    }
    
    /**
     * Lấy danh sách người dùng theo role
     */
    public function getByRole($roleId)
    {
        $users = User::with(['profile'])
                    ->where('role_id', $roleId)
                    ->orderBy('created_at', 'desc')
                    ->get();
        
        return response()->json([
            'success' => true,
            'data' => $users
        ]);
    }
    
    /**
     * Thống kê người dùng
     */
    public function statistics()
    {
        $totalUsers = User::count();
        $activeUsers = User::where('is_active', true)->count();
        
        $usersByRole = User::select('role_id', DB::raw('count(*) as count'))
                          ->groupBy('role_id')
                          ->with('role')
                          ->get();
        
        $recentUsers = User::with(['role', 'profile'])
                          ->orderBy('created_at', 'desc')
                          ->limit(10)
                          ->get();
        
        return response()->json([
            'success' => true,
            'data' => [
                'total_users' => $totalUsers,
                'active_users' => $activeUsers,
                'users_by_role' => $usersByRole,
                'recent_users' => $recentUsers
            ]
        ]);
    }
    
    /**
     * Lấy lịch sử đơn hàng của người dùng
     */
    public function orderHistory($id)
    {
        $user = User::find($id);
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Người dùng không tồn tại'
            ], 404);
        }
        
        $orders = $user->orders()
                      ->with(['orderItems.product'])
                      ->orderBy('created_at', 'desc')
                      ->paginate(10);
        
        return response()->json([
            'success' => true,
            'data' => $orders
        ]);
    }

}