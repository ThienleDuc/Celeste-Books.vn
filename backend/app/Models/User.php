<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'users';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';
   

    protected $fillable = [
        'id',
        'username',
        'email',
        'password_hash',
        'is_active',
        'created_at',
        'role_id',
    ];

    protected $hidden = [
        'password_hash',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        
    ];
    // 🔗 1 - 1 Profile
    public function profile()
    {
        return $this->hasOne(Profile::class, 'user_id', 'id');
    }

    // 🔗 1 - N Address
    public function addresses()
    {
        return $this->hasMany(Address::class, 'user_id', 'id');
    }

    // 🔗 1 - N Notification
    public function notifications()
    {
        return $this->hasMany(UserNotification::class, 'user_id', 'id');
    }
      public $timestamps = false;
      

}
