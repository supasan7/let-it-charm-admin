const db = require('../config/db');

async function addCostColumnToStockLogs() {
    try {
        const connection = await db.getConnection();
        console.log("Connected to database...");

        // Add cost column DECIMAL(10,2)
        console.log("Adding cost column to stock_logs...");

        // Check if column exists first to avoid error? Or just try ADD COLUMN IF NOT EXISTS syntax (Mariadb/Mysql 8)
        // Or catch error. Let's try simple ADD COLUMN and catch 'Duplicate column name' error if any.
        try {
            await connection.query("ALTER TABLE stock_logs ADD COLUMN cost DECIMAL(10,2) DEFAULT 0 AFTER quantity");
            console.log("Successfully added 'cost' column.");
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log("Column 'cost' already exists.");
            } else {
                throw err;
            }
        }

        connection.release();
        process.exit(0);
    } catch (error) {
        console.error("Error updating table schema:", error);
        process.exit(1);
    }
}

addCostColumnToStockLogs();
