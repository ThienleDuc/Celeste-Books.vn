<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $min_distance
 * @property string $max_distance
 * @property string $multiplier
 * @property \Illuminate\Support\Carbon|null $created_at
 * @method static \Illuminate\Database\Eloquent\Builder|DistanceFee newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|DistanceFee newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|DistanceFee query()
 * @method static \Illuminate\Database\Eloquent\Builder|DistanceFee whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|DistanceFee whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|DistanceFee whereMaxDistance($value)
 * @method static \Illuminate\Database\Eloquent\Builder|DistanceFee whereMinDistance($value)
 * @method static \Illuminate\Database\Eloquent\Builder|DistanceFee whereMultiplier($value)
 * @mixin \Eloquent
 */
class DistanceFee extends Model
{
    use HasFactory;

    protected $table = 'distance_fees';
    protected $fillable = [
        'min_distance',
        'max_distance',
        'multiplier',
        'created_at',
    ];
}
