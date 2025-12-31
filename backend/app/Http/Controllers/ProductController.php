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

        if (Product::where('name', $request->name)
            ->orWhere('slug', $slug)
            ->exists()) {
            return $this->json([
                'message' => 'Sản phẩm đã tồn tại'
            ], 409);
        }

        DB::beginTransaction();
        try {
            $productId = (Product::max('id') ?? 0) + 1;

            // Bảng Products
            $product = Product::create([
                'id' => $productId,
                'name' => $request->name,
                'slug' => Str::slug($request->name),
                'description' => $request->description,
                'author' => $request->author,
                'publisher' => $request->publisher,
                'publication_year' => $request->publication_year,
                'status' => $request->status ?? 1
            ]);

            // Bảng Product Details
            ProductDetail::create([
                'id' => (ProductDetail::max('id') ?? 0) + 1,
                'product_id' => $productId,
                'product_type' => $request->product_type, // 'Sách giấy' hoặc 'Sách điện tử'
                'sku' => $request->sku ?? 'SKU-'.time(),
                'original_price' => $request->original_price,
                'sale_price' => $request->sale_price,
                'stock' => $request->stock
            ]);

            // Bảng Product Categories
            if ($request->category_ids) {
                foreach ($request->category_ids as $catId) {
                    ProductCategory::create([
                        'product_id' => $productId,
                        'category_id' => $catId
                    ]);
                }
            }

            // Bảng Product Images
            if ($request->images) {
                foreach ($request->images as $img) {
                    ProductImage::create([
                        'product_id' => $productId,
                        'image_url' => $img['url'],
                        'is_primary' => $img['is_primary'] ?? false
                    ]);
                }
            }

            DB::commit();
            return $this->json(['message' => 'Thêm sản phẩm thành công'], 201);
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
            return $this->json([
                'message' => 'Tên sản phẩm đã tồn tại'
            ], 409);
        }
        DB::beginTransaction();
        try {
            // Cập nhật Products
            $product->update([
                'name' => $request->name,
                'slug' => Str::slug($request->name),
                'status' => $request->status
            ]);

            // Cập nhật ProductDetails
            $detail = ProductDetail::where('product_id', $id)->first();
            $oldPrice = $detail->sale_price;
            $detail->update($request->only(['original_price', 'sale_price', 'stock', 'product_type']));

            // Cập nhật Categories (Xóa cũ thêm mới)
            ProductCategory::where('product_id', $id)->delete();
            foreach ($request->category_ids as $catId) {
                ProductCategory::create(['product_id' => $id, 'category_id' => $catId]);
            }

            // Gửi thông báo nếu giá giảm (ProductNotification)
            if ($request->sale_price < $oldPrice) {
                ProductNotification::create([
                    'id' => (ProductNotification::max('id') ?? 0) + 1,
                    'user_id' => 'U01', // Mặc định cho Admin hoặc lấy từ Auth
                    'product_id' => $id,
                    'type' => 'price_drop',
                    'title' => 'Giảm giá cực sốc',
                    'content' => "Sản phẩm {$product->name} vừa giảm giá!",
                    'is_read' => false
                ]);
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
        // Do DB có ON DELETE CASCADE nên khi xóa Product, các bảng liên quan sẽ tự động xóa
        Product::findOrFail($id)->delete();
        return $this->json(['message' => 'Xóa sản phẩm thành công']);
    }
}
