<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Profile extends Model
{
    protected $table = 'profiles';
    protected $primaryKey = 'user_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'user_id',
        'full_name',
        'avatar_url',
        'phone',
        'birthday',
        'gender',
    ];
     public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }
    
    public $timestamps = false;
}

