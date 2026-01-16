<?php

namespace App\Http\Controllers;


use App\Models\User;


use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ShoppingCart;
use App\Models\CartItem;
use App\Models\ProductDetail;
use App\Models\Address;
use App\Models\UserNotification;
use App\Models\OrderNotification;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

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


    // 1. Tạo đơn hàng mới (Checkout)
    public function createOrder(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'shipping_address_id' => 'required|exists:addresses,id',
            'payment_method' => 'required|in:cod,momo,bank_transfer,credit_card,vnpay', 
            'shipping_type' => 'required|in:standard,express', 
            'items' => 'required|array', 
        ]);
    
        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }
    
        DB::beginTransaction();
        try {
            // 1. Tính toán dựa trên dữ liệu Frontend gửi lên (để khớp với số tiền người dùng thấy)
            $subtotal = 0;
            foreach ($request->items as $item) {
                $subtotal += $item['price'] * $item['quantity'];
            }
    
            $shippingFee = $request->shipping_fee ?? 0;
            $discountAmount = $request->discount ?? 0;
            $totalAmount = $subtotal + $shippingFee - $discountAmount;
    
            // 2. Tạo đơn hàng khớp với bảng orders trong SQL
            $order = Order::create([
                'user_id' => $request->user_id,
                'order_code' => $this->generateOrderCode(),
                'status' => 'pending',
                'subtotal' => $subtotal,
                'shipping_fee' => $shippingFee,
                'discount' => $discountAmount,
                'total_amount' => $totalAmount,
                'shipping_address_id' => $request->shipping_address_id,
                'payment_method' => $request->payment_method == 'vnpay' ? 'bank_transfer' : $request->payment_method,
                'payment_status' => 'unpaid',
            ]);
    
            // 3. Lưu chi tiết đơn hàng (OrderItems)
            foreach ($request->items as $item) {
                // Kiểm tra stock thực tế trước khi trừ
                $productDetail = ProductDetail::find($item['product_details_id']);
                if ($productDetail->stock < $item['quantity']) {
                    throw new \Exception("Sản phẩm đã hết hàng hoặc không đủ số lượng.");
                }
    
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['product_id'],
                    'product_details_id' => $item['product_details_id'],

                    'product_type' => $item['product_type'], // 'Sách giấy' hoặc 'Sách điện tử'

                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'total_price' => $item['price'] * $item['quantity'],
                ]);
    
                // Cập nhật tồn kho
                $productDetail->decrement('stock', $item['quantity']);
            }
    
            // 4. Lưu thông tin giảm giá vào bảng order_discount_details (Theo SQL của bạn)
            if ($request->product_discount_id || $request->shipping_discount_id) {
                DB::table('order_discount_details')->insert([
                    'order_id' => $order->id,
                    'product_discount_id' => $request->product_discount_id,
                    'shipping_discount_id' => $request->shipping_discount_id,
                    'amount' => $discountAmount
                ]);
            }
    
            // 5. Dọn dẹp giỏ hàng - Xóa các item đã mua khỏi cart_items
            $itemIds = collect($request->items)->pluck('cart_item_id');
            CartItem::whereIn('id', $itemIds)->delete();
    
            DB::commit();
    
            return response()->json([
                'success' => true,
                'order' => $order,
                'message' => 'Đơn hàng đã được tạo'
            ], 201);
    
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // 2. Lấy danh sách đơn hàng của user
    public function getUserOrders(Request $request, $userId)
    {
        try {
            $query = Order::where('user_id', $userId)
                ->with(['items.product',
                 'items.productDetail',
                 'shippingAddress.commune.province'])

                ->orderBy('created_at', 'desc');

            // Filter theo status
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            // Filter theo payment_status
            if ($request->has('payment_status')) {
                $query->where('payment_status', $request->payment_status);
            }

            // Phân trang
            $perPage = $request->get('per_page', 10);
            $orders = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'message' => 'Lấy danh sách đơn hàng thành công',
                'data' => $orders
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi server',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // 3. Lấy chi tiết đơn hàng
    public function getOrderDetail($orderCode)
    {
        try {
            $order = Order::where('order_code', $orderCode)
                ->with([

                    'items.product',
                    'items.productDetail',
                    'shippingAddress.commune.province',
                    'user.profile'
                ])
                ->first();

            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy đơn hàng'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Lấy chi tiết đơn hàng thành công',
                'data' => $order
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi server',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // 4. Hủy đơn hàng
    public function cancelOrder(Request $request, $orderId)
    {
        $validator = Validator::make($request->all(), [
            'reason' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();
        try {
            $order = Order::find($orderId);

            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy đơn hàng'
                ], 404);
            }

            // Kiểm tra có thể hủy không
            if (!in_array($order->status, ['pending', 'processing'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không thể hủy đơn hàng ở trạng thái hiện tại'
                ], 400);
            }

            // Cập nhật trạng thái
            $order->status = 'cancelled';
            $order->save();

            // Hoàn lại stock
            $orderItems = OrderItem::where('order_id', $orderId)->get();
            foreach ($orderItems as $item) {
                ProductDetail::where('id', $item->product_details_id)
                    ->increment('stock', $item->quantity);
                
                // Giảm purchase count
                DB::table('products')
                    ->where('id', $item->product_id)
                    ->decrement('purchase_count', $item->quantity);
            }

            // Tạo thông báo
            $this->createOrderNotification($order, 'cancelled', $request->reason);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Hủy đơn hàng thành công'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Hủy đơn hàng thất bại',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // 5. Tính toán đơn hàng (pre-checkout)
    public function calculateOrder(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'shipping_address_id' => 'required|exists:addresses,id',
            'shipping_type' => 'required|in:standard,express',
            'promo_code' => 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Lấy giỏ hàng
            $cart = ShoppingCart::where('user_id', $request->user_id)
                ->where('status', 'active')
                ->first();

            if (!$cart) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy giỏ hàng'
                ], 404);
            }

            $cartItems = CartItem::where('cart_id', $cart->id)
                ->with('productDetail')
                ->get();

            if ($cartItems->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Giỏ hàng trống'
                ], 400);
            }

            // Tính toán
            $subtotal = $cartItems->sum(function($item) {
                return $item->price_at_time * $item->quantity;
            });

            $shippingFee = $this->calculateShippingFee($cartItems, $request->shipping_method, $request->shipping_address_id);
            $discountAmount = $request->promo_code ? $this->calculateDiscount($request->promo_code, $subtotal) : 0;
            $totalAmount = $subtotal + $shippingFee - $discountAmount;

            return response()->json([
                'success' => true,
                'data' => [
                    'summary' => [
                        'subtotal' => $subtotal,
                        'shipping_fee' => $shippingFee,
                        'discount' => $discountAmount,
                        'total_amount' => $totalAmount,
                        'item_count' => $cartItems->count(),
                        'total_quantity' => $cartItems->sum('quantity')
                    ],
                    'items' => $cartItems->map(function($item) {
                        return [
                            'product_id' => $item->product_id,
                            'product_details_id' => $item->product_details_id,
                            'name' => $item->product->name ?? 'N/A',
                            'quantity' => $item->quantity,
                            'price' => $item->price_at_time,

                            'total' => $item->price_at_time * $item->quantity,
                            'stock' => $item->productDetail->stock
                        ];
                    })
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi tính toán đơn hàng',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // 6. Cập nhật trạng thái đơn hàng (cho admin)
    public function updateOrderStatus(Request $request, $orderId)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,processing,shipped,delivered,cancelled',
            'note' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();
        try {
            $order = Order::find($orderId);

            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy đơn hàng'
                ], 404);
            }

            $oldStatus = $order->status;
            $order->status = $request->status;
            $order->save();

            // Tạo thông báo khi status thay đổi
            if ($oldStatus != $request->status) {
                $this->createOrderNotification($order, 'status_change', $request->note);
            }
            $itemIds = collect($request->items)->pluck('cart_item_id')->filter();
                if ($itemIds->isNotEmpty()) {
                    CartItem::whereIn('id', $itemIds)->delete();
                }
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật trạng thái thành công',
                'data' => $order
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Cập nhật trạng thái thất bại',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // 7. Lấy đơn hàng theo trạng thái
    public function getOrdersByStatus($status)
    {
        try {
            $orders = Order::where('status', $status)
                ->with(['user.profile', 'items.product'])
                ->orderBy('created_at', 'desc')
                ->paginate(20);

            return response()->json([
                'success' => true,
                'message' => "Lấy đơn hàng trạng thái {$status} thành công",
                'data' => $orders
            ]);
        } catch (\Exception $e) {
            return response()->json([

                'success' => false,

                'message' => 'Lỗi server',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // 8. Tìm kiếm đơn hàng (cho admin)
    public function searchOrders(Request $request)
    {
        try {
            $query = Order::query();

            if ($request->has('order_code')) {
                $query->where('order_code', 'like', "%{$request->order_code}%");
            }

            if ($request->has('customer_name')) {
                $query->whereHas('user.profile', function($q) use ($request) {
                    $q->where('full_name', 'like', "%{$request->customer_name}%");
                });
            }

            if ($request->has('phone')) {
                $query->whereHas('shippingAddress', function($q) use ($request) {
                    $q->where('phone', 'like', "%{$request->phone}%");
                });
            }

            if ($request->has('start_date')) {
                $query->where('created_at', '>=', $request->start_date);
            }

            if ($request->has('end_date')) {
                $query->where('created_at', '<=', $request->end_date);
            }

            $orders = $query->with(['user.profile', 'items'])
                ->orderBy('created_at', 'desc')
                ->paginate($request->get('per_page', 20));

            return response()->json([
                'success' => true,
                'message' => 'Tìm kiếm đơn hàng thành công',
                'data' => $orders
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi tìm kiếm',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // ============ HELPER METHODS ============

    // Tạo order code duy nhất
    private function generateOrderCode()
    {
        do {
            $code = 'ORD' . date('Ymd') . Str::random(6);
        } while (Order::where('order_code', $code)->exists());

        return $code;
    }



    // Tạo thông báo đơn hàng
    private function createOrderNotification($order, $type = 'created', $note = null)
    {
        $messages = [
            'created' => "Đơn hàng {$order->order_code} đã được tạo thành công",
            'status_change' => "Đơn hàng {$order->order_code} đã thay đổi trạng thái thành {$order->status}",
            'cancelled' => "Đơn hàng {$order->order_code} đã bị hủy" . ($note ? " - Lý do: {$note}" : ""),
        ];

        OrderNotification::create([
            'user_id' => $order->user_id,
            'order_id' => $order->id,
            'type' => $type == 'created' ? 'status_change' : 'other',
            'title' => "Thông báo đơn hàng {$order->order_code}",
            'content' => $messages[$type] ?? "Cập nhật đơn hàng {$order->order_code}",
            'is_read' => false,
        ]);
    }

// Lấy thông tin thanh toán

    private function getPaymentInfo($order)
    {
        $info = [
            'order_code' => $order->order_code,
            'amount' => $order->total_amount,
            'payment_method' => $order->payment_method,
            'payment_status' => $order->payment_status,
        ];

        if ($order->payment_method == 'momo') {
            $info['payment_url'] = $this->createMoMoPayment($order);
        } elseif ($order->payment_method == 'bank_transfer') {
            $info['bank_info'] = [
                'bank_name' => 'Vietcombank',
                'account_number' => '0123456789',
                'account_name' => 'CELESTE BOOKS',
                'amount' => $order->total_amount,
                'content' => "CTH {$order->order_code}"
            ];
        }

        return $info;
    }
public function getOrderDetails($orderId)
{
    try {
        // Sử dụng Eager Loading (hàm with) để lấy luôn các bảng liên quan
        // thay vì phải viết Join dài dòng
        $order = Order::with([
            // 1. Lấy thông tin địa chỉ giao hàng
            'shippingAddress', 
            
            // 2. Lấy danh sách items bên trong
            'items', 

            // 3. Từ items, lấy tiếp thông tin Product (tên, tác giả...)
            'items.product', 

            // 4. Từ items, lấy tiếp thông tin ProductDetail (sku, file_url...)
            'items.productDetail'
        ])->find($orderId);

        // Kiểm tra nếu không tìm thấy đơn hàng
        if (!$order) {
            return response()->json([
                'status' => false,
                'message' => 'Không tìm thấy đơn hàng'
            ], 404);
        }

        return response()->json([
            'status' => true,
            'message' => 'Lấy chi tiết đơn hàng thành công',
            'data' => $order
        ]);

    } catch (\Throwable $e) {
        return response()->json([
            'status' => false,
            'message' => 'Lỗi hệ thống: ' . $e->getMessage()
        ], 500);
    }

}
}

