<?php

namespace App\Http\Controllers;

use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class RoleController extends Controller
{
    // Lấy danh sách vai trò (có tìm kiếm theo tên)
    public function index(Request $request)
    {
        try {
            $query = Role::query();

            // Tìm kiếm theo tên role
            if ($request->filled('keyword')) {
                $keyword = $request->keyword;

                $query->where('name', 'LIKE', '%' . $keyword . '%');
            }

            $roles = $query->get();

            // Nếu có keyword nhưng không tìm thấy
            if ($request->filled('keyword') && $roles->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy vai trò phù hợp.'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $roles
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ.',
                'errors' => $e->errors()
            ], 422);
            
        } catch (\Illuminate\Database\QueryException $e) {
            Log::error('Lỗi database trong RoleController@index: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Lỗi truy vấn cơ sở dữ liệu.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
            
        } catch (\Exception $e) {
            Log::error('Lỗi trong RoleController@index: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    // Tạo ID từ các chữ cái đầu của mỗi từ trong tên
    private function generateCodeFromName(string $name): string
    {
        // Loại bỏ khoảng trắng thừa
        $name = trim($name);
        
        // Tách các từ
        $words = preg_split('/\s+/', $name);
        
        // Lấy chữ cái đầu của mỗi từ và chuyển thành chữ hoa
        $code = '';
        foreach ($words as $word) {
            // Lấy chữ cái đầu tiên (hỗ trợ Unicode cho tiếng Việt)
            if (mb_strlen($word) > 0) {
                $firstChar = mb_substr($word, 0, 1, 'UTF-8');
                $code .= mb_strtoupper($firstChar, 'UTF-8');
            }
        }
        
        return $code;
    }

    // Tạo mới vai trò.
    public function store(Request $request)
    {
        try {
            $request->validate([
                'name' => 'required|string|max:50|unique:roles,name',
                'description' => 'nullable|string|max:255',
                'slug' => 'nullable|string|max:255'
            ]);

            return DB::transaction(function () use ($request) {
                try {
                    // Generate ID
                    $id = $this->generateCodeFromName($request->name);
                    $originalId = $id;
                    $counter = 1;

                    while (Role::where('id', $id)->exists()) {
                        $id = $originalId . $counter++;
                        
                        // Giới hạn tối đa 100 lần thử để tránh vòng lặp vô hạn
                        if ($counter > 100) {
                            throw new \Exception('Không thể tạo ID duy nhất cho vai trò.');
                        }
                    }

                    // Generate slug
                    $slug = $request->slug ?? Str::slug($request->name);
                    $originalSlug = $slug;
                    $counter = 1;

                    while (Role::where('slug', $slug)->exists()) {
                        $slug = $originalSlug . '-' . $counter++;
                        
                        // Giới hạn tối đa 100 lần thử
                        if ($counter > 100) {
                            throw new \Exception('Không thể tạo slug duy nhất cho vai trò.');
                        }
                    }

                    $role = Role::create([
                        'id' => $id,
                        'name' => $request->name,
                        'description' => $request->description,
                        'slug' => $slug
                    ]);

                    return response()->json([
                        'success' => true,
                        'message' => 'Đã tạo mới vai trò thành công.',
                        'data' => $role
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
            Log::error('Lỗi database trong RoleController@store: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Lỗi cơ sở dữ liệu. Không thể tạo vai trò.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
            
        } catch (\Exception $e) {
            Log::error('Lỗi trong RoleController@store: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Đã xảy ra lỗi khi tạo vai trò: ' . $e->getMessage(),
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    // Hiển thị chi tiết vai trò theo slug.
    public function showBySlug(string $slug)
    {
        try {
            $role = Role::where('slug', $slug)->first();
            
            if (!$role) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy vai trò.'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $role
            ]);

        } catch (\Illuminate\Database\QueryException $e) {
            Log::error('Lỗi database trong RoleController@showBySlug: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Lỗi truy vấn cơ sở dữ liệu.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
            
        } catch (\Exception $e) {
            Log::error('Lỗi trong RoleController@showBySlug: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    // Cập nhật vai trò.
    public function update(Request $request, string $id)
    {
        try {
            $role = Role::find($id);

            if (!$role) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy vai trò.'
                ], 404);
            }

            $request->validate([
                'name' => 'required|string|max:50',
                'description' => 'nullable|string|max:255',
                'slug' => 'nullable|string|max:255'
            ]);

            // Kiểm tra trùng name
            if (
                $request->filled('name') &&
                Role::where('name', $request->name)
                    ->where('id', '!=', $id)
                    ->exists()
            ) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cập nhật không thành công.',
                    'reason' => 'Tên vai trò đã tồn tại.'
                ], 409);
            }

            // Kiểm tra trùng slug
            if (
                $request->filled('slug') &&
                Role::where('slug', $request->slug)
                    ->where('id', '!=', $id)
                    ->exists()
            ) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cập nhật không thành công.',
                    'reason' => 'Slug đã tồn tại.'
                ], 409);
            }

            // Thực hiện cập nhật trong transaction
            DB::beginTransaction();
            
            try {
                // Cập nhật
                $role->update($request->only(['name', 'description', 'slug']));
                
                DB::commit();
                
                return response()->json([
                    'success' => true,
                    'message' => 'Vai trò được cập nhật thành công.',
                    'data' => $role
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
            Log::error('Lỗi database trong RoleController@update: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Lỗi cơ sở dữ liệu. Không thể cập nhật vai trò.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
            
        } catch (\Exception $e) {
            Log::error('Lỗi trong RoleController@update: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Đã xảy ra lỗi khi cập nhật vai trò.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    // Xóa vai trò khỏi kho lưu trữ.
    public function destroy(string $id)
    {
        try {
            $role = Role::find($id);
            
            if (!$role) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy vai trò.'
                ], 404);
            }

            // Thực hiện xóa trong transaction
            DB::beginTransaction();
            
            try {
                // Xóa tất cả quan hệ với permissions trước khi xóa role
                DB::table('role_per')->where('role_id', $id)->delete();
                
                // Xóa role
                $role->delete();
                
                DB::commit();
                
                return response()->json([
                    'success' => true,
                    'message' => 'Đã xóa vai trò thành công.'
                ]);
                
            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }

        } catch (\Illuminate\Database\QueryException $e) {
            Log::error('Lỗi database trong RoleController@destroy: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Lỗi cơ sở dữ liệu. Không thể xóa vai trò.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
            
        } catch (\Exception $e) {
            Log::error('Lỗi trong RoleController@destroy: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Đã xảy ra lỗi khi xóa vai trò.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    // Hiển thị chi tiết vai trò theo ID (nếu cần)
    public function show(string $id)
    {
        try {
            $role = Role::find($id);
            
            if (!$role) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy vai trò.'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $role
            ]);

        } catch (\Exception $e) {
            Log::error('Lỗi trong RoleController@show: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }
}