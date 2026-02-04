
const db = require('../config/db');

async function renameTable() {
    try {
        const connection = await db.getConnection();
        console.log("Connected to database...");

        // Check if stock_logs already exists
        const [rows] = await connection.query("SHOW TABLES LIKE 'stock_logs'");
        if (rows.length > 0) {
            console.log("Table 'stock_logs' already exists.");
        } else {
            // Check if inventory_logs exists
            const [rowsInv] = await connection.query("SHOW TABLES LIKE 'inventory_logs'");
            if (rowsInv.length > 0) {
                await connection.query("RENAME TABLE inventory_logs TO stock_logs");
                console.log("Table renamed from 'inventory_logs' to 'stock_logs' successfully.");
            } else {
                console.log("Table 'inventory_logs' does not exist. Creating 'stock_logs' directly...");
                await connection.query(`
                    CREATE TABLE IF NOT EXISTS stock_logs (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        variant_id INT NOT NULL,
                        quantity INT NOT NULL COMMENT 'Change amount (+/-)',
                        type ENUM('IN', 'OUT') DEFAULT 'IN',
                        note VARCHAR(255) COMMENT 'Reason or Context',
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (variant_id) REFERENCES variants(id) ON DELETE CASCADE
                    )
                `);
                console.log("Table 'stock_logs' created.");
            }
        }

        connection.release();
        process.exit(0);
    } catch (error) {
        console.error("Error renaming/creating table:", error);
        process.exit(1);
    }
}

renameTable();
