<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderDiscountDetail extends Model
{
    use HasFactory;

    protected $table = 'order_discount_details';
    protected $fillable = [
        'order_id',
        'product_discount_id',
        'shipping_discount_id',
        'amount',
        'created_at',
    ];

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
