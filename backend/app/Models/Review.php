<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    protected $table = 'reviews';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'bigint';

    protected $fillable = [
        'id',
        'order_item_id',
        'user_id',
        'rating',
        'title',
        'content',
        'images',
        'created_at',
        'updated_at',
    ];
}
