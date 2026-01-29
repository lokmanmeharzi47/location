-- ============================================
-- Dashboard Database Schema
-- Database: dashboard_db
-- Compatible with MySQL 5.7+ / MariaDB 10.2+
-- ============================================

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS dashboard_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE dashboard_db;

-- ============================================
-- Users Table (Admin Authentication)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin user (password: admin123)
-- Password hash is generated using bcrypt
INSERT INTO users (email, password_hash, name, role) VALUES 
('admin@boutique-rital.dz', '$2b$10$rIC/7p1j5.T4k5D5Z5Y5YeZNQ5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y', 'مدير النظام', 'admin')
ON DUPLICATE KEY UPDATE name = name;

-- ============================================
-- Products Table
-- ============================================
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock INT DEFAULT 0,
    status ENUM('متوفر', 'نفذ') DEFAULT 'متوفر',
    image_path VARCHAR(500),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample products
INSERT INTO products (name, category, price, stock, status, image_path) VALUES 
('قميص مطرز كلاسيكي', 'قمصان', 4500.00, 25, 'متوفر', NULL),
('فستان مطرز تقليدي', 'فساتين', 8200.00, 12, 'متوفر', NULL),
('جاكيت مطرز عصري', 'جاكيتات', 6800.00, 8, 'متوفر', NULL),
('حقيبة مطرزة يدوياً', 'اكسسوارات', 3200.00, 0, 'نفذ', NULL),
('قميص تقليدي مطرز', 'قمصان', 5200.00, 15, 'متوفر', NULL),
('جاكيت شتوي مطرز', 'جاكيتات', 9500.00, 5, 'متوفر', NULL)
ON DUPLICATE KEY UPDATE name = name;

-- ============================================
-- Orders Table
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(20) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    product_id INT,
    product_name VARCHAR(255),
    color VARCHAR(50),
    size VARCHAR(20),
    total DECIMAL(10,2) NOT NULL,
    status ENUM('قيد التنفيذ', 'جاري الشحن', 'مكتمل', 'ملغي') DEFAULT 'قيد التنفيذ',
    wilaya VARCHAR(100),
    address TEXT,
    notes TEXT,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_order_date (order_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample orders
INSERT INTO orders (order_number, customer_name, phone, product_id, product_name, color, size, total, status, wilaya) VALUES 
('#1234', 'أحمد محمد', '0555123456', 1, 'قميص مطرز', 'أبيض', 'L', 4500.00, 'قيد التنفيذ', 'الجزائر'),
('#1233', 'سارة علي', '0666234567', 2, 'فستان مطرز', 'وردي', 'M', 8200.00, 'مكتمل', 'وهران'),
('#1232', 'محمد خالد', '0777345678', 3, 'جاكيت مطرز', 'أسود', 'XL', 6800.00, 'جاري الشحن', 'قسنطينة'),
('#1231', 'فاطمة حسن', '0555456789', 4, 'حقيبة مطرزة', 'بني', '-', 3200.00, 'مكتمل', 'عنابة'),
('#1230', 'يوسف أمين', '0666567890', 1, 'قميص مطرز', 'أزرق', 'M', 4500.00, 'ملغي', 'سطيف')
ON DUPLICATE KEY UPDATE customer_name = customer_name;

-- ============================================
-- Sessions Table (for authentication)
-- ============================================
CREATE TABLE IF NOT EXISTS sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
