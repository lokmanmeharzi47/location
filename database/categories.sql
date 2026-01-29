-- ============================================
-- Categories Table for Dashboard
-- Run this after dashboard_db.sql
-- ============================================

USE dashboard_db;

-- ============================================
-- Categories Table
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    image_path VARCHAR(500),
    href VARCHAR(255),
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_slug (slug),
    INDEX idx_active (is_active),
    INDEX idx_order (display_order)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Insert default categories
INSERT INTO
    categories (
        name,
        slug,
        description,
        image_path,
        href,
        display_order
    )
VALUES (
        'فساتين',
        'dresses',
        'اكتشفي تشكيلتنا الراقية من الفساتين الأنيقة، مصممة لتبرز جمالك في كل مناسبة.',
        '/images/t-shirtcat.jpg',
        '/design/dresses',
        1
    ),
    (
        'بلايز نسائية',
        'tops',
        'بلايز عصرية بتصاميم أنثوية ناعمة، مثالية للإطلالات اليومية والمميزة.',
        '/images/hoodiecat.jpg',
        '/design/tops',
        2
    ),
    (
        'أطقم نسائية',
        'sets',
        'أطقم متناسقة تجمع بين الأناقة والراحة، لإطلالة متكاملة تعكس ذوقك الرفيع.',
        '/images/sweet-shirtcat.jpg',
        '/design/sets',
        3
    ),
    (
        'كنزات ناعمة',
        'sweaters',
        'كنزات دافئة بملمس ناعم وتطريز أنيق، لأيام الشتاء الباردة.',
        '/images/sweet-shirtct.jpg',
        '/design/sweaters',
        4
    )
ON DUPLICATE KEY UPDATE
    name = VALUES(name);