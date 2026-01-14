<?php

namespace App\Http\Controllers;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Models\Product;

use Smalot\PdfParser\Parser as PdfParser;
use PhpOffice\PhpWord\IOFactory;
use PhpOffice\PhpWord\Element\Text;
use PhpOffice\PhpWord\Element\TextRun;
use PhpOffice\PhpWord\Element\Table;
use Illuminate\Support\Facades\Cache;

class ProductDetailController extends Controller
{
    protected $notificationController;
    
    public function __construct()
    {
        $this->notificationController = new \App\Http\Controllers\ProductNotificationController();
    }
    

   // Nhớ import Model ở đầu file controller


public function index(Request $request)
    {
        try {
            // 1. Lấy Slug từ params
            $slug = $request->input('slug') ?? $request->query('slug');

            // 2. Query cơ bản với Eager Loading
            $query = Product::with([
                // Lấy detail (HasOne) để hiển thị giá đại diện
                'detail', 
                // Lấy tất cả variants (HasMany) phòng khi muốn chọn loại sách
                'productDetails', 
                // Lấy ảnh
                'images' => function($q) {
                    $q->orderBy('sort_order', 'asc');
                },
                // Lấy danh mục
                'categories'
            ]);

            // ============================================================
            // TRƯỜNG HỢP 1: CÓ SLUG -> LẤY CHI TIẾT SẢN PHẨM
            // ============================================================
            if ($slug) {
                // Load thêm reviews và user của review đó
                // Lưu ý: reviews đi qua order_items
                $product = $query->with(['reviews' => function($q) {
                    $q->orderBy('created_at', 'desc')
                      ->select('reviews.*'); // Đảm bảo chỉ lấy cột của reviews
                    
                    // Nếu bạn có Model User và quan hệ trong Review, hãy thêm: .with('user')
                    // Giả sử Model Review có: public function user() { return $this->belongsTo(User::class); }
                }])->where('slug', $slug)->first();

                if (!$product) {
                    return response()->json([
                        'status' => false,
                        'message' => 'Không tìm thấy sản phẩm'
                    ], 404);
                }

                // Tăng view
                $product->increment('views');

                return response()->json([
                    'status' => true,
                    'message' => 'Lấy chi tiết sản phẩm thành công',
                    'data' => $product
                ]);
            }

            // ============================================================
            // TRƯỜNG HỢP 2: KHÔNG CÓ SLUG -> LẤY DANH SÁCH (SHOP/HOME)
            // ============================================================
            
            // Tìm kiếm
            if ($request->filled('search')) {
                $query->where('name', 'like', '%' . $request->search . '%');
            }

            // Lọc theo danh mục (nếu cần)
            if ($request->filled('category_id')) {
                $query->whereHas('categories', function($q) use ($request) {
                    $q->where('id', $request->category_id);
                });
            }

            // Sắp xếp
            $sortBy = $request->get('sort_by', 'created_at'); // mặc định mới nhất
            $sortDir = $request->get('sort_dir', 'desc');
            
            // Nếu sort theo giá, phải join với bảng details, ở đây làm đơn giản sort theo bảng products
            $query->orderBy($sortBy, $sortDir);

            $perPage = (int) $request->get('per_page', 20);
            $products = $query->paginate($perPage);

            return response()->json([
                'status' => true,
                'message' => 'Lấy danh sách sản phẩm thành công',
                'data' => $products
            ]);

        } catch (\Throwable $e) {
            return response()->json([
                'status' => false, 
                'message' => 'Lỗi server: ' . $e->getMessage()
            ], 500);
        }
    }
    // Thêm chi tiết sản phẩm
    public function store(Request $request)
    {
        $request->validate([
            'product_id'     => 'required|integer|exists:products,id',
            'product_type'   => 'required|string',
            'original_price' => 'required|numeric|min:0',
            'sale_price'     => 'required|numeric|min:0',
            'stock'          => 'required|integer|min:0',
            'weight'         => 'nullable|numeric|min:0',
            'length'         => 'nullable|numeric|min:0',
            'width'          => 'nullable|numeric|min:0',
            'height'         => 'nullable|numeric|min:0',
            'file_url'       => 'nullable|url|max:500',
        ]);

        // check trùng product_type
        $existsType = DB::table('product_details')
            ->where('product_id', $request->product_id)
            ->where('product_type', $request->product_type)
            ->exists();

        if ($existsType) {
            return response()->json([
                'status'  => false,
                'message' => 'Product type đã tồn tại cho sản phẩm này'
            ], 409);
        }

        try {
            $sku = strtoupper(Str::random(16));

            $id = DB::table('product_details')->insertGetId([
                'product_id'     => $request->product_id,
                'product_type'   => $request->product_type,
                'sku'            => $sku,
                'original_price' => $request->original_price,
                'sale_price'     => $request->sale_price,
                'stock'          => $request->stock,
                'weight'         => $request->weight,
                'length'         => $request->length,
                'width'          => $request->width,
                'height'         => $request->height,
                'file_url'       => $request->file_url,
                'created_at'     => now(),
            ]);

            $detail = DB::table('product_details')->where('id', $id)->first();

            // Thêm notification cho store
            $this->notificationController->store(new Request([
                'user_id'    => 'A01', // TODO: Thay đổi sau khi có thông tin đăng nhập
                'product_id' => $request->product_id,
                'type'       => 'create',
                'title'      => 'Thêm chi tiết sản phẩm',
                'content'    => sprintf(
                    'Đã thêm chi tiết sản phẩm mới: %s cho sản phẩm ID %d',
                    $request->product_type,
                    $request->product_id
                ),
            ]));

            return response()->json([
                'status'  => true,
                'message' => 'Thêm chi tiết sản phẩm thành công',
                'data'    => $detail
            ], 201);

        } catch (\Throwable $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Lỗi server',
                'error'   => $e->getMessage()
            ], 500);
        }
    }
    // Lấy danh sách hình ảnh theo product_id
    public function getImages($product_id)
    {
        // Kiểm tra xem product_id có tồn tại trong bảng products không (tùy chọn)
        $exists = DB::table('products')->where('id', $product_id)->exists();
        
        if (!$exists) {
            return response()->json([
                'status' => false,
                'message' => 'Sản phẩm không tồn tại'
            ], 404);
        }

        try {
            // LƯU Ý: Thay 'product_images' bằng tên bảng thực tế trong database của bạn 
            // (ví dụ: 'images' hoặc 'product_images')
            $images = DB::table('product_images')
                ->where('product_id', $product_id)
                ->orderBy('sort_order', 'asc') // Sắp xếp theo thứ tự hiển thị (nếu có cột này)
                ->get();

            return response()->json([
                'status' => true,
                'message' => 'Lấy danh sách ảnh thành công',
                'data' => $images
            ]);

        } catch (\Throwable $e) {
            return response()->json([
                'status' => false,
                'message' => 'Lỗi server: ' . $e->getMessage()
            ], 500);
        }
    }

    // Cập nhật chi tiết sản phẩm
    public function update(Request $request, $id)
    {
        $current = DB::table('product_details')->where('id', $id)->first();

        if (!$current) {
            return response()->json([
                'status'  => false,
                'message' => 'Không tìm thấy chi tiết sản phẩm'
            ], 404);
        }

        $request->validate([
            'product_type'   => 'sometimes|string',
            'original_price' => 'sometimes|numeric|min:0',
            'sale_price'     => 'sometimes|numeric|min:0',
            'stock'          => 'sometimes|integer|min:0',
            'weight'         => 'nullable|numeric|min:0',
            'length'         => 'nullable|numeric|min:0',
            'width'          => 'nullable|numeric|min:0',
            'height'         => 'nullable|numeric|min:0',
            'file_url'       => 'nullable|url|max:500',
        ]);

        // check trùng product_type (trừ chính nó)
        if ($request->filled('product_type')) {
            $existsType = DB::table('product_details')
                ->where('product_id', $current->product_id)
                ->where('product_type', $request->product_type)
                ->where('id', '!=', $id)
                ->exists();

            if ($existsType) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Product type đã tồn tại cho sản phẩm này'
                ], 409);
            }
        }

        try {
            $data = $request->only([
                'product_type',
                'original_price',
                'sale_price',
                'stock',
                'weight',
                'length',
                'width',
                'height',
                'file_url'
            ]);

            if (!$request->has('file_url')) {
                unset($data['file_url']);
            }

            if (empty($data)) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Không có dữ liệu để cập nhật'
                ], 400);
            }

            DB::table('product_details')
                ->where('id', $id)
                ->update($data);

            $detail = DB::table('product_details')->where('id', $id)->first();

            // Thêm notification cho update
            $this->notificationController->store(new Request([
                'user_id'    => 'A01', // TODO: Thay đổi sau khi có thông tin đăng nhập
                'product_id' => $current->product_id,
                'type'       => 'update',
                'title'      => 'Cập nhật chi tiết sản phẩm',
                'content'    => sprintf(
                    'Đã cập nhật chi tiết sản phẩm ID %d (%s)',
                    $id,
                    $current->product_type
                ),
            ]));
            
            return response()->json([
                'status'  => true,
                'message' => 'Cập nhật chi tiết sản phẩm thành công',
                'data'    => $detail
            ]);

        } catch (\Throwable $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Lỗi server',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    // Xóa chi tiết sản phẩm
    public function destroy($id)
    {
        // 1. Kiểm tra tồn tại
        $detail = DB::table('product_details')->where('id', $id)->first();

        if (!$detail) {
            return response()->json([
                'status'  => false,
                'message' => 'Không tìm thấy chi tiết sản phẩm'
            ], 404);
        }

        try {

            $this->notificationController->store(new Request([
                'user_id'    => 'A01', // TODO: Thay đổi sau khi có thông tin đăng nhập
                'product_id' => $detail->product_id,
                'type'       => 'delete',
                'title'      => 'Xóa chi tiết sản phẩm',
                'content'    => sprintf(
                    'Đã xóa chi tiết sản phẩm ID %d (%s)',
                    $id,
                    $detail->product_type
                ),
            ]));

            // 2. Xóa
            DB::table('product_details')
                ->where('id', $id)
                ->delete();

            return response()->json([
                'status'  => true,
                'message' => 'Xóa chi tiết sản phẩm thành công'
            ]);

        } catch (\Throwable $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Lỗi server',
                'error'   => $e->getMessage()
            ], 500);
        }
    }


public function extractDescriptionContent($id)
    {
        try {
            $product = Product::find($id);
            if (!$product) return response()->json(['status' => false, 'message' => 'Not found'], 404);

            $currentDesc = $product->description;

            // Kiểm tra xem mô tả có phải là Link không
            $isUrl = preg_match('/^https?:\/\//', $currentDesc);

            // Nếu trong DB KHÔNG phải là Link (tức là ai đó đã nhập text tay), trả về luôn
            if (!$isUrl) {
                 return response()->json([
                    'status' => true,
                    'data' => ['content' => $currentDesc]
                ]);
            }

            // ============================================================
            // 🚀 SỬ DỤNG CACHE ĐỂ TRÁNH ĐỌC FILE LIÊN TỤC
            // ============================================================
            // Key cache dựa trên ID sản phẩm. Thời gian cache: 24 giờ (86400 giây)
            $cacheKey = 'product_desc_parsed_' . $id;

            $finalContent = Cache::remember($cacheKey, 86400, function () use ($id, $currentDesc, $isUrl) {
                
                // 1. Tìm Link file (Ưu tiên trong chi tiết, nếu ko có thì lấy ở description)
                $detail = DB::table('product_details')
                            ->where('product_id', $id)
                            ->whereIn('product_type', ['Sách điện tử', 'Ebook', 'ebook']) 
                            ->first();
                
                $pathOrUrl = '';
                if ($detail && !empty($detail->file_url)) {
                    $pathOrUrl = $detail->file_url;
                } elseif ($isUrl) {
                    $pathOrUrl = $currentDesc;
                } else {
                    return "Không tìm thấy nội dung sách.";
                }

                // 2. Tải file về thư mục tạm
                $extension = strtolower(pathinfo(parse_url($pathOrUrl, PHP_URL_PATH), PATHINFO_EXTENSION));
                if (!$extension) $extension = 'pdf'; // Mặc định PDF nếu ko nhận ra đuôi

                try {
                    $response = Http::withoutVerifying()->timeout(30)->get($pathOrUrl);
                    if ($response->failed()) return "Không thể tải nội dung sách từ liên kết.";

                    $tempFileName = 'temp_read_' . uniqid() . '.' . $extension;
                    $tempPath = storage_path('app/' . $tempFileName);
                    file_put_contents($tempPath, $response->body());

                    // 3. Parse file
                    $text = '';
                    if ($extension === 'pdf') {
                        $parser = new PdfParser();
                        $pdf = $parser->parseFile($tempPath);
                        $text = $pdf->getText();
                    } elseif ($extension === 'docx') {
                        $phpWord = IOFactory::load($tempPath);
                        foreach ($phpWord->getSections() as $section) {
                            foreach ($section->getElements() as $element) {
                                $text .= $this->extractTextFromElement($element);
                            }
                        }
                    } else {
                        $text = "Định dạng file không được hỗ trợ đọc trực tiếp.";
                    }

                    // Xóa file tạm ngay sau khi đọc xong
                    if (file_exists($tempPath)) unlink($tempPath);

                    // Trả về nội dung để Cache lưu lại
                    return trim($text) ?: "Nội dung sách trống.";

                } catch (\Exception $e) {
                    // Xóa file tạm nếu lỗi
                    if (isset($tempPath) && file_exists($tempPath)) unlink($tempPath);
                    return "Lỗi khi đọc sách: " . $e->getMessage();
                }
            });

            // ============================================================
            // ❌ KHÔNG CÓ LỆNH $product->save() Ở ĐÂY
            // ============================================================

            return response()->json([
                'status' => true,
                'data' => [
                    'product_id' => $product->id,
                    'source' => 'cache_or_live_parse', // Đánh dấu nguồn
                    'content' => $finalContent
                ]
            ]);

        } catch (\Throwable $e) {
            return response()->json(['status' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // ... (Hàm extractTextFromElement giữ nguyên) ...
     private function extractTextFromElement($element)
    {
        $text = '';
        if ($element instanceof Text) {
            $text .= $element->getText() . " ";
        } elseif ($element instanceof TextRun) {
            foreach ($element->getElements() as $child) {
                $text .= $this->extractTextFromElement($child); 
            }
            $text .= "\n"; 
        } elseif ($element instanceof Table) {
            foreach ($element->getRows() as $row) {
                foreach ($row->getCells() as $cell) {
                    foreach ($cell->getElements() as $cellElement) {
                        $text .= $this->extractTextFromElement($cellElement); 
                    }
                    $text .= " | "; 
                }
                $text .= "\n"; 
            }
        }
        return $text;
    }
    
    
}
