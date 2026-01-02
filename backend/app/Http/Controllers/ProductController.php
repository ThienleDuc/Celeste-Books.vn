<?php

namespace App\Http\Controllers;
use App\Models\Product;
use App\Models\ProductDetail;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(){
    $products = Product::all();
    return response()->json([
        'message' => 'Lấy danh sách sản phẩm thành công',
        'data' => $products
    ]);
    }
    
   public function show($id)
{

   

    $product = Product::with('detail')->find($id);

    if (!$product) {
        return response()->json([
            'message' => 'Không tìm thấy sản phẩm'
        ], 404);
    }

   
    
        // ✅ TĂNG VIEW
        $product->increment('Views');

        return response()->json([
            'message' => 'Lấy chi tiết sản phẩm thành công',
            'data' => $product
        ]);
}

public function suggest($id)
{
    $product = Product::find($id);

    if (!$product) {
        return response()->json([
            'message' => 'Không tìm thấy sản phẩm'
        ], 404);
    }

    $suggests = Product::where('id', '!=', $id)
        ->where('language', $product->language)
        ->limit(4)
        ->get();

    return response()->json([
        'data' => $suggests
    ]);
}

}
