<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough; // <--- QUAN TRỌNG: Thêm dòng này
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Product extends Model
{
    use HasFactory;

    protected $table = 'products';

    protected $primaryKey = 'id';

    public $incrementing = true;
    protected $keyType = 'int';

    public $timestamps = false;
    const UPDATED_AT = null;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'author',
        'publisher',
        'publication_year',
        'language',
        'status',
        'views',
        'purchase_count',
        'rating',
    ];

    protected $casts = [
        'status'          => 'boolean',
        'views'           => 'integer',
        'purchase_count'  => 'integer',
        'rating'          => 'float',
        'created_at'      => 'datetime',
    ];

    // 1. Product có nhiều images
    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class, 'product_id', 'id')
                    ->orderBy('sort_order', 'asc');
    }

    // 2. Product thuộc nhiều categories
    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(
            Category::class,
            'product_categories',
            'product_id',
            'category_id'
        );
    }    

    // 3. Chi tiết đại diện (Lấy 1 cái để hiện giá ở trang danh sách)
    public function detail(): HasOne
    {
        return $this->hasOne(ProductDetail::class, 'product_id', 'id');
    }
    
    // 4. (Khuyên dùng) Lấy TOÀN BỘ chi tiết (Ví dụ: Sách giấy + Ebook)
    public function productDetails(): HasMany
    {
        return $this->hasMany(ProductDetail::class, 'product_id', 'id');
    }
    
    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class, 'product_id', 'id');
    }
    
    // =================================================================
    // SỬA ĐỔI QUAN TRỌNG Ở ĐÂY
    // =================================================================
    // Vì Reviews liên kết qua bảng OrderItems, ta dùng HasManyThrough
    public function reviews(): HasManyThrough
    {
        return $this->hasManyThrough(
            Review::class,      // Model Đích (Review)
            OrderItem::class,   // Model Trung Gian (OrderItem)
            'product_id',       // Khóa ngoại trên bảng trung gian (order_items.product_id)
            'order_item_id',    // Khóa ngoại trên bảng đích (reviews.order_item_id)
            'id',               // Khóa chính bảng hiện tại (products.id)
            'id'                // Khóa chính bảng trung gian (order_items.id)
        );
    }
    
    public function scopeActive($query)
    {
        return $query->where('status', 1);
    }
    
    public function scopeSearch($query, $search)
    {
        return $query->where('name', 'like', '%' . $search . '%')
                     ->orWhere('author', 'like', '%' . $search . '%')
                     ->orWhere('publisher', 'like', '%' . $search . '%');
    }
}