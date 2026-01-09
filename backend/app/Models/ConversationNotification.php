<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @method static \Illuminate\Database\Eloquent\Builder|MessageNotification newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|MessageNotification newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|MessageNotification query()
 * @mixin \Eloquent
 * @mixin IdeHelperConversationNotification
 */
class ConversationNotification extends Model
{
    protected $table = 'conversation_notifications';
    protected $primaryKey = 'id';
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'conversation_id',
        'type',
        'title',
        'content',
        'last_message_id',
        'unread_count',
        'is_read',
        'created_at',
        'updated_at',
    ];
}
