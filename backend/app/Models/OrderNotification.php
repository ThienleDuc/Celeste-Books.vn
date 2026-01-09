<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string|null $user_id
 * @property int|null $order_id
 * @property string|null $type
 * @property string|null $title
 * @property string|null $content
 * @property int|null $is_read
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder|OrderNotification newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|OrderNotification newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|OrderNotification query()
 * @method static \Illuminate\Database\Eloquent\Builder|OrderNotification whereContent($value)
 * @method static \Illuminate\Database\Eloquent\Builder|OrderNotification whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|OrderNotification whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|OrderNotification whereIsRead($value)
 * @method static \Illuminate\Database\Eloquent\Builder|OrderNotification whereOrderId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|OrderNotification whereTitle($value)
 * @method static \Illuminate\Database\Eloquent\Builder|OrderNotification whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder|OrderNotification whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|OrderNotification whereUserId($value)
 * @mixin \Eloquent
 * @mixin IdeHelperOrderNotification
 */
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
