<?php

namespace App\Http\Controllers;

use App\Models\OrderProductDiscount;
use Illuminate\Http\Request;

class OrderProductDiscountController extends Controller
{
    /**
     * Lấy danh sách tất cả voucher sản phẩm
     */
    public function index()
    {
        $discounts = OrderProductDiscount::all();
        return response()->json([
            'success' => true,
            'data' => $discounts
        ]);
    }

    /**
     * Lấy thông tin chi tiết một voucher sản phẩm
     */
    public function show($id)
    {
        $discount = OrderProductDiscount::find($id);
        
        if (!$discount) {
            return response()->json([
                'success' => false,
                'message' => 'Voucher không tồn tại'
            ], 404);
        }
        
        return response()->json([
            'success' => true,
            'data' => $discount
        ]);
    }

    /**
     * Lấy voucher theo loại
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
        
        $discounts = OrderProductDiscount::where('type', $type)->get();
        
        return response()->json([
            'success' => true,
            'data' => $discounts
        ]);
    }
}