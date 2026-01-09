<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string|null $type
 * @property string $amount
 * @property int $quantity
 * @property int $used_quantity
 * @property string|null $created_at
 * @method static \Illuminate\Database\Eloquent\Builder|OrderShippingDiscount newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|OrderShippingDiscount newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|OrderShippingDiscount query()
 * @method static \Illuminate\Database\Eloquent\Builder|OrderShippingDiscount whereAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder|OrderShippingDiscount whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|OrderShippingDiscount whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|OrderShippingDiscount whereQuantity($value)
 * @method static \Illuminate\Database\Eloquent\Builder|OrderShippingDiscount whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder|OrderShippingDiscount whereUsedQuantity($value)
 * @mixin \Eloquent
 * @mixin IdeHelperOrderShippingDiscount
 */
class OrderShippingDiscount extends Model
{
    use HasFactory;

    protected $table = 'order_shipping_discounts';
    protected $fillable = [
        'type',
        'amount',
        'created_at'
    ];

    public $timestamps = false;
}
