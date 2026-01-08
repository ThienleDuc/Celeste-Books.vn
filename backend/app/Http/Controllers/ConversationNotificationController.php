<?php

namespace App\Http\Controllers;
use Illuminate\Support\Facades\DB;
use App\Models\ConversationNotification;
use Illuminate\Http\Request;
use App\Http\Requests\ConversationNotificationRequest;
class ConversationNotificationController extends Controller
{
    //get all notifications 
    public function getConversationNotifications(Request $request)
    {
        //vì chưa đăng nhập nên chưa lấy được id của tôi
        // $myId = auth()->id();
        $myId = 'U01';
        try {
            $notifitions =ConversationNotification::where('user_id', $myId)
            ->orderBy('created_at', 'desc')
            ->get();
            return response()->json([
                'status' => 'success',
                'data' => $notifitions
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve notificatmions.',
                'error' => $th->getMessage()
            ], 500);
        }


    }
    public function getConversationNotificationDetail($id)
    {
        try {
            $noteificationDetail = ConversationNotification::where('id', $id)
            ->orderBy('created_at', 'desc')
            ->first();
            //update read notification status
            ConversationNotification::where('id',$id)
            ->update(['is_read' =>1]);
            return response()->json([
                'status' => 'success',
                'data' => $noteificationDetail
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve notificatmion detail.',
                'error' => $th->getMessage()
            ], 500);
            
        }
    }
    //tạo thông báo mới
    public function createConversationNotification(ConversationNotificationRequest $request){
        try {
            $conversationNotificationInput = $request->validated();
            $notification = ConversationNotification::updateOrCreate(
            [
                'conversation_id' => $data['conversation_id'],
                'user_id'         => $data['user_id'],
            ],
            $conversationNotificationInput
        );            
        return response()->json([
                'status' => 'success',
                'message' => 'Notification created successfully.',
                'data' => $createNotification
            ], 201);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create notification.',
                'error' => $th->getMessage()
            ], 500);
        }

    }
    //update notification 
    public function updateConversationNotification(ConversationNotificationRequest $request, $id){
        try {
            $updateNotificationInput = $request->validated();
            $updateNotification = ConversationNotification::where('id',$id)
            ->update($updateNotificationInput);
            return response()->json([
                'status' => 'success',
                'message' => 'Notification updated successfully.',
                'data' => $updateNotification
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update notification.',
                'error' => $th->getMessage()
            ], 500);
        }
    }
    // //delete conversation notification
    public function deleteConversationNotification($id){
        try {
            $deleteNotification = ConversationNotification::find($id);
            if(!$deleteNotification){
                return response()->json([
                    'status' => 'error',
                    'message' => 'Notification not found.', 
                ], 404);
            }
            
            $deleteNotification->delete();
            return response()->json([
                'status' => 'success',
                'message' => 'Notification deleted successfully.',
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status'=> 'error',
                'message'=>'Failed to delete notification',
                'error'=>$th->getMessage()
            ],500);
        }
    }
   



                
}
