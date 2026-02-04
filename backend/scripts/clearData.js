require('dotenv').config();
const db = require('../config/db');

const clearData = async () => {
    const connection = await db.getConnection();
    try {
        console.log('Starting data cleanup...');

        await connection.query('SET FOREIGN_KEY_CHECKS = 0');

        console.log('Truncating stock_request_items...');
        await connection.query('TRUNCATE TABLE stock_request_items');

        console.log('Truncating stock_requests...');
        await connection.query('TRUNCATE TABLE stock_requests');

        console.log('Truncating variants...');
        await connection.query('TRUNCATE TABLE variants');

        console.log('Truncating products...');
        await connection.query('TRUNCATE TABLE products');

        await connection.query('SET FOREIGN_KEY_CHECKS = 1');

        console.log('✅ All data cleared successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error clearing data:', error);
        process.exit(1);
    } finally {
        connection.release();
    }
};

clearData();
