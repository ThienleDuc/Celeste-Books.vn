<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Product;
use App\Models\ProductDetail;
use App\Models\ShoppingCart;
use App\Models\CartItem;

class ShoppingCartController extends Controller
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

    // 1. THÊM SẢN PHẨM VÀO GIỎ HÀNG
    public function addToCart(Request $request)
    {
        // 1. Validate dữ liệu đầu vào
        $request->validate([
            'user_id' => 'required|string|exists:users,id',
            'product_id' => 'required|integer|exists:products,id',
            'product_details_id' => 'required|integer|exists:product_details,id',
            'quantity' => 'required|integer|min:1',
        ]);

        // 2. Kiểm tra chi tiết sản phẩm và tính hợp lệ với product_id
        $productDetail = ProductDetail::where('id', $request->product_details_id)
            ->where('product_id', $request->product_id)
            ->first();

        if (!$productDetail) {
            return $this->jsonResponse([], 'Chi tiết sản phẩm không khớp với sản phẩm đã chọn', 400);
        }

        DB::beginTransaction();
        try {
            // 3. Tìm hoặc tạo giỏ hàng có trạng thái 'active' cho người dùng
            $cart = ShoppingCart::where('user_id', $request->user_id)
                ->where('status', 'active')
                ->first();

            if (!$cart) {
                $cartId = (ShoppingCart::max('id') ?? 0) + 1;
                $cart = ShoppingCart::create([
                    'id' => $cartId,
                    'user_id' => $request->user_id,
                    'status' => 'active',
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }

            // 4. Kiểm tra xem item này đã tồn tại trong giỏ chưa
            $cartItem = CartItem::where('cart_id', $cart->id)
                ->where('product_details_id', $request->product_details_id)
                ->first();

            $requestedQuantity = $request->quantity;
            $currentStock = $productDetail->stock;

            if ($cartItem) {
                // Nếu đã có trong giỏ, tính tổng số lượng mới
                $newTotalQuantity = $cartItem->quantity + $requestedQuantity;

                // Kiểm tra tồn kho trước khi cập nhật
                if ($newTotalQuantity > $currentStock) {
                    return $this->jsonResponse(['stock' => $currentStock], 'Số lượng vượt quá tồn kho hiện có', 400);
                }

                $cartItem->update([
                    'quantity' => $newTotalQuantity,
                    'updated_at' => now()
                ]);
            } else {
                // Nếu chưa có, kiểm tra tồn kho trước khi thêm mới
                if ($requestedQuantity > $currentStock) {
                    return $this->jsonResponse(['stock' => $currentStock], 'Số lượng vượt quá tồn kho hiện có', 400);
                }

                // Tạo ID mới thủ công cho cart_item
                $cartItemId = (CartItem::max('id') ?? 0) + 1;
                CartItem::create([
                    'id' => $cartItemId,
                    'cart_id' => $cart->id,
                    'product_id' => $request->product_id,
                    'product_details_id' => $request->product_details_id,
                    'quantity' => $requestedQuantity,
                    'price_at_time' => $productDetail->sale_price,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }

            // Cập nhật thời gian thay đổi cuối cùng của giỏ hàng
            $cart->update(['updated_at' => now()]);

            DB::commit();
            return $this->jsonResponse($cart->load('items'), 'Thêm vào giỏ hàng thành công');

        } catch (\Exception $e) {
            DB::rollBack();
            return $this->jsonResponse([], 'Lỗi hệ thống: ' . $e->getMessage(), 500);
        }
    }

    // 2. LẤY GIỎ HÀNG (GET CART)
    public function getCart($userId)
    {
        try {
            // Eager load: Lấy item, thông tin sản phẩm (để lấy tên), chi tiết (để lấy loại, stock), và ảnh
            $cart = ShoppingCart::with([
                'items.product.images',
                'items.productDetail'
            ])
            ->where('user_id', $userId)
            ->where('status', 'active') //
            ->first();

            if (!$cart) {
                return $this->jsonResponse([], 'Giỏ hàng trống');
            }

            return $this->jsonResponse($cart, 'Lấy giỏ hàng thành công');
        } catch (\Exception $e) {
            return $this->jsonResponse([], 'Lỗi server: ' . $e->getMessage(), 500);
        }
    }

    // 3. CẬP NHẬT SỐ LƯỢNG (UPDATE QUANTITY)
    public function updateCartItem(Request $request, $itemId)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1'
        ]);

        try {
            $cartItem = CartItem::find($itemId); //

            if (!$cartItem) {
                return $this->jsonResponse([], 'Sản phẩm không tồn tại trong giỏ', 404);
            }

            // Kiểm tra tồn kho từ bảng product_details
            $productDetail = ProductDetail::find($cartItem->product_details_id);

            if ($request->quantity > $productDetail->stock) {
                 return $this->jsonResponse(['stock' => $productDetail->stock], 'Số lượng vượt quá tồn kho', 400);
            }

            $cartItem->update([
                'quantity' => $request->quantity,
                'updated_at' => now()
            ]);

            // Cập nhật lại thời gian giỏ hàng
            ShoppingCart::where('id', $cartItem->cart_id)->update(['updated_at' => now()]);

            return $this->jsonResponse($cartItem, 'Cập nhật thành công');
        } catch (\Exception $e) {
            return $this->jsonResponse([], 'Lỗi server', 500);
        }
    }

    // 4. XÓA SẢN PHẨM KHỎI GIỎ (REMOVE ITEM)
    public function removeCartItem($itemId)
    {
        try {
            $cartItem = CartItem::find($itemId);
            if ($cartItem) {
                $cartId = $cartItem->cart_id;
                $cartItem->delete();

                // Cập nhật thời gian giỏ hàng
                ShoppingCart::where('id', $cartId)->update(['updated_at' => now()]);
            }
            return $this->jsonResponse([], 'Đã xóa sản phẩm');
        } catch (\Exception $e) {
            return $this->jsonResponse([], 'Lỗi server', 500);
        }
    }
}
