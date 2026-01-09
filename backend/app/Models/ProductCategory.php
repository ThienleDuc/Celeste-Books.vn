<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

/**
 * @property int $product_id
 * @property int $category_id
 * @method static \Illuminate\Database\Eloquent\Builder|ProductCategory newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|ProductCategory newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|ProductCategory query()
 * @method static \Illuminate\Database\Eloquent\Builder|ProductCategory whereCategoryId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ProductCategory whereProductId($value)
 * @mixin \Eloquent
 * @mixin IdeHelperProductCategory
 */
class ProductCategory extends Model
{
    protected $table = 'product_categories';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'product_id',
        'category_id',
    ];

    public static function syncCategories(int $productId, array $categoryIds): void
    {
        DB::transaction(function () use ($productId, $categoryIds) {

            $categoryIds = array_unique($categoryIds);

            /* ===== CATEGORY HIỆN TẠI ===== */
            $currentCategoryIds = DB::table('product_categories')
                ->where('product_id', $productId)
                ->pluck('category_id')
                ->toArray();

            /* ===== TÍNH TOÁN ===== */
            $toInsert = array_diff($categoryIds, $currentCategoryIds);
            $toDelete = array_diff($currentCategoryIds, $categoryIds);

            /* ===== INSERT ===== */
            if (!empty($toInsert)) {
                $data = [];
                foreach ($toInsert as $categoryId) {
                    $data[] = [
                        'product_id'  => $productId,
                        'category_id' => $categoryId,
                    ];
                }

                DB::table('product_categories')->insert($data);
            }

            /* ===== DELETE ===== */
            if (!empty($toDelete)) {
                DB::table('product_categories')
                    ->where('product_id', $productId)
                    ->whereIn('category_id', $toDelete)
                    ->delete();
            }
        });
    }
}
