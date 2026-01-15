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

    public function getLatestCartItem($userId)
    {
        try {
            $latestItem = DB::table('cart_items as ci')
                ->join('shopping_carts as sc', 'ci.cart_id', '=', 'sc.id')
                ->join('products as p', 'ci.product_id', '=', 'p.id')
                ->join('product_details as pd', 'ci.product_details_id', '=', 'pd.id')
                ->leftJoin('product_images as pi', function($join) {
                    $join->on('p.id', '=', 'pi.product_id')
                        ->where('pi.is_primary', true);
                })
                ->leftJoin('categories as c', function($join) {
                    // Sử dụng subquery để tránh lặp dòng nếu 1 sp có nhiều category
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
                    'pd.file_url',
                    
                    'pi.image_url as primary_image',
                    'c.name as category_name',
                    
                    DB::raw('(ci.price_at_time * ci.quantity) as item_total'),
                    DB::raw('CASE WHEN pd.stock < ci.quantity THEN "out_of_stock" ELSE "in_stock" END as stock_status')
                ])
                ->orderBy('ci.id', 'desc') // Lấy cái vừa được tạo sau cùng
                ->first(); // Chỉ lấy 1
    
            if (!$latestItem) {
                return response()->json([
                    'success' => true,
                    'data' => null
                ]);
            }
    
            return response()->json([
                'success' => true,
                'data' => $latestItem
            ]);
    
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy sản phẩm mới nhất',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
