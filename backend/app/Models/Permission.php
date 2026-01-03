<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Permission extends Model
{
    protected $table = 'permissions';
    protected $primaryKey = 'id';
    // xóa dòng public $incrementing = false;
    public $timestamps = false; // thêm dòng này
    protected $keyType = 'int';

    protected $fillable = [
        'name',
        'description',
        'slug',
    ];
}
