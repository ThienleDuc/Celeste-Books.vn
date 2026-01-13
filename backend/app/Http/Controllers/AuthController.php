<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use App\Services\EmailService;
use App\Models\OTPVerification;

class AuthController extends Controller
{
    protected EmailService $emailService;

    public function __construct(EmailService $emailService)
    {
        $this->emailService = $emailService;
    }

    /**
     * Tạo ID tự động theo role
     */
    private function generateUserId($roleId)
    {
        $userCount = User::where('role_id', $roleId)->count();
        $nextNumber = $userCount + 1;
        $formattedNumber = str_pad($nextNumber, 3, '0', STR_PAD_LEFT);
        return $roleId . $formattedNumber;
    }
    
    public function sendOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|max:255'
        ], [
            'email.required' => 'Email là bắt buộc',
            'email.email' => 'Email không đúng định dạng'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $email = $request->email;

        // Kiểm tra email đã đăng ký chưa
        if (User::where('email', $email)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Email đã được sử dụng'
            ], 422);
        }

        // Gửi OTP
        $result = $this->emailService->sendOtp($email, 'register');

        if ($result['success']) {
            return response()->json([
                'success' => true,
                'message' => $result['message'],
                'data' => [
                    'expires_at' => $result['expires_at']->toDateTimeString()
                ]
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => $result['message']
        ], 500);
    }

    /**
     * Xác thực OTP
     */
    public function verifyOtp($email, $otp, $purpose = 'register')
    {
        // Tìm OTP record với email và otp khớp
        $otpRecord = OTPVerification::where('email', $email) // THÊM điều kiện email
                                ->where('otp', $otp)
                                ->where('purpose', $purpose)
                                ->first();

        if (!$otpRecord) {
            return [
                'success' => false,
                'message' => 'Mã OTP không hợp lệ cho email này'
            ];
        }

        if ($otpRecord->is_used) {
            return [
                'success' => false,
                'message' => 'Mã OTP đã được sử dụng'
            ];
        }

        if (!$otpRecord->expires_at || $otpRecord->expires_at->isPast()) {
            return [
                'success' => false,
                'message' => 'Mã OTP đã hết hạn'
            ];
        }

        // Đánh dấu OTP đã sử dụng
        $otpRecord->update(['is_used' => true]);

        return [
            'success' => true,
            'message' => 'Xác thực OTP thành công'
        ];
    }

    /**
     * Đăng ký với OTP verification
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'username' => 'required|string|min:8|max:16|unique:users',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6|max:12|confirmed',
            'full_name' => 'required|string|max:50',
            'otp' => 'required|string|size:6',
            'role_id' => 'required|string|max:10|exists:roles,id'
        ], [
            'username.required' => 'Tên đăng nhập là bắt buộc',
            'username.min' => 'Tên đăng nhập phải có ít nhất 8 ký tự',
            'username.max' => 'Tên đăng nhập không được vượt quá 16 ký tự',
            'username.unique' => 'Tên đăng nhập đã được sử dụng',
            'email.required' => 'Email là bắt buộc',
            'email.email' => 'Email không đúng định dạng',
            'email.max' => 'Email không được vượt quá 255 ký tự',
            'email.unique' => 'Email đã được sử dụng',
            'password.required' => 'Mật khẩu là bắt buộc',
            'password.min' => 'Mật khẩu phải có ít nhất 6 ký tự',
            'password.max' => 'Mật khẩu không được vượt quá 12 ký tự',
            'password.confirmed' => 'Xác nhận mật khẩu không khớp',
            'full_name.required' => 'Họ tên là bắt buộc',
            'full_name.max' => 'Họ tên không được vượt quá 50 ký tự',
            'otp.required' => 'Mã OTP là bắt buộc',
            'otp.size' => 'Mã OTP phải có 6 chữ số',
            'role_id.required' => 'Vai trò là bắt buộc',
            'role_id.exists' => 'Vai trò không tồn tại trong hệ thống'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        // Kiểm tra OTP có tồn tại và chưa sử dụng cho email này không
        $otpExists = OTPVerification::where('email', $request->email)
                                ->where('otp', $request->otp)
                                ->where('purpose', 'register')
                                ->where('is_used', false)
                                ->exists();

        if (!$otpExists) {
            return response()->json([
                'success' => false,
                'message' => 'Mã OTP không hợp lệ hoặc đã được sử dụng cho email này'
            ], 422);
        }

        // Xác thực OTP (sẽ đánh dấu là đã dùng)
        $otpVerification = $this->emailService->verifyOtp(
            $request->email,  // Đảm bảo email khớp
            $request->otp, 
            'register'
        );

        if (!$otpVerification['success']) {
            return response()->json([
                'success' => false,
                'message' => $otpVerification['message']
            ], 422);
        }

        DB::beginTransaction();
        try {
            // Tạo user
            $userId = $this->generateUserId($request->role_id);
            $user = User::create([
                'id' => $userId,
                'username' => $request->username,
                'email' => $request->email,
                'password_hash' => bcrypt($request->password),
                'is_active' => true,
                'role_id' => $request->role_id,
            ]);

            // Tạo profile
            $user->profile()->create([
                'full_name' => $request->full_name,
                'gender' => 'Khác'
            ]);

            // Tạo token
            $expiresAt = now()->addDays(7);
            $tokenObj = $user->createToken('auth_token', ['*'], $expiresAt);
            $plainToken = $tokenObj->plainTextToken;

            $tokenModel = $tokenObj->accessToken ?? $user->tokens()->latest('id')->first();
            $tokenId = $tokenModel?->id ?? null;
            $tokenExpiresAt = $tokenModel?->expires_at ?? $expiresAt;

            DB::commit();

            // Gửi thông báo
            UserNotification::add($user->id, 'Đăng ký', "Người dùng {$user->username} vừa tạo tài khoản", 'account');

            return response()->json([
                'success' => true,
                'message' => 'Đăng ký thành công',
                'data' => [
                    'user_id' => $user->id,
                    'username' => $user->username,
                    'email' => $user->email,
                    'role_id' => $user->role_id,
                    'full_name' => $request->full_name,
                    'gender' => 'Khác',
                    'access_token' => $plainToken,
                    'token_type' => 'Bearer',
                    'token_id' => $tokenId,
                    'expires_at' => $tokenExpiresAt ? $tokenExpiresAt->toDateTimeString() : null,
                    'expires_in_days' => $tokenExpiresAt ? now()->diffInDays($tokenExpiresAt) : null,
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Registration failed', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Đăng ký thất bại: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Đăng nhập (WEB & API)
     */
    public function login(Request $request)
    {
        // 1. Validate
        $validator = Validator::make($request->all(), [
            'username' => 'nullable|string|min:8|max:16',
            'email'    => 'nullable|email|max:255',
            'password' => 'required|string|min:6|max:12',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors'  => $validator->errors(),
            ], 422);
        }

        // 2. Phải có username hoặc email
        if (!$request->filled('username') && !$request->filled('email')) {
            return response()->json([
                'success' => false,
                'message' => 'Phải nhập username hoặc email',
            ], 422);
        }

        // 3. Xác định field login
        $loginField = $request->filled('username') ? 'username' : 'email';
        $loginValue = $request->input($loginField);

        // 4. Tìm user
        $user = User::with('profile')
            ->where($loginField, $loginValue)
            ->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Tài khoản không tồn tại',
            ], 404);
        }

        // 5. Kiểm tra mật khẩu
        if (!Hash::check($request->password, $user->password_hash)) {
            return response()->json([
                'success' => false,
                'message' => 'Mật khẩu không chính xác',
            ], 401);
        }

        // 6. Kiểm tra trạng thái
        if (!$user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Tài khoản đã bị khóa',
            ], 403);
        }

        // 7. Tạo token Sanctum
        try {
            $expiresAt = now()->addDays(7);
            $tokenObj  = $user->createToken('auth_token', ['*'], $expiresAt);

            $accessToken = $tokenObj->plainTextToken;
            $tokenModel  = $tokenObj->accessToken
                ?? $user->tokens()->latest('id')->first();

        } catch (\Throwable $e) {
            Log::error('Login error', ['error' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'message' => 'Không thể tạo token',
            ], 500);
        }

        // 8. Ghi log / notification
        UserNotification::add(
            $user->id,
            'Đăng nhập',
            "Người dùng {$user->username} vừa đăng nhập",
            'account'
        );

        // 9. TRẢ KẾT QUẢ (QUAN TRỌNG)
        return response()->json([
            'success' => true,
            'message' => 'Đăng nhập thành công',
            'data' => [
                'user_id'      => $user->id,
                'username'     => $user->username,
                'email'        => $user->email,
                'role_id'      => $user->role_id, // 👈 CÁI BẠN CẦN
                'has_profile'  => !empty($user->profile),
                'full_name'    => $user->profile?->full_name,
                'access_token' => $accessToken,
                'token_type'   => 'Bearer',
                'expires_at'   => $tokenModel?->expires_at?->toDateTimeString(),
            ]
        ]);
    }
    
    /**
     * Lấy thông tin user hiện tại (sử dụng middleware auth:sanctum)
     */
    public function me(Request $request)
    {
        // User đã được xác thực bởi middleware auth:sanctum
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy thông tin người dùng',
                'error_code' => 'USER_NOT_FOUND'
            ], 401);
        }

        // Kiểm tra tài khoản có active không
        if (!$user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Tài khoản đã bị vô hiệu hóa',
                'error_code' => 'ACCOUNT_DISABLED'
            ], 403);
        }

        // Load thông tin
        $user->load([
            'profile' => function($query) {
                $query->select('user_id', 'full_name', 'gender', 'phone', 'avatar_url');
            },
            'role' => function($query) {
                $query->select('id', 'name');
            }
        ]);

        // Lấy token hiện tại (nếu có) để kiểm tra expires_at và last_used_at
        $currentToken = $request->user()->currentAccessToken();
        $tokenValid = true;
        $tokenInfo = null;
        if ($currentToken) {
            $isExpired = $currentToken->expires_at ? now()->gt($currentToken->expires_at) : false;
            $tokenValid = !$isExpired;
            $tokenInfo = [
                'token_id' => $currentToken->id,
                'name' => $currentToken->name,
                'expires_at' => $currentToken->expires_at?->toDateTimeString(),
                'is_expired' => $isExpired,
                'last_used_at' => $currentToken->last_used_at?->toDateTimeString(),
            ];
        }

        // Chuẩn hóa avatar URL
        $avatarUrl = null;
        if ($user->profile?->avatar) {
            $avatarUrl = filter_var($user->profile->avatar, FILTER_VALIDATE_URL)
                ? $user->profile->avatar
                : url('storage/' . ltrim($user->profile->avatar, '/'));
        }

        return response()->json([
            'success' => true,
            'message' => 'Lấy thông tin thành công',
            'data' => [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'role' => [
                    'id' => $user->role_id,
                    'name' => $user->role->name ?? $user->role_id,
                ],
                'profile' => $user->profile ? [
                    'full_name' => $user->profile->full_name,
                    'gender' => $user->profile->gender,
                    'phone' => $user->profile->phone,
                    'avatar_url' => $avatarUrl,
                ] : null,
                'status' => $user->is_active ? 'active' : 'inactive',
                'created_at' => $user->created_at?->format('d/m/Y'),
                'token_valid' => $tokenValid,
                'token' => $tokenInfo,
            ]
        ]);
    }

    /**
     * Đăng xuất - sử dụng token hiện tại (sử dụng middleware auth:sanctum)
     */
    public function logout(Request $request)
    {
        $user = $request->user();

        // 1. Chưa đăng nhập / token không hợp lệ
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Người dùng chưa đăng nhập hoặc token không hợp lệ'
            ], 401);
        }

        try {
            // 2. Xóa token hiện tại (Sanctum)
            $currentToken = $user->currentAccessToken();

            if ($currentToken) {
                $currentToken->delete();
            }

            // 3. Log hệ thống
            Log::info('User logged out', [
                'user_id'  => $user->id,
                'username' => $user->username,
                'token_id' => $currentToken?->id,
            ]);

            // 4. Notification (đúng tên hành động)
            UserNotification::add(
                $user->id,
                'Đăng xuất',
                "Người dùng {$user->username} vừa đăng xuất tài khoản",
                'account'
            );

            // 5. Response
            return response()->json([
                'success' => true,
                'message' => 'Đăng xuất thành công',
                'data' => [
                    'user_id'     => $user->id,
                    'logout_time' => now()->toDateTimeString(),
                ]
            ]);

        } catch (\Throwable $e) {
            Log::error('Logout failed', [
                'user_id' => $user->id,
                'error'   => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Đăng xuất thất bại'
            ], 500);
        }
    }


    /**
     * Đăng xuất từ tất cả thiết bị (sử dụng middleware auth:sanctum)
     */
    public function logoutAll(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy người dùng'
            ], 401);
        }
        
        $tokenCount = $user->tokens()->count();
        $user->tokens()->delete();
        
        Log::info('User logged out from all devices', [
            'user_id' => $user->id,
            'username' => $user->username,
            'tokens_deleted' => $tokenCount
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Đã đăng xuất từ tất cả thiết bị',
            'data' => [
                'user_id' => $user->id,
                'tokens_deleted' => $tokenCount,
                'logout_time' => now()->toDateTimeString()
            ]
        ]);
    }

    /**
     * Danh sách các thiết bị đã đăng nhập (sử dụng middleware auth:sanctum)
     */
    public function devices(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy người dùng'
            ], 401);
        }
        
        $tokens = $user->tokens()
            ->select('id', 'name', 'last_used_at', 'expires_at', 'created_at')
            ->orderBy('last_used_at', 'desc')
            ->get()
            ->map(function ($token) {
                return [
                    'id' => $token->id,
                    'name' => $token->name,
                    'last_used' => $token->last_used_at?->format('d/m/Y H:i:s'),
                    'expires_at' => $token->expires_at?->format('d/m/Y H:i:s'),
                    'is_expired' => $token->expires_at ? now()->gt($token->expires_at) : false,
                    'is_current' => false,
                    'created_at' => $token->created_at?->format('d/m/Y H:i:s'),
                    'days_since_created' => $token->created_at ? $token->created_at->diffInDays(now()) : null,
                ];
            });
        
        return response()->json([
            'success' => true,
            'message' => 'Danh sách thiết bị đã đăng nhập',
            'data' => [
                'total_devices' => $tokens->count(),
                'active_devices' => $tokens->where('is_expired', false)->count(),
                'devices' => $tokens
            ]
        ]);
    }

    /**
     * Xóa token cụ thể theo ID (sử dụng middleware auth:sanctum)
     */
    public function revokeToken(Request $request, $tokenId)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy người dùng'
            ], 401);
        }
        
        $token = $user->tokens()->where('id', $tokenId)->first();
        
        if (!$token) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy token với ID này'
            ], 404);
        }
        
        $token->delete();
        
        Log::info('Token revoked manually', [
            'user_id' => $user->id,
            'token_id' => $tokenId
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Đã thu hồi token thành công',
            'data' => [
                'token_id' => $tokenId,
                'revoked_at' => now()->toDateTimeString()
            ]
        ]);
    }

    /**
     * API kiểm tra username/email tồn tại
     */
    public function checkExists(Request $request)
    {
        $request->validate([
            'username' => 'nullable|string|min:8|max:16',
            'email' => 'nullable|email|max:255',
            'role_id' => 'nullable|string|max:10'
        ]);
        
        $response = [
            'success' => true,
            'data' => []
        ];
        
        if ($request->has('username') && $request->filled('username')) {
            $usernameExists = User::where('username', $request->username);
            
            if ($request->has('role_id')) {
                $usernameExists->where('role_id', $request->role_id);
            }
            
            $response['data']['username'] = [
                'exists' => $usernameExists->exists(),
                'message' => $usernameExists->exists() ? 'Tên đăng nhập đã tồn tại' : 'Tên đăng nhập có thể sử dụng'
            ];
        }
        
        if ($request->has('email') && $request->filled('email')) {
            $emailExists = User::where('email', $request->email);
            
            if ($request->has('role_id')) {
                $emailExists->where('role_id', $request->role_id);
            }
            
            $response['data']['email'] = [
                'exists' => $emailExists->exists(),
                'message' => $emailExists->exists() ? 'Email đã tồn tại' : 'Email có thể sử dụng'
            ];
        }
        
        return response()->json($response);
    }
    
    /**
     * API gợi ý role khi nhập username/email
     */
    public function suggestRole(Request $request)
    {
        $request->validate([
            'username' => 'nullable|string|min:8|max:16',
            'email' => 'nullable|email|max:255'
        ]);
        
        if (empty($request->username) && empty($request->email)) {
            return response()->json([
                'success' => false,
                'message' => 'Phải nhập username hoặc email'
            ], 422);
        }
        
        $loginField = $request->filled('username') ? 'username' : 'email';
        $loginValue = $request->input($loginField);
        
        $user = User::where($loginField, $loginValue)->first();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy tài khoản'
            ], 404);
        }
        
        return response()->json([
            'success' => true,
            'data' => [
                'username' => $user->username,
                'email' => $user->email,
                'role_id' => $user->role_id,
                'suggested_role' => $user->role_id,
                'message' => 'Vai trò của tài khoản này là: ' . $user->role_id
            ]
        ]);
    }
}
