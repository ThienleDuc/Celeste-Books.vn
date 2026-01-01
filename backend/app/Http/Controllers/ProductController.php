<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductDetail;
use App\Models\ProductImage;
use App\Models\ProductNotification;
use App\Models\ProductCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function index() {
        return $this->json(Product::with(['details', 'categories', 'images'])->get());
    }

    // 1. THÊM MỚI SẢN PHẨM
    public function store(Request $request) {
        $slug = Str::slug($request->name);

        if (Product::where('name', $request->name)->orWhere('slug', $slug)->exists()) {
            return $this->json(['message' => 'Sản phẩm đã tồn tại'], 409);
        }

        DB::beginTransaction();
        try {
            $productId = (Product::max('id') ?? 0) + 1;

            // --- Bảng Products ---
            $product = Product::create([
                'id' => $productId,
                'name' => $request->name,
                'slug' => $slug,
                'description' => $request->description,
                'author' => $request->author,
                'publisher' => $request->publisher,
                'publication_year' => $request->publication_year,
                'cover_image' => $request->cover_image,
                'language' => $request->language ?? 'Tiếng Việt',
                'status' => $request->status ?? 1,
                'Views' => $request->views ?? 0
            ]);

            // --- Bảng Product Details ---
            $detailId = (ProductDetail::max('id') ?? 0) + 1;

            ProductDetail::create([
                'id' => $detailId,
                'product_id' => $productId,
                'product_type' => $request->product_type,
                'sku' => $request->sku ?? 'SKU-'.time(),
                'original_price' => $request->original_price,
                'sale_price' => $request->sale_price,
                'stock' => $request->stock ?? 0,
                'file_url' => $request->file_url,
                'weight' => $request->weight,
                'length' => $request->length,
                'width' => $request->width,
                'height' => $request->height,
            ]);

            // --- Bảng Product Categories ---
            if ($request->category_ids) {
                foreach ($request->category_ids as $catId) {
                    ProductCategory::create([
                        'product_id' => $productId,
                        'category_id' => $catId
                    ]);
                }
            }

            // --- Bảng Product Images (Ảnh phụ) ---
            if ($request->images) {
                foreach ($request->images as $img) {
                    ProductImage::create([
                        'product_id' => $productId,
                        'image_url' => $img['url'],
                        'is_primary' => $img['is_primary'] ?? false,
                        'sort_order' => $img['sort_order'] ?? 0
                    ]);
                }
            }

            DB::commit();
            return $this->json(['message' => 'Thêm sản phẩm thành công', 'data' => $product], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->json(['error' => $e->getMessage()], 500);
        }
    }

    // 2. CẬP NHẬT SẢN PHẨM
    public function update(Request $request, $id) {
        $product = Product::findOrFail($id);
        $slug = Str::slug($request->name);

        $exists = Product::where('id', '!=', $id)
            ->where(function ($q) use ($request, $slug) {
                $q->where('name', $request->name)
                ->orWhere('slug', $slug);
            })
            ->exists();

        if ($exists) {
            return $this->json(['message' => 'Tên sản phẩm đã tồn tại'], 409);
        }

        DB::beginTransaction();
        try {
            // --- Cập nhật Products ---
            $product->update([
                'name' => $request->name,
                'slug' => $slug,
                'description' => $request->description,
                'author' => $request->author,
                'publisher' => $request->publisher,
                'publication_year' => $request->publication_year,
                'cover_image' => $request->cover_image,
                'language' => $request->language,
                'status' => $request->status,
            ]);

            // --- Cập nhật ProductDetails ---
            $detail = ProductDetail::where('product_id', $id)->first();
            if ($detail) {
                $oldPrice = $detail->sale_price;

                $detail->update($request->only([
                    'product_type',
                    'sku',
                    'original_price',
                    'sale_price',
                    'stock',
                    'file_url',
                    'weight',
                    'length',
                    'width',
                    'height'
                ]));

                // Gửi thông báo nếu giá giảm (ProductNotification)
                if ($request->sale_price < $oldPrice) {
                    $notiId = (ProductNotification::max('id') ?? 0) + 1;
                    ProductNotification::create([
                        'id' => $notiId,
                        'user_id' => 'U01',
                        'product_id' => $id,
                        'type' => 'price_drop',
                        'title' => 'Giảm giá cực sốc',
                        'content' => "Sản phẩm {$product->name} vừa giảm giá!",
                        'is_read' => false
                    ]);
                }
            }

            // --- Cập nhật Categories (Xóa cũ thêm mới) ---
            if ($request->has('category_ids')) {
                ProductCategory::where('product_id', $id)->delete();
                foreach ($request->category_ids as $catId) {
                    ProductCategory::create(['product_id' => $id, 'category_id' => $catId]);
                }
            }

            // --- Cập nhật Product Images ---
            if ($request->has('images')) {
                ProductImage::where('product_id', $id)->delete();
                foreach ($request->images as $img) {
                    ProductImage::create([
                        'product_id' => $id,
                        'image_url' => $img['url'],
                        'is_primary' => $img['is_primary'] ?? false,
                        'sort_order' => $img['sort_order'] ?? 0
                    ]);
                }
            }

            DB::commit();
            return $this->json(['message' => 'Cập nhật thành công']);
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->json(['error' => $e->getMessage()], 500);
        }
    }

    // 3. XÓA SẢN PHẨM
    public function destroy($id) {
        $product = Product::find($id);
        if (!$product) {
            return $this->json(['message' => 'Không tìm thấy sản phẩm'], 404);
        }

        $product->delete();
        return $this->json(['message' => 'Xóa sản phẩm thành công']);
    }
}
