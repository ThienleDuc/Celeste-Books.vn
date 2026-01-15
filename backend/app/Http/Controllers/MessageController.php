<?php

namespace App\Http\Controllers;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\MessageRequest;
    
class MessageController extends Controller
{
    //get list message by conversation_id
    public function getMessage()
    {
        try {
            $messages = Message::orderBy('created_at', 'asc')
            ->get();
            return response()->json([  
                'status' => 'success',
                'data' => $messages
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve messages.',
                'error' => $th->getMessage()
            ], 500);
        }
    }
    //get detail message
    public function getDetailMessage(Request $request, $id){
        try {
            $detailMessage =  Message::find( $id);
            if (!$detailMessage) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Message not found.',
                ], 404);
            }
            
            return response()->json([
                'status' => 'success',
                'data' => $detailMessage
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve detail message.',
                'error' => $th->getMessage()
            ], 500);
        }
    }
    //create message
    public function createMessage(MessageRequest $request){
        try {
           $createMessage=Message::create([
            'sender_id' => $request->sender_id,
            'conversation_id' => $request->conversation_id,
            'message' => $request->message,
            'created_at' => now(),
           ]);
           return response()->json([
            'status'=>'success',
           'data'=>$createMessage], 201);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create message.',
                'error' => $th->getMessage()
            ], 500);
    }
    }
  // delete message
    public function deleteMessage($id)
    {
        try {
            $deleteMessage = Message::find($id);
            if (!$deleteMessage) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Message not found.',
                ], 404);
            }

            $deleteMessage->delete();
            return response()->json([
                'status' => 'success',
                'message' => 'Message deleted successfully.'
            ], 200);

        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete message.',
                'error' => $th->getMessage()
            ], 500);
        }
    }
    //update message
    public function updateMessage(MessageRequest $request, $id){
        try {
            $updateMessage=Message::find($id);
            if(!$updateMessage){
                return response()->json([
                    'message' => 'Message not found.',
                ], 404);
            }
            $updateMessage->update($request->all());
            return response()->json($updateMessage, 200);
        } catch (\Throwable $th) {
            return response()->json([], 'Failed to update message.', 500, $th->getMessage());
        }
    }
   


}
