<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ConversationNotificationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $rules = [
            
            'conversation_id' => 'required|integer|exists:conversations,id',
            'user_id' => 'required|string|exists:users,id',
            'type' => 'string|max:255',
            'title' => 'required|string|max:255',
            'content' => 'string|max:1000',
            'unread_count' =>'integer',
            'is_read' => 'boolean',
            'last_message_id' => 'required|integer|exists:messages,id',
            'created_at' => 'nullable|date',
            'updated_at' => 'nullable|date',
        ];
        if($this->isMethod('put')){
            $rules['conversation_id'] = 'sometimes|string|exists:conversations,id';
            $rules['user_id'] = 'sometimes|string|exists:users,id';
            $rules['type'] = 'sometimes|string|';
            $rules['content'] = 'sometimes|string';
            $rules['unread_count'] = 'sometimes|integer|';
            $rules['last_message_id'] = 'sometimes|integer|exists:messages,id';

        }
        return $rules;

    }
    public function messages(): array
    {
        return [
            'id.required' => 'Notification ID is required.',
            'id.integer' => 'Notification ID must be an integer.',
            'conversation_id.required' => 'Conversation ID is required.',
            'conversation_id.integer' => 'Conversation ID must be an integer.',
            'conversation_id.exists' => 'Conversation does not exist.',
            'user_id.required' => 'User ID is required.',
            'user_id.string' => 'User ID must be a string.',
            'user_id.exists' => 'User does not exist.',
            'type.required' => 'Type is required.',
            'type.string' => 'Type must be a string.',
            'type.max' => 'Type may not be greater than 255 characters.',
            'title.required' => 'Title is required.',
            'title.string' => 'Title must be a string.',
            'title.max' => 'Title may not be greater than 255 characters.',
            'content.required' => 'Content is required.',
            'content.string' => 'Content must be a string.',
            'content.max' => 'Content may not be greater than 1000 characters.',
            'unread_count.required' => 'Unread count is required.',
            'unread_count.integer' => 'Unread count must be an integer.',
            'is_read.boolean' => 'Is read must be true or false.',
            'last_message_id.required' => 'Last message ID is required.',
            'last_message_id.integer' => 'Last message ID must be an integer.',
            'last_message_id.exists' => 'Last message does not exist.',
            'created_at.date' => 'Created at must be a valid date.',
            'updated_at.date' => 'Updated at must be a valid date.',
        ];
    }
}
