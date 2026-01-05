<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
}
