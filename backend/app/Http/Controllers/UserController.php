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
            'username'  => 'required|string|min:8|max:16|unique:users,username',
            'email'     => 'required|email|unique:users,email',
            'password'  => 'required|string|min:6|max:12',
            'role_id'   => 'required|exists:roles,id',
            'full_name' => 'nullable|string|max:50',
            'phone'     => 'nullable|string|size:10',
            'birthday'  => 'nullable|date',
            'gender'    => 'nullable|in:Nam,Nữ,Khác',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors(),
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Tạo user_id
            $userId = $this->generateUserId($request->role_id);

            // Tạo user bằng MySQL query
            $currentTime = now()->format('Y-m-d H:i:s');
            $isActive = $request->has('is_active') ? ($request->is_active ? 1 : 0) : 1;
            
            DB::insert("
                INSERT INTO users (
                    id, 
                    username, 
                    email, 
                    password_hash, 
                    role_id, 
                    is_active, 
                    created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            ", [
                $userId,
                $request->username,
                $request->email,
                bcrypt($request->password),
                $request->role_id,
                $isActive,
                $currentTime
            ]);

            // Tạo profile nếu có ít nhất 1 giá trị hợp lệ
            if ($request->filled('full_name') ||
                $request->filled('phone') ||
                $request->filled('birthday') ||
                $request->filled('gender')) {
                
                // Format birthday nếu có
                $birthday = null;
                if ($request->filled('birthday')) {
                    $birthday = date('Y-m-d', strtotime($request->birthday));
                }

                DB::insert("
                    INSERT INTO profiles (
                        user_id, 
                        full_name, 
                        phone, 
                        birthday, 
                        gender
                    ) VALUES (?, ?, ?, ?, ?)
                ", [
                    $userId,
                    $request->filled('full_name') ? $request->full_name : null,
                    $request->filled('phone') ? $request->phone : null,
                    $birthday,
                    $request->filled('gender') ? $request->gender : null
                ]);
            }

            // Lấy full_name cho thông báo
            $fullName = $request->filled('full_name') ? $request->full_name : 'Người dùng';
            
            // Tạo thông báo hệ thống
            UserNotification::add(
                $userId,
                'Tài khoản được tạo',
                'Tài khoản của ' . $fullName . ' (ID: ' . $userId . ') đã được tạo thành công.',
                'account'
            );

            // Lấy dữ liệu user vừa tạo để trả về response bằng MySQL query
            $user = DB::selectOne("
                SELECT 
                    u.*,
                    r.name as role_name,
                    p.full_name,
                    p.avatar_url,
                    p.phone,
                    p.birthday,
                    p.gender,
                    CASE 
                        WHEN u.is_active = 1 THEN 'Đang hoạt động'
                        ELSE 'Đã khóa'
                    END as status_text,
                    CASE 
                        WHEN p.gender = 'Nam' THEN 'Nam'
                        WHEN p.gender = 'Nữ' THEN 'Nữ'
                        WHEN p.gender = 'Khác' THEN 'Khác'
                        ELSE 'Không xác định'
                    END as gender_text,
                    DATE_FORMAT(u.created_at, '%d/%m/%Y %H:%i:%s') as created_at_raw
                FROM users u
                LEFT JOIN roles r ON u.role_id = r.id
                LEFT JOIN profiles p ON u.id = p.user_id
                WHERE u.id = ?
            ", [$userId]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Tạo người dùng thành công',
                'data'    => $user,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi tạo người dùng: ' . $e->getMessage(),
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
    public function update(Request $request, $id) {
        $user = DB::selectOne('SELECT * FROM users WHERE id = ?', [$id]);
        if (!$user) return response()->json(['success' => false, 'message' => 'Người dùng không tồn tại'], 404);
        
        // Convert role_id to string for validation
        $requestData = $request->all();
        if (isset($requestData['role_id'])) {
            $requestData['role_id'] = (string) $requestData['role_id'];
        }
        
        $validator = Validator::make($requestData, [
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
        
        if ($validator->fails()) return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        
        try {
            DB::beginTransaction();
            
            $newId = $id;
            if ($request->has('role_id') && $request->role_id != $user->role_id) {
                $newId = $this->generateUserId($request->role_id);
                $updates[] = 'id = ?'; 
                $values[] = $newId;
            }
            
            $updates = []; 
            $values = [];
            
            // Xử lý các trường cơ bản
            $basicFields = ['username', 'email', 'role_id'];
            foreach ($basicFields as $field) {
                if ($request->has($field)) { 
                    $updates[] = "$field = ?"; 
                    // Đảm bảo role_id là string
                    $value = $request->$field;
                    if ($field === 'role_id') {
                        $value = (string) $value;
                    }
                    $values[] = $value; 
                }
            }
            
            if ($request->has('is_active')) { 
                $updates[] = 'is_active = ?'; 
                $values[] = $request->is_active ? 1 : 0; 
            }
            
            if ($request->has('password')) { 
                $updates[] = 'password_hash = ?'; 
                $values[] = bcrypt($request->password); 
            }
            
            if (!empty($updates)) {
                $values[] = $id;
                DB::update('UPDATE users SET ' . implode(', ', $updates) . ' WHERE id = ?', $values);
                
                if ($newId != $id) {
                    foreach (['profiles', 'addresses', 'orders', 'user_notifications'] as $table) {
                        DB::update("UPDATE $table SET user_id = ? WHERE user_id = ?", [$newId, $id]);
                    }
                    $id = $newId;
                }
            }
            
            // Xử lý profile
            $profileFields = []; 
            $profileValues = [];
            
            if ($request->filled('full_name')) { 
                $profileFields[] = 'full_name = ?'; 
                $profileValues[] = $request->full_name; 
            }
            if ($request->filled('phone')) { 
                $profileFields[] = 'phone = ?'; 
                $profileValues[] = $request->phone; 
            }
            if ($request->filled('birthday')) { 
                $profileFields[] = 'birthday = ?'; 
                $profileValues[] = date('Y-m-d', strtotime($request->birthday)); 
            }
            if ($request->filled('gender')) { 
                $profileFields[] = 'gender = ?'; 
                $profileValues[] = $request->gender; 
            }
            
            if (!empty($profileFields)) {
                $existingProfile = DB::selectOne('SELECT 1 FROM profiles WHERE user_id = ?', [$id]);
                if ($existingProfile) {
                    $profileValues[] = $id;
                    DB::update('UPDATE profiles SET ' . implode(', ', $profileFields) . ' WHERE user_id = ?', $profileValues);
                } else {
                    $insertData = ['user_id' => $id]; 
                    $insertValues = [$id];
                    
                    if ($request->filled('full_name')) { 
                        $insertData['full_name'] = $request->full_name; 
                        $insertValues[] = $request->full_name; 
                    }
                    if ($request->filled('phone')) { 
                        $insertData['phone'] = $request->phone; 
                        $insertValues[] = $request->phone; 
                    }
                    if ($request->filled('birthday')) { 
                        $insertData['birthday'] = date('Y-m-d', strtotime($request->birthday)); 
                        $insertValues[] = $insertData['birthday']; 
                    }
                    if ($request->filled('gender')) { 
                        $insertData['gender'] = $request->gender; 
                        $insertValues[] = $request->gender; 
                    }
                    
                    $columns = implode(', ', array_keys($insertData)); 
                    $placeholders = implode(', ', array_fill(0, count($insertValues), '?'));
                    DB::insert("INSERT INTO profiles ($columns) VALUES ($placeholders)", $insertValues);
                }
            }
            
            $fullName = $request->filled('full_name') ? $request->full_name : 
                    (DB::selectOne('SELECT full_name FROM profiles WHERE user_id = ?', [$id])?->full_name ?? 'Người dùng');
            
            UserNotification::add($id, 'Thông tin được cập nhật', 
                'Thông tin tài khoản ' . $fullName . ' (ID: ' . $id . ') đã được cập nhật thành công.', 'account');
            
            $updatedUser = DB::selectOne("SELECT u.*, r.name as role_name, p.full_name, p.avatar_url, p.phone, p.birthday, p.gender, 
                IF(u.is_active = 1, 'Đang hoạt động', 'Đã khóa') as status_text, 
                COALESCE(p.gender, 'Không xác định') as gender_text, 
                DATE_FORMAT(u.created_at, '%d/%m/%Y %H:%i:%s') as created_at_raw 
                FROM users u 
                LEFT JOIN roles r ON u.role_id = r.id 
                LEFT JOIN profiles p ON u.id = p.user_id 
                WHERE u.id = ?", [$id]);
            
            DB::commit();
            return response()->json([
                'success' => true, 
                'message' => 'Cập nhật người dùng thành công', 
                'data' => $updatedUser
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
    // Backend - UserController.php
    public function destroy($id)
    {
        // 1. Lấy current user ID từ query parameter
        $currentUserId = request()->input('current_user_id');
        
        if (!$currentUserId) {
            return response()->json([
                'success' => false, 
                'message' => 'Thiếu thông tin người dùng hiện tại'
            ], 400);
        }
        
        // 2. Kiểm tra user tồn tại và lấy full_name
        $user = DB::selectOne("
            SELECT u.id, u.username, u.email, u.role_id, p.full_name 
            FROM users u
            LEFT JOIN profiles p ON u.id = p.user_id
            WHERE u.id = ?
        ", [$id]);
        
        if (!$user) {
            return response()->json([
                'success' => false, 
                'message' => 'Người dùng không tồn tại'
            ], 404);
        }

        // 3. Không được xóa chính mình
        if ($user->id == $currentUserId) {
            return response()->json([
                'success' => false, 
                'message' => 'Không thể tự xóa chính mình'
            ], 403);
        }

        // 4. Lấy thông tin current user
        $currentUser = DB::selectOne("SELECT role_id FROM users WHERE id = ?", [$currentUserId]);
        
        if (!$currentUser) {
            return response()->json([
                'success' => false, 
                'message' => 'Người dùng hiện tại không tồn tại'
            ], 401);
        }

        // 5. Kiểm tra quyền (giữ nguyên logic quyền)
        $currentRole = $currentUser->role_id;
        $targetRole = $user->role_id;
        
        if ($currentRole === 'C') {
            return response()->json([
                'success' => false, 
                'message' => 'Bạn không có quyền xóa người dùng'
            ], 403);
        }
        
        if ($currentRole === 'S') {
            if ($targetRole === 'A' || $targetRole === 'S') {
                return response()->json([
                    'success' => false, 
                    'message' => 'Bạn không có quyền xóa người dùng có vai trò này'
                ], 403);
            }
        }

        try {
            DB::beginTransaction();
            
            // INSERT THÔNG BÁO
            $fullName = $user->full_name ?: 'Người dùng';
            $adminNotificationContent = "Bạn đã xóa tài khoản {$fullName} (ID: {$user->id}) khỏi hệ thống.";
            
            DB::insert("
                INSERT INTO user_notifications (user_id, title, content, type, is_read, created_at)
                VALUES (?, ?, ?, 'system', 0, NOW())
            ", [
                $currentUserId,
                'Đã xóa tài khoản',
                $adminNotificationContent,
            ]);
            
            // XÓA USER
            $deleted = DB::delete('DELETE FROM users WHERE id = ?', [$id]);
            
            if (!$deleted) {
                throw new \Exception('Không thể xóa người dùng');
            }
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'Đã xóa người dùng thành công',
                'data' => [
                    'id' => $user->id,
                    'username' => $user->username,
                    'email' => $user->email,
                    'role_id' => $user->role_id,
                    'full_name' => $user->full_name,
                    'deleted_by' => $currentUserId,
                    'deleted_at' => date('Y-m-d H:i:s')
                ]
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            if (strpos($e->getMessage(), 'foreign key constraint') !== false) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không thể xóa người dùng vì có dữ liệu liên quan'
                ], 409);
            }
            
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi xóa người dùng: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Kích hoạt/Vô hiệu hóa người dùng
     */
    public function toggleStatus($id)
    {
        // Kiểm tra user tồn tại và lấy full_name từ profile
        $userInfo = DB::selectOne("
            SELECT u.id, u.is_active, p.full_name 
            FROM users u
            LEFT JOIN profiles p ON u.id = p.user_id
            WHERE u.id = ?
        ", [$id]);
        
        if (!$userInfo) {
            return response()->json([
                'success' => false,
                'message' => 'Người dùng không tồn tại'
            ], 404);
        }
        
        try {
            DB::beginTransaction();
            
            // Tính trạng thái mới - đảo ngược is_active hiện tại
            $newStatus = $userInfo->is_active ? 0 : 1;
            
            // UPDATE trạng thái
            DB::update('UPDATE users SET is_active = ? WHERE id = ?', [$newStatus, $id]);
            
            // Chuẩn bị thông tin cho notification
            $fullName = $userInfo->full_name ?: 'Người dùng';
            $actionText = $newStatus ? 'kích hoạt' : 'vô hiệu hóa';
            $title = 'Trạng thái tài khoản thay đổi';
            $content = 'Tài khoản ' . $fullName . ' (ID: ' . $id . ') đã được ' . $actionText . '.';
            
            // Insert thông báo với full_name
            DB::insert("
                INSERT INTO user_notifications (user_id, title, content, type, is_read, created_at, updated_at)
                VALUES (?, ?, ?, 'system', 0, NOW(), NOW())
            ", [
                $id,
                $title,
                $content,
            ]);
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => $newStatus ? 'Đã kích hoạt người dùng' : 'Đã vô hiệu hóa người dùng',
                'data' => [
                    'id' => $id,
                    'full_name' => $userInfo->full_name,
                    'is_active' => $newStatus
                ]
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi thay đổi trạng thái người dùng: ' . $e->getMessage()
            ], 500);
        }
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

    //-------------------------------------------------------//
    public function getAllUserWithPagination(Request $request)
    {
        $query = User::with(['role', 'profile']);
        
        // Lọc dữ liệu
        $this->applyFilters($query, $request);
        
        // Sắp xếp
        $this->applySorting($query, $request);
        
        // Phân trang
        $perPage = $request->get('per_page', 15);
        $users = $query->paginate($perPage);
        
        // Transform data
        $transformedData = $this->transformUsers($users);
        
        return $this->buildResponse($users, $transformedData, $request);
    }

    /**
     * Áp dụng bộ lọc
     */
    private function applyFilters($query, $request)
    {
        // Lọc theo role
        if ($request->filled('role_id')) {
            $query->where('role_id', $request->role_id);
        }
        
        // Lọc theo trạng thái
        if ($request->has('is_active') && $request->is_active !== null) {
            $isActive = filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN);
            $query->where('is_active', $isActive);
        }
        
        // Tìm kiếm
        if ($request->filled('search')) {
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
    }

    /**
     * Áp dụng sắp xếp
     */
    private function applySorting($query, $request)
    {
        $sortField = $request->get('sort_field', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        
        $sortableFields = [
            'id', 'username', 'email', 'is_active', 'role_id', 'created_at',
            'full_name', 'phone', 'birthday', 'gender'
        ];
        
        if (!in_array($sortField, $sortableFields)) {
            $sortField = 'created_at';
        }
        
        if (in_array($sortField, ['full_name', 'phone', 'birthday', 'gender'])) {
            $query->leftJoin('profiles', 'users.id', '=', 'profiles.user_id')
                ->orderBy("profiles.{$sortField}", $sortOrder)
                ->select('users.*');
        } else {
            $query->orderBy($sortField, $sortOrder);
        }
    }

    /**
     * Transform user data
     */
    private function transformUsers($paginator)
    {
        return $paginator->through(function ($user) {
            $profile = $user->profile;
            $role = $user->role;
            
            return [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'is_active' => (bool) $user->is_active,
                'status_text' => $user->is_active ? 'Đang hoạt động' : 'Đã khóa',
                'role_id' => $user->role_id,
                'role_name' => $role->name ?? null,
                'full_name' => $profile->full_name ?? null,
                'phone' => $profile->phone ?? null,
                'avatar_url' => $profile->avatar_url ?? null,
                'gender' => $profile->gender ?? null,
                'birthday' => $profile->birthday ?? null,
                'created_at' => $user->created_at?->format('d/m/Y H:i:s'),
                'created_at_raw' => $user->created_at?->format('Y-m-d H:i:s'),
                'gender_text' => match($profile->gender ?? null) {
                    'Nam' => 'Nam',
                    'Nữ' => 'Nữ',
                    default => 'Khác'
                },
            ];
        });
    }

    /**
     * Build API response
     */
    private function buildResponse($paginator, $transformedData, $request)
    {
        $sortField = $request->get('sort_field', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        
        return response()->json([
            'success' => true,
            'message' => 'Lấy danh sách người dùng thành công',
            'data' => [
                'items' => $transformedData->items(),
                'pagination' => [
                    'current_page' => $paginator->currentPage(),
                    'last_page' => $paginator->lastPage(),
                    'per_page' => $paginator->perPage(),
                    'total' => $paginator->total(),
                    'from' => $paginator->firstItem(),
                    'to' => $paginator->lastItem(),
                    'has_more_pages' => $paginator->hasMorePages(),
                    'next_page_url' => $paginator->nextPageUrl(),
                    'prev_page_url' => $paginator->previousPageUrl(),
                ],
                'sort' => [
                    'field' => $sortField,
                    'order' => $sortOrder,
                ]
            ]
        ]);
    }

    public function getUserById($id)
    {
        // Kiểm tra user tồn tại
        $user = DB::selectOne('SELECT * FROM users WHERE id = ?', [$id]);
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Người dùng không tồn tại'
            ], 404);
        }
        
        // Lấy thông tin user cơ bản
        $userData = DB::selectOne("
            SELECT 
                u.*,
                r.name as role_name,
                p.full_name,
                p.avatar_url,
                p.phone,
                p.birthday,
                p.gender,
                CASE 
                    WHEN u.is_active = 1 THEN 'Đang hoạt động'
                    ELSE 'Đã khóa'
                END as status_text,
                CASE 
                    WHEN p.gender = 'Nam' THEN 'Nam'
                    WHEN p.gender = 'Nữ' THEN 'Nữ'
                    WHEN p.gender = 'Khác' THEN 'Khác'
                    ELSE 'Không xác định'
                END as gender_text,
                DATE_FORMAT(u.created_at, '%d/%m/%Y %H:%i:%s') as created_at_raw
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
            LEFT JOIN profiles p ON u.id = p.user_id
            WHERE u.id = ?
        ", [$id]);
        
        // Lấy địa chỉ với thông tin xã/phường và tỉnh
        $addresses = DB::select("
            SELECT 
                a.*,
                c.name as commune_name,
                c.code as commune_code,
                p.name as province_name,
                p.code as province_code
            FROM addresses a
            LEFT JOIN communes c ON a.commune_id = c.id
            LEFT JOIN provinces p ON c.province_id = p.id
            WHERE a.user_id = ?
            ORDER BY a.is_default DESC, a.created_at DESC
        ", [$id]);
        
        // Lấy thông báo
        $notifications = DB::select("
            SELECT 
                id,
                user_id,
                title,
                content,
                type,
                is_read,
                DATE_FORMAT(created_at, '%d/%m/%Y %H:%i:%s') as created_at
            FROM user_notifications
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT 20
        ", [$id]);
        
        // Chuẩn bị dữ liệu trả về
        $responseData = [
            'id' => $userData->id,
            'username' => $userData->username,
            'email' => $userData->email,
            'is_active' => (bool)$userData->is_active,
            'role_id' => $userData->role_id,
            'created_at' => $userData->created_at,
            
            'status_text' => $userData->status_text,
            'role_name' => $userData->role_name,
            'full_name' => $userData->full_name,
            'avatar_url' => $userData->avatar_url,
            'phone' => $userData->phone,
            'gender' => $userData->gender,
            'birthday' => $userData->birthday,
            'created_at_raw' => $userData->created_at_raw,
            'gender_text' => $userData->gender_text,
            
            'role' => $userData->role_name ? [
                'id' => $userData->role_id,
                'name' => $userData->role_name
            ] : null,
            
            'profile' => ($userData->full_name || $userData->avatar_url || $userData->phone || $userData->birthday || $userData->gender) ? [
                'full_name' => $userData->full_name,
                'avatar_url' => $userData->avatar_url,
                'phone' => $userData->phone,
                'birthday' => $userData->birthday,
                'gender' => $userData->gender
            ] : null,
            
            'addresses' => array_map(function($address) {
                return [
                    'id' => $address->id,
                    'user_id' => $address->user_id,
                    'label' => $address->label,
                    'receiver_name' => $address->receiver_name,
                    'phone' => $address->phone,
                    'street_address' => $address->street_address,
                    'commune_id' => $address->commune_id,
                    'is_default' => (bool)$address->is_default,
                    'created_at' => $address->created_at,
                    'commune_name' => $address->commune_name,
                    'commune_code' => $address->commune_code,
                    'province_name' => $address->province_name,
                    'province_code' => $address->province_code
                ];
            }, $addresses),
            
            'notifications' => array_map(function($notification) {
                return [
                    'id' => $notification->id,
                    'user_id' => $notification->user_id,
                    'title' => $notification->title,
                    'content' => $notification->content,
                    'type' => $notification->type,
                    'is_read' => (bool)$notification->is_read,
                    'created_at' => $notification->created_at
                ];
            }, $notifications)
        ];
        
        return response()->json([
            'success' => true,
            'data' => $responseData
        ]);
    }

    /**
     * Xem danh sách địa chỉ
     */
    public function getUserAddresses($userId)
    {
        $addresses = DB::select("
            SELECT a.*, 
                c.name as commune_name, 
                p.name as province_name,
                CONCAT(a.street_address, ', ', c.name, ', ', p.name) as full_address
            FROM addresses a
            LEFT JOIN communes c ON a.commune_id = c.id
            LEFT JOIN provinces p ON c.province_id = p.id
            WHERE a.user_id = ?
            ORDER BY a.is_default DESC, a.created_at DESC
        ", [$userId]);

        return response()->json([
            'success' => true,
            'data' => $addresses
        ]);
    }

    /**
     * Thêm địa chỉ mới
     */
    public function addAddress(Request $request, $userId)
    {
        // Validate theo schema
        $data = $request->validate([
            'label'           => 'nullable|string|max:50',
            'receiver_name'   => 'required|string|max:50',
            'phone'           => 'required|digits:10', // CHAR(10)
            'street_address'  => 'required|string|max:255',
            'commune_id'      => 'nullable|integer|exists:communes,id',
            'is_default'      => 'sometimes|boolean'
        ]);

        DB::beginTransaction();

        try {
            // Nếu set mặc định → bỏ mặc định các địa chỉ khác
            if (!empty($data['is_default'])) {
                DB::table('addresses')
                    ->where('user_id', $userId)
                    ->update(['is_default' => false]);
            }

            // Nếu là địa chỉ đầu tiên → auto mặc định
            $hasAddress = DB::table('addresses')
                ->where('user_id', $userId)
                ->exists();

            if (!$hasAddress) {
                $data['is_default'] = true;
            }

            // Insert địa chỉ
            $addressId = DB::table('addresses')->insertGetId([
                'user_id'        => $userId,
                'label'          => $data['label'] ?? null,
                'receiver_name'  => $data['receiver_name'],
                'phone'          => $data['phone'],
                'street_address' => $data['street_address'],
                'commune_id'     => $data['commune_id'] ?? null,
                'is_default'     => $data['is_default'] ?? false,
                'created_at'     => now(),
            ]);

            // Lấy địa chỉ vừa thêm (kèm tỉnh / xã)
            $newAddress = DB::table('addresses as a')
                ->select(
                    'a.*',
                    'c.name as commune_name',
                    'p.name as province_name',
                    DB::raw("
                        CONCAT(
                            a.street_address,
                            IF(c.name IS NOT NULL, CONCAT(', ', c.name), ''),
                            IF(p.name IS NOT NULL, CONCAT(', ', p.name), '')
                        ) as full_address
                    ")
                )
                ->leftJoin('communes as c', 'a.commune_id', '=', 'c.id')
                ->leftJoin('provinces as p', 'c.province_id', '=', 'p.id')
                ->where('a.id', $addressId)
                ->first();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Thêm địa chỉ thành công',
                'data'    => $newAddress
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Add address error', ['error' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra khi thêm địa chỉ'
            ], 500);
        }
    }

    /**
     * Sửa địa chỉ
     */
    public function updateAddress(Request $request, $userId, $addressId)
    {
        // Validate theo schema giống addAddress
        $data = $request->validate([
            'label'           => 'nullable|string|max:50',
            'receiver_name'   => 'sometimes|required|string|max:50',
            'phone'           => 'sometimes|required|digits:10', // CHAR(10) - đồng bộ với addAddress
            'street_address'  => 'sometimes|required|string|max:255',
            'commune_id'      => 'sometimes|nullable|integer|exists:communes,id',
            'is_default'      => 'sometimes|boolean'
        ]);

        DB::beginTransaction();

        try {
            // Kiểm tra user tồn tại
            $userExists = DB::table('users')->where('id', $userId)->exists();
            if (!$userExists) {
                return response()->json([
                    'success' => false,
                    'message' => 'Người dùng không tồn tại'
                ], 404);
            }

            // Kiểm tra địa chỉ thuộc về user
            $address = DB::table('addresses')
                ->where('id', $addressId)
                ->where('user_id', $userId)
                ->first();
                
            if (!$address) {
                return response()->json([
                    'success' => false,
                    'message' => 'Địa chỉ không tồn tại'
                ], 404);
            }

            // Nếu đặt làm mặc định, bỏ mặc định của các địa chỉ khác
            if (isset($data['is_default']) && $data['is_default']) {
                DB::table('addresses')
                    ->where('user_id', $userId)
                    ->where('id', '!=', $addressId) // Không update địa chỉ hiện tại
                    ->update(['is_default' => false]);
            }

            // Nếu phone được update, kiểm tra định dạng digits:10 đã được validation đảm bảo
            // Không cần padding như code cũ vì validation digits:10 đã đảm bảo đúng 10 số

            // Chuẩn bị dữ liệu update
            $updateData = [];
            if (isset($data['label'])) $updateData['label'] = $data['label'];
            if (isset($data['receiver_name'])) $updateData['receiver_name'] = $data['receiver_name'];
            if (isset($data['phone'])) $updateData['phone'] = $data['phone'];
            if (isset($data['street_address'])) $updateData['street_address'] = $data['street_address'];
            if (isset($data['commune_id'])) $updateData['commune_id'] = $data['commune_id'];
            if (isset($data['is_default'])) $updateData['is_default'] = $data['is_default'];
            
            // Luôn cập nhật updated_at
            $updateData['updated_at'] = now();

            // Cập nhật địa chỉ
            DB::table('addresses')
                ->where('id', $addressId)
                ->where('user_id', $userId)
                ->update($updateData);

            // Lấy địa chỉ đã cập nhật (cùng format với addAddress)
            $updatedAddress = DB::table('addresses as a')
                ->select(
                    'a.*',
                    'c.name as commune_name',
                    'p.name as province_name',
                    DB::raw("
                        CONCAT(
                            a.street_address,
                            IF(c.name IS NOT NULL, CONCAT(', ', c.name), ''),
                            IF(p.name IS NOT NULL, CONCAT(', ', p.name), '')
                        ) as full_address
                    ")
                )
                ->leftJoin('communes as c', 'a.commune_id', '=', 'c.id')
                ->leftJoin('provinces as p', 'c.province_id', '=', 'p.id')
                ->where('a.id', $addressId)
                ->first();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật địa chỉ thành công',
                'data' => $updatedAddress
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Update address error', [
                'userId' => $userId,
                'addressId' => $addressId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra khi cập nhật địa chỉ'
            ], 500);
        }
    }
    
    /**
     * Xóa địa chỉ
     */
    public function deleteAddress($userId, $addressId)
    {
        DB::beginTransaction();
        
        try {
            // Kiểm tra địa chỉ thuộc về user
            $address = DB::selectOne("SELECT id, is_default FROM addresses WHERE id = ? AND user_id = ?", [$addressId, $userId]);
            if (!$address) {
                return response()->json([
                    'success' => false,
                    'message' => 'Địa chỉ không tồn tại'
                ], 404);
            }

            // Xóa địa chỉ
            DB::delete("DELETE FROM addresses WHERE id = ? AND user_id = ?", [$addressId, $userId]);

            // Nếu xóa địa chỉ mặc định, đặt địa chỉ khác làm mặc định
            if ($address->is_default) {
                $newDefault = DB::selectOne("SELECT id FROM addresses WHERE user_id = ? ORDER BY created_at DESC LIMIT 1", [$userId]);
                if ($newDefault) {
                    DB::update("UPDATE addresses SET is_default = TRUE WHERE id = ?", [$newDefault->id]);
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Xóa địa chỉ thành công'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra khi xóa địa chỉ'
            ], 500);
        }
    }

    /**
     * Đặt làm địa chỉ mặc định
     */
    public function setDefaultAddress($userId, $addressId)
    {
        DB::beginTransaction();
        
        try {
            // Kiểm tra địa chỉ thuộc về user
            $address = DB::selectOne("SELECT id FROM addresses WHERE id = ? AND user_id = ?", [$addressId, $userId]);
            if (!$address) {
                return response()->json([
                    'success' => false,
                    'message' => 'Địa chỉ không tồn tại'
                ], 404);
            }

            // Bỏ mặc định của tất cả địa chỉ
            DB::update("UPDATE addresses SET is_default = FALSE WHERE user_id = ?", [$userId]);
            
            // Đặt địa chỉ này làm mặc định
            DB::update("UPDATE addresses SET is_default = TRUE WHERE id = ?", [$addressId]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Đã đặt làm địa chỉ mặc định'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra khi đặt địa chỉ mặc định'
            ], 500);
        }
    }
}