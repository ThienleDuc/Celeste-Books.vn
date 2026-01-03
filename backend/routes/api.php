<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


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
// Message Routes
//all contacts 
Route::get('/messages', [\App\Http\Controllers\MessageController::class, 'getContactList']);
//show detail messages
Route::get('message/{id}', [\App\Http\Controllers\MessageController::class, 'getMessage']);
//send message
Route::post('message/{id}', [\App\Http\Controllers\MessageController::class, 'sendMessage']);
//xóa message
Route::delete('message/{id}', [\App\Http\Controllers\MessageController::class, 'deleteMessage']);


//notification
//show all notifications
Route::get('/notifications', [\App\Http\Controllers\MessageNotificationController::class, 'getNotifications']);
//xem chi tiết thông báo
Route::get('/notification/{id}', [\App\Http\Controllers\MessageNotificationController::class, 'getNotificationDetail']);

