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
//all messages
Route::get('/messages', [\App\Http\Controllers\MessageController::class, 'index']);
//show detail messages
Route::get('message/{id}', [\App\Http\Controllers\MessageController::class, 'getMessage']);
//send message
Route::post('message/{id}', [\App\Http\Controllers\MessageController::class, 'sendMessage']);
use App\Http\Controllers\UserController;

Route::get('/users/{id}', [UserController::class, 'show']);
Route::put('/users/{id}', [UserController::class, 'updateBasicInfo']);
Route::post('/users/{id}/avatar', [UserController::class, 'uploadAvatar']);

Route::put('/users/{id}/password', [UserController::class, 'changePassword']);
Route::put('/users/{user_id}/address', [UserController::class, 'updateByUser']);
use App\Http\Controllers\AddressController;

Route::put('/addresses/{id}', [AddressController::class, 'update']);
use App\Http\Controllers\ProductController;

Route::get('/products/{id}', [ProductController::class, 'show']);
Route::get('/products/{id}/suggest', [ProductController::class, 'suggest']);
