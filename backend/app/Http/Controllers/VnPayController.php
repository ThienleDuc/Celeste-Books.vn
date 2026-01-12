<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class VnPayController extends Controller
{
    public function createPayment(Request $request)
    {
        $vnp_TmnCode = env('VNPAY_TMN_CODE');
        $vnp_HashSecret = env('VNPAY_HASH_SECRET');
        $vnp_Url = env('VNPAY_URL');
        $vnp_Returnurl = env('VNPAY_RETURN_URL');

        // Lấy Order từ Database để đảm bảo dữ liệu thật
        $order = Order::find($request->order_id);
        if (!$order) {
            return response()->json(['status' => 'error', 'message' => 'Đơn hàng không tồn tại'], 404);
        }

        $vnp_TxnRef = $order->order_code; // Sử dụng Order Code cho đồng bộ
        $vnp_OrderInfo = "Thanh toan don hang #" . $vnp_TxnRef;
        $vnp_OrderType = 'billpayment';
        $vnp_Amount = $order->total_amount * 100; // Sử dụng giá thực tế từ DB
        $vnp_Locale = 'vn';
        $vnp_IpAddr = $request->ip();

        $inputData = array(
            "vnp_Version" => "2.1.0",
            "vnp_TmnCode" => $vnp_TmnCode,
            "vnp_Amount" => $vnp_Amount,
            "vnp_Command" => "pay",
            "vnp_CreateDate" => date('YmdHis'),
            "vnp_CurrCode" => "VND",
            "vnp_IpAddr" => $vnp_IpAddr,
            "vnp_Locale" => $vnp_Locale,
            "vnp_OrderInfo" => $vnp_OrderInfo,
            "vnp_OrderType" => $vnp_OrderType,
            "vnp_ReturnUrl" => $vnp_Returnurl,
            "vnp_TxnRef" => $vnp_TxnRef,
        );

        ksort($inputData);
        $query = "";
        $i = 0;
        $hashdata = "";
        foreach ($inputData as $key => $value) {
            if ($i == 1) {
                $hashdata .= '&' . urlencode($key) . "=" . urlencode($value);
            } else {
                $hashdata .= urlencode($key) . "=" . urlencode($value);
                $i = 1;
            }
            $query .= urlencode($key) . "=" . urlencode($value) . '&';
        }

        $vnp_Url = $vnp_Url . "?" . $query;
        if (isset($vnp_HashSecret)) {
            $vnpSecureHash = hash_hmac('sha512', $hashdata, $vnp_HashSecret);
            $vnp_Url .= 'vnp_SecureHash=' . $vnpSecureHash;
        }

        return response()->json([
            'status' => 'success',
            'payment_url' => $vnp_Url
        ]);
    }



public function vnpayReturn(Request $request) {
    $vnp_HashSecret = env('VNPAY_HASH_SECRET');
    $vnp_SecureHash = $request->vnp_SecureHash;
    $inputData = $request->except('vnp_SecureHash');

    ksort($inputData);
    $hashData = "";
    $i = 0;
    foreach ($inputData as $key => $value) {
        if ($i == 1) {
            $hashData .= '&' . urlencode($key) . "=" . urlencode($value);
        } else {
            $hashData .= urlencode($key) . "=" . urlencode($value);
            $i = 1;
        }
    }

    $secureHash = hash_hmac('sha512', $hashData, $vnp_HashSecret);

    if ($secureHash == $vnp_SecureHash) {
        if ($request->vnp_ResponseCode == '00') {
            $order = \App\Models\Order::where('order_code', $request->vnp_TxnRef)->first();
            
            if ($order) {
                $order->update([
                    'payment_status' => 'paid',
                    'status' => 'processing'
                ]);

                // QUAN TRỌNG: Điều hướng về Frontend kèm order_id
                return redirect("http://localhost:5173/");
            }
        }
    }

    // Nếu thất bại hoặc hủy
    return redirect("http://localhost:5173/checkout?payment_status=failed");
}



}