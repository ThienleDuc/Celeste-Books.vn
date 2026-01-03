<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShoppingCart extends Model
{
    protected $table = 'shopping_carts';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'int';

    protected $fillable = [
        'id',
        'user_id',
        'created_at',
        'status',
        'updated_at',
    ];

    // Relationships with CartItem
    public function items() {
        return $this->hasMany(CartItem::class, 'cart_id', 'id');
    }
}
