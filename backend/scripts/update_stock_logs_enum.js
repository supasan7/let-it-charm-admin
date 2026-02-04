const db = require('../config/db');

async function updateStockLogsSchema() {
    try {
        const connection = await db.getConnection();
        console.log("Connected to database...");

        // Modify column to VARCHAR(20) to support ADJUST, RETURN, etc.
        console.log("Modifying stock_logs.type column to VARCHAR(20)...");
        await connection.query("ALTER TABLE stock_logs MODIFY COLUMN type VARCHAR(20) NOT NULL DEFAULT 'IN'");

        console.log("Successfully updated stock_logs table schema.");

        connection.release();
        process.exit(0);
    } catch (error) {
        console.error("Error updating table schema:", error);
        process.exit(1);
    }
}

updateStockLogsSchema();
