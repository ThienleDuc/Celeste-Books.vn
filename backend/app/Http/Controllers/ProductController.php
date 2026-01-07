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
    public function index(Request $request)
    {
        try {
            $query = DB::table('products as p')
                // JOIN ảnh chính
                ->leftJoin('product_images as pi', function ($join) {
                    $join->on('pi.product_id', '=', 'p.id')
                        ->where('pi.is_primary', 1);
                })
                // JOIN product_details lấy giá thấp nhất
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
                ->where('p.status', 1);

            /* ===== SORT (WHITELIST) ===== */
            $sortable = [
                'id'               => 'p.id',
                'name'             => 'p.name',
                'rating'           => 'p.rating',
                'views'            => 'p.views',
                'purchase_count'   => 'p.purchase_count',
                'sale_price'       => 'pd.sale_price',
                'created_at'       => 'p.created_at',
            ];

            $sortBy    = $request->get('sort_by', 'p.id');
            $sortOrder = strtolower($request->get('sort_order')) === 'asc'
                ? 'asc'
                : 'desc';

            if (isset($sortable[$sortBy])) {
                $query->orderBy($sortable[$sortBy], $sortOrder);
            } else {
                $query->orderBy('p.id', 'desc');
            }

            /* ===== SELECT ===== */
            $query->select([
                'p.id',
                'p.name',
                'p.slug',
                DB::raw('COALESCE(pi.image_url, "") as image'),
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

            return response()->json([
                'status'  => true,
                'message' => 'Lấy danh sách sản phẩm thành công',
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
                ->get(['id', 'name', 'slug']);

            return $this->jsonResponse($suggests, 'Lấy sản phẩm gợi ý thành công');
        } catch (\Exception $e) {
            return $this->jsonResponse([], 'Lỗi server', 500, $e->getMessage());
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

    protected function filterCategory($query, $categorySlug)
    {
        if (!$categorySlug) {
            return $query;
        }

        return $query->whereExists(function ($subQuery) use ($categorySlug) {
            $subQuery->select(DB::raw(1))
                ->from('product_categories as pc')
                ->join('categories as c', 'c.id', '=', 'pc.category_id')
                ->whereRaw('pc.product_id = p.id')
                ->where('c.slug', $categorySlug);
        });
    }

    protected function applyRankingFilter($query, string $ranking)
    {
        if ($ranking !== 'all') {
            // Xác định khoảng thời gian
            $dateRange = match($ranking) {
                'day' => [now()->startOfDay(), now()->endOfDay()],
                'week' => [now()->startOfWeek(), now()->endOfWeek()],
                'month' => [now()->startOfMonth(), now()->endOfMonth()],
                'year' => [now()->startOfYear(), now()->endOfYear()],
                default => null
            };

            // Subquery cho order_items - chỉ lấy đơn hàng đã giao (delivered)
            $orderItemsSubquery = DB::table('order_items as oi')
                ->join('orders as o', 'o.id', '=', 'oi.order_id')
                ->where('o.status', 'delivered')
                ->when($dateRange, function ($q) use ($dateRange) {
                    return $q->whereBetween('o.created_at', $dateRange);
                })
                ->select('oi.product_id', DB::raw('COALESCE(SUM(oi.quantity), 0) as total_sold'))
                ->groupBy('oi.product_id');

            // Subquery cho reviews - chỉ lấy review từ đơn hàng đã giao
            $reviewSubquery = DB::table('reviews as r')
                ->join('order_items as oi_rev', 'oi_rev.id', '=', 'r.order_item_id')
                ->join('orders as o_rev', 'o_rev.id', '=', 'oi_rev.order_id')
                ->where('o_rev.status', 'delivered')
                ->when($dateRange, function ($q) use ($dateRange) {
                    return $q->whereBetween('r.created_at', $dateRange);
                })
                ->whereNotNull('r.rating') // Chỉ lấy review có rating
                ->select('oi_rev.product_id', DB::raw('COALESCE(AVG(r.rating), 0) as avg_rating'))
                ->groupBy('oi_rev.product_id');

            // Thực hiện join
            $query->leftJoinSub($orderItemsSubquery, 'oi_stats', function ($join) {
                $join->on('oi_stats.product_id', '=', 'p.id');
            })->leftJoinSub($reviewSubquery, 'r_stats', function ($join) {
                $join->on('r_stats.product_id', '=', 'p.id');
            });

            // Thêm select - đảm bảo luôn có giá trị mặc định
            $query->addSelect([
                DB::raw('COALESCE(oi_stats.total_sold, 0) as total_sold'),
                DB::raw('COALESCE(r_stats.avg_rating, 0) as avg_rating')
            ]);
        }

        return $query;
    }

    public function sort(Request $request)
    {
        try {
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
                ->leftJoin('product_categories as pc', 'pc.product_id', '=', 'p.id')
                ->leftJoin('categories as cat', 'cat.id', '=', 'pc.category_id')
                ->where('p.status', 1);

            /* ===== FILTER THEO PRODUCT_TYPE ===== */
            $productType = $request->get('product_type', 'all');
            $query = $this->filterProductType($query, $productType);

            /* ===== FILTER THEO CATEGORY ===== */
            $categorySlug = $request->get('category_slug');
            $query = $this->filterCategory($query, $categorySlug);

            /* ===== ÁP DỤNG RANKING FILTER ===== */
            $ranking = $request->get('ranking', 'all');
            $query = $this->applyRankingFilter($query, $ranking);

            /* ===== SORT ===== */
            $sortable = [
                'id'               => 'p.id',
                'name'             => 'p.name',
                'rating'           => 'p.rating',
                'views'            => 'p.views',
                'purchase_count'   => 'p.purchase_count',
                'sale_price'       => 'pd.sale_price',
                'created_at'       => 'p.created_at',
            ];

            $sortBy    = $request->get('sort_by', 'p.id');
            $sortOrder = strtolower($request->get('sort_order')) === 'asc' ? 'asc' : 'desc';

            // Nếu có ranking, sort theo total_sold và avg_rating
            if ($ranking !== 'all') {
                $query->orderByDesc('total_sold')
                    ->orderByDesc('avg_rating')
                    ->orderByDesc('p.created_at');
            } else {
                // Sort thông thường
                if (isset($sortable[$sortBy])) {
                    $query->orderBy($sortable[$sortBy], $sortOrder);
                } else {
                    $query->orderBy('p.id', 'desc');
                }
            }

            /* ===== SELECT ===== */
            $selectFields = [
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
            ];

            // Nếu có ranking, thêm các trường ranking
            if ($ranking !== 'all') {
                $selectFields[] = DB::raw('COALESCE(oi_stats.total_sold, 0) as total_sold');
                $selectFields[] = DB::raw('COALESCE(r_stats.avg_rating, 0) as avg_rating');
            }

            $query->select($selectFields);

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
                'message'      => 'Sắp xếp sản phẩm thành công',
                'data'         => $products->items(),
                'current_page' => $products->currentPage(),
                'per_page'     => $products->perPage(),
                'total'        => $products->total(),
                'last_page'    => $products->lastPage(),
                'filters'      => ($productType !== 'all' || $ranking !== 'all') ? [
                    'product_type' => $productType,
                    'ranking' => $ranking
                ] : null
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
            $query = Product::with(['detail', 'categories', 'images']);

            // Lọc theo trạng thái
            if ($request->has('status')) {
                $query->where('status', $request->status);
            } else {
                // Mặc định chỉ lấy sản phẩm active
                $query->where('status', 1);
            }

            // Lọc theo ngôn ngữ
            if ($request->has('language')) {
                $query->where('language', $request->language);
            }

            // Tìm kiếm theo tên
            if ($request->has('search')) {
                $query->where('name', 'like', '%' . $request->search . '%');
            }

            // Lọc theo danh mục
            if ($request->has('category_id')) {
                $query->whereHas('categories', function ($q) use ($request) {
                    $q->where('categories.id', $request->category_id);
                });
            }

            // Sắp xếp theo purchase_count (giảm dần) và Views (giảm dần)
            $query->orderByDesc('purchase_count')
                ->orderByDesc('Views');

            // Lấy số lượng sản phẩm
            $limit = $request->get('limit', 10);

            // Phân trang nếu có yêu cầu
            if ($request->has('paginate') && $request->paginate) {
                $perPage = $request->get('per_page', 20);
                $bestSellers = $query->paginate($perPage);
            } else {
                // Không phân trang, chỉ lấy top
                $bestSellers = $query->limit($limit)->get();
            }

            // Format dữ liệu thêm thông tin
            $bestSellers->transform(function ($product) {
                // Tính tỷ lệ giảm giá nếu có
                if ($product->detail && $product->detail->original_price > 0 && $product->detail->sale_price > 0) {
                    $product->discount_percent = round(
                        (($product->detail->original_price - $product->detail->sale_price) / $product->detail->original_price) * 100
                    );
                } else {
                    $product->discount_percent = 0;
                }

                // Format số lượng bán
                $product->total_sold_formatted = number_format($product->purchase_count ?? 0);

                // Lấy ảnh chính
                $product->primary_image = $product->images->firstWhere('is_primary', 1)
                    ? $product->images->firstWhere('is_primary', 1)->image_url
                    : ($product->images->first() ? $product->images->first()->image_url : null);

                return $product;
            });

            return $this->jsonResponse($bestSellers, 'Lấy sản phẩm bán chạy thành công');

        } catch (\Exception $e) {
            return $this->jsonResponse([], 'Lỗi server', 500, $e->getMessage());
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
