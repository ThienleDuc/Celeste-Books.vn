<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\UserNotificationController;


/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::prefix('users')->group(function () {
    Route::get('/', [UserController::class, 'index']);
    Route::get('/statistics', [UserController::class, 'statistics']);
    Route::get('/role/{roleId}', [UserController::class, 'getByRole']);
    
    Route::post('/', [UserController::class, 'store']);
    
    Route::prefix('{id}')->group(function () {
        Route::get('/', [UserController::class, 'show']);
        Route::put('/', [UserController::class, 'update']);
        Route::patch('/', [UserController::class, 'update']);
        Route::delete('/', [UserController::class, 'destroy']);
        
        Route::patch('/toggle-status', [UserController::class, 'toggleStatus']);
        Route::get('/orders', [UserController::class, 'orderHistory']);
    });
});

Route::prefix('notifications')->group(function () {
    Route::get('/', [UserNotificationController::class, 'index']);
    Route::get('/my', [UserNotificationController::class, 'myNotifications']);
    Route::get('/unread-count', [UserNotificationController::class, 'countUnread']);
    Route::post('/mark-as-read/{id}', [UserNotificationController::class, 'markAsRead']);
    Route::post('/mark-all-as-read', [UserNotificationController::class, 'markAllAsRead']);
    // Xóa thông tin người dùng (giữ nguyên thông báo)
    Route::delete('/', [UserController::class, 'destroy']);
    // Xóa hoàn toàn người dùng (xóa cả thông báo) - nếu cần
    Route::delete('/force', [UserController::class, 'forceDestroy']);
});

