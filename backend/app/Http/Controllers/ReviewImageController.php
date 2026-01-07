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
    public function createReviewImage(ReviewImageRequest $request)
    {
        try {
            $createReviewImageInput = $request->validated();
            $createReviewImage = ReviewImage::create($createReviewImageInput);
            return response()->json([
                'status' => 'success',
                'data' => $createReviewImage,
            ], 200);


        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve review image',
                'error' => $th->getMessage()
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
