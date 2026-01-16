<?php

namespace App\Http\Controllers;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ProductImage;


class ProductImageController extends Controller
{
    //get product images by product id 
    public function getProductImageByProductId($productId)
    {
        $productImages = ProductImage::where('product_id', $productId)->get();
        return response()->json($productImages);
    }
}
