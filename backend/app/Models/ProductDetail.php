<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductDetail extends Model
{
    protected $table = 'product_details';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'int';

    protected $fillable = [
        'id',
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
