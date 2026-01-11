<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\RolePerController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\UserNotificationController;
use App\Http\Controllers\AddressController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProductDetailController;
use App\Http\Controllers\ProductNotificationController;
use App\Http\Controllers\AuthController;
/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();

});

// ==================== MESSAGE ROUTES ====================
Route::prefix('messages')->group(function () {
    //show contact list of messages
    Route::get('/', [\App\Http\Controllers\MessageController::class, 'getMessage']);
    //show detail messages
    Route::get('/{id}', [\App\Http\Controllers\MessageController::class, 'getDetailMessage']);
    //create message
    Route::post('/', [\App\Http\Controllers\MessageController::class, 'createMessage']);
    //update message
    Route::put('/{id}', [\App\Http\Controllers\MessageController::class, 'updateMessage']);
    //delete message
    Route::delete('/{id}', [\App\Http\Controllers\MessageController::class, 'deleteMessage']);
});

// ==================== CONVERSATION NOTIFICATION ====================
Route::prefix('conversationNotifications')->group(function () {
    //show all notifications
    Route::get('/', [\App\Http\Controllers\ConversationNotificationController::class, 'getConversationNotifications']);
    //show detail notification
    Route::get('/{id}', [\App\Http\Controllers\ConversationNotificationController::class, 'getConversationNotificationDetail']);
    //create new notification 
    Route::post('/', [\App\Http\Controllers\ConversationNotificationController::class, 'createConversationNotification']);
    //update notification
    Route::put('/{id}', [\App\Http\Controllers\ConversationNotificationController::class, 'updateConversationNotification']);
    //delete notification
    Route::delete('/{id}', [\App\Http\Controllers\ConversationNotificationController::class, 'deleteConversationNotification']);
});


// ==================== CONVERSATION ====================
Route::prefix('conversations')->group(function () {
    //show all conversations
    Route::get('/', [\App\Http\Controllers\ConversationController::class, 'getConversations']);
    //show detail conversation
    Route::get('/{id}', [\App\Http\Controllers\ConversationController::class, 'getConversationDetail']);
    //update conversation
    Route::put('/{id}', [\App\Http\Controllers\ConversationController::class, 'updateConversation']);
    //delete conversation
    Route::delete('/{id}', [\App\Http\Controllers\ConversationController::class, 'deleteConversation']);    
    //create conversation
    Route::post('/', [\App\Http\Controllers\ConversationController::class, 'createConversation']);
   
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
        Route::get('/', [UserController::class, 'show']);
          
        Route::get('/purchased-products', [UserController::class, 'getPurchasedProducts']);
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
        Route::put('/mark-read', [UserNotificationController::class, 'markAsRead'])
            ->where('id', '[0-9]+');
        Route::delete('/', [UserNotificationController::class, 'destroy'])
            ->where('id', '[0-9]+');
    });

    Route::prefix('products')->group(function () {
        Route::get('/', [ProductNotificationController::class, 'index']);
        route::post('/', [ProductNotificationController::class, 'store']);
        Route::delete('/{id}', [ProductNotificationController::class, 'destroy'])
            ->where('id', '[0-9]+');
        Route::delete('/', [ProductNotificationController::class, 'destroyMultiple']);
        Route::delete('/all/clear', [ProductNotificationController::class, 'destroyAll']);
    });

});

// ==================== CATEGORY ROUTES ====================
Route::prefix('categories')->group(function () {
    Route::get('/', [CategoryController::class, 'index']);
    Route::post('/', [CategoryController::class, 'store']);
    Route::put('/{id}', [CategoryController::class, 'update'])
        ->where('id', '[0-9]+');
    Route::delete('/{id}', [CategoryController::class, 'destroy'])
        ->where('id', '[0-9]+');
    // Thêm route lấy category theo slug (nếu cần)
    Route::get('/{slug}', [CategoryController::class, 'showBySlug'])
        ->where('slug', '^[a-zA-Z0-9_-]+$');
});

// ==================== PRODUCT ROUTES ====================
Route::prefix('products')->group(function () {
    // Lấy danh sách sản phẩm (có phân trang, lọc, sắp xếp)
    Route::get('/', [ProductController::class, 'index']);
// Lấy chi tiết sản phẩm theo ID
    Route::get('/{id}', [ProductController::class, 'show']);
//lấy sản phẩm gợi ý
    Route::get('/{id}/suggest', [ProductController::class, 'suggest']);
    
    // Thêm sản phẩm mới
    Route::post('/', [ProductController::class, 'store']);
    
    // Cập nhật sản phẩm bằng ID
    Route::put('/{id}', [ProductController::class, 'update'])
        ->where('id', '[0-9]+');
    
    // Xóa sản phẩm bằng ID
    Route::delete('/{id}', [ProductController::class, 'destroy'])
        ->where('id', '[0-9]+');
    
    // Tìm kiếm sản phẩm (endpoint riêng cho search)
    Route::get('/search', [ProductController::class, 'searchByName']);

    // Sắp xếp sản phẩm theo các tiêu chí
    Route::get('/sort', [ProductController::class, 'sort']);
});

// ================= PRODUCT DETAILS ROUTES =================
Route::prefix('product-details')->group(function () {
    // Lấy danh sách chi tiết sản phẩm (có thể lọc theo product_id, product_type)
    Route::get('/', [ProductDetailController::class, 'index']);
    
    // Thêm chi tiết sản phẩm mới
    Route::post('/', [ProductDetailController::class, 'store']);
    
    // Cập nhật chi tiết sản phẩm theo ID
    Route::put('/{id}', [ProductDetailController::class, 'update'])
        ->where('id', '[0-9]+');
    
    // Xóa chi tiết sản phẩm theo ID
    Route::delete('/{id}', [ProductDetailController::class, 'destroy'])
        ->where('id', '[0-9]+');
    Route::get('/best-sellers', [ProductController::class, 'getBestSellers']);
        
});

// ==================== ADDRESS ROUTES ====================
Route::prefix('addresses')->group(function () {
    // Tìm địa chỉ theo user_id
    Route::get('/user/{userId}', [AddressController::class, 'getByUser']);
    
    // Cập nhật địa chỉ của user - ĐỔI THÀNH 'update' (đúng với controller)
    Route::put('/user/{userId}', [AddressController::class, 'update']);
    
    // Cập nhật địa chỉ theo address id - THÊM ROUTE MỚI
    Route::put('/{id}', [AddressController::class, 'updateById'])
        ->where('id', '[0-9]+');
    
    // Các route CRUD theo address id
    Route::get('/', [AddressController::class, 'index']);
    Route::post('/', [AddressController::class, 'store']);
    Route::get('/{id}', [AddressController::class, 'show'])
        ->where('id', '[0-9]+');
    Route::delete('/{id}', [AddressController::class, 'destroy'])
        ->where('id', '[0-9]+');
});

//==================REVIEW ROUTES ===================
Route::prefix('review')->group(function () {
    //show contact list of messages
    Route::get('/', [\App\Http\Controllers\ReviewController::class, 'getReviews']);
    //show detail messages
    Route::get('/{id}', [\App\Http\Controllers\ReviewController::class, 'getDetailReview']);
    //create message
    Route::post('/', [\App\Http\Controllers\ReviewController::class, 'createReview']);
    //update message
    Route::put('/{id}', [\App\Http\Controllers\ReviewController::class, 'updateReview']);
    //delete message
    Route::delete('/{id}', [\App\Http\Controllers\ReviewController::class, 'deleteReview']);
});
//==================REVIEW ROUTES ===================
Route::prefix('review-image')->group(function () {
    //show contact list of messages
    Route::get('/', [\App\Http\Controllers\ReviewImageController::class, 'getReviewImages']);
    //show detail messages
    Route::get('/{id}', [\App\Http\Controllers\ReviewImageController::class, 'getDetailReviewImage']);
    //create message
    Route::post('/', [\App\Http\Controllers\ReviewImageController::class, 'createReviewImage']);
    //update message
    Route::put('/{id}', [\App\Http\Controllers\ReviewImageController::class, 'updateReviewImage']);
    //delete message
    Route::delete('/{id}', [\App\Http\Controllers\ReviewImageController::class, 'deleteReviewImage']);
});


Route::prefix('oders')->group(function() {
    Route::get('/all-purchases', [OrderController::class, 'getAllPurchasedProducts']);
});

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/check-exists', [AuthController::class, 'checkExists']);
    Route::post('/suggest-role', [AuthController::class, 'suggestRole']);

    // Protected routes với middleware auth:sanctum
    Route::middleware('auth.sanctum')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});