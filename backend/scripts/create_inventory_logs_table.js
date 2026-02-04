
const db = require('../config/db');

async function createTable() {
    try {
        const connection = await db.getConnection();
        console.log("Connected to database...");

        await connection.query(`
            CREATE TABLE IF NOT EXISTS inventory_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                variant_id INT NOT NULL,
                quantity INT NOT NULL COMMENT 'Change amount (+/-)',
                type ENUM('IN', 'OUT') DEFAULT 'IN',
                note VARCHAR(255) COMMENT 'Reason or Context',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (variant_id) REFERENCES variants(id) ON DELETE CASCADE
            )
        `);

        console.log("Table 'inventory_logs' created successfully.");
        connection.release();
        process.exit(0);
    } catch (error) {
        console.error("Error creating table:", error);
        process.exit(1);
    }
}

createTable();
