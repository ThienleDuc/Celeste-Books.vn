<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\RolePerController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\UserNotificationController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\AddressController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// ==================== ROLE ROUTES ====================
Route::prefix('roles')->group(function () {
    // Danh sách + tìm kiếm
    Route::get('/', [RoleController::class, 'index']);
    
    // Tạo mới
    Route::post('/', [RoleController::class, 'store']);
    
    // Lấy theo slug - ĐẶT SAU các route cụ thể như 'create'
    Route::get('/{slug}', [RoleController::class, 'showBySlug'])
        ->where('slug', '^[a-zA-Z0-9_-]+$'); // Thêm regex để tránh conflict
    
    // Update / Delete theo ID
    Route::put('/{id}', [RoleController::class, 'update'])
        ->where('id', '[0-9]+');
    Route::patch('/{id}', [RoleController::class, 'update'])
        ->where('id', '[0-9]+');
    Route::delete('/{id}', [RoleController::class, 'destroy'])
        ->where('id', '[0-9]+');
});

// ==================== PERMISSION ROUTES ====================
Route::prefix('permissions')->group(function () {
    // Danh sách + tìm kiếm
    Route::get('/', [PermissionController::class, 'index']);
    
    // Tạo permission mới
    Route::post('/', [PermissionController::class, 'store']);
    
    // Lấy permission theo slug
    Route::get('/{slug}', [PermissionController::class, 'showBySlug'])
        ->where('slug', '^[a-zA-Z0-9_-]+$');
    
    // Cập nhật permission theo ID
    Route::put('/{id}', [PermissionController::class, 'update'])
        ->where('id', '[0-9]+');
    Route::patch('/{id}', [PermissionController::class, 'update'])
        ->where('id', '[0-9]+');
    
    // Xóa permission theo ID
    Route::delete('/{id}', [PermissionController::class, 'destroy'])
        ->where('id', '[0-9]+');
});

// ==================== ROLE-PERMISSION ROUTES ====================
Route::prefix('role-permissions')->group(function () {
    // Danh sách + tìm kiếm
    Route::get('/', [RolePerController::class, 'index']);
    
    // Gán permission cho role
    Route::post('/', [RolePerController::class, 'store']);
    
    // Update permission của role
    Route::put('/', [RolePerController::class, 'update']);
    
    // Xóa permission khỏi role
    Route::delete('/', [RolePerController::class, 'destroy']);
    
    // Lấy theo role_id
    Route::get('/role/{roleId}', [RolePerController::class, 'getByRole'])
        ->where('roleId', '[0-9]+');
    
    // Lấy theo per_id
    Route::get('/permission/{perId}', [RolePerController::class, 'getByPermission'])
        ->where('perId', '[0-9]+');
});

// ==================== USER ROUTES ====================
Route::prefix('users')->group(function () {
    Route::get('/', [UserController::class, 'index']);
    Route::post('/', [UserController::class, 'store']);
    Route::get('/statistics', [UserController::class, 'statistics']);
    Route::get('/role/{roleId}', [UserController::class, 'getByRole'])
        ->where('roleId', '[0-9]+');
    
    Route::prefix('{id}')->group(function () {
        Route::get('/', [UserController::class, 'show'])
            ->where('id', '[0-9]+');
        Route::put('/', [UserController::class, 'updateBasicInfo']);
        Route::put('/update', [UserController::class, 'update']);
        Route::post('/avatar', [UserController::class, 'uploadAvatar']);
        Route::put('/password', [UserController::class, 'changePassword']);
        Route::put('/toggle-status', [UserController::class, 'toggleStatus']);
        Route::delete('/', [UserController::class, 'destroy']);
        
        Route::prefix('notifications')->group(function () {
            Route::get('/', [UserNotificationController::class, 'myNotifications']);
            Route::get('/count-unread', [UserNotificationController::class, 'countUnread']);
        });
    });
});

// ==================== NOTIFICATION ROUTES ====================
Route::prefix('notifications')->group(function () {
    Route::get('/', [UserNotificationController::class, 'index']);
    Route::get('/my', [UserNotificationController::class, 'myNotifications']);
    Route::get('/count-unread', [UserNotificationController::class, 'countUnread']);
    Route::put('/mark-all-read', [UserNotificationController::class, 'markAllAsRead']);
    
    Route::prefix('{id}')->group(function () {
        Route::put('/mark-read', [UserNotificationController::class, 'markAsRead'])
            ->where('id', '[0-9]+');
        Route::delete('/', [UserNotificationController::class, 'destroy'])
            ->where('id', '[0-9]+');
    });
});

// ==================== PRODUCT ROUTES ====================
Route::prefix('products')->group(function () {
    Route::get('/{id}', [ProductController::class, 'show'])
        ->where('id', '[0-9]+');
    Route::get('/{id}/suggest', [ProductController::class, 'suggest'])
        ->where('id', '[0-9]+');
});

// ==================== ADDRESS ROUTES ====================
Route::prefix('addresses')->group(function () {
    Route::put('/{id}', [AddressController::class, 'update'])
        ->where('id', '[0-9]+');
});