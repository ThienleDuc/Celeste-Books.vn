<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @mixin IdeHelperUserNotification
 */
class UserNotification extends Model
{
    protected $table = 'user_notifications';
    protected $primaryKey = 'id';
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = false;

    protected $fillable = [
        'id',
        'user_id',
        'type',
        'title',
        'content',
        'is_read',
        'created_at',
        'updated_at',
    ];

    /**
     * Tạo thông báo mới hoặc đánh dấu đã đọc nếu đã tồn tại
     *
     * @param string|int $userId
     * @param string $title
     * @param string $content
     * @param string $type
     * @return static
     */
    public static function add(string|int $userId, string $title, string $content, string $type = 'System'): static
    {
        // Tìm thông báo đã tồn tại
        $notification = static::where('user_id', $userId)
            ->where('type', $type)
            ->where('title', $title)
            ->where('content', $content)
            ->first();

        if ($notification) {
            // Nếu tồn tại, đánh dấu đã đọc
            $notification->is_read = true;
            $notification->save();
            return $notification;
        }

        // Nếu chưa tồn tại, tạo mới với is_read = false
        return static::create([
            'user_id' => $userId,
            'type' => $type,
            'title' => $title,
            'content' => $content,
            'is_read' => false,
        ]);
    }
}
