<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\RolePer;
use Illuminate\Support\Facades\Log;

class RolePerController extends Controller
{
    // Danh sách role - permission (Có tìm kiếm theo tên permission & role_id)
    public function index(Request $request)
    {
        try {
            $request->validate([
                'role_id'   => 'nullable|string',
                'per_id'    => 'nullable|integer',
                'role_name' => 'nullable|string|max:100',
                'per_name'  => 'nullable|string|max:100',
            ]);

            $query = DB::table('role_per')
                ->join('roles', 'roles.id', '=', 'role_per.role_id')
                ->join('permissions', 'permissions.id', '=', 'role_per.per_id')
                ->select(
                    'role_per.role_id',
                    'roles.name as role_name',
                    'role_per.per_id',
                    'permissions.name as permission_name',
                    'permissions.slug as permission_slug'
                );

            // Kiểm tra xem có filter nào không
            $hasFilter = $request->filled('role_id') || 
                        $request->filled('per_id') || 
                        $request->filled('role_name') || 
                        $request->filled('per_name');

            // Nếu không có filter nào -> trả về tất cả
            if (!$hasFilter) {
                $data = $query->get();
                return response()->json([
                    'success' => true,
                    'data' => $data
                ]);
            }

            // Áp dụng filter
            if ($request->filled('role_id')) {
                $query->where('role_per.role_id', $request->role_id);
            }

            if ($request->filled('per_id')) {
                $query->where('role_per.per_id', $request->per_id);
            }

            if ($request->filled('role_name')) {
                $query->where('roles.name', 'LIKE', '%' . $request->role_name . '%');
            }

            if ($request->filled('per_name')) {
                $query->where('permissions.name', 'LIKE', '%' . $request->per_name . '%');
            }

            $data = $query->get();

            // Nếu có dữ liệu -> trả về
            if ($data->isNotEmpty()) {
                return response()->json([
                    'success' => true,
                    'data' => $data
                ]);
            }

            // Nếu không có dữ liệu -> kiểm tra từng trường hợp và trả về lỗi chi tiết
            $errors = [];

            // Kiểm tra role_id nếu được truyền
            if ($request->filled('role_id') && !DB::table('roles')->where('id', $request->role_id)->exists()) {
                $errors['role_id'] = 'Vai trò không tồn tại.';
            }

            // Kiểm tra per_id nếu được truyền
            if ($request->filled('per_id') && !DB::table('permissions')->where('id', $request->per_id)->exists()) {
                $errors['per_id'] = 'Quyền hạn không tồn tại.';
            }

            // Kiểm tra role_name nếu được truyền
            if ($request->filled('role_name') && !DB::table('roles')->where('name', 'LIKE', '%' . $request->role_name . '%')->exists()) {
                $errors['role_name'] = 'Không tìm thấy vai trò theo tên.';
            }

            // Kiểm tra per_name nếu được truyền
            if ($request->filled('per_name') && !DB::table('permissions')->where('name', 'LIKE', '%' . $request->per_name . '%')->exists()) {
                $errors['per_name'] = 'Không tìm thấy quyền hạn theo tên.';
            }

            // Nếu có lỗi trong các kiểm tra trên
            if (!empty($errors)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy dữ liệu tìm kiếm phù hợp.',
                    'errors' => $errors
                ], 404);
            }

            // Trường hợp: các filter hợp lệ nhưng không có quan hệ nào phù hợp
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy dữ liệu tìm kiếm phù hợp.'
            ], 404);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ.',
                'errors' => $e->errors()
            ], 422);
            
        } catch (\Exception $e) {
            Log::error('Lỗi trong RolePerController@index: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    // Gán permission cho role
    public function store(Request $request)
    {
        try {
            $request->validate([
                'role_id' => 'required|string|exists:roles,id',
                'per_id'  => 'required|integer|exists:permissions,id',
            ]);

            // Kiểm tra đã tồn tại quan hệ role - permission chưa
            $exists = RolePer::where('role_id', $request->role_id)
                ->where('per_id', $request->per_id)
                ->exists();

            if ($exists) {
                return response()->json([
                    'success' => false,
                    'message' => 'Quyền hạn đã được thêm trước đó.'
                ], 409); // Conflict
            }

            RolePer::create([
                'role_id' => $request->role_id,
                'per_id'  => $request->per_id
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Gán quyền hạn cho vai trò thành công.'
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ.',
                'errors' => $e->errors()
            ], 422);
            
        } catch (\Illuminate\Database\QueryException $e) {
            Log::error('Lỗi database trong RolePerController@store: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Lỗi cơ sở dữ liệu. Không thể gán quyền hạn.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
            
        } catch (\Exception $e) {
            Log::error('Lỗi trong RolePerController@store: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    // Cập nhật permission cho role
    public function update(Request $request)
    {
        try {
            // validate dữ liệu đầu vào
            $request->validate([
                'role_id'     => 'required|string|exists:roles,id',
                'per_id'      => 'required|integer|exists:permissions,id',
                'new_per_id'  => 'required|integer|exists:permissions,id',
            ]);

            // Kiểm tra new_per_id có khác với per_id không
            if ((int)$request->per_id === (int)$request->new_per_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Quyền hạn mới trùng với quyền hạn hiện tại.'
                ], 400);
            }

            // Kiểm tra bản ghi hiện tại theo khóa kép
            $current = RolePer::where('role_id', $request->role_id)
                ->where('per_id', $request->per_id)
                ->first();

            if (!$current) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy bản ghi vai trò và quyền hạn tương ứng.'
                ], 404);
            }

            // Kiểm tra quyền mới đã tồn tại cho vai trò chưa
            $exists = RolePer::where('role_id', $request->role_id)
                ->where('per_id', $request->new_per_id)
                ->exists();

            if ($exists) {
                return response()->json([
                    'success' => false,
                    'message' => 'Quyền hạn đã được gán cho vai trò trước đó.'
                ], 409);
            }

            // Thực hiện cập nhật trong transaction để đảm bảo tính nhất quán
            DB::beginTransaction();
            
            try {
                RolePer::where('role_id', $request->role_id)
                    ->where('per_id', $request->per_id)
                    ->update([
                        'per_id' => $request->new_per_id
                    ]);
                    
                DB::commit();
                
                return response()->json([
                    'success' => true,
                    'message' => 'Cập nhật quyền hạn cho vai trò thành công.'
                ]);
                
            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ.',
                'errors' => $e->errors()
            ], 422);
            
        } catch (\Illuminate\Database\QueryException $e) {
            Log::error('Lỗi database trong RolePerController@update: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Lỗi cơ sở dữ liệu. Không thể cập nhật quyền hạn.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
            
        } catch (\Exception $e) {
            Log::error('Lỗi trong RolePerController@update: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    // Xóa permission khỏi role
    public function destroy(Request $request)
    {
        try {
            $request->validate([
                'role_id' => 'required|string',
                'per_id'  => 'required|integer',
            ]);

            // Kiểm tra role có tồn tại không
            $roleExists = DB::table('roles')->where('id', $request->role_id)->exists();
            if (!$roleExists) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vai trò không tồn tại.'
                ], 404);
            }

            // Kiểm tra permission có tồn tại không
            $permissionExists = DB::table('permissions')->where('id', $request->per_id)->exists();
            if (!$permissionExists) {
                return response()->json([
                    'success' => false,
                    'message' => 'Quyền hạn không tồn tại.'
                ], 404);
            }

            // Kiểm tra quan hệ có tồn tại không
            $relationshipExists = RolePer::where('role_id', $request->role_id)
                ->where('per_id', $request->per_id)
                ->exists();

            if (!$relationshipExists) {
                return response()->json([
                    'success' => false,
                    'message' => 'Quyền hạn không tồn tại trong vai trò này.'
                ], 404);
            }

            $deleted = RolePer::where('role_id', $request->role_id)
                ->where('per_id', $request->per_id)
                ->delete();

            if (!$deleted) {
                throw new \Exception('Không thể xóa bản ghi do lỗi hệ thống.');
            }

            return response()->json([
                'success' => true,
                'message' => 'Đã xóa quyền hạn khỏi vai trò thành công.'
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ.',
                'errors' => $e->errors()
            ], 422);
            
        } catch (\Illuminate\Database\QueryException $e) {
            Log::error('Lỗi database trong RolePerController@destroy: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Lỗi cơ sở dữ liệu. Không thể xóa quyền hạn.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
            
        } catch (\Exception $e) {
            Log::error('Lỗi trong RolePerController@destroy: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    // Lấy danh sách permission theo role_id
    public function getByRole(string $roleId)
    {
        try {
            // Kiểm tra role có tồn tại không
            $roleExists = DB::table('roles')->where('id', $roleId)->exists();
            if (!$roleExists) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vai trò không tồn tại.'
                ], 404);
            }

            $data = DB::table('role_per')
                ->join('permissions', 'permissions.id', '=', 'role_per.per_id')
                ->where('role_per.role_id', $roleId)
                ->select(
                    'permissions.id',
                    'permissions.name',
                    'permissions.slug',
                    'permissions.description'
                )
                ->get();

            return response()->json([
                'success' => true,
                'data' => $data
            ]);

        } catch (\Exception $e) {
            Log::error('Lỗi trong RolePerController@getByRole: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    // Lấy danh sách role theo per_id
    public function getByPermission(int $perId)
    {
        try {
            // Kiểm tra permission có tồn tại không
            $permissionExists = DB::table('permissions')->where('id', $perId)->exists();
            if (!$permissionExists) {
                return response()->json([
                    'success' => false,
                    'message' => 'Quyền hạn không tồn tại.'
                ], 404);
            }

            $data = DB::table('role_per')
                ->join('roles', 'roles.id', '=', 'role_per.role_id')
                ->where('role_per.per_id', $perId)
                ->select(
                    'roles.id',
                    'roles.name',
                    'roles.slug'
                )
                ->get();

            return response()->json([
                'success' => true,
                'data' => $data
            ]);

        } catch (\Exception $e) {
            Log::error('Lỗi trong RolePerController@getByPermission: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }
}