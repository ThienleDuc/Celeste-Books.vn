<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Factories\HasFactory;

/**
 * @mixin IdeHelperProduct
 */
class Product extends Model
{
    use HasFactory;

    protected $table = 'products';

    protected $primaryKey = 'id';

    // BIGINT AUTO_INCREMENT
    public $incrementing = true;
    protected $keyType = 'int'; // Laravel dùng int cho BIGINT vẫn OK

    // Có created_at nhưng KHÔNG có updated_at
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
    public function images()
    {
        return $this->hasMany(ProductImage::class, 'product_id', 'id')
                    ->orderBy('sort_order');
    }

    // 2. Product thuộc nhiều categories (qua bảng trung gian)
    public function categories()
    {
        return $this->belongsToMany(
            Category::class,
            'product_categories',
            'product_id',
            'category_id'
        );
    }    

    public function detail(): HasOne
    {
        return $this->hasOne(ProductDetail::class, 'product_id', 'id');
    }
    
    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class, 'product_id', 'id');
    }
    
    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class, 'product_id', 'id');
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