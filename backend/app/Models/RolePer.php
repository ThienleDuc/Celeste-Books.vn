<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RolePer extends Model
{
    protected $table = 'role_per';
    protected $primaryKey = null; 
    public $incrementing = false;
    public $timestamps = false; // Thêm mới -> ko tạo create_at và upadate_at

    protected $fillable = [
        'per_id',
        'role_id',
    ];
}
