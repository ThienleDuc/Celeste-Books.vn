<?php

namespace App\Http\Controllers;

use App\Models\WeightFee;
use Illuminate\Http\Request;

class WeightFeeController extends Controller
{
    // Lấy danh sách hệ số trọng lượng
    public function index()
    {
        $weightFees = WeightFee::all();
        return response()->json([
            'success' => true,
            'data' => $weightFees
        ]);
    }

    // Lưu cấu hình trọng lượng mới
    public function store(Request $request)
    {
        $validated = $request->validate([
            'min_weight' => 'required|numeric',
            'max_weight' => 'required|numeric',
            'multiplier' => 'required|numeric',
        ]);

        $weightFee = WeightFee::create($validated);
        return response()->json(['success' => true, 'data' => $weightFee], 201);
    }
}