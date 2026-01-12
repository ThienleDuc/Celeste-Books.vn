<?php

namespace App\Http\Controllers;
use App\Models\Review;
use App\Http\Requests\ReviewRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use  App\Models\OrderItem;
class ReviewController extends Controller
{  
     public function getReviewByProductId(Request $request, $id) {
    try {
        $orderItemIds = OrderItem::where('product_id', $id)->pluck('id');

        $reviews = Review::with(['user:id,username,email']) // Thêm 'email' nếu muốn lấy cả email
            ->whereIn('order_item_id', $orderItemIds)
            ->get();

       

        return response()->json([
            'status' => 'success',
            'data' => $reviews
        ], 200);

    } catch (\Throwable $th) {
        return response()->json([
            'status' => 'error',
            'message' => 'Failed',
            'error' => $th->getMessage()
        ], 500);
    }
}


    public function getReviews(Request $request){
        try {
            $getReview= Review::orderBy("created_at","desc")
            ->get();
        return response()->json([
            'status' => 'success',
            'data'=>$getReview,
        ],200);
        } catch (\Throwable $th) {
            return response()->json([
                'status'=>'error',
                'message'=>'Failed to retrieve reviews.',
                'error'=>$th->getMessage()
            ]);
        }

    }
    /////////===== cảm thấy thừa ============
    // public function getDetailReview($id){
    //     try {
    //         $detailReview= Review::findOrFail($id);
    //         return response()->json([
    //             'status'=>'success',
    //             'data'=>$detailReview
    //         ],200);
    //     } catch (\Throwable $th) {
    //         return response()->json ([
    //             'status'=>'error',
    //             'message'=>'Failed to retrieve review details.',
    //             'error'=>$th->getMessage()
    //         ]);
    //     }
    // }
    public function createReview(ReviewRequest  $request){
        try {
            $createReviewInput=$request->validated();
            
            $createReview= Review::create($createReviewInput);
            return response()->json([
            'status' => 'success',
            'data'=>$createReview,
        ],200);

        } catch (\Throwable $th) {
            return response()->json([
                'status'=>'error',
                'message'=>'Failed to retrieve reviews.',
                'error'=>$th->getMessage()
            ]);
        }
    }
    public function deleteReview($id){
        try {
            $review= Review::findOrFail($id);
            $review->delete();
            return response()->json([
                'status'=>'success',
                'message'=>'Review deleted successfully.'
            ],200);
        } catch (\Throwable $th) {
            return response()->json ([
                'status'=>'error',
                'message'=>'Failed to delete review.',
                'error'=>$th->getMessage()
            ]);
        }
    }
    public function updateReview(ReviewRequest $request, $id){
        try {
            $review= Review::findOrFail($id);
            $updateReviewInput=$request->validated();
            $review->update([
                'content'=>$updateReviewInput['content'] ?? $review->content,
                'rating'=>$updateReviewInput['rating'] ?? $review->rating,
                'title'=>$updateReviewInput['title'] ?? $review->title,
            ]);
            return response()->json([
                'status'=>'success',
                'data'=>$review
            ],200);
        } catch (\Throwable $th) {
            return response()->json ([
                'status'=>'error',
                'message'=>'Failed to update review.',
                'error'=>$th->getMessage()
            ]);
        }
    }
    //lấy review theo mã sản phẩm
    
        

}

