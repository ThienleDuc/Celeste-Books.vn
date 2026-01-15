<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\StreamedResponse;

class StatisticsController extends Controller
{
    // =================================================================
    // HELPER: JSON RESPONSE CHUẨN
    // =================================================================
    private function jsonResponse($data = [], $message = '', $status = 200)
    {
        return response()->json([
            'success' => $status >= 200 && $status < 300,
            'message' => $message,
            'data'    => $data
        ], $status, [], JSON_UNESCAPED_UNICODE);
    }

    // =================================================================
    // PHẦN 1: THỐNG KÊ BÁN RA (SALES)
    // URL: /api/statistics/sales
    // =================================================================
    public function sales(Request $request)
    {
        try {
            $dateFrom = $request->query('date_from');
            $dateTo   = $request->query('date_to');
            $search   = $request->query('search');

            // 1. Xây dựng điều kiện lọc thời gian cho đơn hàng
            $dateCondition = "";
            $bindings = [];

            if ($dateFrom && $dateTo) {
                $dateCondition = " AND o.created_at BETWEEN ? AND ? ";
                $bindings = [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59'];
            }

            // 2. Tổng quan (Overview)
            // Chỉ tính đơn hàng đã giao thành công (delivered)
            $overviewSql = "
                SELECT
                    IFNULL(SUM(total_amount), 0) as total_revenue,
                    COUNT(*) as total_orders_delivered,
                    IFNULL(AVG(total_amount), 0) as avg_order_value
                FROM orders o
                WHERE o.status = 'delivered'
                $dateCondition
            ";
            $overview = DB::selectOne($overviewSql, $bindings);

            // 3. Top khách hàng (Top Customers)
            $topCustomerSql = "
                SELECT u.username, p.full_name, SUM(o.total_amount) as total_spent
                FROM orders o
                JOIN users u ON o.user_id = u.id
                LEFT JOIN profiles p ON u.id = p.user_id
                WHERE o.status = 'delivered'
                $dateCondition
                GROUP BY u.id, u.username, p.full_name
                ORDER BY total_spent DESC
                LIMIT 5
            ";
            $topCustomers = DB::select($topCustomerSql, $bindings);

            // 4. Danh sách sản phẩm bán ra
            // Logic: Join Products -> Product Details -> Order Items -> Orders
            // Tính tổng số lượng và doanh thu dựa trên các item trong đơn hàng đã giao
            $productSql = "
                SELECT
                    p.id, p.name,
                    pd.sale_price,
                    p.status,
                    (
                        SELECT GROUP_CONCAT(c.name SEPARATOR ', ')
                        FROM product_categories pc
                        JOIN categories c ON pc.category_id = c.id
                        WHERE pc.product_id = p.id
                    ) AS categories,

                    -- Số lượng bán (chỉ tính trong khoảng thời gian lọc)
                    IFNULL(SUM(
                        CASE WHEN o.status = 'delivered' $dateCondition
                        THEN oi.quantity ELSE 0 END
                    ), 0) as units_sold,

                    -- Doanh thu sản phẩm (chỉ tính trong khoảng thời gian lọc)
                    IFNULL(SUM(
                        CASE WHEN o.status = 'delivered' $dateCondition
                        THEN oi.total_price ELSE 0 END
                    ), 0) as revenue

                FROM products p
                JOIN product_details pd ON p.id = pd.product_id
                LEFT JOIN order_items oi ON pd.id = oi.product_details_id
                LEFT JOIN orders o ON oi.order_id = o.id
                WHERE 1=1
            ";

            $productBindings = [];
            // Bind tham số date 2 lần cho 2 mệnh đề CASE WHEN
            if ($dateFrom && $dateTo) {
                $productBindings = array_merge($bindings, $bindings);
            }

            if ($search) {
                $productSql .= " AND p.name LIKE ? ";
                $productBindings[] = "%$search%";
            }

            // Chỉ hiển thị sản phẩm có doanh thu > 0 (hoặc bỏ dòng này nếu muốn hiện tất cả)
            // $productSql .= " HAVING revenue > 0 ";

            $productSql .= " GROUP BY p.id, p.name, pd.sale_price, p.status ORDER BY revenue DESC";

            $products = DB::select($productSql, $productBindings);

            return $this->jsonResponse([
                'overview' => [
                    'total_revenue' => $overview->total_revenue,
                    'total_orders_delivered' => $overview->total_orders_delivered,
                    'avg_order_value' => $overview->avg_order_value,
                    'top_customers' => $topCustomers
                ],
                'products_list' => $products
            ], 'Lấy thống kê bán ra thành công');

        } catch (\Exception $e) {
            return $this->jsonResponse([], 'Lỗi: ' . $e->getMessage(), 500);
        }
    }

    // =================================================================
    // PHẦN 2: THỐNG KÊ KHO / NHẬP VÀO (INVENTORY)
    // URL: /api/statistics/inventory
    // =================================================================
    public function inventory(Request $request)
    {
        try {
            $search = $request->query('search');

            // 1. Tổng quan kho (Overview)
            // Giá trị kho = stock * original_price (giá nhập)
            // Cảnh báo hết hàng = stock < 10
            $overviewSql = "
                SELECT
                    IFNULL(SUM(pd.stock * pd.original_price), 0) as total_inventory_value,
                    IFNULL(SUM(pd.stock), 0) as total_items_in_stock,
                    COUNT(CASE WHEN pd.stock < 10 THEN 1 END) as low_stock_items
                FROM products p
                JOIN product_details pd ON p.id = pd.product_id
                WHERE p.status = 1 -- Chỉ tính sản phẩm đang hoạt động (tuỳ nghiệp vụ)
            ";
            $overview = DB::selectOne($overviewSql);

            // 2. Danh sách chi tiết kho
            $productSql = "
                SELECT
                    p.id, p.name, p.status,
                    pd.sku,
                    pd.original_price,
                    pd.stock as current_stock,
                    (pd.stock * pd.original_price) as total_import_value,
                    (
                        SELECT GROUP_CONCAT(c.name SEPARATOR ', ')
                        FROM product_categories pc
                        JOIN categories c ON pc.category_id = c.id
                        WHERE pc.product_id = p.id
                    ) AS categories
                FROM products p
                JOIN product_details pd ON p.id = pd.product_id
                WHERE 1=1
            ";

            $bindings = [];
            if ($search) {
                $productSql .= " AND (p.name LIKE ? OR pd.sku LIKE ?) ";
                $bindings[] = "%$search%";
                $bindings[] = "%$search%";
            }

            $productSql .= " ORDER BY pd.stock ASC"; // Sắp xếp tồn kho tăng dần để dễ thấy hàng sắp hết

            $products = DB::select($productSql, $bindings);

            return $this->jsonResponse([
                'overview' => [
                    'total_inventory_value' => $overview->total_inventory_value,
                    'total_items_in_stock' => $overview->total_items_in_stock,
                    'low_stock_items' => $overview->low_stock_items
                ],
                'products_list' => $products
            ], 'Lấy thống kê kho thành công');

        } catch (\Exception $e) {
            return $this->jsonResponse([], 'Lỗi: ' . $e->getMessage(), 500);
        }
    }

    // =================================================================
    // PHẦN 3: XUẤT CSV BÁN RA
    // URL: /api/statistics/sales/export
    // =================================================================
    public function exportSales(Request $request)
    {
        // ... (Logic lọc query giống hệt function sales ở trên) ...
        // Để ngắn gọn, ta copy lại phần Query products_list
        try {
            $dateFrom = $request->query('date_from');
            $dateTo   = $request->query('date_to');
            $search   = $request->query('search');

            $dateCondition = "";
            $bindings = [];
            if ($dateFrom && $dateTo) {
                $dateCondition = " AND o.created_at BETWEEN ? AND ? ";
                $bindings = [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59'];
            }

            $sql = "
                SELECT
                    p.name,
                    pd.sale_price,
                    IFNULL(SUM(CASE WHEN o.status = 'delivered' $dateCondition THEN oi.quantity ELSE 0 END), 0) as units_sold,
                    IFNULL(SUM(CASE WHEN o.status = 'delivered' $dateCondition THEN oi.total_price ELSE 0 END), 0) as revenue
                FROM products p
                JOIN product_details pd ON p.id = pd.product_id
                LEFT JOIN order_items oi ON pd.id = oi.product_details_id
                LEFT JOIN orders o ON oi.order_id = o.id
                WHERE 1=1
            ";

            $sqlBindings = [];
            if ($dateFrom && $dateTo) $sqlBindings = array_merge($bindings, $bindings);
            if ($search) {
                $sql .= " AND p.name LIKE ? ";
                $sqlBindings[] = "%$search%";
            }
            $sql .= " GROUP BY p.id, p.name, pd.sale_price HAVING revenue > 0 ORDER BY revenue DESC";

            $data = DB::select($sql, $sqlBindings);

            return $this->streamCsv($data, ['Tên Sản Phẩm', 'Giá Bán', 'Đã Bán', 'Doanh Thu'], 'BaoCao_BanRa');

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // =================================================================
    // PHẦN 4: XUẤT CSV TỒN KHO
    // URL: /api/statistics/inventory/export
    // =================================================================
    public function exportInventory(Request $request)
    {
        try {
            $search = $request->query('search');

            $sql = "
                SELECT
                    p.name,
                    pd.sku,
                    pd.original_price,
                    pd.stock,
                    (pd.stock * pd.original_price) as total_value,
                    IF(p.status = 1, 'Đang bán', 'Ngừng bán') as status_text
                FROM products p
                JOIN product_details pd ON p.id = pd.product_id
                WHERE 1=1
            ";

            $bindings = [];
            if ($search) {
                $sql .= " AND (p.name LIKE ? OR pd.sku LIKE ?) ";
                $bindings[] = "%$search%";
                $bindings[] = "%$search%";
            }
            $sql .= " ORDER BY pd.stock ASC";

            $data = DB::select($sql, $bindings);

            return $this->streamCsv($data, ['Tên Sản Phẩm', 'SKU', 'Giá Nhập', 'Tồn Kho', 'Tổng Giá Trị Vốn', 'Trạng Thái'], 'BaoCao_TonKho');

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // =================================================================
    // HELPER: STREAM CSV (Dùng chung)
    // =================================================================
    private function streamCsv($data, $headers, $fileNamePrefix)
    {
        $responseHeaders = [
            "Content-type"        => "text/csv; charset=UTF-8",
            "Content-Disposition" => "attachment; filename=" . $fileNamePrefix . "_" . date('Y-m-d') . ".csv",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $callback = function() use ($data, $headers) {
            $file = fopen('php://output', 'w');
            fputs($file, "\xEF\xBB\xBF"); // BOM header cho Excel đọc tiếng Việt
            fputcsv($file, $headers);

            foreach ($data as $row) {
                fputcsv($file, (array) $row);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $responseHeaders);
    }
}
