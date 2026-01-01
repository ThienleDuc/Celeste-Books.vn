<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $table = 'products';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'int';

    protected $fillable = [
        'id',
        'name',
        'slug',
        'description',
        'author',
        'publisher',
        'publication_year',
        'language',
        'status',
        'Views',
        'created_at',
    ];
    public function detail()
    {
        return $this->hasMany(ProductDetail::class, 'product_id', 'id');
    }
     public $timestamps = false;
}

