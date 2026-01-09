<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $order_id
 * @property int $weight_fee_id
 * @property int $distance_fee_id
 * @property int $shipping_type_fee_id
 * @property string $amount
 * @property-read \App\Models\DistanceFee $distanceFee
 * @property-read \App\Models\Order $order
 * @property-read \App\Models\ShippingTypeFee $shippingTypeFee
 * @property-read \App\Models\WeightFee $weightFee
 * @method static \Illuminate\Database\Eloquent\Builder|OrderShippingFeeDetail newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|OrderShippingFeeDetail newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|OrderShippingFeeDetail query()
 * @method static \Illuminate\Database\Eloquent\Builder|OrderShippingFeeDetail whereAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder|OrderShippingFeeDetail whereDistanceFeeId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|OrderShippingFeeDetail whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|OrderShippingFeeDetail whereOrderId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|OrderShippingFeeDetail whereShippingTypeFeeId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|OrderShippingFeeDetail whereWeightFeeId($value)
 * @mixin \Eloquent
 * @mixin IdeHelperOrderShippingFeeDetail
 */
class OrderShippingFeeDetail extends Model
{
    protected $table = 'order_shipping_fee_details';
    protected $fillable = [
        'order_id',
        'weight_fee_id',
        'distance_fee_id',
        'shipping_type_fee_id',
        'amount'
    ];
    public $timestamps = false;

    public function order()
    {
        return $this->belongsTo(Order::class, 'order_id');
    }

    public function weightFee()
    {
        return $this->belongsTo(WeightFee::class, 'weight_fee_id');
    }

    public function distanceFee()
    {
        return $this->belongsTo(DistanceFee::class, 'distance_fee_id');
    }

    public function shippingTypeFee()
    {
        return $this->belongsTo(ShippingTypeFee::class, 'shipping_type_fee_id');
    }
}
