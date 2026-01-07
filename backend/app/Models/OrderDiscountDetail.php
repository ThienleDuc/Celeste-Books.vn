<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $order_id
 * @property int|null $product_discount_id
 * @property int|null $shipping_discount_id
 * @property string $amount
 * @property-read \App\Models\Order $order
 * @property-read \App\Models\OrderProductDiscount|null $productDiscount
 * @property-read \App\Models\OrderShippingDiscount|null $shippingDiscount
 * @method static \Illuminate\Database\Eloquent\Builder|OrderDiscountDetail newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|OrderDiscountDetail newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|OrderDiscountDetail query()
 * @method static \Illuminate\Database\Eloquent\Builder|OrderDiscountDetail whereAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder|OrderDiscountDetail whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|OrderDiscountDetail whereOrderId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|OrderDiscountDetail whereProductDiscountId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|OrderDiscountDetail whereShippingDiscountId($value)
 * @mixin \Eloquent
 */
class OrderDiscountDetail extends Model
{
    use HasFactory;

    protected $table = 'order_discount_details';
    protected $fillable = [
        'order_id',
        'product_discount_id',
        'shipping_discount_id',
        'amount',
    ];

    public $timestamps = false;

    public function order() {
        return $this->belongsTo(Order::class);
    }

    public function productDiscount() {
        return $this->belongsTo(OrderProductDiscount::class, 'product_discount_id');
    }

    public function shippingDiscount() {
        return $this->belongsTo(OrderShippingDiscount::class, 'shipping_discount_id');
    }
}
