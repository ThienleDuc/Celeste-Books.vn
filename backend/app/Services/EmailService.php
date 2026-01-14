<?php

namespace App\Services;

use App\Models\OTPVerification;
use Illuminate\Support\Facades\Mail;
use App\Mail\OTPEmail;
use Illuminate\Support\Str;
use Carbon\Carbon;

class EmailService
{
    /**
     * Gửi OTP qua email
     */
    public function sendOtp($email, $purpose = 'register')
    {
        // Xóa OTP cũ của email này
        OTPVerification::where('email', $email)
                      ->where('purpose', $purpose)
                      ->delete();

        // Tạo OTP mới (6 chữ số)
        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        
        // Lưu OTP vào database
        $otpRecord = OTPVerification::create([
            'email' => $email,
            'otp' => $otp,
            'purpose' => $purpose,
            'expires_at' => Carbon::now()->addMinutes(1),
        ]);

        try {
            // Gửi email
            Mail::to($email)->send(new OTPEmail($otp));
            
            return [
                'success' => true,
                'message' => 'Mã OTP đã được gửi đến email của bạn',
                'expires_at' => $otpRecord->expires_at
            ];
        } catch (\Exception $e) {
            // Xóa OTP nếu gửi email thất bại
            $otpRecord->delete();
            
            return [
                'success' => false,
                'message' => 'Không thể gửi email: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Xác thực OTP
     */
    public function verifyOtp($email, $otp, $purpose = 'register')
    {
        $otpRecord = OTPVerification::where('email', $email)
                                   ->where('otp', $otp)
                                   ->where('purpose', $purpose)
                                   ->first();

        if (!$otpRecord) {
            return [
                'success' => false,
                'message' => 'Mã OTP không hợp lệ'
            ];
        }

        if ($otpRecord->is_used) {
            return [
                'success' => false,
                'message' => 'Mã OTP đã được sử dụng'
            ];
        }

        if ($otpRecord->expires_at->isPast()) {
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
}