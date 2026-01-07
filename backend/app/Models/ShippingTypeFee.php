<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $shipping_type
 * @property string $multiplier
 * @property \Illuminate\Support\Carbon|null $created_at
 * @method static \Illuminate\Database\Eloquent\Builder|ShippingTypeFee newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|ShippingTypeFee newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|ShippingTypeFee query()
 * @method static \Illuminate\Database\Eloquent\Builder|ShippingTypeFee whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ShippingTypeFee whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ShippingTypeFee whereMultiplier($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ShippingTypeFee whereShippingType($value)
 * @mixin \Eloquent
 */
class ShippingTypeFee extends Model
{
    use HasFactory;

    protected $table = 'shipping_type_fees';
    protected $fillable = [
        'shipping_type',
        'multiplier',
        'created_at',
    ];
}
