<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ReviewImage;
use App\Http\Requests\ReviewImageRequest;
use PhpParser\Node\Stmt\TryCatch;
class ReviewImageController extends Controller
{
    //get all review images 
    public function getReviewImages(Request $request)
    {
        try {
            $getReviewImage = ReviewImage::orderBy("created_at", "desc")->get();
            return response()->json([
                'status' => 'success',
                'data' => $getReviewImage,
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve review images',
                'error' => $th->getMessage()
            ], 500);
        }
    }

    //get detail review image
    public function getDetailReviewImage(Request $request, $id)
    {
        try {
            $getDetailReviewImage = ReviewImage::find($id);
            return response()->json([
                'status' => 'success',
                'data' => $getDetailReviewImage,
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve review image',
                'error' => $th->getMessage()
            ], 500);
        }
    }
    //create reivew image
    public function createReviewImage(Request $request) 
{
    // BƯỚC 1: Validate đầu vào phải là ẢNH (File), không được là string
    $request->validate([
        'review_id' => 'required|integer',
        // Dòng này quan trọng: phải check là image, không được check là string
        'image_url' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120', 
    ]);

    try {
        $urlToSave = '';

        // BƯỚC 2: Kiểm tra và Upload file
        if ($request->hasFile('image_url')) {
            $file = $request->file('image_url');
            
            // Cách 1: Tạo tên file ngẫu nhiên để không trùng
            $filename = time() . '_' . $file->getClientOriginalName();
            
            // Upload vào thư mục public/uploads/reviews
            $file->move(public_path('uploads/reviews'), $filename);
            
            // BƯỚC 3: Tạo đường dẫn URL đầy đủ (String)
            // Kết quả sẽ dạng: http://localhost:8000/uploads/reviews/12345_anh.jpg
            $urlToSave = url('uploads/reviews/' . $filename);
        }

        // BƯỚC 4: Lưu chuỗi URL đó vào Database
        $reviewImage = ReviewImage::create([
            'review_id' => $request->review_id,
            'image_url' => $urlToSave, // <-- Đây chính là String URL bạn muốn
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Upload thành công',
            'data' => $reviewImage
        ], 201);

    } catch (\Exception $e) {
        return response()->json([
            'status' => false,
            'message' => 'Lỗi upload: ' . $e->getMessage()
        ], 500);
    }
}
    //update review image 
    public function updateReviewImage(ReviewImageRequest $request, $id)
    {
        try {
            $updateReviewImageInput = $request->validated();
            $update=ReviewImage::find($id);
            $update->update([

                'image_url' => $updateReviewImageInput['image_url'],
            ]);
            return response()->json([
                'status' => 'success',
                'data' => $update,
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve review image',
                'error' => $th->getMessage()
            ], 500);
        }
    }
    //delete review image 
    public function deleteReviewImage(Request $request,$id){
        try {
            $deleteReviewImage = ReviewImage::find($id)->delete();
             return response()->json([
                'status'=>'success',
                'message'=>'delete review image successfully',
            ],200);

    
        } catch (\Throwable $th) {
            return response()->json([
                    'status'=>'error',
                    'message'=>'Failed to retrieve review image',
                    'error'=>$th->getMessage()  
                ],500);
        }
    }



}
