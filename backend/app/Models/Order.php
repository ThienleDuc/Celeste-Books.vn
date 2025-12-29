<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $table = 'orders';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'bigint';

    protected $fillable = [
        'id',
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
        'created_at',
        'updated_at',
    ];
}
