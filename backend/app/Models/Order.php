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

    
    // ✔️ Đơn hàng có nhiều sản phẩm
    public function items()
    {
        return $this->hasMany(OrderItem::class, 'order_id');
    }

    // ✔️ Người đặt hàng
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // ✔️ Địa chỉ giao hàng

    public function shippingAddress()
    {
        return $this->belongsTo(Address::class, 'shipping_address_id');
    }

}
