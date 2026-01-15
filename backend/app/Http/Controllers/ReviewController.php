<?php

namespace App\Http\Controllers;
use App\Models\Review;
use App\Http\Requests\ReviewRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use  App\Models\OrderItem;
class ReviewController extends Controller
{  
  public function getReviewByProductId(Request $request, $id) {
    try {
        // 1. Lấy danh sách ID các OrderItem thuộc về Product này
        $orderItemIds = OrderItem::where('product_id', $id)->pluck('id');

        // 2. Query lấy Review kèm User và Images
        $reviews = Review::with(['user', 'images']) // <--- THÊM 'images' VÀO ĐÂY
            ->whereIn('order_item_id', $orderItemIds)
            ->orderBy('created_at', 'desc')
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
    //kiểm tra đã đánh giá chưa theo dựa vào product_id và user_id

    public function checkReviewed(Request $request) {
        try {
            // 1. Lấy Product ID từ query params (?productId=...)
            $productId = $request->input('productId');
            
            // 2. Lấy User ID từ Auth hoặc từ request
            $userId = Auth::id() ?? $request->input('user_id'); 

            // Validation
            if (!$productId) {
                return response()->json([
                    'status' => false,
                    'reviewed' => false, 
                    'message' => 'productId không hợp lệ'
                ], 400);
            }

            // Nếu chưa đăng nhập => Chắc chắn chưa đánh giá
            if (!$userId) {
                return response()->json([
                    'status' => true,
                    'reviewed' => false, 
                    'message' => 'User chưa đăng nhập'
                ]);
            }

            // 3. Kiểm tra trong DB xem User đã đánh giá Product này chưa
            // Lấy order_item_ids của product này trước
            $orderItemIds = OrderItem::where('product_id', $productId)->pluck('id');
            
            // Rồi kiểm tra xem có review nào của user này cho order items này không
            $isReviewed = Review::where('user_id', $userId)
                ->whereIn('order_item_id', $orderItemIds)
                ->exists();

            // 4. Trả về kết quả
            return response()->json([
                'status' => true,
                'reviewed' => $isReviewed // True: Đã đánh giá, False: Chưa
            ]);

        } catch (\Throwable $th) {
            \Log::error('checkReviewed error: ' . $th->getMessage());
            return response()->json([
                'status' => false,
                'reviewed' => false,
                'message' => 'Lỗi server: ' . $th->getMessage()
            ], 500);
        }
    }
}

