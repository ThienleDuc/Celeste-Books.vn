<?php

namespace App\Http\Controllers;

use App\Models\OrderShippingDiscount;
use Illuminate\Http\Request;

class OrderShippingDiscountController extends Controller
{
    /**
     * Lấy danh sách tất cả voucher ship hàng
     */
    public function index()
    {
        $discounts = OrderShippingDiscount::all();
        return response()->json([
            'success' => true,
            'data' => $discounts
        ]);
    }

    /**
     * Lấy thông tin chi tiết một voucher ship hàng
     */
    public function show($id)
    {
        $discount = OrderShippingDiscount::find($id);
        
        if (!$discount) {
            return response()->json([
                'success' => false,
                'message' => 'Voucher ship hàng không tồn tại'
            ], 404);
        }
        
        return response()->json([
            'success' => true,
            'data' => $discount
        ]);
    }

    /**
     * Lấy voucher ship hàng theo loại
     */
    public function getByType(Request $request)
    {
        $type = $request->input('type');
        
        if (!$type) {
            return response()->json([
                'success' => false,
                'message' => 'Vui lòng cung cấp loại voucher'
            ], 400);
        }
        
        $discounts = OrderShippingDiscount::where('type', $type)->get();
        
        return response()->json([
            'success' => true,
            'data' => $discounts
        ]);
    }
}