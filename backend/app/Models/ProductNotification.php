<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductNotification extends Model
{
    protected $table = 'product_notifications';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'bigint';

    protected $fillable = [
        'id',
        'user_id',
        'product_id',
        'type',
        'title',
        'content',
        'is_read',
        'created_at',
        'updated_at',
    ];
}