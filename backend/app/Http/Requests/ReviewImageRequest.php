<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReviewImageRequest extends FormRequest
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
            'review_id' => 'required|integer|exists:reviews,id',
            'image_url' => 'nullable|string',
            
        ];
        
        return $rules;
    }
    public function messages(): array
    {
        return [
            'review_id.required' => 'Review ID is required.',
            'review_id.integer' => 'Review ID must be an integer.',
            'review_id.exists' => 'The specified review does not exist.',
          
            'image_url.string' => 'Image URL must be a string.',
        ];
    }
}
