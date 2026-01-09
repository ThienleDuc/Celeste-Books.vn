<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class MessageRequest extends FormRequest
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
            'message'         => 'required|string|max:1000',
            'sender_id'       => 'required|string|exists:users,id',
            
        ];
        if($this->isMethod('put')){
            $rules['conversation_id'] = 'sometimes|integer|exists:conversations,id';
            $rules['message']         = 'sometimes|string|max:1000';
            $rules['sender_id']       = 'sometimes|string|exists:users,id';

        }
        return $rules;

    }
    public function messages(): array
    {
        return [
            'id.required' => 'Contact ID is required.',
            'id.integer' => 'Contact ID must be an integer.',
            'conversation_id.required' => 'Conversation ID is required.',
            'conversation_id.integer' => 'Conversation ID must be an integer.',
            'conversation_id.exists' => 'Conversation does not exist.',
            'message.required' => 'Message content is required.',
            'message.string' => 'Message content must be a string.',
            'message.max' => 'Message content may not be greater than 1000 characters.',
            'sender_id.required' => 'Sender ID is required.',
            'sender_id.string' => 'Sender ID must be a string.',
            'sender_id.exists' => 'Sender does not exist.',
            'created_at.date' => 'Created at must be a valid date.',
        ];
    }
}
