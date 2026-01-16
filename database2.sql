-- =============================================================================
-- PHẦN 1: TẠO DATABASE VÀ CẤU TRÚC BẢNG (DDL)
-- =============================================================================
DROP DATABASE IF EXISTS book_store_db_2;
CREATE DATABASE IF NOT EXISTS book_store_db_2 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE book_store_db_2;

-- Tắt chế độ an toàn để cho phép xóa/sửa thoải mái khi nạp dữ liệu
SET SQL_SAFE_UPDATES = 0;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Roles
CREATE TABLE roles (
    id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(50) UNIQUE,
    description VARCHAR(255),
    slug varchar(255)
);

-- 2. Permissions
CREATE TABLE permissions (
    id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) UNIQUE,
    description VARCHAR(255),
    slug varchar(255)
);

-- 3. Role_Per
CREATE TABLE role_per (
    per_id INT NOT NULL,
    role_id VARCHAR(10) NOT NULL,
    PRIMARY KEY (per_id, role_id),
    FOREIGN KEY (per_id) REFERENCES permissions(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- 4. Users
CREATE TABLE users (
    id VARCHAR(10) PRIMARY KEY,
    username VARCHAR(16) UNIQUE,
    password_hash VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    role_id VARCHAR(10),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL
);

-- 5. Profiles
CREATE TABLE profiles (
    user_id VARCHAR(10) PRIMARY KEY,
    full_name VARCHAR(50),
    avatar_url TEXT,
    phone CHAR(10),
    birthday DATE,
    gender ENUM('Nam', 'Nữ', 'Khác'),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 6. Provinces
CREATE TABLE provinces (
    id INT PRIMARY KEY,
    name VARCHAR(50),
    code VARCHAR(10) UNIQUE
);

-- 7. Communes
CREATE TABLE communes (
    id INT PRIMARY KEY,
    province_id INT,
    name VARCHAR(50),
    code VARCHAR(10) UNIQUE,
    FOREIGN KEY (province_id) REFERENCES provinces(id) ON DELETE CASCADE
);

-- 8. Addresses
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

-- 9. Categories
CREATE TABLE categories (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    slug VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Products
CREATE TABLE products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
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
) ENGINE=InnoDB;

-- 11. Product Categories
CREATE TABLE product_categories (
    product_id BIGINT,
    category_id INT,
    PRIMARY KEY (product_id, category_id),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE, 
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- 12. Product Details
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

-- 13. Shopping Carts
CREATE TABLE shopping_carts (
    id BIGINT PRIMARY KEY,
    user_id VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('active', 'checked out', 'abandoned'), 
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 14. Cart Items
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

-- 15. Orders
CREATE TABLE orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(10) NULL,
    order_code VARCHAR(30) NOT NULL UNIQUE,
    status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending',
    subtotal DECIMAL(12,2) DEFAULT 0,
    shipping_fee DECIMAL(12,2) DEFAULT 0,
    discount DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL,
    shipping_address_id BIGINT NULL,
    payment_method ENUM('cod', 'momo', 'bank_transfer', 'credit_card') NOT NULL,
    payment_status ENUM('unpaid', 'paid', 'refunded') NOT NULL DEFAULT 'unpaid',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_orders_address FOREIGN KEY (shipping_address_id) REFERENCES addresses(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 16. Order Items
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

-- Các bảng Shipping Fees
CREATE TABLE weight_fees (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    min_weight DECIMAL(10,2) NOT NULL,
    max_weight DECIMAL(10,2) NOT NULL,
    base_price DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE distance_fees (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    min_distance DECIMAL(10,2) NOT NULL,
    max_distance DECIMAL(10,2) NOT NULL,
    multiplier DECIMAL(5,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE shipping_type_fees (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    shipping_type ENUM('standard', 'express') NOT NULL,
    multiplier DECIMAL(5,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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

-- Các bảng Discount
CREATE TABLE order_product_discounts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('promo_code', 'member_discount', 'voucher') DEFAULT 'promo_code',
    amount DECIMAL(12,2) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    used_quantity INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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

-- 17. Reviews
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
    CONSTRAINT fk_reviews_order_item FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE SET NULL,
    CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Notifications & Images
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

CREATE TABLE product_notifications (
    id BIGINT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    user_id VARCHAR(10),
    product_id BIGINT,
    type ENUM('restock', 'price_drop', 'promotion', 'create', 'update', 'delete', 'other'), 
    title VARCHAR(255),
    content TEXT,
    is_read BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

CREATE TABLE user_notifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(10),
    type ENUM('system', 'promotion', 'account'),
    title VARCHAR(255),
    content TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE product_images (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    image_url TEXT,
    is_primary BOOLEAN DEFAULT FALSE,
    sort_order TINYINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

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
    FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE SET NULL
);

CREATE TABLE messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    conversation_id BIGINT NOT NULL,
    sender_id VARCHAR(10) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE conversation_notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    conversation_id BIGINT NOT NULL,
    user_id VARCHAR(10),
    type ENUM('new', 'update', 'recall', 'system') DEFAULT 'new',
    title VARCHAR(255) NOT NULL,
    content VARCHAR(500),
    unread_count INT DEFAULT 0,
    is_read BOOLEAN DEFAULT FALSE,
    last_message_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (last_message_id) REFERENCES messages(id) ON DELETE SET NULL
);

CREATE TABLE review_images (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    review_id BIGINT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE
);

-- =============================================================================
-- PHẦN 2: TRIGGER
-- =============================================================================
DELIMITER //

-- Trigger: Tăng lượt mua khi có order item mới
CREATE TRIGGER update_purchase_count_after_order_item_insert
AFTER INSERT ON order_items
FOR EACH ROW
BEGIN
    UPDATE products
    SET purchase_count = purchase_count + NEW.quantity
    WHERE id = NEW.product_id;
END//

-- Trigger: Cập nhật rating sản phẩm khi có review mới
CREATE TRIGGER update_rating_after_review_insert
AFTER INSERT ON reviews
FOR EACH ROW
BEGIN
    DECLARE product_id_val BIGINT;
    DECLARE avg_rating DECIMAL(3,2);
    
    SELECT oi.product_id INTO product_id_val
    FROM order_items oi
    WHERE oi.id = NEW.order_item_id;
    
    SELECT AVG(r.rating) INTO avg_rating
    FROM reviews r
    JOIN order_items oi ON r.order_item_id = oi.id
    WHERE oi.product_id = product_id_val;
    
    UPDATE products
    SET rating = COALESCE(avg_rating, 5.00)
    WHERE id = product_id_val;
END//

DELIMITER ;

-- =============================================================================
-- PHẦN 3: NHẬP LIỆU (DATA SEEDING)
-- =============================================================================

-- 1. Roles
INSERT INTO roles (id, name, description, slug) VALUES
('A', 'Admin', 'Quản trị viên', 'admin'),
('C', 'Customer', 'Khách hàng', 'customer');

-- 2. Permissions
INSERT INTO permissions (id, name, description, slug) VALUES
(1, 'Thống kê nhập', 'Thống kê nhập', 'stats.import'), (2, 'Thống kê bán', 'Thống kê bán', 'stats.sales'),
(3, 'Phân quyền', 'Quản lý phân quyền', 'auth.manage'), (4, 'Quản lý người dùng', 'QL người dùng', 'user.manage'),
(5, 'Quản lý thông báo', 'QL thông báo', 'notify.manage'), (6, 'Quản lý sản phẩm', 'QL sản phẩm', 'product.manage'),
(7, 'Quản lý voucher', 'QL voucher', 'voucher.manage'), (8, 'Quản lý khối lượng', 'Cấu hình ship', 'shipping.weight'),
(9, 'Xác nhận đơn hàng', 'Duyệt đơn', 'order.confirm'),
(10, 'Tìm kiếm', 'Tìm sản phẩm', 'product.search'), (11, 'Xem danh sách', 'Xem list SP', 'product.list'),
(12, 'Xem chi tiết', 'Xem chi tiết SP', 'product.detail'), (13, 'Giỏ hàng', 'QL giỏ hàng', 'cart.manage'),
(14, 'Đặt hàng', 'Tạo đơn hàng', 'order.place'), (15, 'Lịch sử đơn', 'Xem lịch sử', 'order.history'),
(16, 'Đánh giá', 'Review SP', 'product.review'), (17, 'Chat AI', 'Chat bot', 'ai.chat'),
(18, 'Lịch sử mua', 'Xem SP đã mua', 'purchase.history'),
(19, 'Xem profile', 'Xem TK', 'profile.view'), (20, 'Sửa profile', 'Sửa TK', 'profile.edit'),
(21, 'Đổi mật khẩu', 'Đổi pass', 'auth.password'), (22, 'Xem thông báo', 'Xem notify', 'notify.view'),
(23, 'Đọc thông báo', 'Đánh dấu đọc', 'notify.read'), (24, 'Xem voucher', 'Xem mã giảm giá', 'voucher.view'),
(25, 'Dùng voucher', 'Apply mã', 'voucher.use');

INSERT INTO role_per (role_id, per_id) VALUES
('A',1),('A',2),('A',3),('A',4),('A',5),('A',6),('A',7),('A',8),('A',9),('A',19),('A',20),('A',21),('A',22),('A',23),('A',24),('A',25),
('C',10),('C',11),('C',12),('C',13),('C',14),('C',15),('C',16),('C',17),('C',18),('C',19),('C',20),('C',21),('C',22),('C',23),('C',24),('C',25);

-- 3. Users (A00x cho Admin, C00x cho Customer)
INSERT INTO users (id, username, password_hash, email, is_active, role_id) VALUES
('A001', 'admin_boss', '$2a$12$xxx', 'boss@store.com', 1, 'A'),
('A002', 'admin_staff', '$2a$12$xxx', 'staff@store.com', 1, 'A');

-- 50 Customer (C001 -> C050)
INSERT INTO users (id, username, password_hash, email, is_active, role_id) VALUES
('C001','cus01','$2y$10$x','u01@gmail.com',1,'C'),('C002','cus02','$2y$10$x','u02@gmail.com',1,'C'),
('C003','cus03','$2y$10$x','u03@gmail.com',1,'C'),('C004','cus04','$2y$10$x','u04@gmail.com',1,'C'),
('C005','cus05','$2y$10$x','u05@gmail.com',1,'C'),('C006','cus06','$2y$10$x','u06@gmail.com',1,'C'),
('C007','cus07','$2y$10$x','u07@gmail.com',1,'C'),('C008','cus08','$2y$10$x','u08@gmail.com',1,'C'),
('C009','cus09','$2y$10$x','u09@gmail.com',1,'C'),('C010','cus10','$2y$10$x','u10@gmail.com',1,'C'),
('C011','cus11','$2y$10$x','u11@gmail.com',1,'C'),('C012','cus12','$2y$10$x','u12@gmail.com',1,'C'),
('C013','cus13','$2y$10$x','u13@gmail.com',1,'C'),('C014','cus14','$2y$10$x','u14@gmail.com',1,'C'),
('C015','cus15','$2y$10$x','u15@gmail.com',1,'C'),('C016','cus16','$2y$10$x','u16@gmail.com',1,'C'),
('C017','cus17','$2y$10$x','u17@gmail.com',1,'C'),('C018','cus18','$2y$10$x','u18@gmail.com',1,'C'),
('C019','cus19','$2y$10$x','u19@gmail.com',1,'C'),('C020','cus20','$2y$10$x','u20@gmail.com',1,'C'),
('C021','cus21','$2y$10$x','u21@gmail.com',1,'C'),('C022','cus22','$2y$10$x','u22@gmail.com',1,'C'),
('C023','cus23','$2y$10$x','u23@gmail.com',1,'C'),('C024','cus24','$2y$10$x','u24@gmail.com',1,'C'),
('C025','cus25','$2y$10$x','u25@gmail.com',1,'C'),('C026','cus26','$2y$10$x','u26@gmail.com',1,'C'),
('C027','cus27','$2y$10$x','u27@gmail.com',1,'C'),('C028','cus28','$2y$10$x','u28@gmail.com',1,'C'),
('C029','cus29','$2y$10$x','u29@gmail.com',1,'C'),('C030','cus30','$2y$10$x','u30@gmail.com',1,'C'),
('C031','cus31','$2y$10$x','u31@gmail.com',1,'C'),('C032','cus32','$2y$10$x','u32@gmail.com',1,'C'),
('C033','cus33','$2y$10$x','u33@gmail.com',1,'C'),('C034','cus34','$2y$10$x','u34@gmail.com',1,'C'),
('C035','cus35','$2y$10$x','u35@gmail.com',1,'C'),('C036','cus36','$2y$10$x','u36@gmail.com',1,'C'),
('C037','cus37','$2y$10$x','u37@gmail.com',1,'C'),('C038','cus38','$2y$10$x','u38@gmail.com',1,'C'),
('C039','cus39','$2y$10$x','u39@gmail.com',1,'C'),('C040','cus40','$2y$10$x','u40@gmail.com',1,'C'),
('C041','cus41','$2y$10$x','u41@gmail.com',1,'C'),('C042','cus42','$2y$10$x','u42@gmail.com',1,'C'),
('C043','cus43','$2y$10$x','u43@gmail.com',1,'C'),('C044','cus44','$2y$10$x','u44@gmail.com',1,'C'),
('C045','cus45','$2y$10$x','u45@gmail.com',1,'C'),('C046','cus46','$2y$10$x','u46@gmail.com',1,'C'),
('C047','cus47','$2y$10$x','u47@gmail.com',1,'C'),('C048','cus48','$2y$10$x','u48@gmail.com',1,'C'),
('C049','cus49','$2y$10$x','u49@gmail.com',1,'C'),('C050','cus50','$2y$10$x','u50@gmail.com',1,'C');

-- Profile & Address
INSERT INTO profiles (user_id, full_name, phone, birthday, gender)
SELECT id, CONCAT('Nguyễn Văn ', SUBSTRING(id, 2)), '0901234567', '2000-01-01', 'Nam' FROM users;

INSERT INTO addresses (user_id, label, receiver_name, phone, street_address, commune_id, is_default)
SELECT id, 'Nhà riêng', 'Người nhận', '0909998888', '123 Đường Phố', 1, 1 FROM users WHERE role_id = 'C';

-- 4. Danh mục & Địa lý
INSERT INTO provinces (id, name, code) VALUES (1, 'Hà Nội', 'HN'), (2, 'TP.HCM', 'HCM');
INSERT INTO communes (id, province_id, name, code) VALUES (1, 1, 'Ba Đình', 'BD'), (2, 2, 'Quận 1', 'Q1');
INSERT INTO categories (id, name, slug) VALUES 
(1, 'Văn học', 'van-hoc'), (2, 'Kinh tế', 'kinh-te'), (3, 'Thiếu nhi', 'thieu-nhi'), (4, 'CNTT', 'it'), (5, 'Manga', 'manga');

-- 5. Products (50 sản phẩm tên thật, view < 100)
INSERT INTO products (id, name, slug, description, author, publisher, publication_year, language, status, views, purchase_count, rating) VALUES
(1, 'Nhà Giả Kim', 'nha-gia-kim', 'Tiểu thuyết bán chạy', 'Paulo Coelho', 'NXB Văn Học', 2020, 'Việt', 1, 85, 20, 4.8),
(2, 'Đắc Nhân Tâm', 'dac-nhan-tam', 'Sách kỹ năng', 'Dale Carnegie', 'NXB TH', 2021, 'Việt', 1, 95, 40, 5.0),
(3, 'Clean Code', 'clean-code', 'Sách lập trình', 'Robert Martin', 'NXB IT', 2019, 'Anh', 1, 55, 10, 4.9),
(4, 'Doraemon Tập 1', 'doraemon-1', 'Truyện tranh', 'Fujiko F', 'NXB Kim Đồng', 2022, 'Việt', 1, 99, 80, 5.0),
(5, 'One Piece 100', 'one-piece-100', 'Truyện tranh', 'Oda', 'NXB Kim Đồng', 2023, 'Việt', 1, 90, 70, 5.0),
(6, 'Harry Potter 1', 'hp-1', 'Phù thủy', 'Rowling', 'NXB Trẻ', 2000, 'Việt', 1, 60, 25, 4.7),
(7, 'Sherlock Holmes', 'sherlock', 'Trinh thám', 'Conan Doyle', 'NXB VH', 1990, 'Việt', 1, 45, 15, 4.5),
(8, 'Mắt Biếc', 'mat-biec', 'Tình cảm', 'Nguyễn Nhật Ánh', 'NXB Trẻ', 2018, 'Việt', 1, 80, 50, 4.6),
(9, 'Tuổi Trẻ Đáng Giá', 'tuoi-tre', 'Self help', 'Rosie', 'NXB NN', 2018, 'Việt', 1, 75, 30, 4.2),
(10, 'Cà Phê Cùng Tony', 'tony', 'Kỹ năng', 'Tony', 'NXB Trẻ', 2017, 'Việt', 1, 65, 20, 4.0),
(11, 'Cha Giàu Cha Nghèo', 'cha-giau', 'Kinh tế', 'Kiyosaki', 'NXB Trẻ', 2020, 'Việt', 1, 35, 5, 4.5),
(12, 'Khởi Nghiệp 4.0', 'khoi-nghiep', 'Kinh tế', 'D.S', 'NXB CT', 2021, 'Việt', 1, 25, 2, 4.0),
(13, 'Marketing Giỏi', 'mkt', 'Kinh tế', 'Kotler', 'NXB LD', 2019, 'Việt', 1, 52, 12, 4.8),
(14, 'Chứng Khoán ABC', 'ck', 'Kinh tế', 'ABC', 'NXB TC', 2022, 'Việt', 1, 15, 1, 3.5),
(15, 'Tâm Lý Học', 'tam-ly', 'Khoa học', 'Freud', 'NXB Tri Thức', 2015, 'Việt', 1, 42, 8, 4.2),
(16, 'Vũ Trụ', 'vu-tru', 'Khoa học', 'Sagan', 'NXB NN', 2018, 'Việt', 1, 68, 12, 5.0),
(17, 'Lược Sử Loài Người', 'sapiens', 'Lịch sử', 'Harari', 'NXB TT', 2019, 'Việt', 1, 92, 35, 4.9),
(18, 'Code Dạo Ký Sự', 'code-dao', 'IT', 'Hoàng', 'NXB DT', 2017, 'Việt', 1, 78, 20, 4.8),
(19, 'Tớ Học Lập Trình', 'learn-code', 'Thiếu nhi', 'TG', 'NXB KD', 2020, 'Việt', 1, 28, 5, 4.5),
(20, 'Dế Mèn Phiêu Lưu', 'de-men', 'Văn học', 'Tô Hoài', 'NXB KD', 2000, 'Việt', 1, 82, 40, 5.0),
(21, 'Đất Rừng Phương Nam', 'dat-rung', 'Văn học', 'Đoàn Giỏi', 'NXB KD', 2005, 'Việt', 1, 55, 10, 4.5),
(22, 'Số Đỏ', 'so-do', 'Văn học', 'Vũ Trọng Phụng', 'NXB VH', 1990, 'Việt', 1, 48, 12, 4.2),
(23, 'Chí Phèo', 'chi-pheo', 'Văn học', 'Nam Cao', 'NXB VH', 1995, 'Việt', 1, 58, 15, 4.6),
(24, 'Tắt Đèn', 'tat-den', 'Văn học', 'Ngô Tất Tố', 'NXB VH', 1996, 'Việt', 1, 32, 5, 4.0),
(25, 'Dragon Ball 1', 'dragon-ball', 'Manga', 'Toriyama', 'NXB KD', 2000, 'Việt', 1, 96, 50, 5.0),
(26, 'Naruto 1', 'naruto', 'Manga', 'Kishimoto', 'NXB KD', 2002, 'Việt', 1, 91, 45, 4.9),
(27, 'Conan 1', 'conan', 'Manga', 'Aoyama', 'NXB KD', 2000, 'Việt', 1, 98, 55, 4.8),
(28, 'Shin Bút Chì', 'shin', 'Manga', 'Usui', 'NXB KD', 2005, 'Việt', 1, 86, 30, 4.5),
(29, 'Java Cơ Bản', 'java-core', 'IT', 'TG', 'NXB IT', 2020, 'Việt', 1, 22, 2, 4.0),
(30, 'Python Cho Bé', 'python-kid', 'IT', 'TG', 'NXB IT', 2021, 'Việt', 1, 18, 1, 4.2),
(31, 'ReactJS Nâng Cao', 'reactjs', 'IT', 'TG', 'NXB IT', 2022, 'Việt', 1, 41, 8, 4.7),
(32, 'NodeJS Thực Chiến', 'nodejs', 'IT', 'TG', 'NXB IT', 2022, 'Việt', 1, 36, 7, 4.6),
(33, 'Docker Cơ Bản', 'docker', 'IT', 'TG', 'NXB IT', 2023, 'Việt', 1, 26, 4, 4.5),
(34, 'AWS Cloud', 'aws', 'IT', 'TG', 'NXB IT', 2023, 'Việt', 1, 12, 1, 4.8),
(35, 'Tiếng Anh Giao Tiếp', 'eng-com', 'Ngoại ngữ', 'TG', 'NXB GD', 2019, 'Việt', 1, 52, 10, 4.0),
(36, 'TOEIC 500', 'toeic', 'Ngoại ngữ', 'ETS', 'NXB GD', 2020, 'Việt', 1, 62, 20, 4.2),
(37, 'IELTS 7.0', 'ielts', 'Ngoại ngữ', 'Cambridge', 'NXB GD', 2021, 'Việt', 1, 56, 15, 4.5),
(38, 'Ngữ Pháp Tiếng Anh', 'grammar', 'Ngoại ngữ', 'Mai Lan Huong', 'NXB GD', 2010, 'Việt', 1, 82, 40, 4.8),
(39, 'Từ Điển Anh Việt', 'dict', 'Ngoại ngữ', 'TG', 'NXB GD', 2015, 'Việt', 1, 42, 5, 4.0),
(40, '300 Bài Code Thiếu Nhi', '300-code', 'IT', 'Mạng', 'NXB IT', 2022, 'Việt', 1, 99, 50, 5.0),
(41, 'Design Patterns', 'design-pattern', 'IT', 'GOF', 'NXB IT', 2000, 'Anh', 1, 46, 10, 4.9),
(42, 'Refactoring', 'refactor', 'IT', 'Fowler', 'NXB IT', 2010, 'Anh', 1, 32, 5, 4.7),
(43, 'Head First Java', 'hf-java', 'IT', 'Sierra', 'NXB IT', 2005, 'Anh', 1, 52, 12, 4.8),
(44, 'Effective Java', 'eff-java', 'IT', 'Bloch', 'NXB IT', 2018, 'Anh', 1, 42, 8, 4.9),
(45, 'Spring Boot', 'spring', 'IT', 'TG', 'NXB IT', 2021, 'Anh', 1, 36, 6, 4.5),
(46, 'HTML CSS', 'html-css', 'IT', 'Duckett', 'NXB IT', 2015, 'Anh', 1, 72, 25, 4.8),
(47, 'JS The Good Parts', 'js-good', 'IT', 'Crockford', 'NXB IT', 2008, 'Anh', 1, 26, 3, 4.2),
(48, 'You Dont Know JS', 'ydkjs', 'IT', 'Simpson', 'NXB IT', 2019, 'Anh', 1, 56, 15, 4.9),
(49, 'Eloquent JS', 'eloquent', 'IT', 'Haverbeke', 'NXB IT', 2018, 'Anh', 1, 46, 10, 4.7),
(50, 'Pragmatic Programmer', 'pragmatic', 'IT', 'Hunt', 'NXB IT', 1999, 'Anh', 1, 66, 20, 5.0);

INSERT INTO product_details (id, product_id, product_type, sku, original_price, sale_price, stock, weight)
SELECT id, id, 'Sách giấy', CONCAT('SKU-', id), 100000, 80000, 50, 300 FROM products;

INSERT INTO product_categories (product_id, category_id) SELECT id, FLOOR(1 + RAND() * 5) FROM products;

-- 6. ẢNH SẢN PHẨM (Mỗi SP có 3-4 ảnh link thật từ Amazon/Tiki)
INSERT INTO product_images (product_id, image_url, is_primary, sort_order)
SELECT p.id, img.url, (img.idx = 1), img.idx
FROM products p
CROSS JOIN (
    SELECT 1 as idx, 'https://images-na.ssl-images-amazon.com/images/I/51Z0nLAfLmL.jpg' as url
    UNION ALL SELECT 2, 'https://images-na.ssl-images-amazon.com/images/I/51UoqRAxwEL.jpg'
    UNION ALL SELECT 3, 'https://salt.tikicdn.com/cache/w1200/ts/product/2e/27/76/674d82f76bd748e77840130d2222a720.jpg'
    UNION ALL SELECT 4, 'https://salt.tikicdn.com/cache/w400/ts/product/05/2f/94/d17cb3d1912a2095a57061d4b6843472.jpg'
) img;

-- Xóa bớt 1 ảnh của các SP ID chẵn để có SP 3 ảnh, SP 4 ảnh
DELETE FROM product_images WHERE sort_order = 4 AND product_id % 2 = 0;

-- 7. Đơn hàng (C001 -> C050)
INSERT INTO shopping_carts (id, user_id, status)
SELECT (@rn := @rn + 1), u.id, 'active'
FROM users u, (SELECT @rn := 0) r WHERE u.role_id = 'C';

INSERT INTO orders (id, user_id, order_code, status, subtotal, shipping_fee, total_amount, payment_method, payment_status)
SELECT (@rn2 := @rn2 + 1), u.id, CONCAT('ORD-', u.id, '-X'), 'delivered', 100000, 20000, 120000, 'cod', 'paid'
FROM users u, (SELECT @rn2 := 0) r WHERE u.role_id = 'C';

INSERT INTO order_items (order_id, product_id, product_details_id, product_type, quantity, price, total_price)
SELECT id, 1, 1, 'Sách giấy', 1, 80000, 80000 FROM orders;

-- 8. Reviews
INSERT INTO reviews (order_item_id, user_id, rating, title, content)
SELECT id, 'C001', 5, 'Sách đẹp', 'Hài lòng về sản phẩm' FROM order_items LIMIT 30;

-- 9. Phí ship & Dữ liệu phụ
INSERT INTO weight_fees (min_weight, max_weight, base_price) VALUES (0, 1000, 15000), (1001, 5000, 30000);
INSERT INTO distance_fees (min_distance, max_distance, multiplier) VALUES (0, 10, 1.0), (11, 100, 1.5);
INSERT INTO shipping_type_fees (shipping_type, multiplier) VALUES ('standard', 1.0), ('express', 2.0);

INSERT INTO order_product_discounts (type, amount, quantity) VALUES ('promo_code', 10000, 10);
INSERT INTO order_shipping_discounts (type, amount, quantity) VALUES ('promo_code', 5000, 10);

-- Các bảng thông báo & Chat
INSERT INTO user_notifications (user_id, type, title, content) SELECT id, 'system', 'Chào mừng', 'Chào mừng bạn đến với cửa hàng' FROM users LIMIT 50;
INSERT INTO conversations (participant1_id, participant2_id, product_id) VALUES ('C001', 'A001', 1);
INSERT INTO messages (conversation_id, sender_id, message) VALUES (1, 'C001', 'Còn hàng không shop?');

SET FOREIGN_KEY_CHECKS = 1;
SET SQL_SAFE_UPDATES = 1;
