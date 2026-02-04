const db = require('../config/db');

async function runMigration() {
    const connection = await db.getConnection();
    try {
        console.log("Starting migration...");

        // 1. Add material to products
        try {
            await connection.query(`ALTER TABLE products ADD COLUMN material VARCHAR(50) DEFAULT NULL`);
            console.log("SUCCESS: Added 'material' column to products");
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log("SKIPPED: 'material' column already exists");
            } else {
                console.error("ERROR adding 'material':", e.message);
            }
        }

        // 2. Add part_tone to products
        try {
            await connection.query(`ALTER TABLE products ADD COLUMN part_tone VARCHAR(50) DEFAULT NULL`);
            console.log("SUCCESS: Added 'part_tone' column to products");
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log("SKIPPED: 'part_tone' column already exists");
            } else {
                console.error("ERROR adding 'part_tone':", e.message);
            }
        }

        // 3. Ensure default_cost exists in variants
        try {
            await connection.query(`ALTER TABLE variants ADD COLUMN default_cost DECIMAL(10,2) DEFAULT 0`);
            console.log("SUCCESS: Added 'default_cost' column to variants");
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log("SKIPPED: 'default_cost' column already exists in variants");
            } else {
                console.error("ERROR adding 'default_cost':", e.message);
            }
        }

        console.log("Migration completed.");

    } catch (error) {
        console.error("Migration fatal error:", error);
    } finally {
        connection.release();
        process.exit();
    }
}

runMigration();
