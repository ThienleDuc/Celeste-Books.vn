<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OTPVerification extends Model
{
    use HasFactory;

    protected $table = 'otp_verifications';

    protected $fillable = [
        'email',
        'otp',
        'purpose',
        'is_used',
        'expires_at'
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'is_used' => 'boolean'
    ];

    /**
     * Kiểm tra OTP còn hiệu lực
     */
    public function isValid()
    {
        return !$this->is_used && $this->expires_at->isFuture();
    }
}