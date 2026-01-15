<?php

namespace App\Http\Controllers;

use App\Models\OrderShippingFeeDetail;
use Illuminate\Http\Request;

class OrderShippingFeeDetailController extends Controller
{
    /**
     * Lấy danh sách tất cả chi tiết phí ship
     */
    public function index()
    {
        $feeDetails = OrderShippingFeeDetail::with(['weightFee', 'distanceFee', 'shippingTypeFee'])->get();
        
        return response()->json([
            'success' => true,
            'data' => $feeDetails
        ]);
    }

    /**
     * Lấy thông tin chi tiết phí ship theo order_id
     */
    public function getByOrder($orderId)
    {
        $feeDetail = OrderShippingFeeDetail::with(['weightFee', 'distanceFee', 'shippingTypeFee'])
            ->where('order_id', $orderId)
            ->first();
        
        if (!$feeDetail) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy thông tin phí ship cho đơn hàng này'
            ], 404);
        }
        
        return response()->json([
            'success' => true,
            'data' => $feeDetail
        ]);
    }

    /**
     * Lấy tổng phí ship
     */
    public function getTotalShippingFee($orderId)
    {
        $feeDetail = OrderShippingFeeDetail::where('order_id', $orderId)->first();
        
        if (!$feeDetail) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy thông tin phí ship'
            ], 404);
        }
        
        return response()->json([
            'success' => true,
            'order_id' => $orderId,
            'total_shipping_fee' => $feeDetail->amount
        ]);
    }
}