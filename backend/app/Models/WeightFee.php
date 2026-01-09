<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $min_weight
 * @property string $max_weight
 * @property string $base_price
 * @property \Illuminate\Support\Carbon|null $created_at
 * @method static \Illuminate\Database\Eloquent\Builder|WeightFee newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|WeightFee newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|WeightFee query()
 * @method static \Illuminate\Database\Eloquent\Builder|WeightFee whereBasePrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder|WeightFee whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|WeightFee whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|WeightFee whereMaxWeight($value)
 * @method static \Illuminate\Database\Eloquent\Builder|WeightFee whereMinWeight($value)
 * @mixin \Eloquent
 */
class WeightFee extends Model
{
    use HasFactory;

    protected $table = 'weight_fees';
    protected $fillable = [
        'min_weight',
        'max_weight',
        'multiplier',
        'created_at',
    ];
}
