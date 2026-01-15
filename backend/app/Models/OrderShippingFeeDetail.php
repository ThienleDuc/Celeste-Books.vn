<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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
