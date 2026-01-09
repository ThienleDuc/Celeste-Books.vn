<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string|null $user_id
 * @property int|null $product_id
 * @property string|null $type
 * @property string|null $title
 * @property string|null $content
 * @property int|null $is_read
 * @property string|null $created_at
 * @property string|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder|ProductNotification newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|ProductNotification newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|ProductNotification query()
 * @method static \Illuminate\Database\Eloquent\Builder|ProductNotification whereContent($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ProductNotification whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ProductNotification whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ProductNotification whereIsRead($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ProductNotification whereProductId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ProductNotification whereTitle($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ProductNotification whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ProductNotification whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ProductNotification whereUserId($value)
 * @mixin \Eloquent
 * @mixin IdeHelperProductNotification
 */
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
