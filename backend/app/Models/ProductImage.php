<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

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
