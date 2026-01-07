<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $name
 * @property string|null $slug
 * @property string|null $description
 * @property string|null $author
 * @property string|null $publisher
 * @property int|null $publication_year
 * @property string|null $language
 * @property bool|null $status
 * @property int|null $views
 * @property int|null $purchase_count
 * @property float|null $rating
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Category> $categories
 * @property-read int|null $categories_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\ProductImage> $images
 * @property-read int|null $images_count
 * @method static \Illuminate\Database\Eloquent\Builder|Product newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Product newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Product query()
 * @method static \Illuminate\Database\Eloquent\Builder|Product whereAuthor($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Product whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Product whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Product whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Product whereLanguage($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Product whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Product wherePublicationYear($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Product wherePublisher($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Product wherePurchaseCount($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Product whereRating($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Product whereSlug($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Product whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Product whereViews($value)
 * @mixin \Eloquent
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
}
