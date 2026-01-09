<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string|null $name
 * @property string|null $description
 * @property string|null $slug
 * @method static \Illuminate\Database\Eloquent\Builder|Permission newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Permission newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Permission query()
 * @method static \Illuminate\Database\Eloquent\Builder|Permission whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Permission whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Permission whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Permission whereSlug($value)
 * @mixin \Eloquent
 */
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
