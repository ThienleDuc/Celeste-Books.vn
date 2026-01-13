<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Models\OrderItem;
use Illuminate\Support\Facades\Log;

use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    protected $notificationController;
    
    public function __construct()
    {
        $this->notificationController = new \App\Http\Controllers\ProductNotificationController();
    }

    // 1. LẤY DANH SÁCH SẢN PHẨM
    public function getListProducts(Request $request)
    {
        try {
            // Sử dụng subquery để xử lý phân trang với DISTINCT
            $baseQuery = DB::table('products as p')
                // JOIN ảnh chính
                ->leftJoin('product_images as pi', function ($join) {
                    $join->on('pi.product_id', '=', 'p.id')
                        ->where('pi.is_primary', 1);
                })
                // Subquery để lấy product_detail có giá thấp nhất
                ->leftJoin(DB::raw('(
                    SELECT 
                        pd1.*,
                        ROW_NUMBER() OVER (PARTITION BY pd1.product_id ORDER BY pd1.sale_price ASC) as rn
                    FROM product_details pd1
                ) as pd'), function ($join) {
                    $join->on('pd.product_id', '=', 'p.id')
                        ->where('pd.rn', '=', 1);
                })
                ->where('p.status', 1);

            /* ===== SORT ===== */
            $sortBy = $request->get('sort_by', 'p.id');
            $sortOrder = strtolower($request->get('sort_order')) === 'asc' ? 'asc' : 'desc';
            
            $sortable = [
                'id' => 'p.id',
                'name' => 'p.name',
                'rating' => 'p.rating',
                'views' => 'p.views',
                'purchase_count' => 'p.purchase_count',
                'sale_price' => 'pd.sale_price',
                'created_at' => 'p.created_at',
            ];

            if (isset($sortable[$sortBy])) {
                $baseQuery->orderBy($sortable[$sortBy], $sortOrder);
            } else {
                $baseQuery->orderBy('p.id', 'desc');
            }

            /* ===== SELECT với DISTINCT ===== */
            $baseQuery->select([
                'p.id',
                'p.name',
                'p.slug',
                'p.rating',
                'p.views',
                'p.purchase_count',
                'p.created_at',
                DB::raw('COALESCE(pi.image_url, "") as image'),
                DB::raw('pi.image_url as primary_image'),
                DB::raw('COALESCE(pd.original_price, 0) as original_price'),
                DB::raw('COALESCE(pd.sale_price, 0) as sale_price'),
                DB::raw('CASE 
                    WHEN pd.original_price > 0 AND pd.sale_price > 0 
                        AND pd.original_price > pd.sale_price
                    THEN ROUND(((pd.original_price - pd.sale_price) / pd.original_price) * 100, 0)
                    ELSE 0 
                END as discount_percent'),
                DB::raw('p.purchase_count as total_sold'),
                DB::raw('FORMAT(p.purchase_count, 0) as total_sold_formatted')
            ]);

            // THÊM DISTINCT VÀO ĐÂY
            $baseQuery->distinct('p.id');

            /* ===== PAGINATION với DISTINCT ===== */
            $perPage = (int) $request->get('per_page', 20);
            
            // Lấy tổng số sản phẩm phân biệt
            $totalQuery = clone $baseQuery;
            $total = DB::table(DB::raw("({$totalQuery->toSql()}) as sub"))
                ->mergeBindings($totalQuery)
                ->count();
            
            // Lấy dữ liệu trang hiện tại
            $page = $request->get('page', 1);
            $offset = ($page - 1) * $perPage;
            
            $products = DB::table(DB::raw("({$baseQuery->toSql()}) as sub"))
                ->mergeBindings($baseQuery)
                ->offset($offset)
                ->limit($perPage)
                ->get();

            return response()->json([
                'status' => true,
                'message' => 'Lấy danh sách sản phẩm thành công',
                'data' => [
                    'data' => $products,
                    'current_page' => (int) $page,
                    'per_page' => $perPage,
                    'total' => $total,
                    'last_page' => ceil($total / $perPage)
                ]
            ], 200);

        } catch (\Throwable $e) {
            return response()->json([
                'status' => false,
                'message' => 'Lỗi server',
                'error' => env('APP_DEBUG') ? $e->getMessage() : null
            ], 500);
        }
    }

     // 2. LẤY CHI TIẾT SẢN PHẨM
    public function show($id)
    {
        try {
            $product = Product::with(['detail', 'categories', 'images'])->find($id);

            if (!$product) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Không tìm thấy sản phẩm',
                    'data'    => []
                ], 404);
            }

            // Tăng lượt xem
            $product->increment('views');

            return response()->json([
                'status'  => true,
                'message' => 'Lấy chi tiết sản phẩm thành công',
                'data'    => $product
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Lỗi server',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    // 3. GỢI Ý SẢN PHẨM LIÊN QUAN
    public function suggest(Request $request, $id)
    {
        try {
            $product = Product::find($id);

            if (!$product) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Không tìm thấy sản phẩm',
                    'data'    => []
                ], 404);
            }

            // Lấy TẤT CẢ category_id của sản phẩm gốc (từ bảng product_categories)
            $categoryIds = DB::table('product_categories')
                ->where('product_id', $id)
                ->pluck('category_id')
                ->toArray();

            // Nếu sản phẩm không có category nào, trả về mảng rỗng
            if (empty($categoryIds)) {
                return response()->json([
                    'status'  => true,
                    'message' => 'Sản phẩm không có thể loại',
                    'data'    => [
                        'products' => [],
                        'has_more' => false,
                        'total' => 0,
                        'limit' => 0,
                        'offset' => 0
                    ]
                ], 200);
            }

            // Tính số lượng category trùng cho mỗi sản phẩm (để ưu tiên sản phẩm có nhiều category giống)
            $matchCounts = DB::table('product_categories as pc')
                ->select(
                    'pc.product_id',
                    DB::raw('COUNT(*) as match_count')
                )
                ->whereIn('pc.category_id', $categoryIds)
                ->where('pc.product_id', '!=', $id)
                ->groupBy('pc.product_id');

            // Sử dụng query builder giống index
            $baseQuery = DB::table('products as p')
                // JOIN ảnh chính
                ->leftJoin('product_images as pi', function ($join) {
                    $join->on('pi.product_id', '=', 'p.id')
                        ->where('pi.is_primary', 1);
                })
                // Subquery để lấy product_detail có giá thấp nhất
                ->leftJoin(DB::raw('(
                    SELECT 
                        pd1.*,
                        ROW_NUMBER() OVER (PARTITION BY pd1.product_id ORDER BY pd1.sale_price ASC) as rn
                    FROM product_details pd1
                ) as pd'), function ($join) {
                    $join->on('pd.product_id', '=', 'p.id')
                        ->where('pd.rn', '=', 1);
                })
                // JOIN với matchCounts để có số category trùng
                ->leftJoinSub($matchCounts, 'mc', function ($join) {
                    $join->on('mc.product_id', '=', 'p.id');
                })
                ->where('p.status', 1)
                ->where('p.id', '!=', $id)
                ->whereNotNull('mc.product_id'); // Chỉ lấy sản phẩm có ít nhất 1 category trùng

            /* ===== SELECT với DISTINCT ===== */
            $baseQuery->select([
                'p.id',
                'p.name',
                'p.slug',
                'p.rating',
                'p.views',
                'p.purchase_count',
                'p.created_at',
                DB::raw('COALESCE(pi.image_url, "") as image'),
                DB::raw('pi.image_url as primary_image'),
                DB::raw('COALESCE(pd.original_price, 0) as original_price'),
                DB::raw('COALESCE(pd.sale_price, 0) as sale_price'),
                DB::raw('CASE 
                    WHEN pd.original_price > 0 AND pd.sale_price > 0 
                        AND pd.original_price > pd.sale_price
                    THEN ROUND(((pd.original_price - pd.sale_price) / pd.original_price) * 100, 0)
                    ELSE 0 
                END as discount_percent'),
                DB::raw('p.purchase_count as total_sold'),
                DB::raw('FORMAT(p.purchase_count, 0) as total_sold_formatted'),
                DB::raw('COALESCE(mc.match_count, 0) as category_match_count')
            ]);

            // THÊM DISTINCT VÀO ĐÂY để không bị trùng sản phẩm
            $baseQuery->distinct('p.id');

            // Sắp xếp ưu tiên: số category trùng nhiều nhất -> purchase_count -> rating -> views
            $baseQuery->orderByDesc('category_match_count')
                ->orderByDesc('p.purchase_count')
                ->orderByDesc('p.rating')
                ->orderByDesc('p.views')
                ->orderByDesc('p.created_at');

            /* ===== LẤY TỔNG SỐ SẢN PHẨM ===== */
            $totalQuery = clone $baseQuery;
            $total = DB::table(DB::raw("({$totalQuery->toSql()}) as sub"))
                ->mergeBindings($totalQuery)
                ->count();

            /* ===== LẤY DỮ LIỆU VỚI LIMIT VÀ OFFSET ===== */
            $limit = (int) $request->get('limit', 6);
            $offset = (int) $request->get('offset', 0);
            
            // Lấy dữ liệu với limit và offset
            $products = DB::table(DB::raw("({$baseQuery->toSql()}) as sub"))
                ->mergeBindings($baseQuery)
                ->offset($offset)
                ->limit($limit)
                ->get();

            // Kiểm tra xem còn dữ liệu để load thêm không
            $hasMore = ($offset + $limit) < $total;

            // Thêm product_types vào kết quả
            $productIds = $products->pluck('id')->toArray();
            if (!empty($productIds)) {
                $productTypes = DB::table('product_details')
                    ->whereIn('product_id', $productIds)
                    ->select('product_id', DB::raw('GROUP_CONCAT(DISTINCT product_type) as types'))
                    ->groupBy('product_id')
                    ->get()
                    ->keyBy('product_id');

                $products->transform(function ($item) use ($productTypes) {
                    if (isset($productTypes[$item->id])) {
                        $item->product_types = explode(',', $productTypes[$item->id]->types);
                    } else {
                        $item->product_types = [];
                    }
                    return $item;
                });
            }

            // Thêm category_slug vào kết quả
            if (!empty($productIds)) {
                $categories = DB::table('categories as c')
                    ->join('product_categories as pc', 'pc.category_id', '=', 'c.id')
                    ->whereIn('pc.product_id', $productIds)
                    ->select('pc.product_id', DB::raw('GROUP_CONCAT(DISTINCT c.slug) as category_slugs'))
                    ->groupBy('pc.product_id')
                    ->get()
                    ->keyBy('product_id');

                $products->transform(function ($item) use ($categories) {
                    if (isset($categories[$item->id])) {
                        $item->category_slug = explode(',', $categories[$item->id]->category_slugs);
                    } else {
                        $item->category_slug = [];
                    }
                    return $item;
                });
            }

            return response()->json([
                'status'  => true,
                'message' => 'Lấy sản phẩm gợi ý thành công',
                'data'    => [
                    'products' => $products,
                    'has_more' => $hasMore,
                    'total' => $total,
                    'limit' => $limit,
                    'offset' => $offset
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Lỗi server',
                'error'   => env('APP_DEBUG') ? $e->getMessage() : null
            ], 500);
        }
    }

    public function featured(Request $request)
    {
        try {
            // Lấy tham số từ request
            $limit = (int) $request->get('limit', 12);
            $offset = (int) $request->get('offset', 0);

            // Sử dụng query builder giống index và suggest
            $baseQuery = DB::table('products as p')
                // JOIN ảnh chính
                ->leftJoin('product_images as pi', function ($join) {
                    $join->on('pi.product_id', '=', 'p.id')
                        ->where('pi.is_primary', 1);
                })
                // Subquery để lấy product_detail có giá thấp nhất
                ->leftJoin(DB::raw('(
                    SELECT 
                        pd1.*,
                        ROW_NUMBER() OVER (PARTITION BY pd1.product_id ORDER BY pd1.sale_price ASC) as rn
                    FROM product_details pd1
                ) as pd'), function ($join) {
                    $join->on('pd.product_id', '=', 'p.id')
                        ->where('pd.rn', '=', 1);
                })
                ->where('p.status', 1);

            /* ===== SELECT với DISTINCT ===== */
            $baseQuery->select([
                'p.id',
                'p.name',
                'p.slug',
                'p.rating',
                'p.views',
                'p.purchase_count',
                'p.created_at',
                DB::raw('COALESCE(pi.image_url, "") as image'),
                DB::raw('pi.image_url as primary_image'),
                DB::raw('COALESCE(pd.original_price, 0) as original_price'),
                DB::raw('COALESCE(pd.sale_price, 0) as sale_price'),
                DB::raw('CASE 
                    WHEN pd.original_price > 0 AND pd.sale_price > 0 
                        AND pd.original_price > pd.sale_price
                    THEN ROUND(((pd.original_price - pd.sale_price) / pd.original_price) * 100, 0)
                    ELSE 0 
                END as discount_percent'),
                DB::raw('p.purchase_count as total_sold'),
                DB::raw('FORMAT(p.purchase_count, 0) as total_sold_formatted')
            ]);

            // THÊM DISTINCT để không bị trùng sản phẩm
            $baseQuery->distinct('p.id');

            // Sắp xếp theo: thời gian mới nhất -> lượt mua -> lượt xem -> rating
            $baseQuery->orderByDesc('p.created_at')
                ->orderByDesc('p.purchase_count')
                ->orderByDesc('p.views')
                ->orderByDesc('p.rating');

            /* ===== LẤY TỔNG SỐ SẢN PHẨM ===== */
            $totalQuery = clone $baseQuery;
            $total = DB::table(DB::raw("({$totalQuery->toSql()}) as sub"))
                ->mergeBindings($totalQuery)
                ->count();

            /* ===== LẤY DỮ LIỆU VỚI LIMIT VÀ OFFSET ===== */
            $products = DB::table(DB::raw("({$baseQuery->toSql()}) as sub"))
                ->mergeBindings($baseQuery)
                ->offset($offset)
                ->limit($limit)
                ->get();

            // Kiểm tra xem còn dữ liệu để load thêm không
            $hasMore = ($offset + $limit) < $total;

            // Thêm product_types vào kết quả
            $productIds = $products->pluck('id')->toArray();
            if (!empty($productIds)) {
                $productTypes = DB::table('product_details')
                    ->whereIn('product_id', $productIds)
                    ->select('product_id', DB::raw('GROUP_CONCAT(DISTINCT product_type) as types'))
                    ->groupBy('product_id')
                    ->get()
                    ->keyBy('product_id');

                $products->transform(function ($item) use ($productTypes) {
                    if (isset($productTypes[$item->id])) {
                        $item->product_types = explode(',', $productTypes[$item->id]->types);
                    } else {
                        $item->product_types = [];
                    }
                    return $item;
                });
            }

            // Thêm category_slug vào kết quả
            if (!empty($productIds)) {
                $categories = DB::table('categories as c')
                    ->join('product_categories as pc', 'pc.category_id', '=', 'c.id')
                    ->whereIn('pc.product_id', $productIds)
                    ->select('pc.product_id', DB::raw('GROUP_CONCAT(DISTINCT c.slug) as category_slugs'))
                    ->groupBy('pc.product_id')
                    ->get()
                    ->keyBy('product_id');

                $products->transform(function ($item) use ($categories) {
                    if (isset($categories[$item->id])) {
                        $item->category_slug = explode(',', $categories[$item->id]->category_slugs);
                    } else {
                        $item->category_slug = [];
                    }
                    return $item;
                });
            }

            return response()->json([
                'status'  => true,
                'message' => 'Lấy sản phẩm giới thiệu thành công',
                'data'    => [
                    'products' => $products,
                    'has_more' => $hasMore,
                    'total' => $total,
                    'limit' => $limit,
                    'offset' => $offset
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Lỗi server',
                'error'   => env('APP_DEBUG') ? $e->getMessage() : null
            ], 500);
        }
    }
    
    // 4. TẠO SẢN PHẨM MỚI
    // Thêm mới sản phẩm
    // ý tưởng: thêm 1 danh sách images, categories vào sản phẩm,
    // mô trả sản phẩm là 1 file được load từ thiết bị
    public function store(Request $request)
    {
        $request->validate([
            'name'              => 'required|string|max:255',
            'description_file'  => 'nullable|file|mimes:pdf,doc,docx,txt|max:5120',
            'author'            => 'nullable|string|max:255',
            'publisher'         => 'nullable|string|max:255',
            'publication_year'  => 'nullable|integer',
            'language'          => 'nullable|string|max:50',
            'status'            => 'required|boolean',
            'images'            => 'nullable|array',
            'images.*'          => 'required|url|max:500',
            'categories'        => 'nullable|array',
            'categories.*'      => 'integer|exists:categories,id',
        ]);

        // ===== CHECK TÊN SÁCH TRÙNG =====
        $slug = Str::slug($request->name);

        if (Product::where('slug', $slug)->exists()) {
            return response()->json([
                'status'  => false,
                'message' => 'Sách có tên tương tự đã tồn tại'
            ], 409);
        }

        DB::beginTransaction();
        $descriptionPath = null;

        try {
            if ($request->hasFile('description_file')) {
                $file = $request->file('description_file');
                $fileName = time() . '_' . $file->getClientOriginalName();
                $descriptionPath = $file->storeAs('store', $fileName, 'public');
            }

            $product = Product::create([
                'name'              => $request->name,
                'slug'              => $slug,
                'description'       => $descriptionPath,
                'author'            => $request->author,
                'publisher'         => $request->publisher,
                'publication_year'  => $request->publication_year,
                'language'          => $request->language,
                'status'            => $request->status,
                'views'             => 0,
                'purchase_count'    => 0,
                'rating'            => 5.0,
            ]);

            if ($request->filled('images')) {
                ProductImage::syncImages($product->id, $request->images);
            }

            if ($request->filled('categories')) {
                ProductCategory::syncCategories($product->id, $request->categories);
            }

            DB::commit();

            $this->notificationController->store(new Request([
                'user_id'    => 'A01', // TODO: Thay đổi sau khi có thông tin đăng nhập
                'product_id' => $product->id,
                'type'       => 'create',
                'title'      => 'Thêm sản phẩm mới',
                'content'    => sprintf(
                    'Đã thêm sản phẩm mới: "%s" (ID: %d)',
                    $product->name,
                    $product->id
                ),
            ]));

            return response()->json([
                'status'  => true,
                'message' => 'Thêm sản phẩm thành công',
                'data'    => $product->load(['categories', 'images'])
            ], 201);

        } catch (\Throwable $e) {
            DB::rollBack();

            if ($descriptionPath) {
                Storage::disk('public')->delete($descriptionPath);
            }

            return response()->json([
                'status'  => false,
                'message' => 'Lỗi server',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    // Cập nhật sản phẩm
    public function update(Request $request, $id)
    {
        // 1. Kiểm tra tồn tại sản phẩm
        $product = Product::find($id);
        if (!$product) {
            return response()->json([
                'status' => false,
                'message' => 'Không tìm thấy sản phẩm'
            ], 404);
        }

        // 2. Validate dữ liệu
        $request->validate([
            'name'              => 'sometimes|string|max:255',
            'description_file'  => 'nullable|file|mimes:pdf,doc,docx,txt|max:5120',
            'author'            => 'nullable|string|max:255',
            'publisher'         => 'nullable|string|max:255',
            'publication_year'  => 'nullable|integer',
            'language'          => 'nullable|string|max:50',
            'status'            => 'sometimes|boolean',
            'images'            => 'nullable|array',
            'images.*'          => 'required|url|max:500',
            'categories'        => 'nullable|array',
            'categories.*'      => 'integer|exists:categories,id',
        ]);

        DB::beginTransaction();
        $descriptionPath = $product->description; // giữ mặc định file cũ

        try {
            // 3. Check trùng tên sách (trừ chính sản phẩm này)
            if ($request->filled('name')) {
                $slug = Str::slug($request->name);
                $exists = Product::where('slug', $slug)
                                ->where('id', '!=', $id)
                                ->exists();

                if ($exists) {
                    return response()->json([
                        'status'  => false,
                        'message' => 'Sách có tên tương tự đã tồn tại'
                    ], 409);
                }

                $product->slug = $slug;
                $product->name = $request->name;
            }

            // 4. Upload file mới nếu có
            if ($request->hasFile('description_file')) {
                $file = $request->file('description_file');
                $fileName = time() . '_' . $file->getClientOriginalName();
                $descriptionPath = $file->storeAs('store', $fileName, 'public');

                // Xóa file cũ nếu có
                if ($product->description) {
                    Storage::disk('public')->delete($product->description);
                }

                $product->description = $descriptionPath;
            }

            // 5. Update các trường khác
            $fields = ['author','publisher','publication_year','language','status'];
            foreach ($fields as $field) {
                if ($request->filled($field)) {
                    $product->$field = $request->$field;
                }
            }

            $product->save();

            // 6. Update images nếu có
            if ($request->filled('images')) {
                ProductImage::syncImages($product->id, $request->images);
            }

            // 7. Update categories nếu có
            if ($request->filled('categories')) {
                ProductCategory::syncCategories($product->id, $request->categories);
            }

            DB::commit();

            $this->notificationController->store(new Request([
                'user_id'    => 'A01', // TODO: Thay đổi sau khi có thông tin đăng nhập
                'product_id' => $product->id,
                'type'       => 'update',
                'title'      => 'Cập nhật sản phẩm',
                'content'    => sprintf(
                    'Đã cập nhật sản phẩm: "%s" (ID: %d)',
                    $product->name,
                    $product->id
                ),
            ]));

            return response()->json([
                'status'  => true,
                'message' => 'Cập nhật sản phẩm thành công',
                'data'    => $product->load(['categories','images'])
            ], 200);

        } catch (\Throwable $e) {
            DB::rollBack();

            // Xóa file mới upload nếu có lỗi
            if ($request->hasFile('description_file') && $descriptionPath) {
                Storage::disk('public')->delete($descriptionPath);
            }

            return response()->json([
                'status'  => false,
                'message' => 'Lỗi server',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Tăng lượt xem sản phẩm
     */
    public function incrementViews($id)
    {
        try {
            // 1. Kiểm tra tồn tại sản phẩm
            $product = Product::find($id);
            if (!$product) {
                return response()->json([
                    'status' => false,
                    'message' => 'Không tìm thấy sản phẩm'
                ], 404);
            }

            // 2. Tăng lượt xem
            $product->increment('views');
            
            // 3. Lấy lượt xem mới
            $product->refresh(); // Refresh để lấy giá trị mới

            return response()->json([
                'status' => true,
                'message' => 'Đã tăng lượt xem thành công',
                'data' => [
                    'id' => $product->id,
                    'name' => $product->name,
                    'views' => $product->views,
                    'updated_at' => $product->updated_at
                ]
            ], 200);

        } catch (\Throwable $e) {
            return response()->json([
                'status' => false,
                'message' => 'Lỗi server',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // 6. XÓA SẢN PHẨM
    public function destroy($id)
    {
        // 1. Kiểm tra tồn tại sản phẩm
        $product = Product::find($id);
        if (!$product) {
            return response()->json([
                'status'  => false,
                'message' => 'Không tìm thấy sản phẩm'
            ], 404);
        }

        DB::beginTransaction();

        try {
            // Thêm notification trước khi xóa (sau bước 1, trước DB::beginTransaction())
            $this->notificationController->store(new Request([
                'user_id'    => 'A01', // TODO: Thay đổi sau khi có thông tin đăng nhập
                'product_id' => $product->id,
                'type'       => 'delete',
                'title'      => 'Xóa sản phẩm',
                'content'    => sprintf(
                    'Đã xóa sản phẩm: "%s" (ID: %d)',
                    $product->name,
                    $product->id
                ),
            ]));

            // 2. Xóa file mô tả nếu có
            if ($product->description) {
                Storage::disk('public')->delete($product->description);
            }

            // 3. Xóa images liên quan
            ProductImage::where('product_id', $id)->delete();

            // 4. Xóa categories liên quan
            ProductCategory::where('product_id', $id)->delete();

            // 5. Xóa sản phẩm
            $product->delete();

            DB::commit();

            return response()->json([
                'status'  => true,
                'message' => 'Xóa sản phẩm thành công'
            ], 200);

        } catch (\Throwable $e) {
            DB::rollBack();

            return response()->json([
                'status'  => false,
                'message' => 'Lỗi server',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

     /**
     * Tìm kiếm sản phẩm theo tên (chỉ tìm theo tên)
     */
    public function searchByName(Request $request)
    {
        try {
            $keyword = trim($request->name);
            
            $query = DB::table('products as p')
                ->distinct('p.id') 
                ->leftJoin('product_images as pi', function ($join) {
                    $join->on('pi.product_id', '=', 'p.id')
                        ->where('pi.is_primary', 1);
                })
                ->leftJoin('product_details as pd', function ($join) {
                    $join->on('pd.product_id', '=', 'p.id')
                        ->whereRaw(
                            'pd.sale_price = (
                                SELECT pd2.sale_price
                                FROM product_details pd2
                                WHERE pd2.product_id = p.id
                                ORDER BY pd2.sale_price ASC
                                LIMIT 1
                            )'
                        );
                })
                ->where('p.status', 1)
                ->whereRaw('p.name COLLATE utf8mb4_unicode_ci LIKE ?', ['%' . $keyword . '%']);

            /* ===== SELECT ===== */
            $query->select([
                'p.id',
                'p.name',
                'p.slug',
                DB::raw('COALESCE(pi.image_url,"") as image'),
                'pd.original_price',
                'pd.sale_price',
                'p.rating',
                'p.views',
                'p.purchase_count',
                'p.created_at',
            ]);

            /* ===== PAGINATION ===== */
            $perPage  = (int) $request->get('per_page', 20);
            $products = $query->paginate($perPage);

            /* ===== LẤY product_types ===== */
            if ($products->isNotEmpty()) {
                $productIds = collect($products->items())->pluck('id')->toArray();

                $productTypes = DB::table('product_details')
                    ->whereIn('product_id', $productIds)
                    ->select('product_id', 'product_type')
                    ->get()
                    ->groupBy('product_id');

                foreach ($products->items() as $product) {
                    $types = $productTypes->get($product->id, collect())
                                        ->pluck('product_type')
                                        ->unique()
                                        ->values()
                                        ->toArray();
                    $product->product_types = $types;
                }
            }

            return response()->json([
                'status'       => true,
                'message'      => 'Tìm kiếm theo tên thành công',
                'data'         => $products->items(),
                'current_page' => $products->currentPage(),
                'per_page'     => $products->perPage(),
                'total'        => $products->total(),
                'last_page'    => $products->lastPage(),
                'filters'      => ['search_by_name' => true, 'keyword' => $keyword]
            ], 200);

        } catch (\Throwable $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Lỗi server',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    protected function filterProductType($query, string $type)
    {
        if ($type === 'all') {
            return $query;
        }

        if ($type === 'paper') {
            // Chỉ sản phẩm có ĐÚNG 1 product_detail và là Sách giấy
            return $query->whereExists(function ($subQuery) {
                $subQuery->select(DB::raw(1))
                    ->from('product_details as pd')
                    ->whereRaw('pd.product_id = p.id')
                    ->groupBy('pd.product_id')
                    ->havingRaw('COUNT(*) = 1') // Chỉ có 1 product_detail
                    ->havingRaw('MAX(pd.product_type) = ?', ['Sách giấy']);
            });

        } elseif ($type === 'e-book') {
            // Chỉ sản phẩm có ĐÚNG 1 product_detail và là Sách điện tử
            return $query->whereExists(function ($subQuery) {
                $subQuery->select(DB::raw(1))
                    ->from('product_details as pd')
                    ->whereRaw('pd.product_id = p.id')
                    ->groupBy('pd.product_id')
                    ->havingRaw('COUNT(*) = 1') // Chỉ có 1 product_detail
                    ->havingRaw('MAX(pd.product_type) = ?', ['Sách điện tử']);
            });

        } elseif ($type === 'both') {
            // Chỉ sản phẩm có ĐÚNG 2 product_detail và có cả Sách giấy + Sách điện tử
            return $query->whereExists(function ($subQuery) {
                $subQuery->select(DB::raw(1))
                    ->from('product_details as pd')
                    ->whereRaw('pd.product_id = p.id')
                    ->groupBy('pd.product_id')
                    ->havingRaw('COUNT(*) = 2') // Có đúng 2 product_detail
                    ->havingRaw('COUNT(DISTINCT pd.product_type) = 2'); // Có cả 2 loại
            });
        }

        return $query;
    }

    protected function filterCategory($query, string $categorySlug)
    {
        if (!$categorySlug || $categorySlug === 'all') {
            return $query;
        }

        // Lọc sản phẩm có ít nhất một category trùng slug
        return $query->whereExists(function ($subQuery) use ($categorySlug) {
            $subQuery->select(DB::raw(1))
                    ->from('product_categories as pc')
                    ->join('categories as c', 'c.id', '=', 'pc.category_id')
                    ->whereRaw('pc.product_id = p.id')
                    ->whereIn('c.slug', explode(',', $categorySlug)); // hỗ trợ nhiều slug ngăn cách bởi dấu ,
        });
    }

    protected function applyRankingFilter($query, string $ranking)
    {
        // Nếu ranking là all hoặc new → không cần join
        if (in_array($ranking, ['all', 'new'])) {
            return $query;
        }

        // Xác định khoảng thời gian cho day/week/month
        $dateRange = match ($ranking) {
            'day'   => [now()->startOfDay(), now()->endOfDay()],
            'week'  => [now()->startOfWeek(), now()->endOfWeek()],
            'month' => [now()->startOfMonth(), now()->endOfMonth()],
            default => null,
        };

        // Subquery order_items (đơn đã giao)
        $orderItemsSubquery = DB::table('order_items as oi')
            ->join('orders as o', 'o.id', '=', 'oi.order_id')
            ->where('o.status', 'delivered')
            ->when($dateRange, fn ($q) => $q->whereBetween('o.created_at', $dateRange))
            ->select('oi.product_id', DB::raw('SUM(oi.quantity) as total_sold'))
            ->groupBy('oi.product_id');

        // Subquery reviews
        $reviewSubquery = DB::table('reviews as r')
            ->join('order_items as oi_rev', 'oi_rev.id', '=', 'r.order_item_id')
            ->join('orders as o_rev', 'o_rev.id', '=', 'oi_rev.order_id')
            ->where('o_rev.status', 'delivered')
            ->when($dateRange, fn ($q) => $q->whereBetween('r.created_at', $dateRange))
            ->whereNotNull('r.rating')
            ->select('oi_rev.product_id', DB::raw('AVG(r.rating) as avg_rating'))
            ->groupBy('oi_rev.product_id');

        return $query
            ->leftJoinSub($orderItemsSubquery, 'oi_stats', fn ($join) => $join->on('oi_stats.product_id', '=', 'p.id'))
            ->leftJoinSub($reviewSubquery, 'r_stats', fn ($join) => $join->on('r_stats.product_id', '=', 'p.id'));
    }

    public function sort(Request $request)
    {
        try {
            // Lấy các tham số
            $productType = $request->get('product_type', $request->get('productType', 'all'));
            $categorySlug = $request->get('category_slug', $request->get('categorySlug', 'all'));
            $ranking = $request->get('ranking', 'all');
            $keyword = $request->get('keyword', $request->get('search', ''));
            
            $query = DB::table('products as p')
                ->distinct('p.id')
                ->leftJoin('product_images as pi', function ($join) {
                    $join->on('pi.product_id', '=', 'p.id')
                        ->where('pi.is_primary', 1);
                })
                ->leftJoin('product_details as pd', function ($join) {
                    $join->on('pd.product_id', '=', 'p.id')
                        ->whereRaw('pd.sale_price = (
                            SELECT pd2.sale_price
                            FROM product_details pd2
                            WHERE pd2.product_id = p.id
                            ORDER BY pd2.sale_price ASC
                            LIMIT 1
                        )');
                })
                ->where('p.status', 1);

            /* ===== FILTER THEO KEYWORD ===== */
            if (!empty($keyword)) {
                $query->where('p.name', 'like', '%' . $keyword . '%');
            } else {
                /* ===== FILTER THEO PRODUCT_TYPE ===== */
                $query = $this->filterProductType($query, $productType);

                /* ===== FILTER THEO CATEGORY ===== */
                $query = $this->filterCategory($query, $categorySlug);

                /* ===== ÁP DỤNG RANKING FILTER ===== */
                $rankingsWithStats = ['day', 'week', 'month'];

                if (in_array($ranking, $rankingsWithStats)) {
                    $query = $this->applyRankingFilter($query, $ranking);
                }
            }

            /* ===== SELECT ===== */
            $selectFields = [
                'p.id',
                'p.name',
                'p.slug',
                DB::raw('COALESCE(pi.image_url,"") as image'),
                DB::raw('COALESCE(pi.image_url,"") as primary_image'), // Thêm primary_image
                'pd.original_price',
                'pd.sale_price',
                'p.rating',
                'p.views',
                'p.purchase_count',
                'p.created_at',
            ];

            $rankingsWithStats = ['day', 'week', 'month'];
            if (empty($keyword) && in_array($ranking, $rankingsWithStats)) {
                $selectFields[] = DB::raw('COALESCE(oi_stats.total_sold, 0) as total_sold');
                $selectFields[] = DB::raw('COALESCE(r_stats.avg_rating, 0) as avg_rating');
            }

            $query->select($selectFields);

            /* ===== SORT ===== */
            $sortable = [
                'id'             => 'p.id',
                'name'           => 'p.name',
                'rating'         => 'p.rating',
                'views'          => 'p.views',
                'purchase_count' => 'p.purchase_count',
                'sale_price'     => 'pd.sale_price',
                'created_at'     => 'p.created_at',
            ];

            $sortBy = $request->get('sort_by', $request->get('sortBy', 'p.id'));
            $sortOrder = strtolower($request->get('sort_order', $request->get('sortOrder', 'desc'))) === 'asc' ? 'asc' : 'desc';

            if (!empty($keyword)) {
                $query->orderByDesc('p.created_at');
            } elseif ($ranking === 'new') {
                $query->orderByDesc('p.created_at');
            } elseif (in_array($ranking, $rankingsWithStats)) {
                $query->orderByDesc('total_sold')
                    ->orderByDesc('avg_rating');
            } else {
                if (isset($sortable[$sortBy])) {
                    $query->orderBy($sortable[$sortBy], $sortOrder);
                } else {
                    $query->orderByDesc('p.id');
                }
            }

            /* ===== PAGINATION ===== */
            $perPage = (int) $request->get('per_page', $request->get('perPage', 20));
            $products = $query->paginate($perPage);

            /* ===== TRẢ VỀ KHÔNG TÌM THẤY NẾU RỖNG ===== */
            if ($products->isEmpty()) {
                return response()->json([
                    'status'       => true,
                    'message'      => empty($keyword) ? 'Không tìm thấy sản phẩm' : 'Không tìm thấy sản phẩm với từ khóa "' . $keyword . '"',
                    'data'         => [],
                    'current_page' => 1,
                    'per_page'     => $perPage,
                    'total'        => 0,
                    'last_page'    => 1,
                    'filters'      => [
                        'keyword'       => $keyword,
                        'product_type'  => $productType,
                        'ranking'       => $ranking,
                        'category_slug' => $categorySlug,
                    ]
                ], 200);
            }

            /* ===== LẤY product_types VÀ category_slug ===== */
            $productIds = collect($products->items())->pluck('id')->toArray();

            // Lấy product_types
            $productTypes = DB::table('product_details')
                ->whereIn('product_id', $productIds)
                ->select('product_id', 'product_type')
                ->get()
                ->groupBy('product_id');

            // Lấy categories
            $productCategories = DB::table('product_categories as pc')
                ->join('categories as c', 'c.id', '=', 'pc.category_id')
                ->whereIn('pc.product_id', $productIds)
                ->select('pc.product_id', 'c.slug')
                ->get()
                ->groupBy('product_id');

            foreach ($products->items() as $product) {
                // gán product_types
                $types = $productTypes->get($product->id, collect())
                                    ->pluck('product_type')
                                    ->unique()
                                    ->values()
                                    ->toArray();
                $product->product_types = $types;

                // gán category_slug
                $categories = $productCategories->get($product->id, collect())
                                            ->pluck('slug')
                                            ->unique()
                                            ->values()
                                            ->toArray();
                $product->category_slug = $categories;

                // Tính discount_percent
                if ($product->original_price > 0 && $product->sale_price > 0) {
                    $discount = (($product->original_price - $product->sale_price) / $product->original_price) * 100;
                    $product->discount_percent = round($discount);
                } else {
                    $product->discount_percent = 0;
                }

                // Format total_sold nếu có
                if (isset($product->total_sold)) {
                    $product->total_sold_formatted = number_format($product->total_sold, 0, ',', '.') . ' bán';
                }

                // image và primary_image giống nhau
                $product->primary_image = $product->image;
            }

            return response()->json([
                'status'       => true,
                'message'      => empty($keyword) ? 'Sắp xếp sản phẩm thành công' : 'Tìm kiếm sản phẩm thành công',
                'data'         => $products->items(),
                'current_page' => $products->currentPage(),
                'per_page'     => $products->perPage(),
                'total'        => $products->total(),
                'last_page'    => $products->lastPage(),
                'filters'      => [
                    'keyword'       => $keyword,
                    'product_type'  => $productType,
                    'ranking'       => $ranking,
                    'category_slug' => $categorySlug,
                ]
            ], 200);

        } catch (\Throwable $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Lỗi server',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Lấy sản phẩm bán chạy nhất dựa vào purchase_count
     */
    public function getBestSellers(Request $request)
    {
        try {
            $limit = (int) $request->get('limit', 10);
            
            // Truy vấn con để lấy product_detail có giá thấp nhất cho mỗi sản phẩm
            $subQuery = DB::table('product_details as pd_sub')
                ->select('pd_sub.product_id', DB::raw('MIN(pd_sub.sale_price) as min_price'))
                ->groupBy('pd_sub.product_id');
            
            $products = DB::table('products as p')
                // JOIN ảnh chính
                ->leftJoin('product_images as pi', function ($join) {
                    $join->on('pi.product_id', '=', 'p.id')
                        ->where('pi.is_primary', 1);
                })
                // JOIN với truy vấn con để lấy giá thấp nhất
                ->leftJoinSub($subQuery, 'min_prices', function ($join) {
                    $join->on('min_prices.product_id', '=', 'p.id');
                })
                // JOIN để lấy chi tiết của product_detail có giá thấp nhất
                ->leftJoin('product_details as pd', function ($join) {
                    $join->on('pd.product_id', '=', 'p.id')
                        ->on('pd.sale_price', '=', 'min_prices.min_price');
                })
                ->where('p.status', 1)
                ->select([
                    // Required fields
                    'p.id',
                    'p.name',
                    'p.slug',
                    'p.rating',
                    'p.views',
                    'p.purchase_count',
                    'p.created_at',
                    
                    // image field
                    DB::raw('COALESCE(pi.image_url, "") as image'),
                    
                    // primary_image field
                    DB::raw('pi.image_url as primary_image'),
                    
                    // Price fields
                    DB::raw('COALESCE(pd.original_price, 0) as original_price'),
                    DB::raw('COALESCE(pd.sale_price, 0) as sale_price'),
                    
                    // discount_percent field
                    DB::raw('CASE 
                        WHEN pd.original_price > 0 AND pd.sale_price > 0 
                            AND pd.original_price > pd.sale_price
                        THEN ROUND(((pd.original_price - pd.sale_price) / pd.original_price) * 100, 0)
                        ELSE 0 
                    END as discount_percent'),
                    
                    // total_sold and total_sold_formatted
                    DB::raw('p.purchase_count as total_sold'),
                    DB::raw('FORMAT(p.purchase_count, 0) as total_sold_formatted')
                ])
                ->distinct('p.id') // Đảm bảo mỗi sản phẩm chỉ xuất hiện 1 lần
                ->orderByDesc('p.purchase_count')
                ->orderByDesc('p.views')
                ->orderByDesc('p.rating')
                ->limit($limit)
                ->get();

            return response()->json([
                'status'  => true,
                'message' => 'Lấy sản phẩm bán chạy thành công',
                'data'    => $products
            ], 200);

        } catch (\Throwable $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Lỗi server',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cập nhật purchase_count cho sản phẩm (có thể gọi sau mỗi đơn hàng thành công)
     */
    public function updatePurchaseCount($productId)
    {
        try {
            $product = Product::find($productId);
            
            if (!$product) {
                return false;
            }
            
            // Tính tổng số lượng đã mua từ bảng order_items
            $totalQuantity = OrderItem::where('product_id', $productId)
                ->sum('quantity');
            
            // Cập nhật purchase_count
            $product->purchase_count = (int) $totalQuantity;
            $product->save();
            
            return true;
            
        } catch (\Exception $e) {
            Log::error('Lỗi cập nhật purchase_count: ' . $e->getMessage());
            return false;
        }
    }
}