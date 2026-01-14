<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $per_id
 * @property string $role_id
 * @method static \Illuminate\Database\Eloquent\Builder|RolePer newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|RolePer newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|RolePer query()
 * @method static \Illuminate\Database\Eloquent\Builder|RolePer wherePerId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|RolePer whereRoleId($value)
 * @mixin \Eloquent
 */
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
