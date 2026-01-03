<?php

namespace App\Http\Controllers;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
    
class MessageController extends Controller
{
    public function getMessage(Request $request)
    {
        $anotherPerson = $request->id;
        if (!$anotherPerson) {
             return response()->json(['status' => 'error', 'message' => 'Contact ID is required'], 400);
            }

     //vì chưa đăng nhập nên chưa lấy được id của tôi 
     //    $myId = auth()->id();
        $myId = 'U01';
        try {
            $messages= Message::with('sender', 'receiver')
                ->where(function ($query) use ($anotherPerson, $myId){
                    $query->where('sender_id',$myId)
                            ->where('receiver_id',$anotherPerson);
                })
            ->orWhere(function ($query) use($anotherPerson, $myId){
                $query->where('sender_id',$anotherPerson)
                        ->where('receiver_id',$myId);
            })
            ->orderBy('created_at','ASC')
            ->get();

            DB::table('messages')
                ->where('sender_id', $anotherPerson)
                ->where('receiver_id', $myId)
                ->update(['is_read' => true]);
            return response()->json([
                'status' => 'success',
                'myid' => $myId,
                'anotherPerson' => $anotherPerson,
                'data' => $messages
            ], 200);


        }
        catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve messages.',
                'error' => $e->getMessage()
            ], 500);
        }
        
    }
    public function sendMessage(Request $request)
    {
        $receiverId = $request->id;
        $content = $request->input('content');

        $order_item_id = $request->input('order_item_id');

        //vì chưa đăng nhập nên chưa lấy được id của tôi
        // $myId = auth()->id();
        $myId = 'U01';

        if (!$receiverId || !$content) {
            return response()->json(['status' => 'error', 'message' => 'Receiver ID and content are required'], 400);
        }

        try {
           $message = DB::table('messages')->insert([
                'sender_id' => $myId,
                'receiver_id' => $receiverId,
                'message' => $content,
                'is_read' => false,
                
            ]);

            //lấy message id vừa tạo
            $messageId = DB::getPdo()->lastInsertId();

            //tạo thông báo cho người nhận

            
            $notificationId = DB::table('message_notifications')->insert([
                'user_id' => $receiverId,
                'message_id' => $messageId,
                'content' => 'You have a new message from ' . $myId,
                'is_read' => false,
                'created_at' => now(),

                'updated_at' => now()
            ]);


            return response()->json([
                'status' => 'success',
                'data' => $message
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to send message.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // public function getContactList()
    // {
    //     //vì chưa đăng nhập nên chưa lấy được id của tôi
    //     // $myId = auth()->id();    
    //     $myId = 'U01';
    //     try {
    //         $contacts= DB::table('messages')
                
    //     } catch (\Exception $e) {
    //         return response()->json([
    //             'status' => 'error',
    //             'message' => 'Failed to retrieve contact list.',
    //             'error' => $e->getMessage()
    //         ], 500);
    //     }
    // }

    public function getContactList()
    {
        //vì chưa đăng nhập nên chưa lấy được id của tôi
        // $myId = auth()->id();    
        $myId = 'U01';
        try {
            $contacts = DB::table('messages')
            ->selectRaw("CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END AS contact_id, MAX(created_at) as last_message_time", [$myId])
            ->where(function ($q) use ($myId) {
                $q->where('sender_id', $myId)->orWhere('receiver_id', $myId);
            })
            ->groupBy('contact_id')
            ->orderBy('last_message_time', 'DESC')
            ->get();
                
            return response()->json([
                'status' => 'success',
                'data' => $contacts
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve contact list.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function deleteMessage($id)
    {
        try {
            $message = Message::findOrFail($id);
            $message->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Message deleted successfully.'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete message.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

}
