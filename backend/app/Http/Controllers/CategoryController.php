<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;

class CategoryController extends Controller
{
    // Helper method để trả về JSON response (nếu chưa có trong Controller cha)
    private function jsonResponse($data = [], $message = '', $status = 200, $errors = null)
    {
        $response = [
            'success' => $status >= 200 && $status < 300,
            'message' => $message,
            'data' => $data
        ];
        
        if ($errors) {
            $response['errors'] = $errors;
        }
        
        return response()->json($response, $status);
    }

    // Lấy danh sách danh mục (có phân trang, tìm kiếm)
    public function index(Request $request) 
    {
        try {
            $query = Category::query();
            
            // Tìm kiếm theo tên
            if ($request->has('search')) {
                $query->where('name', 'like', '%' . $request->search . '%');
            }
            
            // Sắp xếp
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);
            
            // Phân trang
            $perPage = $request->get('per_page', 20);
            $categories = $query->paginate($perPage);
            
            return $this->jsonResponse($categories, 'Lấy danh sách danh mục thành công');
        } catch (\Exception $e) {
            return $this->jsonResponse([], 'Lỗi server', 500, $e->getMessage());
        }
    }

    // Thêm danh mục mới
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100|unique:categories,name',
            'description' => 'nullable|string',
            'parent_id' => 'nullable|integer|exists:categories,id',
            'image_url' => 'nullable|url',
            'sort_order' => 'nullable|integer',
            'status' => 'nullable|integer|in:0,1',
        ]);

        if ($validator->fails()) {
            return $this->jsonResponse([], 'Dữ liệu không hợp lệ', 422, $validator->errors());
        }

        $slug = Str::slug($request->name);

        // Kiểm tra slug trùng
        if (Category::where('slug', $slug)->exists()) {
            $slug = $slug . '-' . time(); // Thêm timestamp để tạo slug duy nhất
        }

        try {
            $nextId = (Category::max('id') ?? 0) + 1;

            $category = Category::create([
                'id' => $nextId,
                'name' => $request->name,
                'slug' => $slug,
                'description' => $request->description,
                'parent_id' => $request->parent_id,
                'image_url' => $request->image_url,
                'sort_order' => $request->sort_order ?? 0,
                'status' => $request->status ?? 1,
            ]);

            return $this->jsonResponse($category, 'Tạo danh mục thành công', 201);
        } catch (\Exception $e) {
            return $this->jsonResponse([], 'Tạo danh mục thất bại', 500, $e->getMessage());
        }
    }

    // Lấy chi tiết danh mục theo ID
    public function show($id)
    {
        try {
            $category = Category::with(['parent', 'children'])->find($id);

            if (!$category) {
                return $this->jsonResponse([], 'Không tìm thấy danh mục', 404);
            }

            return $this->jsonResponse($category, 'Lấy chi tiết danh mục thành công');
        } catch (\Exception $e) {
            return $this->jsonResponse([], 'Lỗi server', 500, $e->getMessage());
        }
    }

    // Lấy chi tiết danh mục theo slug
    public function showBySlug($slug)
    {
        try {
            $category = Category::with(['parent', 'children'])
                ->where('slug', $slug)
                ->first();

            if (!$category) {
                return $this->jsonResponse([], 'Không tìm thấy danh mục', 404);
            }

            return $this->jsonResponse($category, 'Lấy danh mục theo slug thành công');
        } catch (\Exception $e) {
            return $this->jsonResponse([], 'Lỗi server', 500, $e->getMessage());
        }
    }

    // Cập nhật danh mục
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'description' => 'nullable|string',
            'parent_id' => 'nullable|integer|exists:categories,id',
            'image_url' => 'nullable|url',
            'sort_order' => 'nullable|integer',
            'status' => 'nullable|integer|in:0,1',
        ]);

        if ($validator->fails()) {
            return $this->jsonResponse([], 'Dữ liệu không hợp lệ', 422, $validator->errors());
        }

        $category = Category::find($id);

        if (!$category) {
            return $this->jsonResponse([], 'Không tìm thấy danh mục', 404);
        }

        // Kiểm tra tên trùng với danh mục khác
        $nameExists = Category::where('name', $request->name)
            ->where('id', '!=', $id)
            ->exists();

        if ($nameExists) {
            return $this->jsonResponse([], 'Tên danh mục đã tồn tại', 409);
        }

        try {
            $slug = Str::slug($request->name);
            
            // Kiểm tra slug trùng (trừ chính nó)
            $slugExists = Category::where('slug', $slug)
                ->where('id', '!=', $id)
                ->exists();

            if ($slugExists) {
                $slug = $slug . '-' . time();
            }

            $category->update([
                'name' => $request->name,
                'slug' => $slug,
                'description' => $request->description,
                'parent_id' => $request->parent_id,
                'image_url' => $request->image_url,
                'sort_order' => $request->sort_order ?? $category->sort_order,
                'status' => $request->status ?? $category->status,
            ]);

            $category->refresh(); // Lấy lại dữ liệu mới nhất
            return $this->jsonResponse($category, 'Cập nhật danh mục thành công');
        } catch (\Exception $e) {
            return $this->jsonResponse([], 'Cập nhật danh mục thất bại', 500, $e->getMessage());
        }
    }

    // Xóa danh mục
    public function destroy($id) 
    {
        try {
            $category = Category::find($id);
            
            if (!$category) {
                return $this->jsonResponse([], 'Không tìm thấy danh mục', 404);
            }

            // Kiểm tra nếu danh mục có danh mục con
            $hasChildren = Category::where('parent_id', $id)->exists();
            if ($hasChildren) {
                return $this->jsonResponse([], 'Không thể xóa danh mục có danh mục con', 400);
            }

            // Kiểm tra nếu danh mục có sản phẩm (nếu có model Product)
            // $hasProducts = \App\Models\ProductCategory::where('category_id', $id)->exists();
            // if ($hasProducts) {
            //     return $this->jsonResponse([], 'Không thể xóa danh mục đã có sản phẩm', 400);
            // }

            $category->delete();
            
            return $this->jsonResponse([], 'Xóa danh mục thành công');
        } catch (\Exception $e) {
            return $this->jsonResponse([], 'Xóa danh mục thất bại', 500, $e->getMessage());
        }
    }
}