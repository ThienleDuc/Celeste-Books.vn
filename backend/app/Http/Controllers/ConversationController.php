<?php

namespace App\Http\Controllers;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Conversation;
use App\Models\Message;
use App\Http\Requests\ConversationRequest;
class ConversationController extends Controller
{
    // 1. Lấy danh sách các cuộc hội thoại của chỉnh tôi (người đăng nhập)
    public function getConversations(Request $request)
    {
        //vì chưa auth nên chưa có myid 
        //$myId= auth()->id();
        $myId = 'C01';

        try {
            $conversations = Conversation::where(function ($query) use ($myId) {
                $query->where(function ($q) use ($myId) {
                    $q->where('participant1_id', $myId)
                        ->where('visible_to_p1', true);
                })
                    ->orWhere(function ($q) use ($myId) {
                        $q->where('participant2_id', $myId)
                            ->where('visible_to_p2', true);
                    });
            })
                ->with(['product:id,name', 'participant1:id,username', 'participant2:id,username'])
                ->orderBy('last_message_at', 'desc')
                ->get();


            $formattedData = $conversations->map(function ($conv) use ($myId) {
                $otherUser = ($conv->participant1_id == $myId) ? $conv->participant2 : $conv->participant1;
                return [
                    'id' => $conv->id,
                    'partner_name' => $otherUser->username ?? 'Unknown',
                    'partner_avatar' => $otherUser->avatar_url ?? null,
                    'product_info' => $conv->product,
                    'last_message_at' => $conv->last_message_at,
                ];
            });

            return response()->json([
                'status' => 'success',
                'data' => $formattedData
            ], 200);

        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve conversations.',
                'error' => $th->getMessage()
            ], 500);
        }
    }

    // get detail conversation
    public function getConversationDetail($id)
    {
        $myId = 'C01';

        try {
            // Kiểm tra xem hội thoại có tồn tại và tôi có quyền xem không
            $conversation = Conversation::where('id', $id)
                ->where(function ($query) use ($myId) {
                    $query->where('participant1_id', $myId)
                        ->orWhere('participant2_id', $myId);
                })
                ->first();

            if (!$conversation) {
                return response()->json(['status' => 'error', 'message' => 'Conversation not found or access denied'], 404);
            }

            // Lấy danh sách tin nhắn
            $messages = Message::where('conversation_id', $id)
                ->orderBy('created_at', 'asc')
                ->get();

            return response()->json([
                'status' => 'success',
                'conversation_info' => $conversation,
                'messages' => $messages
            ], 200);

        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve messages.',
                'error' => $th->getMessage()
            ], 500);
        }
    }

    public function createConversation(ConversationRequest $request)
    {
        $ConversationInput = $request->validated();
        //vì chưa auth() nên chưa  lấy myid
        $senderId = 'C01';

        DB::beginTransaction();
        try {
            $conversation = Conversation::create([
                'participant1_id' => $senderId,
                'participant2_id' => $ConversationInput['participant2_id'],
                'product_id' => $ConversationInput['product_id'] ?? null,
                'last_message_at' => now(),
            ]);
            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Conversation started successfully.',
                'data' => $conversation
            ], 201);

        } catch (\Throwable $th) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to start conversation.',
                'error' => $th->getMessage()
            ], 500);
        }
    }
    //ẩn cuộc hội thoại
    public function deleteConversation($id)
    {
        // $myId = auth()->id();
        $myId = 'C01';

        try {
            $conversation = Conversation::find($id);

            if (!$conversation) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Conversation not found'
                ], 404);
            }

            if ($conversation->participant1_id == $myId) {
                $conversation->update(['visible_to_p1' => false]);
            } elseif ($conversation->participant2_id == $myId) {
                $conversation->update(['visible_to_p2' => false]);
            } else {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized: You are not a participant'
                ], 403);
            }

            if ($conversation->visible_to_p1 == false && $conversation->visible_to_p2 == false) {
                $conversation->delete();
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Conversation deleted successfully (hidden for you).'
            ], 200);

        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete conversation.',
                'error' => $th->getMessage()
            ], 500);
        }
    }

    // update Conversation
    public function updateConversation(ConversationRequest $request, $id)
    {
        $myId = 'C01'; //$myId=auth()->id();

        try {
            $conversationInput = $request->validated();
            $conversation = Conversation::find($id);

            if (!$conversation) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Conversation not found'
                ], 404);
            }

            if ($conversation->participant1_id !== $myId && $conversation->participant2_id !== $myId) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized: You are not a participant'
                ], 403);
            }
            $updateData = [];
            if (isset($conversationInput['order_item_id'])) {
                $updateData['order_item_id'] = $conversationInput['order_item_id'];
            }

            if (isset($conversationInput['product_id'])) {
                $updateData['product_id'] = $conversationInput['product_id'];
            }
            $conversation->update($updateData);

            return response()->json([
                'status' => 'success',
                'message' => 'Conversation updated successfully.',
                'data' => $conversation
            ], 200);

        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update conversation.', // Sửa message từ 'delete' thành 'update' cho đúng ngữ cảnh
                'error' => $th->getMessage()
            ], 500);
        }
    }

}

