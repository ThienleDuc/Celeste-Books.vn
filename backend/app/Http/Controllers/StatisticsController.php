<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\StreamedResponse;

class StatisticsController extends Controller
{
    // Helper JSON chuẩn
    private function jsonResponse($data = [], $message = '', $status = 200)
    {
        return response()->json([
            'success' => $status >= 200 && $status < 300,
            'message' => $message,
            'data'    => $data
        ], $status, [], JSON_UNESCAPED_UNICODE);
    }

    // API: /api/statistics
    public function index(Request $request)
    {
        try {
            /* ======================================================
             * 1. NHẬN THAM SỐ FILTER
             * ====================================================== */
            $status   = $request->query('status');     // product status
            $language = $request->query('language');   // product language
            $search   = $request->query('search');     // product name

            $dateFrom = $request->query('date_from');  // YYYY-MM-DD
            $dateTo   = $request->query('date_to');    // YYYY-MM-DD

            /* ======================================================
             * 2. ĐIỀU KIỆN NGÀY CHO ORDERS
             * ====================================================== */
            $orderDateSql    = '';
            $orderDateParams = [];

            if ($dateFrom && $dateTo) {
                $orderDateSql    = " AND o.created_at BETWEEN ? AND ? ";
                $orderDateParams = [
                    $dateFrom . ' 00:00:00',
                    $dateTo   . ' 23:59:59'
                ];
            }

            /* ======================================================
             * 3. TỔNG DOANH THU (đơn delivered + paid)
             * ====================================================== */
            $revenueSql = "
                SELECT IFNULL(SUM(o.total_amount),0) AS total
                FROM orders o
                WHERE o.status = 'delivered'
                  AND o.payment_status = 'paid'
                  $orderDateSql
            ";
            $revenueTotal = DB::selectOne($revenueSql, $orderDateParams)->total;

            /* ======================================================
             * 4. TỔNG SỐ ĐƠN ĐÃ GIAO
             * ====================================================== */
            $ordersCountSql = "
                SELECT COUNT(*) AS count
                FROM orders o
                WHERE o.status = 'delivered'
                $orderDateSql
            ";
            $ordersCount = DB::selectOne($ordersCountSql, $orderDateParams)->count;

            /* ======================================================
             * 5. TOP 5 KHÁCH CHI TIÊU NHIỀU NHẤT
             * ====================================================== */
            $topSpendersSql = "
                SELECT u.username, pr.full_name,
                       SUM(o.total_amount) AS total_spent
                FROM orders o
                JOIN users u    ON o.user_id = u.id
                JOIN profiles pr ON u.id = pr.user_id
                WHERE o.status = 'delivered'
                $orderDateSql
                GROUP BY u.id, u.username, pr.full_name
                ORDER BY total_spent DESC
                LIMIT 5
            ";
            $topSpenders = DB::select($topSpendersSql, $orderDateParams);

            /* ======================================================
             * 6. DANH SÁCH SẢN PHẨM CHI TIẾT
             * ====================================================== */
            $productSql = "
                SELECT
                    p.id,
                    p.name,
                    p.author,
                    p.language,
                    p.status,
                    p.Views AS total_views,

                    pd.product_type,
                    pd.sku,
                    pd.sale_price,
                    pd.stock AS current_stock,

                    -- Danh mục
                    (
                        SELECT GROUP_CONCAT(c.name SEPARATOR ', ')
                        FROM product_categories pc
                        JOIN categories c ON pc.category_id = c.id
                        WHERE pc.product_id = p.id
                    ) AS categories,

                    -- Số lượng đã bán
                    IFNULL(SUM(
                        CASE
                            WHEN o.status = 'delivered' $orderDateSql
                            THEN oi.quantity
                            ELSE 0
                        END
                    ),0) AS units_sold,

                    -- Doanh thu
                    IFNULL(SUM(
                        CASE
                            WHEN o.status = 'delivered' $orderDateSql
                            THEN oi.total_price
                            ELSE 0
                        END
                    ),0) AS revenue,

                    -- Đánh giá
                    COUNT(DISTINCT r.id) AS review_count,
                    ROUND(AVG(r.rating),1) AS avg_rating

                FROM products p
                JOIN product_details pd ON p.id = pd.product_id
                LEFT JOIN order_items oi ON pd.id = oi.product_details_id
                LEFT JOIN orders o       ON oi.order_id = o.id
                LEFT JOIN reviews r      ON oi.id = r.order_item_id
                WHERE 1=1
            ";

            $productParams = [];

            // date params dùng 2 lần trong CASE WHEN
            if ($dateFrom && $dateTo) {
                $productParams = array_merge(
                    $productParams,
                    $orderDateParams,
                    $orderDateParams
                );
            }

            // Filter sản phẩm
            if ($status !== null) {
                $productSql .= " AND p.status = ?";
                $productParams[] = $status;
            }

            if ($language) {
                $productSql .= " AND p.language = ?";
                $productParams[] = $language;
            }

            if ($search) {
                $productSql .= " AND p.name LIKE ?";
                $productParams[] = "%$search%";
            }

            $productSql .= " GROUP BY p.id, pd.id ORDER BY units_sold DESC";

            $products = DB::select($productSql, $productParams);

            /* ======================================================
             * 7. RESPONSE
             * ====================================================== */
            return $this->jsonResponse([
                'overview' => [
                    'total_revenue'           => $revenueTotal,
                    'total_orders_delivered' => $ordersCount,
                    'top_customers'          => $topSpenders,
                ],
                'products_list' => $products
            ], 'Lấy báo cáo thống kê toàn diện thành công');

        } catch (\Exception $e) {
            return $this->jsonResponse([], 'Lỗi hệ thống: '.$e->getMessage(), 500);
        }
    }

    // 2. API: /api/statistics/export
    public function export(Request $request)
    {
        try {
            // --- 1. COPY LOGIC LỌC TỪ HÀM INDEX ---
            $status   = $request->query('status');
            $language = $request->query('language');
            $search   = $request->query('search');
            $dateFrom = $request->query('date_from');
            $dateTo   = $request->query('date_to');

            $orderDateSql    = "";
            $orderDateParams = [];

            if ($dateFrom && $dateTo) {
                $orderDateSql    = " AND o.created_at BETWEEN ? AND ? ";
                $orderDateParams = [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59'];
            }

            // --- 2. QUERY LẤY DỮ LIỆU SẢN PHẨM (Giống hệt index) ---
            $productSql = "
                SELECT
                    p.id, p.name, p.author,
                    pd.product_type, pd.stock,
                    IFNULL(SUM(CASE WHEN o.status = 'delivered' $orderDateSql THEN oi.quantity ELSE 0 END),0) AS units_sold,
                    IFNULL(SUM(CASE WHEN o.status = 'delivered' $orderDateSql THEN oi.total_price ELSE 0 END),0) AS revenue
                FROM products p
                JOIN product_details pd ON p.id = pd.product_id
                LEFT JOIN order_items oi ON pd.id = oi.product_details_id
                LEFT JOIN orders o       ON oi.order_id = o.id
                WHERE 1=1
            ";

            $productParams = [];
            if ($dateFrom && $dateTo) {
                $productParams = array_merge($productParams, $orderDateParams, $orderDateParams);
            }

            if ($status !== null) { $productSql .= " AND p.status = ?"; $productParams[] = $status; }
            if ($language) { $productSql .= " AND p.language = ?"; $productParams[] = $language; }
            if ($search) { $productSql .= " AND p.name LIKE ?"; $productParams[] = "%$search%"; }

            $productSql .= " GROUP BY p.id, pd.id ORDER BY units_sold DESC";
            $products = DB::select($productSql, $productParams);

            // --- 3. TẠO FILE CSV STREAM ---
            $headers = [
                "Content-type"        => "text/csv; charset=UTF-8",
                "Content-Disposition" => "attachment; filename=bao-cao-thong-ke-" . date('Y-m-d') . ".csv",
                "Pragma"              => "no-cache",
                "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
                "Expires"             => "0"
            ];

            $callback = function() use ($products) {
                $file = fopen('php://output', 'w');

                // Thêm BOM để Excel đọc được tiếng Việt UTF-8
                fputs($file, "\xEF\xBB\xBF");

                // Header cột
                fputcsv($file, ['ID', 'Tên Sản Phẩm', 'Tác Giả', 'Loại', 'Tồn Kho', 'Đã Bán', 'Doanh Thu']);

                // Dữ liệu dòng
                foreach ($products as $row) {
                    fputcsv($file, [
                        $row->id,
                        $row->name,
                        $row->author,
                        $row->product_type,
                        $row->stock,
                        $row->units_sold,
                        $row->revenue
                    ]);
                }
                fclose($file);
            };

            return response()->stream($callback, 200, $headers);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
