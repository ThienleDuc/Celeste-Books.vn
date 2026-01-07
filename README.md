<<<<<<< HEAD
# Celeste-Books.vn

"config": {
        "optimize-autoloader": true,
        "preferred-install": "dist",
        "sort-packages": true,
        "allow-plugins": {
            "pestphp/pest-plugin": true,
            "php-http/discovery": true
        },
        "platform": {
            "php": "8.3.0"
        }
    },

composer update
composer install

php artisan key:generate
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
php artisan migrate
php artisan serve


Thiện -------------------------
CRUD roles / permissions / role_per

# **API DOCUMENTATION - XỬ LÝ NGOẠI LỆ**

## **TỔNG QUAN**

Tài liệu này mô tả các ngoại lệ (exceptions) được xử lý trong hệ thống quản lý Roles, Permissions và quan hệ Role-Permission.

---

## **1. API ROLES**

### **1.1. GET /api/roles - Lấy danh sách vai trò**

**Ngoại lệ được xử lý:**
- **422 ValidationException**: Dữ liệu không hợp lệ (nếu có validate thêm)
- **500 QueryException**: Lỗi truy vấn cơ sở dữ liệu
- **500 Exception**: Lỗi hệ thống chung

**Thông báo lỗi:**
```json
{
    "success": false,
    "message": "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau."
}
```

### **1.2. POST /api/roles - Tạo mới vai trò**

**Ngoại lệ được xử lý:**
- **422 ValidationException**: Validate dữ liệu đầu vào
- **409 Conflict**: Tên vai trò đã tồn tại (tự kiểm tra)
- **500 QueryException**: Lỗi database khi tạo
- **500 Exception**: Không thể tạo ID/slug duy nhất

**Thông báo lỗi ví dụ:**
```json
{
    "success": false,
    "message": "Không thể tạo ID duy nhất cho vai trò."
}
```

### **1.3. GET /api/roles/{id} - Chi tiết vai trò theo ID**

**Ngoại lệ được xử lý:**
- **404 NotFound**: Không tìm thấy vai trò
- **500 Exception**: Lỗi hệ thống

### **1.4. GET /api/roles/slug/{slug} - Chi tiết vai trò theo slug**

**Ngoại lệ được xử lý:**
- **404 NotFound**: Không tìm thấy vai trò
- **500 QueryException**: Lỗi truy vấn
- **500 Exception**: Lỗi hệ thống

### **1.5. PUT /api/roles/{id} - Cập nhật vai trò**

**Ngoại lệ được xử lý:**
- **404 NotFound**: Không tìm thấy vai trò
- **422 ValidationException**: Dữ liệu không hợp lệ
- **409 Conflict**: Tên/slug đã tồn tại
- **500 QueryException**: Lỗi database khi update
- **500 Exception**: Lỗi hệ thống

**Thông báo lỗi ví dụ:**
```json
{
    "success": false,
    "message": "Cập nhật không thành công.",
    "reason": "Tên vai trò đã tồn tại."
}
```

### **1.6. DELETE /api/roles/{id} - Xóa vai trò**

**Ngoại lệ được xử lý:**
- **404 NotFound**: Không tìm thấy vai trò
- **500 QueryException**: Lỗi database khi xóa
- **500 Exception**: Lỗi hệ thống khi xóa quan hệ role_per

**Lưu ý**: Tự động xóa tất cả quan hệ trong `role_per` trước khi xóa role

---

## **2. API PERMISSIONS**

### **2.1. GET /api/permissions - Lấy danh sách quyền hạn**

**Ngoại lệ được xử lý:**
- **404 NotFound**: Không tìm thấy với keyword
- **422 ValidationException**: Dữ liệu không hợp lệ
- **500 QueryException**: Lỗi truy vấn
- **500 Exception**: Lỗi hệ thống

### **2.2. POST /api/permissions - Tạo mới quyền hạn**

**Ngoại lệ được xử lý:**
- **422 ValidationException**: Validate dữ liệu
- **409 Conflict**: Tên quyền hạn đã tồn tại
- **500 QueryException**: Lỗi database
- **500 Exception**: Không thể tạo slug duy nhất

**Thông báo lỗi ví dụ:**
```json
{
    "success": false,
    "message": "Không thể tạo slug duy nhất cho quyền hạn."
}
```

### **2.3. PUT /api/permissions/{id} - Cập nhật quyền hạn**

**Ngoại lệ được xử lý:**
- **404 NotFound**: Không tìm thấy permission
- **422 ValidationException**: Dữ liệu không hợp lệ
- **409 Conflict**: Tên/slug đã tồn tại
- **500 QueryException**: Lỗi database
- **500 Exception**: Lỗi hệ thống

### **2.4. DELETE /api/permissions/{id} - Xóa quyền hạn**

**Ngoại lệ được xử lý:**
- **404 NotFound**: Không tìm thấy permission
- **500 QueryException**: Lỗi database
- **500 Exception**: Lỗi hệ thống

**Lưu ý**: Tự động xóa tất cả quan hệ trong `role_per` trước khi xóa permission

---

## **3. API ROLE-PERMISSIONS**

### **3.1. GET /api/role-permissions - Danh sách quan hệ**

**Ngoại lệ được xử lý:**
- **422 ValidationException**: Validate filter
- **404 NotFound**: Không tìm thấy dữ liệu phù hợp với filter
- **500 QueryException**: Lỗi truy vấn
- **500 Exception**: Lỗi hệ thống

**Thông báo lỗi chi tiết:**
```json
{
    "success": false,
    "message": "Không tìm thấy dữ liệu tìm kiếm phù hợp.",
    "errors": {
        "role_id": "Vai trò không tồn tại.",
        "per_id": "Quyền hạn không tồn tại."
    }
}
```

### **3.2. POST /api/role-permissions - Gán quyền cho vai trò**

**Ngoại lệ được xử lý:**
- **422 ValidationException**: Dữ liệu không hợp lệ
- **409 Conflict**: Quan hệ đã tồn tại
- **500 QueryException**: Lỗi database
- **500 Exception**: Lỗi hệ thống

### **3.3. PUT /api/role-permissions - Cập nhật quan hệ**

**Ngoại lệ được xử lý:**
- **400 BadRequest**: Quyền hạn mới trùng với hiện tại
- **404 NotFound**: Không tìm thấy quan hệ cũ
- **409 Conflict**: Quyền mới đã tồn tại
- **422 ValidationException**: Dữ liệu không hợp lệ
- **500 QueryException**: Lỗi database
- **500 Exception**: Lỗi hệ thống

### **3.4. DELETE /api/role-permissions - Xóa quan hệ**

**Ngoại lệ được xử lý:**
- **404 NotFound**: Role/Permission/Quan hệ không tồn tại
- **422 ValidationException**: Dữ liệu không hợp lệ
- **500 QueryException**: Lỗi database
- **500 Exception**: Lỗi hệ thống

### **3.5. GET /api/role-permissions/role/{roleId} - Quyền theo vai trò**

**Ngoại lệ được xử lý:**
- **404 NotFound**: Vai trò không tồn tại
- **500 Exception**: Lỗi hệ thống

### **3.6. GET /api/role-permissions/permission/{perId} - Vai trò theo quyền**

**Ngoại lệ được xử lý:**
- **404 NotFound**: Quyền hạn không tồn tại
- **500 Exception**: Lỗi hệ thống

---

## **4. LOGIC XỬ LÝ NGOẠI LỆ**

### **4.1. Cấu trúc try-catch**
```php
try {
    // Logic chính
} catch (ValidationException $e) {
    // Lỗi validate: 422
} catch (QueryException $e) {
    // Lỗi database: 500 + log
} catch (Exception $e) {
    // Lỗi hệ thống: 500 + log
}
```

### **4.2. Logging**
```php
Log::error('Lỗi database trong Controller@method: ' . $e->getMessage());
```

### **4.3. Transaction**
```php
DB::beginTransaction();
try {
    // Thao tác database
    DB::commit();
} catch (Exception $e) {
    DB::rollBack();
    throw $e;
}
```

### **4.4. Kiểm tra tồn tại**
- Luôn kiểm tra resource tồn tại trước khi thao tác
- Kiểm tra quan hệ tồn tại trước khi xóa/cập nhật

---

## **5. MESSAGE HIỂN THỊ**

### **5.1. Messages tiếng Việt**
- **Thành công**: "Đã tạo mới vai trò thành công."
- **Lỗi người dùng**: "Không tìm thấy vai trò."
- **Lỗi hệ thống**: "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau."

### **5.2. Debug mode**
```php
'error' => config('app.debug') ? $e->getMessage() : null
```

---

## **6. HTTP STATUS CODES**

| Status | Ý nghĩa | Ví dụ |
|--------|---------|-------|
| **200** | Thành công | GET thành công |
| **201** | Created | POST thành công |
| **400** | Bad Request | Dữ liệu không hợp lệ |
| **404** | Not Found | Resource không tồn tại |
| **409** | Conflict | Resource đã tồn tại |
| **422** | Unprocessable Entity | Validate thất bại |
| **500** | Internal Server Error | Lỗi server |

---

## **7. KIỂM TRA TỰ ĐỘNG**

### **7.1. Test Cases cho Exception**
```php
// Test 404
$response = $this->get('/api/roles/999');
$response->assertStatus(404);

// Test 409 Conflict
$response = $this->post('/api/roles', ['name' => 'Admin']);
$response->assertStatus(409);

// Test 422 Validation
$response = $this->post('/api/roles', []);
$response->assertStatus(422);
```

### **7.2. Mock Exception**
```php
// Mock database exception
DB::shouldReceive('table')->andThrow(new QueryException());

// Mock general exception
$this->mock(Role::class, function ($mock) {
    $mock->shouldReceive('create')->andThrow(new Exception());
});
```

---

## **8. BEST PRACTICES**

### **8.1. Luôn sử dụng transaction cho:**
- Tạo mới với ID tự động
- Cập nhật dữ liệu
- Xóa có quan hệ phụ thuộc

### **8.2. Kiểm tra trước khi thao tác:**
- Resource có tồn tại không?
- Dữ liệu có hợp lệ không?
- Có xung đột không?

### **8.3. Logging đầy đủ:**
- Ghi log tất cả exception
- Bao gồm controller và method
- Ghi cả stack trace nếu cần

### **8.4. User-friendly messages:**
- Không hiển thị lỗi kỹ thuật cho user
- Message bằng tiếng Việt có dấu
- Chi tiết lỗi chỉ hiển thị khi debug

---

## **9. TROUBLESHOOTING**

### **9.1. Lỗi thường gặp:**
1. **ID trùng lặp**: Hàm `generateCodeFromName` tạo ID ngắn có thể trùng
2. **Slug trùng lặp**: Tự động thêm số phía sau
3. **Foreign key constraint**: Xóa quan hệ trước khi xóa resource chính

### **9.2. Giải pháp:**
- Giới hạn vòng lặp tạo ID/slug (100 lần)
- Sử dụng transaction để rollback khi lỗi
- Kiểm tra tồn tại trước khi xóa

------------------------------------------------------------------------------------------
thêm phương thức update view -> mỗi lần người dùng click vào prodcut nó tăng lượt view lên 

phía admin -> xem toàn bộ log người dùng gửi tới , message được tạo ra 
( che route content send tin nhắn ) 

