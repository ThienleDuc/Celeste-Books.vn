<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
