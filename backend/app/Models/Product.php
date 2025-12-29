<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $table = 'products';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'bigint';

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
        'view',
        'created_at',
    ];
}