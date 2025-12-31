<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    // Lấy danh sách danh mục
    public function index() {
        return $this->json(Category::all());
    }

    // Thêm danh mục mới (Tự tạo ID tăng dần)
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:100',
        ]);

        $slug = Str::slug($request->name);

        if (Category::where('slug', $slug)->exists()) {
            return $this->json([
                'message' => 'Danh mục đã tồn tại'
            ], 409);
        }

        // Logic ID tự tăng thủ công
        $nextId = (Category::max('id') ?? 0) + 1;

        $category = Category::create([
            'id'   => $nextId,
            'name' => $request->name,
            'slug' => $slug
        ]);

        return $this->json([
            'message' => 'Tạo mới thành công',
            'data'    => $category
        ], 201);
    }

    // Cập nhật danh mục
    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:100',
        ]);

        $category = Category::find($id);

        if (!$category) {
            return $this->json([
                'message' => 'Danh mục không tồn tại'
            ], 404);
        }

        $slug = Str::slug($request->name);

        $slugExists = Category::where('slug', $slug)
            ->where('id', '!=', $id)
            ->exists();

        if ($slugExists) {
            return $this->json([
                'message' => 'Danh mục đã tồn tại, không thể cập nhật'
            ], 409);
        }

        $category->update([
            'name' => $request->name,
            'slug' => $slug
        ]);

        return $this->json([
            'message' => 'Cập nhật thành công',
            'data'    => $category
        ]);
    }

    // Xóa danh mục
    public function destroy($id) {
        Category::findOrFail($id)->delete();
        return $this->json(['message' => 'Xóa thành công']);
    }
}
