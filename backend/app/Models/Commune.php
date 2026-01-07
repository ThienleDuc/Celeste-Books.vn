<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int|null $province_id
 * @property string|null $name
 * @property string|null $code
 * @method static \Illuminate\Database\Eloquent\Builder|Commune newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Commune newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Commune query()
 * @method static \Illuminate\Database\Eloquent\Builder|Commune whereCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Commune whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Commune whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Commune whereProvinceId($value)
 * @mixin \Eloquent
 */
class Commune extends Model
{
    protected $table = 'communes';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'int';

    protected $fillable = [
        'id',
        'province_id',
        'name',
        'code',
    ];
}
