<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    protected $table = 'order_items';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'int';
    public $timestamps = false;
    protected $fillable = [
        'id',
        'order_id',
        'product_id',
        'product_details_id',
        'product_type',
        'quantity',
        'price',
        'total_price',
        'created_at',
    ];
    // ✔️ Sản phẩm
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    // ✔️ Chi tiết sản phẩm
    public function productDetail()
    {
        return $this->belongsTo(ProductDetail::class, 'product_details_id');
    }

    // ✔️ Thuộc đơn hàng
    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
