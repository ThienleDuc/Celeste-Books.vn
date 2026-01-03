<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MessageNotification extends Model
{
    protected $table = 'message_notifications';
    protected $primaryKey = 'id';
    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = [
        'user_id',
        'message_id',
        'type',
        'title',
        'content',
        'is_read',
        'created_at',
        'updated_at',
    ];
}
