<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    protected $table = 'messages';
    protected $primaryKey = 'id';
    public $incrementing = true;
    protected $keyType = 'bigint';

    protected $fillable = [
        'sender_id',
        'receiver_id',
        'product_id',
        'order_item_id',
        'message',
        'is_read',
        'created_at',
    ];
}
