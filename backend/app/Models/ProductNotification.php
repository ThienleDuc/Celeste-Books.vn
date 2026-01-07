<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductNotification extends Model
{
    use HasFactory;

    protected $table = 'product_notifications';

    protected $primaryKey = 'id';
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'product_id',
        'type',
        'title',
        'content',
        'is_read',
    ];
}
