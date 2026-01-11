<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $table = 'orders';
    
    // 1. Sửa thành true vì ID của bạn là AUTO_INCREMENT trong SQL
    public $incrementing = true; 
    protected $keyType = 'int';

    protected $fillable = [
        'user_id',
        'order_code',
        'status',
        'subtotal',
        'shipping_fee',
        'discount',
        'total_amount',
        'shipping_address_id',
        'payment_method',
        'payment_status',
    ];

    // 2. Bổ sung quan hệ để Controller có thể gọi $order->items
    public function items()
    {
        return $this->hasMany(OrderItem::class, 'order_id', 'id');
    }

    public function shippingAddress()
    {
        return $this->belongsTo(Address::class, 'shipping_address_id');
    }
}