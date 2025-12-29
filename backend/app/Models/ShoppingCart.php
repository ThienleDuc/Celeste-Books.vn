<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShoppingCart extends Model
{
    protected $table = 'shopping_carts';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'bigint';

    protected $fillable = [
        'id',
        'user_id',
        'created_at',
        'status',
        'updated_at',
    ];
}