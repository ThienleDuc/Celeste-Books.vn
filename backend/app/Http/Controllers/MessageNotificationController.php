<?php

namespace App\Http\Controllers;
use Illuminate\Support\Facades\DB;
use App\Models\MessageNotification;
use Illuminate\Http\Request;

class MessageNotificationController extends Controller
{
    public function getNotifications(Request $request)
    {
        //vì chưa đăng nhập nên chưa lấy được id của tôi
        // $myId = auth()->id();
        $myId = 'U01';
        try {
            $notifitions =DB::table('message_notifications')
            ->where('user_id', $myId)
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
    public function getNotificationDetail($id)
    {
        try {
            $noteificationDetail = DB::table('message_notifications')
            ->where('id', $id)
            ->first();
            //update read notification status
            DB::table('message_notifications')
            ->where('id',$id)
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
    //tạo{send} thông báo mới, không cần thiết vì khi gửi tin nhắn thì đã tạo thông báo luôn rồi 
    
}
