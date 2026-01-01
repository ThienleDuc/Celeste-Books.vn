-- Tạo CSDL
DROP DATABASE IF EXISTS book_store_db_2;
CREATE DATABASE IF NOT EXISTS book_store_db_2 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE book_store_db_2;

-- Tắt kiểm tra khóa ngoại để tránh lỗi thứ tự tạo bảng
SET FOREIGN_KEY_CHECKS = 0;

-- =============================================
-- 1. Bảng roles (Vai trò)
CREATE TABLE roles (
    id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(50) UNIQUE,
    description VARCHAR(255)
);

-- =============================================
-- 2. Bảng permissions (Quyền hạn)
CREATE TABLE permissions (
    id INT PRIMARY KEY,
    name VARCHAR(100) UNIQUE,
    description VARCHAR(255)
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
-- 11. Bảng products (Sản phẩm)
-- =============================================
CREATE TABLE products (
    id BIGINT PRIMARY KEY,
    name VARCHAR(255),
    slug VARCHAR(255),
    description TEXT,
    author VARCHAR(50), 
    publisher VARCHAR(50),
    publication_year INT,
    cover_image TEXT,
    language VARCHAR(50),
    status BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    -- Đã xóa dấu phẩy thừa ở đây
);

-- =============================================
-- 10. Bảng product_categories 
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
    id BIGINT PRIMARY KEY,
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
    id BIGINT PRIMARY KEY,
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
    id BIGINT PRIMARY KEY,
    user_id VARCHAR(10),
    order_code VARCHAR(30),
    status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled'),
    subtotal DECIMAL(12,2) DEFAULT 0,
    shipping_fee DECIMAL(12,2) DEFAULT 0,
    discount DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2),
    shipping_address_id BIGINT,
    payment_method ENUM('cod', 'momo', 'bank_transfer', 'credit_card'),
    payment_status ENUM('unpaid', 'paid', 'refunded'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (shipping_address_id) REFERENCES addresses(id) ON DELETE SET NULL
);

-- =============================================
-- 16. Bảng order_items (Chi tiết đơn hàng)
CREATE TABLE order_items (
    id BIGINT PRIMARY KEY,
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
    min_weight DECIMAL(10,2) NOT NULL, -- kg
    max_weight DECIMAL(10,2) NOT NULL,
    multiplier DECIMAL(5,2) NOT NULL,  -- hệ số nhân theo cân nặng
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--
-- Bảng: distance_fees (Phí theo khoảng cách)
CREATE TABLE distance_fees (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    min_distance DECIMAL(10,2) NOT NULL, -- km
    max_distance DECIMAL(10,2) NOT NULL,
    multiplier DECIMAL(5,2) NOT NULL,   -- hệ số nhân theo khoảng cách
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng: shipping_type_fees (Phí theo loại hình)
CREATE TABLE shipping_type_fees (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    shipping_type ENUM('standard', 'express', 'cod') NOT NULL,
    multiplier DECIMAL(5,2) NOT NULL,   -- hệ số nhân theo loại hình
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng: order_shipping_fee_details (các loại phí của order)
CREATE TABLE order_shipping_fee_details (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    
    order_id BIGINT NOT NULL,
    weight_fee_id BIGINT NOT NULL,
    distance_fee_id BIGINT NOT NULL,
    shipping_type_fee_id BIGINT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,   -- số tiền thực tế áp dụng
        
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng: order_shipping_discounts (giảm giá phí ship)
CREATE TABLE order_shipping_discounts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('promo_code', 'member_discount', 'voucher') DEFAULT 'promo_code',
    amount DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_discount_details (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    order_id BIGINT NOT NULL,

    product_discount_id BIGINT NULL,  -- liên kết giảm giá sản phẩm
    shipping_discount_id BIGINT NULL, -- liên kết giảm giá vận chuyển
    amount DECIMAL(12,2) NOT NULL,   -- số tiền thực tế áp dụng

    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_discount_id) REFERENCES order_product_discounts(id) ON DELETE CASCADE,
    FOREIGN KEY (shipping_discount_id) REFERENCES order_shipping_discounts(id) ON DELETE CASCADE,

    UNIQUE KEY unique_product_discount (order_id, product_discount_id),
    UNIQUE KEY unique_shipping_discount (order_id, shipping_discount_id)
);

-- =============================================
-- 17. Bảng reviews (Đánh giá)
CREATE TABLE reviews (
    id BIGINT PRIMARY KEY,
    order_item_id BIGINT,
    user_id VARCHAR(10),
    rating TINYINT,
    title VARCHAR(255),
    content TEXT,
    images TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =============================================
-- 18. Bảng order_notifications
CREATE TABLE order_notifications (
    id BIGINT PRIMARY KEY,
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
    id BIGINT PRIMARY KEY,
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
    id BIGINT PRIMARY KEY,
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
CREATE TABLE messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sender_id VARCHAR(10) NOT NULL,
    receiver_id VARCHAR(10) NOT NULL,
    product_id BIGINT,   
    order_item_id BIGINT,  
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
    FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE SET NULL
);

-- =============================================
-- 23. Bảng message_notifications (Thông báo tin nhắn)
CREATE TABLE message_notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(10) NOT NULL,
    message_id BIGINT NOT NULL,
    type ENUM('new_message', 'reply', 'system_alert') DEFAULT 'new_message', 
    title VARCHAR(255),
    content TEXT,
    is_read BOOLEAN DEFAULT FALSE DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE
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

-- 1. Roles
INSERT INTO roles (id, name, description) VALUES
('R01', 'Admin', 'Quản trị viên hệ thống'),
('R02', 'Manager', 'Quản lý cửa hàng'),
('R03', 'Staff', 'Nhân viên bán hàng'),
('R04', 'Customer', 'Khách hàng'),
('R05', 'Shipper', 'Nhân viên giao hàng');

-- 2. Permissions
INSERT INTO permissions (id, name, description) VALUES
(1, 'view_users', 'Xem danh sách người dùng'),
(2, 'create_users', 'Tạo người dùng mới'),
(3, 'edit_users', 'Sửa thông tin người dùng'),
(4, 'delete_users', 'Xóa người dùng'),
(5, 'view_products', 'Xem sản phẩm'),
(6, 'create_products', 'Tạo sản phẩm mới'),
(7, 'edit_products', 'Sửa sản phẩm'),
(8, 'delete_products', 'Xóa sản phẩm'),
(9, 'manage_orders', 'Quản lý đơn hàng'),
(10, 'view_reports', 'Xem báo cáo doanh thu');

-- 3. Role_Per
INSERT INTO role_per (role_id, per_id) VALUES
('R01', 1), ('R01', 2), ('R01', 3), ('R01', 4),
('R01', 5), ('R01', 6), ('R01', 7), ('R01', 8),
('R02', 5), ('R02', 9),
('R03', 5), ('R03', 9),
('R04', 5), ('R05', 9);

-- 4. Users
INSERT INTO users (id, username, password_hash, email, is_active, role_id) VALUES
('U01', 'admin', '$2a$12$x1ug24gfpkce6cTQPtBXauyYswXojCsEs8O94sfFd3hE2GO0oO2C.', 'admin@store.com', 1, 'R01'),
('U02', 'manager', '$2a$12$x1ug24gfpkce6cTQPtBXauyYswXojCsEs8O94sfFd3hE2GO0oO2C.', 'manager@store.com', 1, 'R02'),
('U03', 'staff', '$2a$12$x1ug24gfpkce6cTQPtBXauyYswXojCsEs8O94sfFd3hE2GO0oO2C.', 'staff@store.com', 1, 'R03'),
('U04', 'shipper', '$2a$12$x1ug24gfpkce6cTQPtBXauyYswXojCsEs8O94sfFd3hE2GO0oO2C.', 'shipper@store.com', 1, 'R05'),
('U05', 'customer1', '$2a$12$x1ug24gfpkce6cTQPtBXauyYswXojCsEs8O94sfFd3hE2GO0oO2C.', 'tuan@gmail.com', 1, 'R04'),
('U06', 'customer2', '$2a$12$x1ug24gfpkce6cTQPtBXauyYswXojCsEs8O94sfFd3hE2GO0oO2C.', 'hoa@gmail.com', 1, 'R04'),
('U07', 'admin2', '$2a$12$x1ug24gfpkce6cTQPtBXauyYswXojCsEs8O94sfFd3hE2GO0oO2C.', 'admin.senior@store.com', 1, 'R01'),
('U08', 'manager2', '$2a$12$x1ug24gfpkce6cTQPtBXauyYswXojCsEs8O94sfFd3hE2GO0oO2C.', 'manager.store2@store.com', 1, 'R02'),
('U09', 'staff1', '$2a$12$x1ug24gfpkce6cTQPtBXauyYswXojCsEs8O94sfFd3hE2GO0oO2C.', 'staff.sales1@store.com', 1, 'R03'),
('U10', 'staff2', '$2a$12$x1ug24gfpkce6cTQPtBXauyYswXojCsEs8O94sfFd3hE2GO0oO2C.', 'staff.sales2@store.com', 1, 'R03'),
('U11', 'staff3', '$2a$12$x1ug24gfpkce6cTQPtBXauyYswXojCsEs8O94sfFd3hE2GO0oO2C.', 'staff.warehouse@store.com', 1, 'R03');

-- 5. Profiles
INSERT INTO profiles (user_id, full_name, phone, birthday, gender) VALUES
('U01', 'Quản Trị Viên', '0901111111', '1990-01-01', 'Nam'),
('U02', 'Lê Quản Lý', '0902222222', '1992-05-05', 'Nữ'),
('U03', 'Trần Nhân Viên', '0903333333', '1995-08-08', 'Nữ'),
('U05', 'Phạm Tuấn', '0905555555', '1998-10-10', 'Nam'),
('U06', 'Lê Thị Hoa', '0906666666', '1999-12-12', 'Nữ'),
('U07', 'Nguyễn Văn Sếp', '0988111000', '1985-02-15', 'Nam'),     
('U08', 'Trần Thị Quản Lý 2', '0977222111', '1992-05-20', 'Nữ'),   
('U09', 'Lê Bán Hàng A', '0966333222', '1998-09-10', 'Nam'),        
('U10', 'Phạm Bán Hàng B', '0955444333', '2000-01-05', 'Nữ'),      
('U11', 'Đỗ Thủ Kho', '0944555444', '1995-11-20', 'Nam');          

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
('U05', 'Nhà riêng', 'Phạm Tuấn', '0905555555', '123 Đường Láng', 2, 1),
('U05', 'Cơ quan', 'Phạm Tuấn', '0905555555', 'Tòa nhà FPT', 2, 0),
('U06', 'Nhà riêng', 'Lê Thị Hoa', '0906666666', '456 Lê Lợi', 3, 1),
('U06', 'Văn phòng', 'Lê Thị Hoa', '0906666666', 'Landmark 81', 4, 0),
('U01', 'Kho chính', 'Admin Kho', '0901111111', '100 Giải Phóng', 1, 1),
('U09', 'Nhà trọ', 'Lê Bán Hàng', '0966333222', 'Ngõ 50 Cầu Giấy', 2, 1),
('U10', 'Nhà riêng', 'Phạm Sale', '0955444333', 'Khu dân cư Him Lam', 3, 1),
('U07', 'Biệt thự', 'Nguyễn Sếp', '0988111000', 'Khu Ciputra', 1, 1),
('U02', 'Cửa hàng 1', 'Lê Quản Lý', '0902222222', '200 Nguyễn Trãi', 1, 1),
('U04', 'Kho giao nhận', 'Shipper', '0904444444', 'Bưu cục Quận 1', 3, 1);

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

-- 10. Product Categories 
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

-- 11. Products 
INSERT INTO products (id, name, slug, description, author, publisher, publication_year, cover_image, language, status) VALUES
(1, 'Nhà Giả Kim', 'nha-gia-kim', 'Hành trình theo đuổi ước mơ', 'Paulo Coelho', 'NXB Văn Học', 2020, NULL, 'Tiếng Việt', 1),
(2, 'Đắc Nhân Tâm', 'dac-nhan-tam', 'Nghệ thuật thu phục lòng người', 'Dale Carnegie', 'NXB Tổng Hợp', 2021, NULL, 'Tiếng Việt', 1),
(3, 'Clean Code', 'clean-code', 'Mã sạch và con đường trở thành nghệ nhân', 'Robert C. Martin', 'NXB Xây Dựng', 2019, NULL, 'Tiếng Anh', 1),
(4, 'Mắt Biếc', 'mat-biec', 'Chuyện tình thanh xuân buồn', 'Nguyễn Nhật Ánh', 'NXB Trẻ', 2018, NULL, 'Tiếng Việt', 1),
(5, 'Doraemon Tập 1', 'doraemon-1', 'Mèo máy đến từ tương lai', 'Fujiko F. Fujio', 'NXB Kim Đồng', 2022, NULL, 'Tiếng Việt', 1),
(6, 'Nguyên Lý Marketing', 'marketing-principles', 'Sách gối đầu giường dân Marketer', 'Philip Kotler', 'NXB Lao Động', 2020, NULL, 'Tiếng Việt', 1),
(7, 'Steve Jobs', 'steve-jobs', 'Tiểu sử người sáng lập Apple', 'Walter Isaacson', 'NXB Trẻ', 2017, NULL, 'Tiếng Việt', 1),
(8, 'Rừng Na Uy', 'rung-na-uy', 'Kiệt tác của Murakami', 'Haruki Murakami', 'NXB Hội Nhà Văn', 2016, NULL, 'Tiếng Việt', 1),
(9, 'Tuổi Trẻ Đáng Giá Bao Nhiêu', 'tuoi-tre-dang-gia', 'Sách kỹ năng cho giới trẻ', 'Rosie Nguyễn', 'NXB Nhã Nam', 2018, NULL, 'Tiếng Việt', 1),
(10, 'One Piece Tập 100', 'one-piece-100', 'Đảo hải tặc tập đặc biệt', 'Eiichiro Oda', 'NXB Kim Đồng', 2023, NULL, 'Tiếng Việt', 1);

-- 12. Product Details
INSERT INTO product_details (id, product_id, product_type, sku, original_price, sale_price, stock, file_url, weight, length, width, height) VALUES
(1, 1, 'Sách giấy', 'SKU01', 80000, 60000, 100, NULL, 300, 20, 13, 2),
(2, 2, 'Sách giấy', 'SKU02', 90000, 75000, 150, NULL, 350, 20, 14, 2),
(3, 3, 'Sách giấy', 'SKU03', 400000, 350000, 20, NULL, 800, 24, 18, 4),
(4, 4, 'Sách giấy', 'SKU04', 110000, 90000, 80, NULL, 250, 19, 13, 2),
(5, 5, 'Sách giấy', 'SKU05', 20000, 20000, 500, NULL, 100, 18, 11, 1),
(6, 6, 'Sách giấy', 'SKU06', 250000, 200000, 40, NULL, 900, 25, 19, 5),
(7, 7, 'Sách giấy', 'SKU07', 300000, 280000, 30, NULL, 700, 24, 16, 4),
(8, 8, 'Sách điện tử', 'SKU08-E', 50000, 40000, 9999, 'link_pdf', 0, 0, 0, 0),
(9, 9, 'Sách giấy', 'SKU09', 85000, 70000, 200, NULL, 300, 20, 13, 2),
(10, 10, 'Sách giấy', 'SKU10', 25000, 22000, 100, NULL, 150, 18, 11, 1);

-- 13. Shopping Carts
INSERT INTO shopping_carts (id, user_id, status) VALUES
(1, 'U05', 'active'),
(2, 'U06', 'active'),
(3, 'U09', 'abandoned'),
(4, 'U10', 'active'),
(5, 'U01', 'active'), 
(6, 'U02', 'checked out'),
(7, 'U05', 'checked out'),
(8, 'U06', 'abandoned'), 
(9, 'U11', 'active'),
(10, 'U07', 'active');

-- 14. Cart Items
INSERT INTO cart_items (id, cart_id, product_id, product_details_id, price_at_time) VALUES
(1, 1, 1, 1, 60000), 
(2, 1, 5, 5, 20000),
(3, 2, 3, 3, 350000),
(4, 3, 4, 4, 90000),
(5, 4, 10, 10, 22000),
(6, 5, 2, 2, 75000),
(7, 9, 6, 6, 200000),
(8, 1, 9, 9, 70000),
(9, 2, 7, 7, 280000),
(10, 10, 8, 8, 40000);


-- 15. Orders
INSERT INTO orders (id, user_id, order_code, status, total_amount, payment_method, payment_status) VALUES
(1, 'U05', 'ORD001', 'delivered', 80000, 'momo', 'paid'),
(2, 'U06', 'ORD002', 'shipped', 350000, 'cod', 'unpaid'),
(3, 'U05', 'ORD003', 'pending', 60000, 'bank_transfer', 'unpaid'),
(4, 'U09', 'ORD004', 'cancelled', 90000, 'cod', 'unpaid'),
(5, 'U10', 'ORD005', 'processing', 200000, 'credit_card', 'paid'),
(6, 'U05', 'ORD006', 'delivered', 150000, 'cod', 'paid'),
(7, 'U06', 'ORD007', 'delivered', 22000, 'momo', 'paid'),
(8, 'U11', 'ORD008', 'processing', 500000, 'bank_transfer', 'paid'),
(9, 'U05', 'ORD009', 'delivered', 280000, 'cod', 'paid'),
(10, 'U02', 'ORD010', 'pending', 40000, 'momo', 'unpaid');

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
(1, 1, 'U05', 5, 'Tuyệt vời', 'Sách nội dung rất hay, giao hàng nhanh.'),
(2, 3, 'U06', 5, 'Sách ngành IT', 'Sách Clean Code in đẹp, kiến thức bổ ích.'),
(3, 5, 'U09', 4, 'Hơi buồn', 'Truyện Mắt Biếc buồn quá, nhưng sách đẹp.'),
(4, 7, 'U05', 5, 'Đáng mua', 'Đắc Nhân Tâm là sách gối đầu giường.'),
(5, 8, 'U06', 5, 'Fan One Piece', 'Tập 100 quá chất lượng!'),
(6, 1, 'U05', 4, 'Giấy hơi mỏng', 'Nội dung ok nhưng giấy hơi mỏng.'),
(7, 6, 'U10', 5, 'Marketing', 'Kiến thức nền tảng tốt.'),
(8, 9, 'U11', 5, 'Sách dày', 'Đóng gói cẩn thận, sách tiểu sử rất hay.'),
(9, 2, 'U05', 3, 'Truyện trẻ con', 'Mua tặng cháu, không đọc nên không rõ.'),
(10, 4, 'U05', 5, 'Mua tặng', 'Mua lần 2 để tặng bạn.');

-- 18. Order Notifications
INSERT INTO order_notifications (id, user_id, order_id, type, title, content, is_read) VALUES
(1, 'U05', 1, 'status_change', 'Giao thành công', 'Đơn hàng đã giao thành công', 1),
(2, 'U06', 2, 'status_change', 'Đang vận chuyển', 'Đơn hàng  đang trên đường đến', 0),
(3, 'U05', 3, 'payment', 'Chờ thanh toán', 'Vui lòng thanh toán đơn hàng', 0),
(4, 'U09', 4, 'other', 'Đã hủy', 'Đơn hàng  đã hủy', 1),
(5, 'U10', 5, 'status_change', 'Đang xử lý', 'Shop đang đóng gói đơn ', 0),
(6, 'U05', 6, 'status_change', 'Giao thành công', 'Đơn  đã giao', 1),
(7, 'U06', 7, 'payment', 'Thanh toán thành công', 'Đã nhận tiền đơn ', 1),
(8, 'U11', 8, 'status_change', 'Đang xử lý', 'Đơn đang xử lý', 0),
(9, 'U05', 9, 'status_change', 'Giao thành công', 'Đơn  đã giao', 1),
(10, 'U02', 10, 'payment', 'Chờ thanh toán', 'Đơn  chưa thanh toán', 0);

-- 19. Product Notifications
INSERT INTO product_notifications (id, user_id, product_id, type, title, content, is_read) VALUES
(1, 'U05', 1, 'price_drop', 'Sách giảm giá', 'Nhà Giả Kim đang giảm 20%', 0),
(2, 'U06', 3, 'restock', 'Có hàng lại', 'Clean Code đã có hàng', 1),
(3, 'U05', 5, 'promotion', 'Tặng kèm', 'Mua Doraemon tặng bookmark', 0),
(4, 'U09', 4, 'price_drop', 'Flash Sale', 'Mắt Biếc giá sốc', 0),
(5, 'U10', 6, 'restock', 'Sách mới về', 'Nguyên lý Marketing đã về kho', 1),
(6, 'U06', 10, 'promotion', 'Pre-order', 'Đặt trước One Piece tập mới', 1),
(7, 'U11', 7, 'price_drop', 'Giảm giá sâu', 'Steve Jobs giảm 30%', 0),
(8, 'U05', 2, 'promotion', 'Combo', 'Mua Đắc Nhân Tâm giảm giá sách khác', 0),
(9, 'U07', 8, 'restock', 'Restock', 'Rừng Na Uy đã có lại', 1),
(10, 'U01', 9, 'other', 'Cập nhật', 'Sách cập nhật bìa mới', 1);

-- 20. User Notifications
INSERT INTO user_notifications (id, user_id, type, title, content, is_read) VALUES
(1, 'U05', 'system', 'Bảo trì', 'Hệ thống bảo trì lúc 0h', 1),
(2, 'U06', 'promotion', 'Sinh nhật', 'Chúc mừng sinh nhật nhận voucher 50k', 0),
(3, 'U09', 'account', 'Đổi mật khẩu', 'Bạn vừa đổi mật khẩu thành công', 1),
(4, 'U05', 'promotion', 'Sale 11/11', 'Săn sale ngày đôi', 0),
(5, 'U10', 'system', 'Cập nhật', 'Điều khoản sử dụng mới', 1),
(6, 'U11', 'account', 'Đăng nhập lạ', 'Có thiết bị lạ đăng nhập', 0),
(7, 'U01', 'system', 'Báo cáo', 'Báo cáo doanh thu tháng đã có', 1),
(8, 'U02', 'system', 'Kho hàng', 'Sắp hết hàng một số mã', 0),
(9, 'U05', 'promotion', 'Black Friday', 'Siêu sale thứ 6 đen tối', 0),
(10, 'U06', 'account', 'Xác thực', 'Vui lòng xác thực email', 1);

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

-- 22. Messages
INSERT INTO messages (sender_id, receiver_id, product_id, order_item_id, message, is_read) VALUES
('U05', 'U01', 1, NULL, 'Sách Nhà Giả Kim còn bản bìa cứng không shop?', 0),
('U01', 'U05', 1, NULL, 'Dạ hiện tại bên em chỉ còn bản bìa mềm ạ.', 0), 
('U06', 'U02', NULL, 3, 'Đơn hàng Clean Code của mình bao giờ giao tới ạ?', 1), 
('U02', 'U06', NULL, 3, 'Shipper đang trên đường giao rồi bạn nhé.', 1),
('U05', 'U03', 5, NULL, 'Truyện Doraemon này là bản in năm bao nhiêu?', 0),
('U03', 'U05', 5, NULL, 'Bản tái bản mới nhất 2022 ạ.', 1),
('U10', 'U01', NULL, NULL, 'Shop có tuyển cộng tác viên không?', 0),
('U09', 'U01', NULL, NULL, 'Sách bị lỗi in ấn đổi trả thế nào?', 0),
('U01', 'U09', NULL, NULL, 'Bạn vui lòng gửi ảnh chụp trang lỗi qua đây nhé.', 1),
('U05', 'U04', NULL, NULL, 'Anh shipper ơi em đổi địa chỉ nhận hàng chút được không?', 1);

-- 23. Message Notifications
INSERT INTO message_notifications (user_id, message_id, type, title, content, is_read) VALUES
('U01', 1, 'new_message', 'Tin nhắn mới từ Phạm Tuấn', 'Sách Nhà Giả Kim còn bản bìa cứng...', 0),
('U05', 2, 'reply', 'Phản hồi từ Admin', 'Dạ hiện tại bên em chỉ còn bản bìa...', 0),
('U02', 3, 'new_message', 'Tin nhắn mới từ Lê Thị Hoa', 'Đơn hàng Clean Code của mình bao giờ...', 1),
('U06', 4, 'reply', 'Phản hồi từ  Quản Lý', 'Shipper đang trên đường giao rồi...', 1),
('U03', 5, 'new_message', 'Hỏi về sản phẩm', 'Truyện Doraemon này là bản in năm...', 0),
('U01', 7, 'new_message', 'Câu hỏi chung', 'Shop có tuyển cộng tác viên không?', 0),
('U01', 8, 'new_message', 'Yêu cầu hỗ trợ', 'Sách bị lỗi in ấn đổi trả thế nào?', 0),
('U09', 9, 'reply', 'Hỗ trợ đổi trả', 'Bạn vui lòng gửi ảnh chụp trang lỗi...', 1),
('U04', 10, 'new_message', 'Tin nhắn từ khách hàng', 'Anh shipper ơi em đổi địa chỉ...', 1),
('U05', 6, 'reply', 'Phản hồi sản phẩm', 'Bản tái bản mới nhất 2022 ạ.', 1);

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
INSERT INTO weight_fees (min_weight, max_weight, multiplier) VALUES
(0, 1, 1.00),
(1.01, 5, 1.50),
(5.01, 10, 2.00),
(10.01, 20, 2.50);

-- 2. Distance Fees
INSERT INTO distance_fees (min_distance, max_distance, multiplier) VALUES
(0, 5, 1.00),
(5.01, 20, 1.20),
(20.01, 50, 1.50),
(50.01, 100, 2.00);

-- 3. Shipping Type Fees
INSERT INTO shipping_type_fees (shipping_type, multiplier) VALUES
('standard', 1.00),
('express', 1.50),
('cod', 1.10);

-- 4. Order Product Discounts
INSERT INTO order_product_discounts (type, amount) VALUES
('promo_code', 10000),
('member_discount', 5000),
('voucher', 20000);

-- 5. Order Shipping Discounts
INSERT INTO order_shipping_discounts (type, amount) VALUES
('promo_code', 5000),
('member_discount', 3000),
('voucher', 10000);

-- 6. Order Shipping Fee Details (giả sử order_id 1, 2)
INSERT INTO order_shipping_fee_details (order_id, weight_fee_id, distance_fee_id, shipping_type_fee_id, amount) VALUES
(1, 1, 1, 1, 5000),
(2, 2, 2, 2, 12000);

-- 7. Order Discount Details
INSERT INTO order_discount_details (order_id, product_discount_id, shipping_discount_id, amount) VALUES
(1, 1, 1, 15000),
(2, 2, NULL, 5000),
(3, NULL, 2, 3000);

SET FOREIGN_KEY_CHECKS = 1;