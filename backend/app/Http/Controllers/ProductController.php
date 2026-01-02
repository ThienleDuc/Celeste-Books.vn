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
use Illuminate\Support\Facades\Validator;

class ProductController extends Controller
{
    // Helper method để trả về JSON response
    private function jsonResponse($data = [], $message = '', $status = 200, $errors = null)
    {
        $response = [
            'success' => $status >= 200 && $status < 300,
            'message' => $message,
            'data' => $data
        ];
        
        if ($errors) {
            $response['errors'] = $errors;
        }
        
        return response()->json($response, $status);
    }

    // 1. LẤY DANH SÁCH SẢN PHẨM
    public function index(Request $request)
    {
        try {
            $query = Product::with(['detail', 'categories', 'images']);
            
            // Lọc theo trạng thái
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }
            
            // Lọc theo ngôn ngữ
            if ($request->has('language')) {
                $query->where('language', $request->language);
            }
            
            // Tìm kiếm theo tên
            if ($request->has('search')) {
                $query->where('name', 'like', '%' . $request->search . '%');
            }
            
            // Sắp xếp
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);
            
            // Phân trang (nếu cần)
            $perPage = $request->get('per_page', 20);
            $products = $query->paginate($perPage);
            
            return $this->jsonResponse($products, 'Lấy danh sách sản phẩm thành công');
        } catch (\Exception $e) {
            return $this->jsonResponse([], 'Lỗi server', 500, $e->getMessage());
        }
    }
    
    // 2. LẤY CHI TIẾT SẢN PHẨM
    public function show($id)
    {
        try {
            $product = Product::with(['detail', 'categories', 'images'])->find($id);

            if (!$product) {
                return $this->jsonResponse([], 'Không tìm thấy sản phẩm', 404);
            }
            
            // Tăng lượt xem
            $product->increment('Views');
            
            return $this->jsonResponse($product, 'Lấy chi tiết sản phẩm thành công');
        } catch (\Exception $e) {
            return $this->jsonResponse([], 'Lỗi server', 500, $e->getMessage());
        }
    }

    // 3. GỢI Ý SẢN PHẨM LIÊN QUAN
    public function suggest($id)
    {
        try {
            $product = Product::find($id);

            if (!$product) {
                return $this->jsonResponse([], 'Không tìm thấy sản phẩm', 404);
            }

            $suggests = Product::where('id', '!=', $id)
                ->where('status', 1) // Chỉ lấy sản phẩm active
                ->where('language', $product->language)
                ->inRandomOrder()
                ->limit(4)
                ->get(['id', 'name', 'cover_image', 'slug']);

            return $this->jsonResponse($suggests, 'Lấy sản phẩm gợi ý thành công');
        } catch (\Exception $e) {
            return $this->jsonResponse([], 'Lỗi server', 500, $e->getMessage());
        }
    }

    // 4. TẠO SẢN PHẨM MỚI
    public function store(Request $request)
    {
        // Validate dữ liệu
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'author' => 'nullable|string|max:100',
            'publisher' => 'nullable|string|max:100',
            'publication_year' => 'nullable|integer|min:1900|max:' . date('Y'),
            'cover_image' => 'nullable|url',
            'language' => 'nullable|string|max:50',
            'status' => 'nullable|integer|in:0,1',
            
            // Product detail validation
            'product_type' => 'required|string',
            'original_price' => 'required|numeric|min:0',
            'sale_price' => 'required|numeric|min:0|lte:original_price',
            'stock' => 'nullable|integer|min:0',
            'file_url' => 'nullable|url',
            'weight' => 'nullable|numeric|min:0',
            'length' => 'nullable|numeric|min:0',
            'width' => 'nullable|numeric|min:0',
            'height' => 'nullable|numeric|min:0',
            
            'category_ids' => 'nullable|array',
            'category_ids.*' => 'integer|exists:categories,id',
            
            'images' => 'nullable|array',
            'images.*.url' => 'required|url',
            'images.*.is_primary' => 'boolean',
            'images.*.sort_order' => 'integer'
        ]);

        if ($validator->fails()) {
            return $this->jsonResponse([], 'Dữ liệu không hợp lệ', 422, $validator->errors());
        }

        $slug = Str::slug($request->name);

        // Kiểm tra trùng lặp
        if (Product::where('name', $request->name)->orWhere('slug', $slug)->exists()) {
            return $this->jsonResponse([], 'Sản phẩm đã tồn tại', 409);
        }

        DB::beginTransaction();
        try {
            $productId = (Product::max('id') ?? 0) + 1;

            // Tạo sản phẩm chính
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
                'Views' => 0
            ]);

            // Tạo chi tiết sản phẩm
            ProductDetail::create([
                'id' => (ProductDetail::max('id') ?? 0) + 1,
                'product_id' => $productId,
                'product_type' => $request->product_type,
                'sku' => $request->sku ?? 'SKU-' . time() . '-' . $productId,
                'original_price' => $request->original_price,
                'sale_price' => $request->sale_price,
                'stock' => $request->stock ?? 0,
                'file_url' => $request->file_url,
                'weight' => $request->weight,
                'length' => $request->length,
                'width' => $request->width,
                'height' => $request->height,
            ]);

            // Thêm danh mục
            if ($request->category_ids && is_array($request->category_ids)) {
                foreach ($request->category_ids as $catId) {
                    ProductCategory::create([
                        'product_id' => $productId,
                        'category_id' => $catId
                    ]);
                }
            }

            // Thêm hình ảnh phụ
            if ($request->images && is_array($request->images)) {
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
            
            // Load lại relationships để trả về đầy đủ
            $product->load(['detail', 'categories', 'images']);
            
            return $this->jsonResponse($product, 'Thêm sản phẩm thành công', 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->jsonResponse([], 'Thêm sản phẩm thất bại', 500, $e->getMessage());
        }
    }

    // 5. CẬP NHẬT SẢN PHẨM
    public function update(Request $request, $id)
    {
        $product = Product::find($id);
        
        if (!$product) {
            return $this->jsonResponse([], 'Không tìm thấy sản phẩm', 404);
        }

        // Validate dữ liệu
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'author' => 'nullable|string|max:100',
            'publisher' => 'nullable|string|max:100',
            'publication_year' => 'nullable|integer|min:1900|max:' . date('Y'),
            'cover_image' => 'nullable|url',
            'language' => 'nullable|string|max:50',
            'status' => 'nullable|integer|in:0,1',
            
            'product_type' => 'nullable|string',
            'original_price' => 'nullable|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'stock' => 'nullable|integer|min:0',
            
            'category_ids' => 'nullable|array',
            'category_ids.*' => 'integer|exists:categories,id',
            
            'images' => 'nullable|array',
            'images.*.url' => 'required|url',
            'images.*.is_primary' => 'boolean',
            'images.*.sort_order' => 'integer'
        ]);

        if ($validator->fails()) {
            return $this->jsonResponse([], 'Dữ liệu không hợp lệ', 422, $validator->errors());
        }

        $slug = Str::slug($request->name);

        // Kiểm tra trùng tên/slug với sản phẩm khác
        $exists = Product::where('id', '!=', $id)
            ->where(function ($q) use ($request, $slug) {
                $q->where('name', $request->name)
                  ->orWhere('slug', $slug);
            })
            ->exists();

        if ($exists) {
            return $this->jsonResponse([], 'Tên sản phẩm đã tồn tại', 409);
        }

        DB::beginTransaction();
        try {
            // Lưu giá cũ để so sánh
            $oldPrice = $product->detail->sale_price ?? 0;
            
            // Cập nhật sản phẩm chính
            $product->update([
                'name' => $request->name,
                'slug' => $slug,
                'description' => $request->description,
                'author' => $request->author,
                'publisher' => $request->publisher,
                'publication_year' => $request->publication_year,
                'cover_image' => $request->cover_image,
                'language' => $request->language ?? $product->language,
                'status' => $request->status ?? $product->status,
            ]);

            // Cập nhật chi tiết sản phẩm
            $detail = ProductDetail::where('product_id', $id)->first();
            if ($detail) {
                $detail->update([
                    'product_type' => $request->product_type ?? $detail->product_type,
                    'sku' => $request->sku ?? $detail->sku,
                    'original_price' => $request->original_price ?? $detail->original_price,
                    'sale_price' => $request->sale_price ?? $detail->sale_price,
                    'stock' => $request->stock ?? $detail->stock,
                    'file_url' => $request->file_url ?? $detail->file_url,
                    'weight' => $request->weight ?? $detail->weight,
                    'length' => $request->length ?? $detail->length,
                    'width' => $request->width ?? $detail->width,
                    'height' => $request->height ?? $detail->height,
                ]);
                
                // Tạo thông báo nếu giá giảm
                $newPrice = $detail->sale_price;
                if ($newPrice < $oldPrice) {
                    ProductNotification::create([
                        'id' => (ProductNotification::max('id') ?? 0) + 1,
                        'user_id' => auth()->id() ?? 'U01', // Nếu có authentication
                        'product_id' => $id,
                        'type' => 'price_drop',
                        'title' => 'Giảm giá cực sốc',
                        'content' => "Sản phẩm {$product->name} vừa giảm giá từ " . number_format($oldPrice) . " xuống " . number_format($newPrice),
                        'is_read' => false
                    ]);
                }
            }

            // Cập nhật danh mục
            if ($request->has('category_ids')) {
                ProductCategory::where('product_id', $id)->delete();
                foreach ($request->category_ids as $catId) {
                    ProductCategory::create([
                        'product_id' => $id,
                        'category_id' => $catId
                    ]);
                }
            }

            // Cập nhật hình ảnh
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
            
            // Load lại dữ liệu
            $product->refresh()->load(['detail', 'categories', 'images']);
            
            return $this->jsonResponse($product, 'Cập nhật sản phẩm thành công');
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->jsonResponse([], 'Cập nhật sản phẩm thất bại', 500, $e->getMessage());
        }
    }

    // 6. XÓA SẢN PHẨM
    public function destroy($id)
    {
        try {
            $product = Product::find($id);
            
            if (!$product) {
                return $this->jsonResponse([], 'Không tìm thấy sản phẩm', 404);
            }

            // Kiểm tra xem sản phẩm có đơn hàng liên quan không (nếu cần)
            // $hasOrders = OrderItem::where('product_id', $id)->exists();
            // if ($hasOrders) {
            //     return $this->jsonResponse([], 'Không thể xóa sản phẩm đã có đơn hàng', 400);
            // }

            $product->delete();
            
            return $this->jsonResponse([], 'Xóa sản phẩm thành công');
        } catch (\Exception $e) {
            return $this->jsonResponse([], 'Xóa sản phẩm thất bại', 500, $e->getMessage());
        }
    }
}