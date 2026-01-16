<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Commune;
use Illuminate\Support\Facades\DB;


class CommuneController extends Controller
{
    // CommuneController.php
    public function getCommunesByProvince(Request $request, $provinceId)
    {
        $query = Commune::where('province_id', $provinceId);
        
        // Tìm kiếm
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where('name', 'like', "%{$search}%");
        }
        
        // Sắp xếp theo tên
        $query->orderBy('name', 'asc');
        
        // Phân trang
        $perPage = $request->input('per_page', 10);
        $communes = $query->paginate($perPage);
        
        return response()->json([
            'success' => true,
            'message' => 'Lấy danh sách phường/xã thành công',
            'data' => [
                'data' => $communes->items(),
                'pagination' => [
                    'current_page' => $communes->currentPage(),
                    'per_page' => $communes->perPage(),
                    'total' => $communes->total(),
                    'last_page' => $communes->lastPage(),
                ]
            ]
        ]);
    }

    public function getCommuneDetail($id)
    {
        try {
            // Tìm commune bằng Query Builder
            $commune = DB::table('communes')->where('id', $id)->first();

            if (!$commune) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy phường/xã'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Lấy thông tin phường/xã thành công',
                'data' => $commune
            ]);

        } catch (\Exception $e) {
            \Log::error('Get commune detail error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra khi lấy thông tin phường/xã'
            ], 500);
        }
    }
}
