-- Disable foreign key checks for bulk import
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Products
DROP TABLE IF EXISTS products;
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    images JSON COMMENT 'Stores array of image filenames',
    status ENUM('active', 'inactive') DEFAULT 'active',
    material VARCHAR(255),
    part_tone VARCHAR(255),
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Variants
DROP TABLE IF EXISTS variants;
CREATE TABLE variants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    sku VARCHAR(100) NOT NULL COMMENT 'Unique SKU',
    option_name VARCHAR(100),
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    default_cost DECIMAL(10, 2) DEFAULT 0.00,
    stock_qty INT DEFAULT 0,
    is_bundle BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
CREATE INDEX idx_sku ON variants(sku);

-- 3. Bundle Mapping
DROP TABLE IF EXISTS bundle_mapping;
CREATE TABLE bundle_mapping (
    id INT AUTO_INCREMENT PRIMARY KEY,
    parent_variant_id INT NOT NULL,
    child_variant_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    FOREIGN KEY (parent_variant_id) REFERENCES variants(id) ON DELETE CASCADE,
    FOREIGN KEY (child_variant_id) REFERENCES variants(id) ON DELETE CASCADE
);

-- 4. Stock Requests
DROP TABLE IF EXISTS stock_requests;
CREATE TABLE stock_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_no VARCHAR(50) NOT NULL UNIQUE,
    requester_name VARCHAR(100),
    note TEXT,
    status ENUM('pending','waiting_for_approve','approved', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP NULL
);

-- 5. Stock Request Items
DROP TABLE IF EXISTS stock_request_items;
CREATE TABLE stock_request_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT NOT NULL,
    variant_id INT NOT NULL,
    quantity INT NOT NULL,
    cost_per_unit DECIMAL(10, 2) DEFAULT 0.00,
    FOREIGN KEY (request_id) REFERENCES stock_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (variant_id) REFERENCES variants(id)
);

-- 6. Stock Logs
DROP TABLE IF EXISTS stock_logs;
CREATE TABLE stock_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    variant_id INT NOT NULL,
    quantity INT NOT NULL,
    type VARCHAR(20) NOT NULL DEFAULT 'IN',
    note VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (variant_id) REFERENCES variants(id) ON DELETE CASCADE
);

SET FOREIGN_KEY_CHECKS = 1;
