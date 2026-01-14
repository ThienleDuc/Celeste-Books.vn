<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ConversationRequest extends FormRequest
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
            
            'participant1_id' => 'required|string|exists:users,id',
            'participant2_id' => 'string|exists:users,id',
            'product_id' => 'nullable|integer|exists:products,id',
            'order_item_id' => 'nullable|integer|exists:order_items,id',
            'last_message_at' => 'nullable|date',
            'created_at' => 'nullable|date',  
        ];
        if($this->isMethod('put')){
            $rules['participant1_id'] = 'nullable';
            $rules['participant2_id'] = 'nullable';

        }
        
        return $rules;
    }
    public function messages(): array
    {
        return [
            
            'participant1_id.required' => 'Participant 1 ID is required.',
            'participant1_id.integer' => 'Participant 1 ID must be an integer.',
            'participant1_id.exists' => 'Participant 1 does not exist.',
            'participant2_id.required' => 'Participant 2 ID is required.',
            'participant2_id.integer' => 'Participant 2 ID must be an integer.',
            'participant2_id.exists' => 'Participant 2 does not exist.',
            'product_id.integer' => 'Product ID must be an integer.',
            'product_id.exists' => 'Product does not exist.',
            'order_item_id.integer' => 'Order Item ID must be an integer.',
            'order_item_id.exists' => 'Order Item does not exist.',
            'last_message_id.integer' => 'Last Message ID must be an integer.',
            'last_message_id.exists' => 'Last Message does not exist.',
            'created_at.date' => 'Created at must be a valid date.',
        ];
    }
}
