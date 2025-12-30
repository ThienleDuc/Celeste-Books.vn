<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderShippingFeeDetail extends Model
{
    use HasFactory;

    protected $table = 'order_shipping_fee_details';
    protected $fillable = [
        'order_id',
        'weight_fee_id',
        'distance_fee_id',
        'shipping_type_fee_id',
    ];

    public function order() {
        return $this->belongsTo(Order::class);
    }

    public function weightFee() {
        return $this->belongsTo(WeightFee::class);
    }

    public function distanceFee() {
        return $this->belongsTo(DistanceFee::class);
    }

    public function shippingTypeFee() {
        return $this->belongsTo(ShippingTypeFee::class);
    }
}
