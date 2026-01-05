<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Collection;

class Product extends Model
{
    protected $table = 'products';
    
    protected $fillable = [
        'name', 'slug', 'description', 'author', 'publisher',
        'publication_year', 'language', 'status', 'Views', 'purchase_count', 'rating'
    ];

    public function detail(): HasOne
    {
        return $this->hasOne(ProductDetail::class, 'product_id', 'id');
    }
    
    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(
            Category::class, 
            'product_categories', 
            'product_id', 
            'category_id'
        );
    }
    
    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class, 'product_id', 'id');
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