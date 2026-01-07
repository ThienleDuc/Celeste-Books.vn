<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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
