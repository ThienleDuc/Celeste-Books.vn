<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\UserNotificationController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\AddressController;

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

// ==================== USER ROUTES ====================
Route::prefix('users')->group(function () {
    Route::get('/', [UserController::class, 'index']);
    Route::post('/', [UserController::class, 'store']);
    Route::get('/statistics', [UserController::class, 'statistics']);
    Route::get('/role/{roleId}', [UserController::class, 'getByRole']);

    Route::prefix('{id}')->group(function () {
        Route::get('/', [UserController::class, 'show']);
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
        Route::put('/mark-read', [UserNotificationController::class, 'markAsRead']);
        Route::delete('/', [UserNotificationController::class, 'destroy']);
    });
});

Route::get('/products/{id}', [ProductController::class, 'show']);
Route::get('/products/{id}/suggest', [ProductController::class, 'suggest']);
Route::put('/addresses/{id}', [AddressController::class, 'update']);
