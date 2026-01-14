<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Profile;
use App\Models\UserNotification; // ✅ Import model thông báo
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Str;

class GoogleAuthController extends Controller
{
    /**
     * 1. Chuyển hướng người dùng sang Google
     */
    public function redirectToGoogle()
    {
        // Sử dụng stateless() vì chúng ta đang làm API (React tách rời Laravel)
        return Socialite::driver('google')->stateless()->redirect();
    }

    /**
     * 2. Xử lý khi Google gọi lại (Callback)
     */
    public function handleGoogleCallback()
    {
        try {
            // Lấy thông tin user từ Google
            $googleUser = Socialite::driver('google')->stateless()->user();

            $email  = $googleUser->getEmail();
            $name   = $googleUser->getName();
            $avatar = $googleUser->getAvatar();
            $googleId = $googleUser->getId();

            // Tìm user trong DB theo email
            $user = User::where('email', $email)->first();

            // --- TRƯỜNG HỢP 1: USER CHƯA TỒN TẠI (ĐĂNG KÝ MỚI) ---
            if (!$user) {
                // Mặc định role là Khách hàng (C)
                $roleId = 'C'; 

                // 1. Xử lý trùng tên (Username)
                // Ví dụ: "Quoc Phan" -> "Quoc Phan", "Quoc Phan 1", "Quoc Phan 2"...
                $baseUsername = $name;
                $newUsername = $baseUsername;
                $counter = 1;
                while (User::where('username', $newUsername)->exists()) {
                    $newUsername = $baseUsername . ' ' . $counter;
                    $counter++;
                }

                // 2. Tạo ID mới (Ví dụ: C001, C002...)
                $newUserId = $this->generateNextUserId($roleId);

                // 3. Sử dụng Transaction để đảm bảo toàn vẹn dữ liệu
                DB::transaction(function () use ($newUserId, $email, $newUsername, $name, $avatar, $roleId, $googleId) {
                    
                    // Tạo User
                    User::create([
                        'id'            => $newUserId,
                        'username'      => $newUsername,
                        'email'         => $email,
                        // ⚠️ QUAN TRỌNG: Để null để Frontend biết là user này chưa có mật khẩu (hiện 2 ô)
                        // Yêu cầu: Cột password_hash trong DB phải cho phép NULL (nullable)
                        'password_hash' => null, 
                        'is_active'     => true,
                        'role_id'       => $roleId,
                        // Có thể lưu thêm google_id nếu bảng users có cột này
                        // 'google_id'  => $googleId, 
                    ]);

                    // Tạo Profile
                    Profile::create([
                        'user_id'    => $newUserId,
                        'full_name'  => $name,
                        'avatar_url' => $avatar, // Lưu link ảnh từ Google
                        'gender'     => 'Khác', // Mặc định
                    ]);
                });

                // Lấy lại user vừa tạo
                $user = User::find($newUserId);

                 }

            // --- TRƯỜNG HỢP 2: ĐĂNG NHẬP (TẠO TOKEN) ---

            // Kiểm tra xem tài khoản có bị khóa không
            if (!$user->is_active) {
                return redirect()->to(config('app.frontend_url') . '/dang-nhap?error=account_locked');
            }

            // Tạo Token Sanctum (Hạn 7 ngày giống AuthController cũ)
            $expiresAt = now()->addDays(7);
            $tokenObj = $user->createToken('google_auth_token', ['*'], $expiresAt);
            $plainToken = $tokenObj->plainTextToken;

            // Ghi log đăng nhập
            UserNotification::add($user->id, 'Đăng nhập', "Người dùng {$user->username} vừa đăng nhập bằng Google", 'account');

            // --- CHUYỂN HƯỚNG VỀ REACT ---
            // Gửi token qua URL để React bắt lấy và lưu vào localStorage
            return redirect()->to(
                config('app.frontend_url') . "/dang-nhap?token={$plainToken}"
            );

        } catch (\Exception $e) {
    // Tạm thời dùng dd() để xem lỗi là gì nếu Login thất bại
    dd($e->getMessage(), $e->getTraceAsString());

    // Sau khi fix xong hết thì mới mở lại đoạn redirect này
    /*
    Log::error('Google login failed', ['error' => $e->getMessage()]);
    return redirect()->to(config('app.frontend_url') . '/dang-nhap?error=login_failed');
    */
}
    }

    /**
     * Hàm sinh ID kế tiếp (Giống logic cũ của bạn nhưng an toàn hơn)
     * Ví dụ: Tìm ID lớn nhất C005 -> Tạo C006
     */
    private function generateNextUserId($roleId)
    {
        // Lấy số lớn nhất hiện tại trong DB (Cắt chuỗi từ ký tự thứ 2, ép về kiểu số)
        $maxId = User::where('id', 'like', $roleId . '%')
            ->selectRaw("MAX(CAST(SUBSTRING(id, 2) AS UNSIGNED)) as max_num")
            ->value('max_num');

        $nextNumber = intval($maxId) + 1;

        // Pad số 0 vào đầu cho đủ 3 chữ số (1 -> 001)
        $formattedNumber = str_pad($nextNumber, 3, '0', STR_PAD_LEFT);

        return $roleId . $formattedNumber;
    }
}