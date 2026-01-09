<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

/**
 * @property int $id
 * @property int $product_id
 * @property string|null $image_url
 * @property int|null $is_primary
 * @property int|null $sort_order
 * @property string|null $created_at
 * @method static \Illuminate\Database\Eloquent\Builder|ProductImage newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|ProductImage newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|ProductImage query()
 * @method static \Illuminate\Database\Eloquent\Builder|ProductImage whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ProductImage whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ProductImage whereImageUrl($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ProductImage whereIsPrimary($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ProductImage whereProductId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ProductImage whereSortOrder($value)
 * @mixin \Eloquent
 * @mixin IdeHelperProductImage
 */
class ProductImage extends Model
{
    protected $table = 'product_images';
    protected $primaryKey = 'id';
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = false;

    protected $fillable = [
        'product_id',
        'image_url',
        'is_primary',
        'sort_order',
        'created_at',
    ];

    public static function syncImages(int $productId, array $images): void
    {
        DB::transaction(function () use ($productId, $images) {

            // 1. Xóa toàn bộ ảnh cũ
            self::where('product_id', $productId)->delete();

            if (empty($images)) {
                return;
            }

            // 2. Chuẩn bị dữ liệu insert
            $data = [];
            foreach ($images as $index => $imageUrl) {
                $data[] = [
                    'product_id' => $productId,
                    'image_url'  => $imageUrl,
                    'is_primary' => $index === 0 ? 1 : 0, // ảnh đầu tiên
                    'sort_order' => $index + 1,
                    'created_at' => now(),
                ];
            }

            // 3. Insert hàng loạt
            self::insert($data);
        });
    }
}
