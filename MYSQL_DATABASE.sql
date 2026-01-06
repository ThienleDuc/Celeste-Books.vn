-- Tạo CSDL
DROP DATABASE IF EXISTS book_store_db_2;
CREATE DATABASE IF NOT EXISTS book_store_db_2 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE book_store_db_2;

-- Tắt kiểm tra khóa ngoại để tránh lỗi thứ tự tạo bảng
SET FOREIGN_KEY_CHECKS = 0;

-- Đặt timezone cho Việt Nam
SET GLOBAL time_zone = '+07:00';
SET time_zone = '+07:00';

-- =============================================
-- 1. Bảng roles (Vai trò)
CREATE TABLE roles (
    id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(50) UNIQUE,
    description VARCHAR(255),
    slug varchar(255)
);

-- =============================================
-- 2. Bảng permissions (Quyền hạn)
CREATE TABLE permissions (
    id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) UNIQUE,
    description VARCHAR(255),
    slug varchar(255)
);

-- =============================================
-- 3. Bảng role_per (Bảng trung gian)
CREATE TABLE role_per (
    per_id INT NOT NULL,
    role_id VARCHAR(10) NOT NULL,
    PRIMARY KEY (per_id, role_id),
    FOREIGN KEY (per_id) REFERENCES permissions(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- =============================================
-- 4. Bảng users (Người dùng)
CREATE TABLE users (
    id VARCHAR(10) PRIMARY KEY,
    username VARCHAR(16)  NOT NULL,
    password_hash VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    role_id VARCHAR(10),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL
);

-- =============================================
-- 5. Bảng profiles (Hồ sơ)
CREATE TABLE profiles (
    user_id VARCHAR(10) PRIMARY KEY,
    full_name VARCHAR(50),
    avatar_url TEXT,
    phone CHAR(10),
    birthday DATE,
    gender ENUM('Nam', 'Nữ', 'Khác'),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =============================================
-- 6. Bảng provinces (Tỉnh/Thành phố)
CREATE TABLE provinces (
    id INT PRIMARY KEY,
    name VARCHAR(50),
    code VARCHAR(10) UNIQUE
);

-- =============================================
-- 7. Bảng communes (Xã/Phường)
CREATE TABLE communes (
    id INT PRIMARY KEY,
    province_id INT,
    name VARCHAR(50),
    code VARCHAR(10) UNIQUE,
    FOREIGN KEY (province_id) REFERENCES provinces(id) ON DELETE CASCADE
);

-- =============================================
-- 8. Bảng addresses (Địa chỉ)
CREATE TABLE addresses (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(10),
    label VARCHAR(50),
    receiver_name VARCHAR(50),
    phone CHAR(10),
    street_address VARCHAR(255),
    commune_id INT NULL,
    is_default BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (commune_id) REFERENCES communes(id) ON DELETE SET NULL
);

-- =============================================
-- 9. Bảng categories (Danh mục)
CREATE TABLE categories (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    slug VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 10. Bảng products (Sản phẩm)
CREATE TABLE products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(255)
        CHARACTER SET utf8mb4
        COLLATE utf8mb4_0900_ai_ci
        NOT NULL,

    slug VARCHAR(255) UNIQUE,
    description TEXT,
    author VARCHAR(50),
    publisher VARCHAR(50),
    publication_year INT,
    language VARCHAR(50),

    status BOOLEAN DEFAULT 1,
    views BIGINT DEFAULT 0,
    purchase_count BIGINT DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 5.00,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
ENGINE=InnoDB;

-- =============================================
-- 11. Bảng product_categories 
CREATE TABLE product_categories (
    product_id BIGINT,
    category_id INT,
    PRIMARY KEY (product_id, category_id),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE, 
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- =============================================
-- 12. Bảng product_details (Chi tiết sản phẩm)
CREATE TABLE product_details (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT,
    product_type ENUM('Sách giấy', 'Sách điện tử'),
    sku VARCHAR(100) UNIQUE,
    original_price DECIMAL(10,2),
    sale_price DECIMAL(10,2),
    stock INT,
    file_url LONGTEXT,
    weight DECIMAL(6,2),
    length DECIMAL(6,2),
    width DECIMAL(6,2),
    height DECIMAL(6,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- =============================================
-- 13. Bảng shopping_carts (Giỏ hàng)
CREATE TABLE shopping_carts (
    id BIGINT PRIMARY KEY,
    user_id VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('active', 'checked out', 'abandoned'), 
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =============================================
-- 14. Bảng cart_items (Sản phẩm trong giỏ)
CREATE TABLE cart_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    cart_id BIGINT,
    product_id BIGINT,
    product_details_id BIGINT,
    quantity INT UNSIGNED NOT NULL DEFAULT 1,
    price_at_time DECIMAL(12,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cart_id) REFERENCES shopping_carts(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (product_details_id) REFERENCES product_details(id) ON DELETE CASCADE
);

-- =============================================
-- 15. Bảng orders (Đơn hàng)
CREATE TABLE orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,

    user_id VARCHAR(10) NULL,
    order_code VARCHAR(30) NOT NULL UNIQUE,

    status ENUM(
        'pending',
        'processing',
        'shipped',
        'delivered',
        'cancelled'
    ) NOT NULL DEFAULT 'pending',

    subtotal DECIMAL(12,2) DEFAULT 0,
    shipping_fee DECIMAL(12,2) DEFAULT 0,
    discount DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL,

    shipping_address_id BIGINT NULL,

    payment_method ENUM(
        'cod',
        'momo',
        'bank_transfer',
        'credit_card'
    ) NOT NULL,

    payment_status ENUM(
        'unpaid',
        'paid',
        'refunded'
    ) NOT NULL DEFAULT 'unpaid',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_orders_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_orders_address
        FOREIGN KEY (shipping_address_id)
        REFERENCES addresses(id)
        ON DELETE SET NULL
) ENGINE=InnoDB;

-- =============================================
-- 16. Bảng order_items (Chi tiết đơn hàng)
CREATE TABLE order_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT,
    product_id BIGINT,
    product_details_id BIGINT,
    product_type ENUM('Sách giấy', 'Sách điện tử'),
    quantity INT,
    price DECIMAL(12,2),
    total_price DECIMAL(12,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
    FOREIGN KEY (product_details_id) REFERENCES product_details(id) ON DELETE CASCADE
);

-- =============================================
-- Bảng: weight_fees (Phí theo cân nặng)
CREATE TABLE weight_fees (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    min_weight DECIMAL(10,2) NOT NULL,
    max_weight DECIMAL(10,2) NOT NULL,
    base_price DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng: distance_fees (Phí theo khoảng cách)
CREATE TABLE distance_fees (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    min_distance DECIMAL(10,2) NOT NULL,
    max_distance DECIMAL(10,2) NOT NULL,
    multiplier DECIMAL(5,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng: shipping_type_fees (Phí theo loại hình)
CREATE TABLE shipping_type_fees (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    shipping_type ENUM('standard', 'express') NOT NULL,
    multiplier DECIMAL(5,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng: order_shipping_fee_details (các loại phí của order)
CREATE TABLE order_shipping_fee_details (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    
    order_id BIGINT NOT NULL,
    weight_fee_id BIGINT NOT NULL,
    distance_fee_id BIGINT NOT NULL,
    shipping_type_fee_id BIGINT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
        
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (weight_fee_id) REFERENCES weight_fees(id),
    FOREIGN KEY (distance_fee_id) REFERENCES distance_fees(id),
    FOREIGN KEY (shipping_type_fee_id) REFERENCES shipping_type_fees(id)
);

-- Bảng: order_product_discounts (giảm giá sản phẩm)
CREATE TABLE order_product_discounts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    type ENUM('promo_code', 'member_discount', 'voucher') DEFAULT 'promo_code',

    amount DECIMAL(12,2) NOT NULL,

    quantity INT NOT NULL DEFAULT 1,
    used_quantity INT NOT NULL DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng: order_shipping_discounts (giảm giá phí ship)
CREATE TABLE order_shipping_discounts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    type ENUM('promo_code', 'member_discount', 'voucher') DEFAULT 'promo_code',

    amount DECIMAL(12,2) NOT NULL,

    quantity INT NOT NULL DEFAULT 1,
    used_quantity INT NOT NULL DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_discount_details (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    order_id BIGINT NOT NULL,

    product_discount_id BIGINT NULL,
    shipping_discount_id BIGINT NULL,
    amount DECIMAL(12,2) NOT NULL,

    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_discount_id) REFERENCES order_product_discounts(id) ON DELETE CASCADE,
    FOREIGN KEY (shipping_discount_id) REFERENCES order_shipping_discounts(id) ON DELETE CASCADE,

    UNIQUE KEY unique_product_discount (order_id, product_discount_id),
    UNIQUE KEY unique_shipping_discount (order_id, shipping_discount_id)
);

-- =============================================
-- 17. Bảng reviews (Đánh giá)
CREATE TABLE reviews (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,

    order_item_id BIGINT NULL,
    user_id VARCHAR(10) NOT NULL,

    rating TINYINT CHECK (rating BETWEEN 1 AND 5),
    title VARCHAR(255),
    content TEXT,
    images TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_reviews_order_item
        FOREIGN KEY (order_item_id)
        REFERENCES order_items(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_reviews_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- =============================================
-- 18. Bảng order_notifications
CREATE TABLE order_notifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(10),
    order_id BIGINT,
    type ENUM('status_change', 'payment', 'other'),
    title VARCHAR(255),
    content TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- =============================================
-- 19. Bảng product_notifications
CREATE TABLE product_notifications (
    id BIGINT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    user_id VARCHAR(10),
    product_id BIGINT,
    type ENUM('restock', 'price_drop', 'promotion', 'other'), 
    title VARCHAR(255),
    content TEXT,
    is_read BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- =============================================
-- 20. Bảng user_notifications
CREATE TABLE user_notifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(10),
    type ENUM('system', 'promotion', 'account'),
    title VARCHAR(255),
    content TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =============================================
-- 21. Bảng product_images (Ảnh sản phẩm)
CREATE TABLE product_images (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    image_url TEXT,
    is_primary BOOLEAN DEFAULT FALSE,
    sort_order TINYINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- =============================================
-- 22. Bảng messages (Tin nhắn)
CREATE TABLE conversations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    participant1_id VARCHAR(10) NOT NULL,
    participant2_id VARCHAR(10) NOT NULL,
    product_id BIGINT,
    order_item_id BIGINT,
    last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (participant1_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (participant2_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
    FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE SET NULL,

    CHECK (participant1_id <> participant2_id),

    INDEX idx_conversation_users (participant1_id, participant2_id),
    INDEX idx_last_message_at (last_message_at DESC)
);


CREATE TABLE messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    conversation_id BIGINT NOT NULL,
    sender_id VARCHAR(10) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,

    INDEX idx_message_conversation (conversation_id, created_at)
);

CREATE TABLE conversation_notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    conversation_id BIGINT NOT NULL,
    user_id VARCHAR(10) NOT NULL,

    type ENUM('new', 'update', 'recall', 'system') DEFAULT 'new',

    title VARCHAR(255) NOT NULL,
    content VARCHAR(500),

    unread_count INT DEFAULT 0,
    is_read BOOLEAN DEFAULT FALSE,

    last_message_id BIGINT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (last_message_id) REFERENCES messages(id) ON DELETE SET NULL,

    UNIQUE KEY uq_user_conversation (user_id, conversation_id),

    INDEX idx_notification_user (user_id, is_read, updated_at DESC),
    INDEX idx_notification_type (type)
);

-- =============================================
-- 24. Bảng review_images (Ảnh đánh giá)
CREATE TABLE review_images (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    review_id BIGINT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE
);

-- Bật lại kiểm tra khóa ngoại
SET FOREIGN_KEY_CHECKS = 1;

-- =================================================================
-- PHẦN NHẬP LIỆU
-- =================================================================
SET FOREIGN_KEY_CHECKS = 0;

-- Tạo trigger cho purchase_count khi thêm order_items
DELIMITER //

-- Trigger 1: Khi thêm order_items, tăng purchase_count
CREATE TRIGGER update_purchase_count_after_order_item_insert
AFTER INSERT ON order_items
FOR EACH ROW
BEGIN
    UPDATE products
    SET purchase_count = purchase_count + NEW.quantity
    WHERE id = NEW.product_id;
END//

-- Trigger 2: Khi thêm review mới, cập nhật rating trung bình
CREATE TRIGGER update_rating_after_review_insert
AFTER INSERT ON reviews
FOR EACH ROW
BEGIN
    DECLARE product_id_val BIGINT;
    DECLARE avg_rating DECIMAL(3,2);
    
    -- Lấy product_id từ order_item
    SELECT oi.product_id INTO product_id_val
    FROM order_items oi
    WHERE oi.id = NEW.order_item_id;
    
    -- Tính rating trung bình mới
    SELECT AVG(r.rating) INTO avg_rating
    FROM reviews r
    JOIN order_items oi ON r.order_item_id = oi.id
    WHERE oi.product_id = product_id_val;
    
    -- Cập nhật rating cho sản phẩm
    UPDATE products
    SET rating = COALESCE(avg_rating, 5.00)
    WHERE id = product_id_val;
END//

DELIMITER ;

-- 1. Roles
INSERT INTO roles (id, name, description, slug) VALUES
('A', 'Admin', 'Quản trị viên hệ thống', 'admin'),
('M', 'Manager', 'Quản lý cửa hàng', 'manager'),
('S', 'Staff', 'Nhân viên bán hàng', 'staff'),
('C', 'Customer', 'Khách hàng', 'customer'),
('S1', 'Shipper', 'Nhân viên giao hàng', 'shipper');

-- 2. Permissions
INSERT INTO permissions (name, description, slug) VALUES
('view_users', 'Xem danh sách người dùng', 'view-users'),
('create_users', 'Tạo người dùng mới', 'create-users'),
('edit_users', 'Sửa thông tin người dùng', 'edit-users'),
('delete_users', 'Xóa người dùng', 'delete-users'),
('view_products', 'Xem sản phẩm', 'view-products'),
('create_products', 'Tạo sản phẩm mới', 'create-products'),
('edit_products', 'Sửa sản phẩm', 'edit-products'),
('delete_products', 'Xóa sản phẩm', 'delete-products'),
('manage_orders', 'Quản lý đơn hàng', 'manage-orders'),
('view_reports', 'Xem báo cáo doanh thu', 'view-reports');

-- 3. Role_Per
INSERT INTO role_per (role_id, per_id) VALUES
('A', 1), ('A', 2), ('A', 3), ('A', 4),
('A', 5), ('A', 6), ('A', 7), ('A', 8),
('M', 5), ('M', 9),
('S', 5), ('S', 9),
('C', 5), ('S1', 9);

-- 4. Users
INSERT INTO users (id, username, password_hash, email, is_active, role_id) VALUES
('A01', 'admin', '$2a$12$x1ug24gfpkce6cTQPtBXauyYswXojCsEs8O94sfFd3hE2GO0oO2C.', 'admin@store.com', 1, 'A'),
('M01', 'manager', '$2a$12$x1ug24gfpkce6cTQPtBXauyYswXojCsEs8O94sfFd3hE2GO0oO2C.', 'manager@store.com', 1, 'M'),
('S01', 'staff', '$2a$12$x1ug24gfpkce6cTQPtBXauyYswXojCsEs8O94sfFd3hE2GO0oO2C.', 'staff@store.com', 1, 'S'),
('S101', 'shipper', '$2a$12$x1ug24gfpkce6cTQPtBXauyYswXojCsEs8O94sfFd3hE2GO0oO2C.', 'shipper@store.com', 1, 'S1'),
('C01', 'customer1', '$2a$12$x1ug24gfpkce6cTQPtBXauyYswXojCsEs8O94sfFd3hE2GO0oO2C.', 'tuan@gmail.com', 1, 'C'),
('C02', 'customer2', '$2a$12$x1ug24gfpkce6cTQPtBXauyYswXojCsEs8O94sfFd3hE2GO0oO2C.', 'hoa@gmail.com', 1, 'C'),
('A02', 'admin2', '$2a$12$x1ug24gfpkce6cTQPtBXauyYswXojCsEs8O94sfFd3hE2GO0oO2C.', 'admin.senior@store.com', 1, 'A'),
('M02', 'manager2', '$2a$12$x1ug24gfpkce6cTQPtBXauyYswXojCsEs8O94sfFd3hE2GO0oO2C.', 'manager.store2@store.com', 1, 'M'),
('S02', 'staff1', '$2a$12$x1ug24gfpkce6cTQPtBXauyYswXojCsEs8O94sfFd3hE2GO0oO2C.', 'staff.sales1@store.com', 1, 'S'),
('S03', 'staff2', '$2a$12$x1ug24gfpkce6cTQPtBXauyYswXojCsEs8O94sfFd3hE2GO0oO2C.', 'staff.sales2@store.com', 1, 'S'),
('S04', 'staff3', '$2a$12$x1ug24gfpkce6cTQPtBXauyYswXojCsEs8O94sfFd3hE2GO0oO2C.', 'staff.warehouse@store.com', 1, 'S');

-- 5. Profiles
INSERT INTO profiles (user_id, full_name, phone, birthday, gender) VALUES
('A01', 'Quản Trị Viên', '0901111111', '1990-01-01', 'Nam'),
('M01', 'Lê Quản Lý', '0902222222', '1992-05-05', 'Nữ'),
('S01', 'Trần Nhân Viên', '0903333333', '1995-08-08', 'Nữ'),
('C01', 'Phạm Tuấn', '0905555555', '1998-10-10', 'Nam'),
('C02', 'Lê Thị Hoa', '0906666666', '1999-12-12', 'Nữ'),
('A02', 'Nguyễn Văn Sếp', '0988111000', '1985-02-15', 'Nam'),     
('M02', 'Trần Thị Quản Lý 2', '0977222111', '1992-05-20', 'Nữ'),   
('S02', 'Lê Bán Hàng A', '0966333222', '1998-09-10', 'Nam'),        
('S03', 'Phạm Bán Hàng B', '0955444333', '2000-01-05', 'Nữ'),      
('S04', 'Đỗ Thủ Kho', '0944555444', '1995-11-20', 'Nam');

-- 6. Provinces
INSERT INTO provinces (id, name, code) VALUES
(1, 'Hà Nội', 'HN'),
(2, 'Hồ Chí Minh', 'HCM'),
(3, 'Đà Nẵng', 'DN'),
(4, 'Hải Phòng', 'HP'),
(5, 'Cần Thơ', 'CT'),
(6, 'Bình Dương', 'BD'),
(7, 'Đồng Nai', 'DNA'),
(8, 'Quảng Ninh', 'QN'),
(9, 'Khánh Hòa', 'KH'),
(10, 'Lâm Đồng', 'LD');

-- 7. Communes
INSERT INTO communes (id, province_id, name, code) VALUES
(1, 1, 'Phường Hàng Trống', 'P01'),
(2, 1, 'Phường Trung Hòa', 'P02'),
(3, 2, 'Phường Bến Nghé', 'P03'),
(4, 2, 'Phường Thảo Điền', 'P04'),
(5, 3, 'Phường Hải Châu 1', 'P05'),
(6, 4, 'Phường Cầu Đất', 'P06'),
(7, 5, 'Phường Ninh Kiều', 'P07'),
(8, 6, 'Phường Chánh Nghĩa', 'P08'),
(9, 9, 'Phường Lộc Thọ', 'P09'),
(10, 10, 'Phường 1 Đà Lạt', 'P10');

-- 8. Addresses
INSERT INTO addresses (user_id, label, receiver_name, phone, street_address, commune_id, is_default) VALUES
('C01', 'Nhà riêng', 'Phạm Tuấn', '0905555555', '123 Đường Láng', 2, 1),
('C01', 'Cơ quan', 'Phạm Tuấn', '0905555555', 'Tòa nhà FPT', 2, 0),
('C02', 'Nhà riêng', 'Lê Thị Hoa', '0906666666', '456 Lê Lợi', 3, 1),
('C02', 'Văn phòng', 'Lê Thị Hoa', '0906666666', 'Landmark 81', 4, 0),
('A01', 'Kho chính', 'Admin Kho', '0901111111', '100 Giải Phóng', 1, 1),
('S02', 'Nhà trọ', 'Lê Bán Hàng', '0966333222', 'Ngõ 50 Cầu Giấy', 2, 1),
('S03', 'Nhà riêng', 'Phạm Sale', '0955444333', 'Khu dân cư Him Lam', 3, 1),
('A02', 'Biệt thự', 'Nguyễn Sếp', '0988111000', 'Khu Ciputra', 1, 1),
('M01', 'Cửa hàng 1', 'Lê Quản Lý', '0902222222', '200 Nguyễn Trãi', 1, 1),
('S101', 'Kho giao nhận', 'Shipper', '0904444444', 'Bưu cục Quận 1', 3, 1);

-- 9. Categories
INSERT INTO categories (id, name, slug) VALUES
(1, 'Văn học','van-hoc'),
(2, 'Kinh tế','kinh-te'),
(3, 'Tâm lý - Kỹ năng sống','tam-ly-ky-nang-song'),
(4, 'Thiếu nhi','thieu-nhi'),
(5, 'Giáo khoa - Tham khảo','giao-khoa-tham-khao'),
(6, 'Văn hóa - Xã hội','van-hoa-xa-hoi'),
(7, 'Khoa học kỹ thuật','khoa-hoc-ky-thuat'),
(8, 'Ngoại ngữ','ngoai-ngu'),
(9, 'Truyện tranh','truyen-tranh'),
(10, 'Tiểu sử - Hồi ký','tieu-su-hoi-ky');

-- 10. Products 
INSERT INTO products 
(id, name, slug, description, author, publisher, publication_year, language, status, views) 
VALUES
(1, 'Nhà Giả Kim', 'nha-gia-kim', 'Hành trình theo đuổi ước mơ', 'Paulo Coelho', 'NXB Văn Học', 2020, 'Tiếng Việt', 1, 1500),
(2, 'Đắc Nhân Tâm', 'dac-nhan-tam', 'Nghệ thuật thu phục lòng người', 'Dale Carnegie', 'NXB Tổng Hợp', 2021, 'Tiếng Việt', 1, 2500),
(3, 'Clean Code', 'clean-code', 'Mã sạch và con đường trở thành nghệ nhân', 'Robert C. Martin', 'NXB Xây Dựng', 2019, 'Tiếng Anh', 1, 3200),
(4, 'Mắt Biếc', 'mat-biec', 'Chuyện tình thanh xuân buồn', 'Nguyễn Nhật Ánh', 'NXB Trẻ', 2018, 'Tiếng Việt', 1, 1800),
(5, 'Doraemon Tập 1', 'doraemon-1', 'Mèo máy đến từ tương lai', 'Fujiko F. Fujio', 'NXB Kim Đồng', 2022, 'Tiếng Việt', 1, 4200),
(6, 'Nguyên Lý Marketing', 'marketing-principles', 'Sách gối đầu giường dân Marketer', 'Philip Kotler', 'NXB Lao Động', 2020, 'Tiếng Việt', 1, 1200),
(7, 'Steve Jobs', 'steve-jobs', 'Tiểu sử người sáng lập Apple', 'Walter Isaacson', 'NXB Trẻ', 2017, 'Tiếng Việt', 1, 2100),
(8, 'Rừng Na Uy', 'rung-na-uy', 'Kiệt tác của Murakami', 'Haruki Murakami', 'NXB Hội Nhà Văn', 2016, 'Tiếng Việt', 1, 1600),
(9, 'Tuổi Trẻ Đáng Giá Bao Nhiêu', 'tuoi-tre-dang-gia', 'Sách kỹ năng cho giới trẻ', 'Rosie Nguyễn', 'NXB Nhã Nam', 2018, 'Tiếng Việt', 1, 3800),
(10, 'One Piece Tập 100', 'one-piece-100', 'Đảo hải tặc tập đặc biệt', 'Eiichiro Oda', 'NXB Kim Đồng', 2023, 'Tiếng Việt', 1, 5500);

-- 11. Product Categories 
INSERT INTO product_categories (product_id, category_id) VALUES
(1, 1),
(2, 1),
(3, 2),
(4, 2),
(5, 3),
(6, 4),
(7, 7),
(8, 8),
(9, 9),
(10, 10);

-- 12. Product Details
INSERT INTO product_details (id, product_id, product_type, sku, original_price, sale_price, stock, file_url, weight, length, width, height) VALUES
(1, 1, 'Sách giấy', 'SKU001', 80000, 60000, 100, NULL, 300, 20, 13, 2),
(2, 2, 'Sách giấy', 'SKU002', 90000, 75000, 150, NULL, 350, 20, 14, 2),
(3, 3, 'Sách giấy', 'SKU003', 400000, 350000, 20, NULL, 800, 24, 18, 4),
(4, 4, 'Sách giấy', 'SKU004', 110000, 90000, 80, NULL, 250, 19, 13, 2),
(5, 5, 'Sách giấy', 'SKU005', 20000, 20000, 500, NULL, 100, 18, 11, 1),
(6, 6, 'Sách giấy', 'SKU006', 250000, 200000, 40, NULL, 900, 25, 19, 5),
(7, 7, 'Sách giấy', 'SKU007', 300000, 280000, 30, NULL, 700, 24, 16, 4),
(8, 8, 'Sách điện tử', 'SKU008-E', 50000, 40000, 9999, 'link_pdf', 0, 0, 0, 0),
(9, 9, 'Sách giấy', 'SKU009', 85000, 70000, 200, NULL, 300, 20, 13, 2),
(10, 10, 'Sách giấy', 'SKU010', 25000, 22000, 100, NULL, 150, 18, 11, 1);

INSERT INTO product_details (id, product_id, product_type, sku, original_price, sale_price, stock, file_url, weight, length, width, height) VALUES
(11, 1, 'Sách điện tử', 'SKU011', 80000, 60000, 100, NULL, 300, 20, 13, 2),
(12, 2, 'Sách điện tử', 'SKU012', 90000, 75000, 150, NULL, 350, 20, 14, 2),
(13, 3, 'Sách điện tử', 'SKU013', 400000, 350000, 20, NULL, 800, 24, 18, 4),
(14, 4, 'Sách điện tử', 'SKU014', 110000, 90000, 80, NULL, 250, 19, 13, 2);

-- 13. Shopping Carts
INSERT INTO shopping_carts (id, user_id, status) VALUES
(1, 'C01', 'active'),
(2, 'C02', 'active'),
(3, 'S02', 'abandoned'),
(4, 'S03', 'active'),
(5, 'A01', 'active'), 
(6, 'M01', 'checked out'),
(7, 'C01', 'checked out'),
(8, 'C02', 'abandoned'), 
(9, 'S04', 'active'),
(10, 'A02', 'active');

-- 14. Cart Items
INSERT INTO cart_items (id, cart_id, product_id, product_details_id, quantity, price_at_time) VALUES
(1, 1, 1, 1, 1, 60000), 
(2, 1, 5, 5, 2, 20000),
(3, 2, 3, 3, 1, 350000),
(4, 3, 4, 4, 1, 90000),
(5, 4, 10, 10, 1, 22000),
(6, 5, 2, 2, 1, 75000),
(7, 9, 6, 6, 1, 200000),
(8, 1, 9, 9, 1, 70000),
(9, 2, 7, 7, 1, 280000),
(10, 10, 8, 8, 1, 40000);

-- 15. Orders
INSERT INTO orders (id, user_id, order_code, status, subtotal, shipping_fee, discount, total_amount, shipping_address_id, payment_method, payment_status) VALUES
(1, 'C01', 'ORD001', 'delivered', 80000, 20000, 0, 100000, 1, 'momo', 'paid'),
(2, 'C02', 'ORD002', 'shipped', 350000, 30000, 5000, 375000, 3, 'cod', 'unpaid'),
(3, 'C01', 'ORD003', 'pending', 60000, 15000, 0, 75000, 2, 'bank_transfer', 'unpaid'),
(4, 'S02', 'ORD004', 'cancelled', 90000, 20000, 0, 110000, NULL, 'cod', 'unpaid'),
(5, 'S03', 'ORD005', 'processing', 200000, 25000, 10000, 215000, 7, 'credit_card', 'paid'),
(6, 'C01', 'ORD006', 'delivered', 150000, 20000, 5000, 165000, 1, 'cod', 'paid'),
(7, 'C02', 'ORD007', 'delivered', 22000, 10000, 2000, 30000, 3, 'momo', 'paid'),
(8, 'S04', 'ORD008', 'processing', 280000, 35000, 15000, 300000, NULL, 'bank_transfer', 'paid'),
(9, 'C01', 'ORD009', 'delivered', 280000, 30000, 10000, 300000, 1, 'cod', 'paid'),
(10, 'M01', 'ORD010', 'pending', 40000, 15000, 0, 55000, 9, 'momo', 'unpaid');

-- 16. Order Items
INSERT INTO order_items (id, order_id, product_id, product_details_id, product_type, quantity, price, total_price) VALUES
(1, 1, 1, 1, 'Sách giấy', 1, 60000, 60000), 
(2, 1, 5, 5, 'Sách giấy', 1, 20000, 20000), 
(3, 2, 3, 3, 'Sách giấy', 1, 350000, 350000),
(4, 3, 1, 1, 'Sách giấy', 1, 60000, 60000),
(5, 4, 4, 4, 'Sách giấy', 1, 90000, 90000),
(6, 5, 6, 6, 'Sách giấy', 1, 200000, 200000),
(7, 6, 2, 2, 'Sách giấy', 2, 75000, 150000),
(8, 7, 10, 10, 'Sách giấy', 1, 22000, 22000),
(9, 8, 7, 7, 'Sách giấy', 1, 280000, 280000), 
(10, 9, 7, 7, 'Sách giấy', 1, 280000, 280000);

-- 17. Reviews
INSERT INTO reviews (id, order_item_id, user_id, rating, title, content) VALUES
(1, 1, 'C01', 5, 'Tuyệt vời', 'Sách nội dung rất hay, giao hàng nhanh.'),
(2, 3, 'C02', 5, 'Sách ngành IT', 'Sách Clean Code in đẹp, kiến thức bổ ích.'),
(3, 5, 'S02', 4, 'Hơi buồn', 'Truyện Mắt Biếc buồn quá, nhưng sách đẹp.'),
(4, 7, 'C01', 5, 'Đáng mua', 'Đắc Nhân Tâm là sách gối đầu giường.'),
(5, 8, 'C02', 5, 'Fan One Piece', 'Tập 100 quá chất lượng!'),
(6, 1, 'C01', 4, 'Giấy hơi mỏng', 'Nội dung ok nhưng giấy hơi mỏng.'),
(7, 6, 'S03', 5, 'Marketing', 'Kiến thức nền tảng tốt.'),
(8, 9, 'S04', 5, 'Sách dày', 'Đóng gói cẩn thận, sách tiểu sử rất hay.'),
(9, 2, 'C01', 3, 'Truyện trẻ con', 'Mua tặng cháu, không đọc nên không rõ.'),
(10, 4, 'C01', 5, 'Mua tặng', 'Mua lần 2 để tặng bạn.');

-- 18. Order Notifications
INSERT INTO order_notifications (id, user_id, order_id, type, title, content, is_read) VALUES
(1, 'C01', 1, 'status_change', 'Giao thành công', 'Đơn hàng đã giao thành công', 1),
(2, 'C02', 2, 'status_change', 'Đang vận chuyển', 'Đơn hàng đang trên đường đến', 0),
(3, 'C01', 3, 'payment', 'Chờ thanh toán', 'Vui lòng thanh toán đơn hàng', 0),
(4, 'S02', 4, 'other', 'Đã hủy', 'Đơn hàng đã hủy', 1),
(5, 'S03', 5, 'status_change', 'Đang xử lý', 'Shop đang đóng gói đơn', 0),
(6, 'C01', 6, 'status_change', 'Giao thành công', 'Đơn đã giao', 1),
(7, 'C02', 7, 'payment', 'Thanh toán thành công', 'Đã nhận tiền đơn', 1),
(8, 'S04', 8, 'status_change', 'Đang xử lý', 'Đơn đang xử lý', 0),
(9, 'C01', 9, 'status_change', 'Giao thành công', 'Đơn đã giao', 1),
(10, 'M01', 10, 'payment', 'Chờ thanh toán', 'Đơn chưa thanh toán', 0);

-- 19. Product Notifications
INSERT INTO product_notifications (id, user_id, product_id, type, title, content, is_read) VALUES
(1, 'C01', 1, 'price_drop', 'Sách giảm giá', 'Nhà Giả Kim đang giảm 20%', 0),
(2, 'C02', 3, 'restock', 'Có hàng lại', 'Clean Code đã có hàng', 1),
(3, 'C01', 5, 'promotion', 'Tặng kèm', 'Mua Doraemon tặng bookmark', 0),
(4, 'S02', 4, 'price_drop', 'Flash Sale', 'Mắt Biếc giá sốc', 0),
(5, 'S03', 6, 'restock', 'Sách mới về', 'Nguyên lý Marketing đã về kho', 1),
(6, 'C02', 10, 'promotion', 'Pre-order', 'Đặt trước One Piece tập mới', 1),
(7, 'S04', 7, 'price_drop', 'Giảm giá sâu', 'Steve Jobs giảm 30%', 0),
(8, 'C01', 2, 'promotion', 'Combo', 'Mua Đắc Nhân Tâm giảm giá sách khác', 0),
(9, 'A02', 8, 'restock', 'Restock', 'Rừng Na Uy đã có lại', 1),
(10, 'A01', 9, 'other', 'Cập nhật', 'Sách cập nhật bìa mới', 1);

-- 20. User Notifications
INSERT INTO user_notifications (id, user_id, type, title, content, is_read) VALUES
(1, 'C01', 'system', 'Bảo trì', 'Hệ thống bảo trì lúc 0h', 1),
(2, 'C02', 'promotion', 'Sinh nhật', 'Chúc mừng sinh nhật nhận voucher 50k', 0),
(3, 'S02', 'account', 'Đổi mật khẩu', 'Bạn vừa đổi mật khẩu thành công', 1),
(4, 'C01', 'promotion', 'Sale 11/11', 'Săn sale ngày đôi', 0),
(5, 'S03', 'system', 'Cập nhật', 'Điều khoản sử dụng mới', 1),
(6, 'S04', 'account', 'Đăng nhập lạ', 'Có thiết bị lạ đăng nhập', 0),
(7, 'A01', 'system', 'Báo cáo', 'Báo cáo doanh thu tháng đã có', 1),
(8, 'M01', 'system', 'Kho hàng', 'Sắp hết hàng một số mã', 0),
(9, 'C01', 'promotion', 'Black Friday', 'Siêu sale thứ 6 đen tối', 0),
(10, 'C02', 'account', 'Xác thực', 'Vui lòng xác thực email', 1);

-- 21. Product Images
INSERT INTO product_images (product_id, image_url, is_primary, sort_order) VALUES
(1, 'https://toplist.vn/images/800px/nha-gia-kim-paulo-coelho-4777.jpg', 1, 1),
(1, 'https://tse4.mm.bing.net/th/id/OIP.6HTlzM1P0dlixOS5BgrdwgHaHa?rs=1&pid=ImgDetMain&o=7&rm=3', 0, 2),
(2, 'https://tse4.mm.bing.net/th/id/OIP.cUYVV92koOJ_3HFiDfTDggHaK1?rs=1&pid=ImgDetMain&o=7&rm=3', 1, 1),
(3, 'https://tse4.mm.bing.net/th/id/OIP.vSsZ-BuvUaRkg3xmYCAdYQHaHa?rs=1&pid=ImgDetMain&o=7&rm=3.jpg', 1, 1),
(4, 'https://th.bing.com/th/id/R.67d0ef3d3fc8897213c9a1f84ee561e1?rik=voHM75CRUp%2bZag&pid=ImgRaw&r=0', 1, 1),
(5, 'https://sachtienganh365.com/wp-content/uploads/2022/12/z3982679297002_dba76bfbd729f83103a5790fdf098426-2048x2027.jpg', 1, 1),
(6, 'https://tse4.mm.bing.net/th/id/OIP.oovS8M4q04PVPAVfJ1NtjgHaEc?rs=1&pid=ImgDetMain&o=7&rm=3', 1, 1),
(7, 'https://down-vn.img.susercontent.com/file/f7cd087f1f0a79c77853cb025c048a54', 1, 1),
(8, 'https://th.bing.com/th/id/OIP.Bmcp5gwPZME9NyVOy_Ml7gHaHa?w=177&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3', 1, 1),
(9, 'https://phuongthengoc.com/wp-content/uploads/2022/10/Tuoi-Tre-Dang-Gia-Bao-Nhieu-1-Rosie-Nguyen_Phuongthengoc-.jpg', 1, 1),
(10, 'https://th.bing.com/th/id/R.6f58c15429706e56ab044e4e34e2fa69?rik=aHeAdleRhefqjQ&pid=ImgRaw&r=0', 1, 1),
(10, 'https://th.bing.com/th/id/R.6f58c15429706e56ab044e4e34e2fa69?rik=aHeAdleRhefqjQ&pid=ImgRaw&r=0', 0, 2);

-- Bảng: conversations
INSERT INTO conversations (id, participant1_id, participant2_id, product_id, order_item_id)
VALUES
(1, 'C01', 'A01', 1, NULL),
(2, 'C02', 'M01', NULL, 3),
(3, 'C01', 'S01', 5, NULL),
(4, 'S03', 'A01', NULL, NULL),
(5, 'S02', 'A01', NULL, NULL),
(6, 'C01', 'S101', NULL, NULL);

-- Bảng: messages
INSERT INTO messages (id, conversation_id, sender_id, message) VALUES
(1, 1, 'C01', 'Sách Nhà Giả Kim còn bản bìa cứng không shop?'),
(2, 1, 'A01', 'Dạ hiện tại bên em chỉ còn bản bìa mềm ạ.'),
(3, 2, 'C02', 'Đơn hàng Clean Code của mình bao giờ giao tới ạ?'),
(4, 2, 'M01', 'Shipper đang trên đường giao rồi bạn nhé.'),
(5, 3, 'C01', 'Truyện Doraemon này là bản in năm bao nhiêu?'),
(6, 3, 'S01', 'Bản tái bản mới nhất 2022 ạ.'),
(7, 4, 'S03', 'Shop có tuyển cộng tác viên không?'),
(8, 5, 'S02', 'Sách bị lỗi in ấn đổi trả thế nào?'),
(9, 5, 'A01', 'Bạn vui lòng gửi ảnh chụp trang lỗi qua đây nhé.'),
(10, 6, 'C01', 'Anh shipper ơi em đổi địa chỉ nhận hàng chút được không?');

-- Bảng: conversation_notifications
INSERT INTO conversation_notifications
(
    conversation_id,
    user_id,
    type,
    title,
    content,
    unread_count,
    is_read,
    last_message_id,
    created_at
)
VALUES
(1, 'A01', 'new', 'Tin nhắn mới từ khách hàng',
 'Sách Nhà Giả Kim còn bản bìa cứng không shop?', 1, 0, 1, NOW()),
(1, 'C01', 'new', 'Phản hồi từ Shop',
 'Dạ hiện tại bên em chỉ còn bản bìa mềm ạ.', 0, 1, 2, NOW()),
(2, 'M01', 'new', 'Tin nhắn mới từ khách hàng',
 'Đơn hàng Clean Code của mình bao giờ giao tới ạ?', 0, 1, 4, NOW()),
(2, 'C02', 'new', 'Phản hồi từ Shop',
 'Shipper đang trên đường giao rồi bạn nhé.', 0, 1, 4, NOW()),
(3, 'S01', 'new', 'Tin nhắn mới từ khách hàng',
 'Truyện Doraemon này là bản in năm bao nhiêu?', 0, 1, 6, NOW()),
(3, 'C01', 'new', 'Phản hồi sản phẩm',
 'Bản tái bản mới nhất 2022 ạ.', 1, 0, 5, NOW()),
(4, 'A01', 'new', 'Tin nhắn mới',
 'Shop có tuyển cộng tác viên không?', 1, 0, 7, NOW()),
(4, 'S03', 'new', 'Đã gửi tin nhắn',
 'Shop có tuyển cộng tác viên không?', 0, 1, 7, NOW()),
(5, 'A01', 'new', 'Yêu cầu hỗ trợ',
 'Sách bị lỗi in ấn đổi trả thế nào?', 1, 0, 8, NOW()),
(5, 'S02', 'new', 'Phản hồi hỗ trợ',
 'Bạn vui lòng gửi ảnh chụp trang lỗi qua đây nhé.', 0, 1, 9, NOW()),
(6, 'S101', 'new', 'Tin nhắn mới từ khách hàng',
 'Anh shipper ơi em đổi địa chỉ nhận hàng chút được không?', 0, 1, 10, NOW()),
(6, 'C01', 'new', 'Đã gửi tin nhắn',
 'Anh shipper ơi em đổi địa chỉ nhận hàng chút được không?', 0, 1, 10, NOW());

-- 24. Review Images
INSERT INTO review_images (review_id, image_url) VALUES
(1, 'https://toplist.vn/images/800px/nha-gia-kim-paulo-coelho-4777.jpg'),
(1, 'https://tse4.mm.bing.net/th/id/OIP.6HTlzM1P0dlixOS5BgrdwgHaHa?rs=1&pid=ImgDetMain&o=7&rm=3'),
(2, 'https://tse4.mm.bing.net/th/id/OIP.cUYVV92koOJ_3HFiDfTDggHaK1?rs=1&pid=ImgDetMain&o=7&rm=3'),
(3, 'https://tse4.mm.bing.net/th/id/OIP.vSsZ-BuvUaRkg3xmYCAdYQHaHa?rs=1&pid=ImgDetMain&o=7&rm=3.jpg'),
(5, 'https://th.bing.com/th/id/R.67d0ef3d3fc8897213c9a1f84ee561e1?rik=voHM75CRUp%2bZag&pid=ImgRaw&r=0'),
(6, 'https://sachtienganh365.com/wp-content/uploads/2022/12/z3982679297002_dba76bfbd729f83103a5790fdf098426-2048x2027.jpg'),
(6, 'https://tse4.mm.bing.net/th/id/OIP.oovS8M4q04PVPAVfJ1NtjgHaEc?rs=1&pid=ImgDetMain&o=7&rm=3'),
(8, 'https://down-vn.img.susercontent.com/file/f7cd087f1f0a79c77853cb025c048a54'),
(10, 'https://th.bing.com/th/id/OIP.Bmcp5gwPZME9NyVOy_Ml7gHaHa?w=177&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3'),
(4, 'https://phuongthengoc.com/wp-content/uploads/2022/10/Tuoi-Tre-Dang-Gia-Bao-Nhieu-1-Rosie-Nguyen_Phuongthengoc-.jpg');

-- ===========================================
-- 1. Weight Fees
INSERT INTO weight_fees (min_weight, max_weight, base_price) VALUES
(0, 1, 10000.00),
(1.01, 5, 15000.00),
(5.01, 10, 20000.00),
(10.01, 20, 25000.00);

-- 2. Distance Fees
INSERT INTO distance_fees (min_distance, max_distance, multiplier) VALUES
(0, 5, 1.00),
(5.01, 20, 1.20),
(20.01, 50, 1.50),
(50.01, 100, 2.00);

-- 3. Shipping Type Fees
INSERT INTO shipping_type_fees (shipping_type, multiplier) VALUES
('standard', 1.00),
('express', 1.50);

-- 4. Order Product Discounts
INSERT INTO order_product_discounts (type, amount, quantity, used_quantity) VALUES
('promo_code', 10000, 10, 0),
('member_discount', 5000, 5, 0),
('voucher', 20000, 1, 0);

-- 5. Order Shipping Discounts
INSERT INTO order_shipping_discounts (type, amount, quantity, used_quantity) VALUES
('promo_code', 5000, 10, 0),
('member_discount', 3000, 5, 0),
('voucher', 10000, 1, 0);

-- 6. Order Shipping Fee Details
INSERT INTO order_shipping_fee_details (order_id, weight_fee_id, distance_fee_id, shipping_type_fee_id, amount) VALUES
(1, 1, 1, 1, 5000),
(2, 2, 2, 2, 12000);

-- 7. Order Discount Details
INSERT INTO order_discount_details (order_id, product_discount_id, shipping_discount_id, amount) VALUES
(1, 1, 1, 15000),
(2, 2, NULL, 5000),
(3, NULL, 2, 3000);

SET FOREIGN_KEY_CHECKS = 1;