<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $review_id
 * @property string|null $image_url
 * @property \Illuminate\Support\Carbon|null $created_at
 * @method static \Illuminate\Database\Eloquent\Builder|ReviewImage newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|ReviewImage newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|ReviewImage query()
 * @method static \Illuminate\Database\Eloquent\Builder|ReviewImage whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ReviewImage whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ReviewImage whereImageUrl($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ReviewImage whereReviewId($value)
 * @mixin \Eloquent
 */
class ReviewImage extends Model
{
    protected $table = 'review_images';
    protected $primaryKey = 'id';
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = false;

    protected $fillable = [
        'review_id',
        'image_url',
        'created_at',
    ];
}
