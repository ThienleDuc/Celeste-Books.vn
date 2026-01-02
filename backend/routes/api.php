<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\RolePerController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Role
Route::prefix('roles')->group(function () {

    // Danh sách + tìm kiếm
    Route::get('/', [RoleController::class, 'index']);

    // Tạo mới
    Route::post('/', [RoleController::class, 'store']);

    // Lấy theo slug (PHẢI đặt trước)
    Route::get('/{slug}', [RoleController::class, 'showBySlug']);

    // Update / Delete theo ID
    Route::put('{id}', [RoleController::class, 'update']);
    Route::patch('{id}', [RoleController::class, 'update']);
    Route::delete('{id}', [RoleController::class, 'destroy']);
});

//Permission
Route::prefix('permissions')->group(function () {

    // Danh sách + tìm kiếm
    Route::get('/', [PermissionController::class, 'index']);

    // Tạo permission mới
    Route::post('/', [PermissionController::class, 'store']);

    // Lấy permission theo slug (PHẢI đặt trước {id})
    Route::get('/{slug}', [PermissionController::class, 'showBySlug']);

    // Cập nhật permission theo ID
    Route::put('{id}', [PermissionController::class, 'update']);
    Route::patch('{id}', [PermissionController::class, 'update']);

    // Xóa permission theo ID
    Route::delete('{id}', [PermissionController::class, 'destroy']);
});

// Role-Permission
Route::prefix('role-permissions')->group(function () {

    // Danh sách + tìm kiếm
    // http://127.0.0.1:8000/api/role-permissions?role_id=R01&keyword=xem danh sách
    Route::get('/', [RolePerController::class, 'index']);

    // Gán permission cho role
    Route::post('/', [RolePerController::class, 'store']);

    // Update permission của role
    Route::put('/', [RolePerController::class, 'update']);

    // Xóa permission khỏi role
    Route::delete('/', [RolePerController::class, 'destroy']);

    // Lấy theo role_id
    Route::get('role/{roleId}', [RolePerController::class, 'getByRole']); // pass

    // Lấy theo per_id
    Route::get('permission/{perId}', [RolePerController::class, 'getByPermission']); // pass
});