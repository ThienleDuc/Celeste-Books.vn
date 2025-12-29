<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductCategory extends Model
{
    protected $table = 'product_categories';
    protected $primaryKey = null; // Pivot table without single primary key
    public $incrementing = false;

    protected $fillable = [
        'product_id',
        'category_id',
    ];
}
