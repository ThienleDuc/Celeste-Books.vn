<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string|null $name
 * @property string|null $code
 * @method static \Illuminate\Database\Eloquent\Builder|Province newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Province newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Province query()
 * @method static \Illuminate\Database\Eloquent\Builder|Province whereCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Province whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Province whereName($value)
 * @mixin \Eloquent
 * @mixin IdeHelperProvince
 */
class Province extends Model
{
    protected $table = 'provinces';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'int';

    protected $fillable = [
        'id',
        'name',
        'code',
    ];
     public function communes()
    {
        return $this->hasMany(Commune::class, 'province_id', 'id');
    }

    /**
     * Relationship với Address thông qua Commune
     */
    public function addresses()
    {
        return $this->hasManyThrough(
            Address::class,
            Commune::class,
            'province_id', // Foreign key on communes table
            'commune_id', // Foreign key on addresses table
            'id', // Local key on provinces table
            'id' // Local key on communes table
        );
    }
     public $timestamps = false;
}
