<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Province;
use Illuminate\Support\Facades\DB;

class ProvinceController extends Controller
{
    // ProvinceController.php
    public function getAllProvinces(Request $request)
    {
        $query = Province::query();
        
        // Tìm kiếm
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where('name', 'like', "%{$search}%");
        }
        
        // Sắp xếp theo tên
        $query->orderBy('name', 'asc');
        
        // Phân trang
        $perPage = $request->input('per_page', 10);
        $provinces = $query->paginate($perPage);
        
        return response()->json([
            'success' => true,
            'message' => 'Lấy danh sách tỉnh thành công',
            'data' => [
                'data' => $provinces->items(),
                'pagination' => [
                    'current_page' => $provinces->currentPage(),
                    'per_page' => $provinces->perPage(),
                    'total' => $provinces->total(),
                    'last_page' => $provinces->lastPage(),
                ]
            ]
        ]);
    }

    /**
     * Lấy thông tin tỉnh khi biết ID xã/phường
     * 
     * @param int $communeId ID xã/phường
     * @return \Illuminate\Http\JsonResponse
     */
    public function getProvinceByCommuneId($communeId)
    {
        try {
            // Kiểm tra ID xã có hợp lệ không
            if (!is_numeric($communeId) || $communeId <= 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'ID xã/phường không hợp lệ'
                ], 400);
            }

            // Sử dụng query builder để join bảng
            $result = DB::table('communes as c')
                ->join('provinces as p', 'c.province_id', '=', 'p.id')
                ->select(
                    'p.id as province_id',
                    'p.name as province_name',
                    'p.code as province_code',
                    'c.id as commune_id',
                    'c.name as commune_name',
                    'c.code as commune_code'
                )
                ->where('c.id', $communeId)
                ->first();

            if (!$result) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy xã/phường với ID: ' . $communeId
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Lấy thông tin tỉnh thành công',
                'data' => $result
            ]);

        } catch (\Exception $e) {
            \Log::error('Get province by commune ID error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra khi lấy thông tin tỉnh'
            ], 500);
        }
    }
}