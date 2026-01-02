<?php

namespace App\Http\Controllers;

use App\Models\Permission;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PermissionController extends Controller
{
    // Lấy danh sách quyền hạn.
    public function index(Request $request)
    {
        try {
            $permissions = Permission::when(
                $request->filled('keyword'),
                function ($query) use ($request) {
                    $keyword = $request->keyword;
                    $query->where('name', 'LIKE', "%{$keyword}%");
                }
            )->get();

            // Nếu có keyword nhưng không tìm thấy
            if ($request->filled('keyword') && $permissions->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy quyền hạn phù hợp.'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $permissions
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ.',
                'errors' => $e->errors()
            ], 422);
            
        } catch (\Illuminate\Database\QueryException $e) {
            Log::error('Lỗi database trong PermissionController@index: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Lỗi truy vấn cơ sở dữ liệu.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
            
        } catch (\Exception $e) {
            Log::error('Lỗi trong PermissionController@index: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    // Tạo mới quyền hạn.
    public function store(Request $request)
    {
        try {
            $request->validate([
                'name' => 'required|string|max:100',
                'description' => 'nullable|string|max:255',
                'slug' => 'nullable|string|max:255'
            ]);

            return DB::transaction(function () use ($request) {
                try {
                    // Kiểm tra trùng name
                    if (Permission::where('name', $request->name)->exists()) {
                        return response()->json([
                            'success' => false,
                            'message' => 'Tạo quyền hạn không thành công.',
                            'reason' => 'Tên quyền hạn đã tồn tại.'
                        ], 409);
                    }

                    // Chuẩn hóa slug (luôn có dấu -)
                    $slug = $request->slug ?? Str::slug($request->name);
                    $originalSlug = $slug;
                    $counter = 1;

                    while (Permission::where('slug', $slug)->exists()) {
                        $slug = $originalSlug . '-' . $counter++;
                        
                        // Giới hạn tối đa 100 lần thử để tránh vòng lặp vô hạn
                        if ($counter > 100) {
                            throw new \Exception('Không thể tạo slug duy nhất cho quyền hạn.');
                        }
                    }

                    $permission = Permission::create([
                        'name' => $request->name,
                        'description' => $request->description,
                        'slug' => $slug
                    ]);

                    return response()->json([
                        'success' => true,
                        'message' => 'Tạo mới quyền hạn thành công.',
                        'data' => $permission
                    ], 201);

                } catch (\Exception $e) {
                    DB::rollBack();
                    throw $e;
                }
            });

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ.',
                'errors' => $e->errors()
            ], 422);
            
        } catch (\Illuminate\Database\QueryException $e) {
            Log::error('Lỗi database trong PermissionController@store: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Lỗi cơ sở dữ liệu. Không thể tạo quyền hạn.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
            
        } catch (\Exception $e) {
            Log::error('Lỗi trong PermissionController@store: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Đã xảy ra lỗi khi tạo quyền hạn: ' . $e->getMessage(),
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    // Hiển thị chi tiết quyền hạn theo slug
    public function showBySlug(string $slug)
    {
        try {
            $permission = Permission::where('slug', $slug)->first();

            if (!$permission) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy quyền hạn.'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $permission
            ]);

        } catch (\Illuminate\Database\QueryException $e) {
            Log::error('Lỗi database trong PermissionController@showBySlug: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Lỗi truy vấn cơ sở dữ liệu.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
            
        } catch (\Exception $e) {
            Log::error('Lỗi trong PermissionController@showBySlug: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    // Cập nhật quyền hạn.
    public function update(Request $request, string $id)
    {
        try {
            $permission = Permission::find($id);

            if (!$permission) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy quyền hạn.'
                ], 404);
            }

            $request->validate([
                'name' => 'required|string|max:100',
                'description' => 'nullable|string|max:255',
                'slug' => 'nullable|string|max:255'
            ]);

            // Kiểm tra trùng name
            if (
                $request->filled('name') &&
                Permission::where('name', $request->name)
                    ->where('id', '!=', $id)
                    ->exists()
            ) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cập nhật quyền hạn không thành công.',
                    'reason' => 'Tên quyền hạn đã tồn tại.'
                ], 409);
            }

            // Kiểm tra trùng slug
            if (
                $request->filled('slug') &&
                Permission::where('slug', $request->slug)
                    ->where('id', '!=', $id)
                    ->exists()
            ) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cập nhật quyền hạn không thành công.',
                    'reason' => 'Slug đã tồn tại.'
                ], 409);
            }

            // Thực hiện cập nhật trong transaction
            DB::beginTransaction();
            
            try {
                $permission->update($request->only(['name', 'description', 'slug']));
                
                DB::commit();
                
                return response()->json([
                    'success' => true,
                    'message' => 'Quyền hạn được cập nhật thành công.',
                    'data' => $permission
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
            Log::error('Lỗi database trong PermissionController@update: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Lỗi cơ sở dữ liệu. Không thể cập nhật quyền hạn.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
            
        } catch (\Exception $e) {
            Log::error('Lỗi trong PermissionController@update: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Đã xảy ra lỗi khi cập nhật quyền hạn.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    // Xóa bỏ quyền hạn.
    public function destroy(string $id)
    {
        try {
            $permission = Permission::find($id);
            
            if (!$permission) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy quyền hạn.'
                ], 404);
            }

            // Thực hiện xóa trong transaction
            DB::beginTransaction();
            
            try {
                // Xóa tất cả quan hệ với roles trước khi xóa permission
                DB::table('role_per')->where('per_id', $id)->delete();
                
                // Xóa permission
                $permission->delete();
                
                DB::commit();
                
                return response()->json([
                    'success' => true,
                    'message' => 'Đã xóa quyền hạn thành công.'
                ]);
                
            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }

        } catch (\Illuminate\Database\QueryException $e) {
            Log::error('Lỗi database trong PermissionController@destroy: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Lỗi cơ sở dữ liệu. Không thể xóa quyền hạn.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
            
        } catch (\Exception $e) {
            Log::error('Lỗi trong PermissionController@destroy: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Đã xảy ra lỗi khi xóa quyền hạn.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    // Hiển thị chi tiết quyền hạn theo ID (nếu cần)
    public function show(string $id)
    {
        try {
            $permission = Permission::find($id);
            
            if (!$permission) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy quyền hạn.'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $permission
            ]);

        } catch (\Exception $e) {
            Log::error('Lỗi trong PermissionController@show: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }
}