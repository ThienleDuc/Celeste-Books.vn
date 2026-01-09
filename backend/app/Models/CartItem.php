<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int|null $cart_id
 * @property int|null $product_id
 * @property int|null $product_details_id
 * @property int $quantity
 * @property string|null $price_at_time
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder|CartItem newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|CartItem newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|CartItem query()
 * @method static \Illuminate\Database\Eloquent\Builder|CartItem whereCartId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|CartItem whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|CartItem whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|CartItem wherePriceAtTime($value)
 * @method static \Illuminate\Database\Eloquent\Builder|CartItem whereProductDetailsId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|CartItem whereProductId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|CartItem whereQuantity($value)
 * @method static \Illuminate\Database\Eloquent\Builder|CartItem whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class CartItem extends Model
{
    protected $table = 'cart_items';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'int';

    protected $fillable = [
        'id',
        'cart_id',
        'product_id',
        'product_details_id',
        'quantity',
        'price_at_time',
        'created_at',
        'updated_at',
    ];

    // Định nghĩa quan hệ với Product và ProductDetail và ShoppingCart
    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', 'id');
    }

    public function productDetail()
    {
        return $this->belongsTo(ProductDetail::class, 'product_details_id', 'id');
    }

    public function cart()
    {
        return $this->belongsTo(ShoppingCart::class, 'cart_id', 'id');
    }
}
