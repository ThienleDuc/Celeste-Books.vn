<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int|null $order_item_id
 * @property string $user_id
 * @property int|null $rating
 * @property string|null $title
 * @property string|null $content
 * @property string|null $images
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder|Review newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Review newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Review query()
 * @method static \Illuminate\Database\Eloquent\Builder|Review whereContent($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Review whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Review whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Review whereImages($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Review whereOrderItemId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Review whereRating($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Review whereTitle($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Review whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Review whereUserId($value)
 * @mixin \Eloquent
 */
class Review extends Model
{
    protected $table = 'reviews';
    protected $primaryKey = 'id';
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = false;

    

    protected $fillable = [
       
        'order_item_id',
        'user_id',
        'rating',
        'title',
        'content',
        'images',
        'created_at',
        'updated_at',
    ];
    public function user()
    {
        // Liên kết với bảng users qua khóa ngoại user_id
        return $this->belongsTo(User::class, 'user_id', 'id');
    }
    public function images()
    {
        // 'review_id' là khóa ngoại trong bảng review_images
        // 'id' là khóa chính của bảng reviews
        return $this->hasMany(ReviewImage::class, 'review_id', 'id');
    }
    public function orderItem()
    {
        return $this->belongsTo(OrderItem::class, 'order_item_id', 'id');
    }
}
