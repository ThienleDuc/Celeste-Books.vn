<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderNotification extends Model
{
    protected $table = 'order_notifications';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'int';

    protected $fillable = [
        'id',
        'user_id',
        'order_id',
        'type',
        'title',
        'content',
        'is_read',
        'created_at',
        'updated_at',
    ];
}
