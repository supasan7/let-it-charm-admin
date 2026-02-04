const db = require('../config/db');

async function migrate() {
    const connection = await db.getConnection();
    try {
        console.log('Migrating stock requests tables...');

        // 4. Stock Requests
        await connection.query(`
            CREATE TABLE IF NOT EXISTS stock_requests (
                id INT AUTO_INCREMENT PRIMARY KEY,
                request_no VARCHAR(50) NOT NULL UNIQUE COMMENT 'เลขที่เอกสารการรับของ',
                requester_name VARCHAR(100) COMMENT 'ชื่อพนักงานที่ทำรายการ',
                note TEXT COMMENT 'หมายเหตุเพิ่มเติม',
                status ENUM('pending', 'approved', 'cancelled') DEFAULT 'pending' COMMENT 'สถานะการอนุมัติ',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                approved_at TIMESTAMP NULL COMMENT 'วันที่แอดมินกดอนุมัติ'
            )
        `);
        console.log('Verified stock_requests table.');

        // 5. Stock Request Items
        await connection.query(`
            CREATE TABLE IF NOT EXISTS stock_request_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                request_id INT NOT NULL,
                variant_id INT NOT NULL,
                quantity INT NOT NULL COMMENT 'จำนวนที่พนักงานนับได้',
                cost_per_unit DECIMAL(10, 2) DEFAULT 0.00 COMMENT 'ต้นทุนต่อหน่วย (ระบบดึงมา Auto แอดมินแก้ได้)',
                FOREIGN KEY (request_id) REFERENCES stock_requests(id) ON DELETE CASCADE,
                FOREIGN KEY (variant_id) REFERENCES variants(id)
            )
        `);
        console.log('Verified stock_request_items table.');

        console.log('Migration completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    } finally {
        if (connection) connection.release();
    }
}

migrate();
