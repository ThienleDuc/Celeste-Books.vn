<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CartItem extends Model
{
    protected $table = 'cart_items';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'bigint';

    protected $fillable = [
        'id',
        'cart_id',
        'product_id',
        'price_at_time',
        'created_at',
        'updated_at',
    ];
}
