<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProductDetailController extends Controller
{
    protected $notificationController;
    
    public function __construct()
    {
        $this->notificationController = new \App\Http\Controllers\ProductNotificationController();
    }
    

    // Danh sách chi tiết sản phẩm
    public function index(Request $request)
    {
        try {
            // per_page an toàn
            $perPage = (int) $request->get('per_page', 20);

            $query = DB::table('product_details as pd')
                ->leftJoin('products as p', 'p.id', '=', 'pd.product_id')
                ->select(
                    'pd.*',
                    'p.name as product_name',
                    'p.slug'
                );

            // Không truyền gì => không có WHERE => trả về tất cả
            if ($request->filled('product_id')) {
                $query->where('pd.product_id', $request->product_id);
            }

            if ($request->filled('product_type')) {
                $query->where('pd.product_type', $request->product_type);
            }

            $details = $query
                ->orderBy('pd.id', 'desc') // an toàn hơn created_at
                ->paginate($perPage);

            return response()->json([
                'status'  => true,
                'message' => 'Lấy danh sách chi tiết sản phẩm thành công',
                'data'    => $details
            ]);

        } catch (\Throwable $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Lỗi server',
                'error'   => $e->getMessage()
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
}
