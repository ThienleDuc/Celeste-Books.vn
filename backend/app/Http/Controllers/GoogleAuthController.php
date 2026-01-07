<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Profile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    /**
     * Redirect to Google OAuth
     */
    public function redirectToGoogle()
    {
        // Bạn có thể dùng ->stateless() nếu vẫn gặp InvalidStateException
        return Socialite::driver('google')->redirect();
    }

    /**
     * Handle Google OAuth callback
     */
    public function handleGoogleCallback()
    {
        try {
            // Lấy dữ liệu từ Google
            $googleUser = Socialite::driver('google')->user();

            // Log dữ liệu để debug
            Log::info('Google User Data:', [
                'id'     => $googleUser->getId(),
                'email'  => $googleUser->getEmail(),
                'name'   => $googleUser->getName(),
                'avatar' => $googleUser->getAvatar(),
                'raw'    => $googleUser->user,
            ]);

            // Hiển thị dữ liệu (bỏ ra nếu muốn lưu luôn)
            // dd([
            //     'Google ID'  => $googleUser->getId(),
            //     'Email'      => $googleUser->getEmail(),
            //     'Name'       => $googleUser->getName(),
            //     'Avatar'     => $googleUser->getAvatar(),
            //     'Raw Data'   => $googleUser->user,
            // ]);

            $email  = $googleUser->getEmail();
            $name   = $googleUser->getName();
            $avatar = $googleUser->getAvatar();

            // Kiểm tra user đã tồn tại chưa
            $user = User::where('email', $email)->first();

            if (!$user) {
                $newUserId = $this->generateNextUserId();


                DB::transaction(function () use ($newUserId, $email, $name, $avatar) {
                    Log::info("Creating new user $newUserId with email $email");

                    // Tạo User
                    User::create([
                        'id'            => $newUserId,
                        'username'      => $name,
                        'email'         => $email,
                        'password_hash' => null,
                        'is_active'     => true,
                        'role_id'       => "C",
                    ]);

                    // Tạo Profile
                    Profile::create([
                        'user_id'    => $newUserId,
                        'full_name'  => $name,
                        'avatar_url' => $avatar,
                        'phone'      => null,
                        'birthday'   => null,
                        'gender'     => null,
                    ]);

                    Log::info("User $newUserId and profile created successfully");
                });

                $user = User::find($newUserId);
            }

            // Login user
            Auth::login($user);

            return redirect()->intended('/');

        } catch (\Exception $e) {
            // Lỗi chi tiết
            Log::error('Google login failed', [
                'message' => $e->getMessage(),
                'trace'   => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Google login failed',
                'error'   => $e->getMessage(),
                'trace'   => $e->getTraceAsString(),
            ], 500);
        }
    }

   private function generateNextUserId()
{
    // Lấy max số từ ID hiện tại
    $maxNumber = User::selectRaw(
        "MAX(CAST(SUBSTRING(id, 2) AS UNSIGNED)) as max_id"
    )->value('max_id');

    // Chuyển sang integer để chắc chắn
    $nextNumber = intval($maxNumber) + 1;

    // Luôn pad đủ 3 chữ số
    $paddedNumber = str_pad($nextNumber, 3, '0', STR_PAD_LEFT);

    return 'C' . $paddedNumber;
}

}
