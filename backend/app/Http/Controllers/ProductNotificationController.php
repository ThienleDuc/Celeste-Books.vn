<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ProductNotification;
use Illuminate\Support\Facades\Log;
class ProductNotificationController extends Controller
{
    public function index(Request $request)
    {
        try {
            // Lấy các tham số từ request
            $perPage = $request->input('per_page', 20);
            $sortBy = $request->input('sort_by', 'created_at'); // Mặc định sắp xếp theo thời gian tạo
            $sortOrder = $request->input('sort_order', 'desc'); // Mặc định từ mới đến cũ (desc)
            
            // Validate sort parameters
            $allowedSortColumns = ['id', 'user_id', 'product_id', 'type', 'title', 'created_at', 'updated_at'];
            $sortBy = in_array($sortBy, $allowedSortColumns) ? $sortBy : 'created_at';
            $sortOrder = in_array(strtolower($sortOrder), ['asc', 'desc']) ? strtolower($sortOrder) : 'desc';
            
            // Lấy danh sách thông báo có sắp xếp và phân trang
            $notifications = ProductNotification::orderBy($sortBy, $sortOrder)
                ->paginate($perPage);
            
            // Thống kê
            $total = ProductNotification::count();
            $unreadCount = ProductNotification::where('is_read', 0)->count();
            
            return response()->json([
                'success' => true,
                'message' => 'Lấy danh sách thông báo thành công',
                'data' => [
                    'notifications' => $notifications->items(),
                    'pagination' => [
                        'current_page' => $notifications->currentPage(),
                        'per_page' => $notifications->perPage(),
                        'total' => $notifications->total(),
                        'last_page' => $notifications->lastPage(),
                        'next_page_url' => $notifications->nextPageUrl(),
                        'prev_page_url' => $notifications->previousPageUrl(),
                    ],
                    'statistics' => [
                        'total' => $total,
                        'unread_count' => $unreadCount,
                        'read_count' => $total - $unreadCount,
                    ],
                    'sorting' => [
                        'sort_by' => $sortBy,
                        'sort_order' => $sortOrder,
                    ]
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi server',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id'    => 'required|string|max:10',
            'product_id' => 'required|integer|exists:products,id',
            'type'       => 'required|string|max:50',
            'title'      => 'required|string|max:255',
            'content'    => 'nullable|string',
        ]);

        try {
            // Thêm giá trị mặc định cho is_read
            $validated['is_read'] = false;
            
            $notification = ProductNotification::create($validated);

            return response()->json([
                'success' => true,
                'message' => 'Thêm thông báo thành công',
                'data'    => $notification,
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi server',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            // Tìm thông báo theo ID
            $notification = ProductNotification::find($id);
            
            // Kiểm tra nếu không tồn tại
            if (!$notification) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy thông báo',
                    'error' => 'Notification not found'
                ], 404);
            }
            
            // Xóa thông báo
            $notification->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Xóa thông báo thành công',
                'data' => [
                    'id' => $id,
                    'deleted_at' => now()->format('Y-m-d H:i:s')
                ]
            ], 200);
            
        } catch (\Exception $e) {
            Log::error('Error deleting product notification', [
                'id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Lỗi server khi xóa thông báo',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    public function destroyMultiple(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:product_notifications,id'
        ]);
        
        try {
            $ids = $request->input('ids');
            $deletedCount = ProductNotification::whereIn('id', $ids)->delete();
            
            return response()->json([
                'success' => true,
                'message' => "Đã xóa {$deletedCount} thông báo",
                'data' => [
                    'deleted_ids' => $ids,
                    'deleted_count' => $deletedCount
                ]
            ], 200);
            
        } catch (\Exception $e) {
            Log::error('Error deleting multiple notifications', [
                'ids' => $request->input('ids'),
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Lỗi server khi xóa thông báo',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroyAll()
    {
        try {
            // Đếm số lượng trước khi xóa
            $totalCount = ProductNotification::count();
            
            // Xóa tất cả
            ProductNotification::truncate();
            
            return response()->json([
                'success' => true,
                'message' => "Đã xóa tất cả {$totalCount} thông báo",
                'data' => [
                    'deleted_count' => $totalCount
                ]
            ], 200);
            
        } catch (\Exception $e) {
            Log::error('Error deleting all notifications', [
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Lỗi server khi xóa tất cả thông báo',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
