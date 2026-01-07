<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int|null $product_id
 * @property string|null $product_type
 * @property string|null $sku
 * @property string|null $original_price
 * @property string|null $sale_price
 * @property int|null $stock
 * @property string|null $file_url
 * @property string|null $weight
 * @property string|null $length
 * @property string|null $width
 * @property string|null $height
 * @property string|null $created_at
 * @method static \Illuminate\Database\Eloquent\Builder|ProductDetail newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|ProductDetail newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|ProductDetail query()
 * @method static \Illuminate\Database\Eloquent\Builder|ProductDetail whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ProductDetail whereFileUrl($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ProductDetail whereHeight($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ProductDetail whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ProductDetail whereLength($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ProductDetail whereOriginalPrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ProductDetail whereProductId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ProductDetail whereProductType($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ProductDetail whereSalePrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ProductDetail whereSku($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ProductDetail whereStock($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ProductDetail whereWeight($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ProductDetail whereWidth($value)
 * @mixin \Eloquent
 */
class ProductDetail extends Model
{
    protected $table = 'product_details';
    protected $primaryKey = 'id';
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = false;

    protected $fillable = [
        'product_id',
        'product_type',
        'sku',
        'original_price',
        'sale_price',
        'stock',
        'file_url',
        'weight',
        'length',
        'width',
        'height',
        'created_at',
    ];
}
