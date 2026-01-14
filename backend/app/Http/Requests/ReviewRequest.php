<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReviewRequest extends FormRequest
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
        $rules =[
            'order_item_id'=>'required|integer|exists:order_items,id',
            'user_id'=>'required|string|exists:users,id',
            'title'=>'nullable|string|max:255',
            'content'=>'nullable|string',
            'rating'=>'nullable|integer|min:1|max:5',
        ];
        return $rules;
    }
    public function messages():array
    {
        return [
            'order_item_id.required'=>'Order Item ID is required.',
            'order_item_id.integer'=>'Order Item ID must be an integer.',
            'order_item_id.exists'=>'The specified order item does not exist.',
            'user_id.required'=>'User ID is required.',
            'user_id.string'=>'User ID must be an string.',
            'user_id.exists'=>'The specified user does not exist.',
        ];
    }
}
