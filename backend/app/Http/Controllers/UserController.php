<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use App\Models\OrderItem;

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
        $user = User::with([
            'role', 
            'profile',
            'addresses.commune.province', // Load commune và province
            'notifications'
        ])->find($id);
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Người dùng không tồn tại'
            ], 404);
        }
        
        // Format lại dữ liệu địa chỉ để hiển thị rõ tỉnh và xã phường
        $formattedUser = $user->toArray();
        
        if (isset($formattedUser['addresses'])) {
            foreach ($formattedUser['addresses'] as &$address) {
                if (isset($address['commune'])) {
                    $address['province_name'] = $address['commune']['province']['name'] ?? null;
                    $address['province_code'] = $address['commune']['province']['code'] ?? null;
                    $address['commune_name'] = $address['commune']['name'] ?? null;
                    $address['commune_code'] = $address['commune']['code'] ?? null;
                    
                    // Xóa dữ liệu commune để tránh trùng lặp
                    unset($address['commune']);
                }
            }
        }
        
        return response()->json([
            'success' => true,
            'data' => $formattedUser
        ]);
    }
    
    
    /**
     * Tạo ID mới dựa trên role
     */
    private function generateUserId($roleId)
    {
        $userCount = User::where('role_id', $roleId)->count();
        $nextNumber = $userCount + 1;
        $formattedNumber = str_pad($nextNumber, 3, '0', STR_PAD_LEFT);
        return $roleId . $formattedNumber; 
    }
    
    /**
     * Tạo người dùng mới
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'username' => 'required|string|min:8|max:16|unique:users',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:6|max:12',
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
            
            // Tạo thông báo hệ thống
            $this->createUserNotification($user->id, 'system', 'Tài khoản được tạo', 'Tài khoản của bạn đã được tạo thành công.');
            
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
     * Cập nhật thông tin cơ bản (từ nhánh feature/User/UpdateUser)
     */
public function updateBasicInfo(Request $request, $id)
{
    $request->validate([
        'email'     => 'nullable|email',
        'username'  => 'nullable|string|max:255',
        'full_name' => 'nullable|string|max:255',
        'phone'     => 'nullable|string|max:20',
        'birthday'  => 'nullable|date',
        'gender'    => 'nullable|in:male,female,other,Nam,Nữ,Khác',
    ]);

    $user = User::find($id);
    if (!$user) {
        return response()->json(['message' => 'User not found'], 404);
    }

    DB::beginTransaction();
    try {
        $userChanged = false;

        // -----------------------------
        // CẬP NHẬT USER
        // -----------------------------
        if ($request->filled('email')) {
            $user->email = $request->email;
            $userChanged = $user->isDirty();
            if ($userChanged) $user->save();
        }

        // -----------------------------
        // CẬP NHẬT PROFILE
        // -----------------------------
        $profile = $user->profile()->firstOrNew(['user_id' => $user->id]);

        $fields = ['full_name', 'phone', 'birthday', 'gender'];
        foreach ($fields as $field) {
            if ($request->filled($field)) {
                // Map gender từ frontend nếu cần
                if ($field === 'gender') {
                    $genderMap = [
                        'male' => 'Nam',
                        'female' => 'Nữ',
                        'other' => 'Khác',
                        'Nam' => 'Nam',
                        'Nữ' => 'Nữ',
                        'Khác' => 'Khác',
                    ];
                    $profile->gender = $genderMap[$request->gender] ?? $profile->gender;
                } else {
                    $profile->$field = $request->$field;
                }
            }
        }

        $profileChanged = $profile->isDirty();
        if ($profileChanged) $profile->save();

        // -----------------------------
        // KHÔNG CÓ GÌ THAY ĐỔỔI
        // -----------------------------
        if (!$userChanged && !$profileChanged) {
            DB::rollBack();
            return response()->json([
                'message' => 'Không có thông tin nào thay đổi'
            ], 200);
        }

        DB::commit();

        // Tạo thông báo nếu có thay đổi
        if ($userChanged || $profileChanged) {
            $this->createUserNotification($user->id);
        }

        return response()->json([
            'message' => 'Cập nhật thông tin thành công',
            'data' => $user->load('profile')
        ]);

    } catch (\Exception $e) {
        DB::rollBack();
        return response()->json([
            'message' => 'Cập nhật thất bại',
            'error' => $e->getMessage()
        ], 500);
    }
}


    
    /**
     * Cập nhật toàn bộ thông tin người dùng (admin)
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
            
            // Tạo thông báo hệ thống
            $this->createUserNotification($user->id, 'system', 'Thông tin'+$user->id+'được cập nhật', 'Thông tin tài khoản của bạn đã được cập nhật bởi quản trị viên.');

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
    
    /**
     * Upload avatar (từ nhánh feature/User/UpdateUser)
     */
    public function uploadAvatar(Request $request, $id)
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpg,jpeg,png|max:2048'
        ]);

        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        // Lưu file
        $path = $request->file('avatar')->store('avatars', 'public');

        // Lưu DB
        $user->profile()->updateOrCreate(
            ['user_id' => $user->id],
            ['avatar_url' => $path]
        );

        $this->createUserNotification($user->id);

        return response()->json([
            'message' => 'Upload avatar thành công',
            'avatar_url' => asset('storage/' . $path)
        ], 200);
    }
    
    /**
     * Đổi mật khẩu (từ nhánh feature/User/UpdateUser)
     */
    public function changePassword(Request $request, $id)
    {
        $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|min:6|confirmed'
        ]);

        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        // ✅ CHECK mật khẩu cũ (text vs hash)
        if (!Hash::check($request->current_password, $user->password_hash)) {
            return response()->json([
                'message' => 'Mật khẩu hiện tại không đúng'
            ], 400);
        }

        // ✅ HASH mật khẩu mới
        $user->password_hash = Hash::make($request->new_password);
        $user->save();
        $this->createUserNotification($user->id);
        return response()->json([
            'message' => 'Đổi mật khẩu thành công'
        ]);
    }
    
    /**
     * Xóa (vô hiệu hóa) người dùng
     */
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
            
            // Vô hiệu hóa tài khoản thay vì xóa
            $user->update([
                'username' => 'null',
                'email' => 'null',
                'password_hash' => 'null',
                'is_active' => false,
            ]);
            
            UserNotificationController::notifyUserInfoDeleted($userData, auth()->user()->username ?? 'System');
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'Đã vô hiệu hóa tài khoản thành công',
                'data' => [
                    'user_id' => $userData['id'],
                    'deactivated_info' => ['email', 'password', 'username'],
                ]
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi vô hiệu hóa tài khoản: ' . $e->getMessage()
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
        
        // Tạo thông báo hệ thống
        $this->createUserNotification(
            $user->id, 
            'system', 
            $newStatus ? 'Tài khoản '+$user->id+' được kích hoạt' : 'Tài khoản '+$user->id+' bị vô hiệu hóa',
            $newStatus ? 'Tài khoản '+$user->id+ 'đã được kích hoạt.' : 'Tài khoản '+$user->id+' đã bị vô hiệu hóa.'
        );
        
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
     * Tạo thông báo người dùng
     */
    private function createUserNotification($userId)
    {
        $last = UserNotification::orderBy('id', 'desc')->first();
        $newId = $last ? $last->id + 1 : 1;
    
        UserNotification::create([
            'id'         => $newId,
            'user_id'    => $userId,
            'type'       => 'system',
          'title'       => 'Thông tin tài khoản ' . $userId . ' đã được cập nhật',
            'content'     => 'Thông tin tài khoản người dùng ' . $userId . ' đã được cập nhật.',
            'is_read'    => false,
            'created_at'=> now(),
            'updated_at'=> now(),
        ]);
    }
    
        public function getPurchasedProducts(Request $request, $id)
    {
        try {
            $user = User::find($id);
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Người dùng không tồn tại'
                ], 404);
            }
            
            $products = OrderItem::select([
                    'products.id',
                    'products.name',
                    'products.slug',
                    'products.cover_image',
                    'products.author',
                    'product_details.sale_price as price',
                    'product_details.original_price',
                    DB::raw('MAX(order_items.created_at) as last_purchased'),
                    DB::raw('SUM(order_items.quantity) as total_purchased')
                ])
                ->join('orders', 'order_items.order_id', '=', 'orders.id')
                ->join('products', 'order_items.product_id', '=', 'products.id')
                ->leftJoin('product_details', 'order_items.product_details_id', '=', 'product_details.id')
                ->where('orders.user_id', $id)
                ->where('orders.status', '!=', 'cancelled')
                ->groupBy('products.id', 'products.name', 'products.slug', 'products.cover_image', 
                        'products.author', 'product_details.sale_price', 'product_details.original_price')
                ->orderBy('last_purchased', 'desc')
                ->get()
                ->map(function ($item) {
                    // Tính giảm giá
                    $discount = 0;
                    if ($item->original_price > 0 && $item->price > 0) {
                        $discount = round((($item->original_price - $item->price) / $item->original_price) * 100);
                    }
                    
                    return [
                        'id' => $item->id,
                        'name' => $item->name,
                        'slug' => $item->slug,
                        'image' => $item->cover_image,
                        'author' => $item->author,
                        'price' => (float) $item->price,
                        'original_price' => (float) $item->original_price,
                        'discount_percent' => $discount,
                        'last_purchased' => $item->last_purchased,
                        'total_purchased' => (int) $item->total_purchased
                    ];
                });
            
            return response()->json([
                'success' => true,
                'data' => $products
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi server',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}