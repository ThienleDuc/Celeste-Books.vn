<?php

namespace App\Http\Controllers;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    //get all orders
    public function getOrders(Request $request) {

    $orders = Order::leftJoin('profiles', 'orders.user_id', '=', 'profiles.user_id')
        ->select(
            'orders.id',             // QUAN TRỌNG: Cần lấy ID để React xử lý cập nhật
            'orders.order_code',
            'orders.user_id',
            'profiles.full_name',    // <--- Đã đổi từ users.username sang profiles.full_name
            'orders.subtotal',
            'orders.shipping_fee',
            'orders.total_amount',   // Cần lấy cột này để hiển thị tổng tiền
            'orders.status',
            'orders.payment_method',
            'orders.payment_status', // Cần lấy cột này để hiển thị trạng thái thanh toán
            'orders.created_at'
        )
        ->where('orders.status', 'pending')
        ->orderBy('orders.created_at', 'desc')
        ->get();

    return response()->json($orders);
}

   
public function updateStatus(Request $request, $id) {
        try {
            // Validate dữ liệu gửi lên (chỉ cho phép các status hợp lệ trong SQL)
            $request->validate([
                'status' => 'required|string'
            ]);

            $order = Order::find($id);

            if (!$order) {
                return response()->json(['message' => 'Order not found'], 404);
            }

            $order->status = $request->status;
            $order->save();

            return response()->json([
                'message' => 'Cập nhật trạng thái thành công',
                'order' => $order
            ], 200);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Lỗi server: ' . $e->getMessage()], 500);
        }
    }

}
