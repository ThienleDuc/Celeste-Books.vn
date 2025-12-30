<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderProductDiscount extends Model
{
    use HasFactory;

    protected $table = 'order_product_discounts';
    protected $fillable = [
        'order_id',
        'type',
        'amount',
        'quantity',
        'created_at',
    ];

    public function order() {
        return $this->belongsTo(Order::class);
    }
}
