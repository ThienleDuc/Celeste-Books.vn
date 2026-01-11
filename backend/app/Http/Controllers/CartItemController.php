<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CartItem;
use Illuminate\Support\Facades\DB; 

class CartItemController extends Controller
{
    public function getUserCart($userId)
{
    try {
        $cartItems = DB::table('cart_items as ci')
            ->join('shopping_carts as sc', 'ci.cart_id', '=', 'sc.id')
            ->join('products as p', 'ci.product_id', '=', 'p.id')
            ->join('product_details as pd', 'ci.product_details_id', '=', 'pd.id')
            ->leftJoin('product_images as pi', function($join) {
                $join->on('p.id', '=', 'pi.product_id')
                     ->where('pi.is_primary', true);
            })
            ->leftJoin('categories as c', function($join) {
                $join->on('p.id', '=', DB::raw('(SELECT product_id FROM product_categories pc WHERE pc.product_id = p.id LIMIT 1)'));
            })
            ->where('sc.user_id', $userId)
            ->where('sc.status', 'active')
            ->select([
                'ci.id as cart_item_id',
                'ci.quantity',
                'ci.price_at_time',
                'ci.created_at as added_at',
                
                'p.id as product_id',
                'p.name as product_name',
                'p.slug as product_slug',
                'p.author',
                'p.publisher',
                'p.rating',
                
                'pd.id as product_detail_id',
                'pd.product_type',
                'pd.sku',
                'pd.original_price',
                'pd.sale_price',
                'pd.stock',
                'pd.weight',
                'pd.file_url', // cho sách điện tử
                
                'pi.image_url as primary_image',
                
                'c.name as category_name',
                
                // Tính toán
                DB::raw('(ci.price_at_time * ci.quantity) as item_total'),
                DB::raw('CASE WHEN pd.stock < ci.quantity THEN "out_of_stock" ELSE "in_stock" END as stock_status')
            ])
            ->orderBy('ci.created_at', 'desc')
            ->get();
        
        // Tính tổng
        $subtotal = $cartItems->sum('item_total');
        $totalItems = $cartItems->sum('quantity');
        
        return response()->json([
            'success' => true,
            'data' => [
                'items' => $cartItems,
                'summary' => [
                    'total_items' => $totalItems,
                    'subtotal' => $subtotal,
                    'estimated_tax' => 0, // có thể tính thêm
                    'estimated_shipping' => 0, // sẽ tính sau
                    'total' => $subtotal
                ]
            ]
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Lỗi khi lấy giỏ hàng',
            'error' => $e->getMessage()
        ], 500);
    }
}

public function getCartItemDetail($cartItemId)
{
    try {
        $item = DB::table('cart_items as ci')
            ->join('products as p', 'ci.product_id', '=', 'p.id')
            ->join('product_details as pd', 'ci.product_details_id', '=', 'pd.id')
            ->leftJoin('product_images as pi', function($join) {
                $join->on('p.id', '=', 'pi.product_id')
                     ->where('pi.is_primary', true);
            })
            ->where('ci.id', $cartItemId)
            ->select([
                'ci.*',
                'p.name',
                'p.slug',
                'p.author',
                'p.publisher',
                'pd.product_type',
                'pd.sku',
                'pd.original_price',
                'pd.sale_price',
                'pd.stock',
                'pd.weight',
                'pi.image_url',
                DB::raw('CASE WHEN pd.stock < ci.quantity THEN false ELSE true END as available')
            ])
            ->first();
        
        if (!$item) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy sản phẩm trong giỏ hàng'
            ], 404);
        }
        
        return response()->json([
            'success' => true,
            'data' => $item
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Lỗi khi lấy chi tiết',
            'error' => $e->getMessage()
        ], 500);
    }
}

public function calculateCartWeight($userId)
{
    try {
        $totalWeight = DB::table('cart_items as ci')
            ->join('shopping_carts as sc', 'ci.cart_id', '=', 'sc.id')
            ->join('product_details as pd', 'ci.product_details_id', '=', 'pd.id')
            ->where('sc.user_id', $userId)
            ->where('sc.status', 'active')
            ->where('pd.product_type', 'Sách giấy') // chỉ tính sách giấy
            ->select(DB::raw('SUM(pd.weight * ci.quantity) as total_weight'))
            ->value('total_weight') ?? 0;
        
        return response()->json([
            'success' => true,
            'data' => [
                'total_weight_kg' => $totalWeight,
                'total_weight_g' => $totalWeight * 1000
            ]
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Lỗi tính cân nặng'
        ], 500);
    }
}
public function getCartSummary($userId)
{
    try {
        $summary = DB::table('cart_items as ci')
            ->join('shopping_carts as sc', 'ci.cart_id', '=', 'sc.id')
            ->join('product_details as pd', 'ci.product_details_id', '=', 'pd.id')
            ->where('sc.user_id', $userId)
            ->where('sc.status', 'active')
            ->select([
                DB::raw('COUNT(ci.id) as item_count'),
                DB::raw('SUM(ci.quantity) as total_quantity'),
                DB::raw('SUM(ci.price_at_time * ci.quantity) as subtotal')
            ])
            ->first();
        
        return response()->json([
            'success' => true,
            'data' => [
                'item_count' => $summary->item_count ?? 0,
                'total_quantity' => $summary->total_quantity ?? 0,
                'subtotal' => $summary->subtotal ?? 0
            ]
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Lỗi lấy tóm tắt giỏ hàng'
        ], 500);
    }
}

public function getCartForCheckout($userId)
{
    try {
        // Lấy giỏ hàng
        $cartResponse = $this->getUserCart($userId);
        $cartData = json_decode($cartResponse->getContent(), true);
        
        if (!$cartData['success']) {
            return $cartResponse;
        }
        
        // Kiểm tra stock
        $stockResponse = $this->checkStockAvailability($userId);
        $stockData = json_decode($stockResponse->getContent(), true);
        
        // Tính weight
        $weightResponse = $this->calculateCartWeight($userId);
        $weightData = json_decode($weightResponse->getContent(), true);
        
        // Kết hợp dữ liệu
        $result = [
            'success' => true,
            'data' => [
                'cart_items' => $cartData['data']['items'] ?? [],
                'summary' => $cartData['data']['summary'] ?? [],
                'stock_check' => $stockData['data'] ?? [],
                'weight_info' => $weightData['data'] ?? [],
                'is_checkout_ready' => $stockData['data']['all_available'] ?? false
            ]
        ];
        
        return response()->json($result);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Lỗi chuẩn bị giỏ hàng cho checkout'
        ], 500);
    }
}

}
