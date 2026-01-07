<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
Use App\Models\UserNotification;
use App\Models\UserNotification as ModelsUserNotification;

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
        'role_id',
    ];

    protected $hidden = [
        'password_hash',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'is_active' => 'boolean',
        'created_at' => 'datetime',
    ];

    public $timestamps = false;

    public function getAuthPassword()
    {
        return $this->password_hash;
    }

    public function role()
    {
        return $this->belongsTo(Role::class, 'role_id', 'id');
    }

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

    // 🔗 1 - N Order
    public function orders()
    {
        return $this->hasMany(Order::class, 'user_id', 'id');
    }

    // 🔗 1 - N Notification
    public function notifications()
    {
        return $this->hasMany(ModelsUserNotification::class, 'user_id', 'id');
    }
  

}