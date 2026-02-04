const db = require('../config/db');

class ProductService {
    async createProduct(data) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const { title, description, category, images, status, variants, material, part_tone } = data;

            // 1. Insert into products table
            const [productResult] = await connection.query(
                `INSERT INTO products (title, description, category, images, status, material, part_tone) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [title, description, category, JSON.stringify(images || []), status || 'active', material || null, part_tone || null]
            );
            const productId = productResult.insertId;

            // 2. Insert into variants table
            const insertedVariantIds = [];
            if (variants && variants.length > 0) {
                for (const v of variants) {
                    const [variantResult] = await connection.query(
                        `INSERT INTO variants (product_id, sku, option_name, price, default_cost, stock_qty, is_bundle) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                        [productId, v.sku, v.option_name, v.price, v.default_cost || 0, v.stock_qty || 0, v.is_bundle ? 1 : 0]
                    );
                    insertedVariantIds.push({
                        variantId: variantResult.insertId,
                        qty: v.stock_qty || 0,
                        cost: v.default_cost || 0,
                        is_bundle: v.is_bundle // Pass this flag through
                    });
                }
            }

            // 3. (Replaced) Create Inventory Logs for initial stock
            const variantsForStockRequest = insertedVariantIds.filter(v => !v.is_bundle);
            for (const item of variantsForStockRequest) {
                if (item.qty > 0) {
                    await connection.query(
                        `INSERT INTO stock_logs (variant_id, quantity, type, note) VALUES (?, ?, ?, ?)`,
                        [item.variantId, item.qty, 'IN', `เพิ่มสินค้าครั้งแรก: ${title}`]
                    );
                }
            }

            await connection.commit();

            // Fetch the complete product with variants to return
            const [rows] = await connection.query(`SELECT * FROM products WHERE id = ?`, [productId]);
            const product = rows[0];

            const [variantRows] = await connection.query(`SELECT * FROM variants WHERE product_id = ?`, [productId]);
            product.variants = variantRows;

            // Parse images if it's a string (from JSON column)
            if (typeof product.images === 'string') {
                try {
                    product.images = JSON.parse(product.images);
                } catch (e) { product.images = []; }
            }

            return product;

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async getAllProducts(filters = {}, page = 1, limit = 1000) {
        const connection = await db.getConnection();
        try {
            const offset = (page - 1) * limit;

            // Use subquery for stock sorting
            let baseSelect = `
                SELECT p.*, 
                COALESCE((SELECT SUM(stock_qty) FROM variants WHERE product_id = p.id), 0) as computed_curr_stock
                FROM products p
            `;

            // For count query, we don't need the computed column in the select, 
            // but we need the same WHERE clauses.
            // Actually, we can just build the WHERE independent of SELECT.

            let whereClauses = [];
            let params = [];

            if (filters.search) {
                whereClauses.push(`(p.title LIKE ? OR p.id IN (SELECT product_id FROM variants WHERE sku LIKE ?))`);
                params.push(`%${filters.search}%`, `%${filters.search}%`);
            }

            if (filters.category) {
                whereClauses.push(`p.category = ?`);
                params.push(filters.category);
            }

            if (filters.status) {
                if (filters.status === 'active' || filters.status === 'inactive') {
                    whereClauses.push(`p.status = ?`);
                    params.push(filters.status);
                }
            }

            let whereSql = '';
            if (whereClauses.length > 0) {
                whereSql = ` WHERE ` + whereClauses.join(' AND ');
            }

            // 1. Get Total Count
            const [countResult] = await connection.query(`SELECT COUNT(*) as total FROM products p ${whereSql}`, params);
            const total = countResult[0].total;

            // 2. Prepare Sort
            // Defaults to created_at DESC
            let orderBy = `ORDER BY p.created_at DESC`;

            if (filters.sort === 'stock_desc') {
                orderBy = `ORDER BY computed_curr_stock DESC`;
            } else if (filters.sort === 'stock_asc') {
                orderBy = `ORDER BY computed_curr_stock ASC`;
            } else if (filters.sort === 'oldest') {
                orderBy = `ORDER BY p.created_at ASC`;
            }

            const query = `${baseSelect} ${whereSql} ${orderBy} LIMIT ? OFFSET ?`;

            const [products] = await connection.query(query, [...params, Number(limit), Number(offset)]);

            // Fetch variants for these products
            if (products.length > 0) {
                const productIds = products.map(p => p.id);
                const [variants] = await connection.query(`SELECT * FROM variants WHERE product_id IN (?)`, [productIds]);

                products.forEach(p => {
                    p.variants = variants.filter(v => v.product_id === p.id);

                    if (typeof p.images === 'string') {
                        try {
                            p.images = JSON.parse(p.images);
                        } catch (e) { p.images = []; }
                    }

                    // Use the computed stock or re-sum (re-summing is safer if variants data is fresher, but they are same transaction content usually)
                    // We can just keep existing reduce logic to be consistent with object structure
                    p.stock = p.variants.reduce((sum, v) => sum + (v.stock_qty || 0), 0);

                    if (!p.type) {
                        if (p.variants.some(v => v.is_bundle)) p.type = 'bundle';
                        else if (p.variants.length > 1) p.type = 'variant';
                        else p.type = 'single';
                    }
                });
            }

            return { products, total };

        } catch (error) {
            throw error;
        } finally {
            connection.release();
        }
    }

    async createStockRequest(items, requesterName = 'Staff', note = '') {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            const randomSuffix = Math.floor(1000 + Math.random() * 9000);
            const requestNo = `STOCKIN-${dateStr}-${randomSuffix}`;

            // 1. Process Items: Update Stock Directly
            for (const item of items) {
                // Find Variant ID by SKU
                const [variantRows] = await connection.query(`SELECT id, default_cost FROM variants WHERE sku = ?`, [item.sku]);

                if (variantRows.length === 0) {
                    throw new Error(`Product with SKU ${item.sku} not found`);
                }
                const variant = variantRows[0];

                // Update Variant Stock and Cost
                // Use the new cost as default_cost if provided (and > 0), otherwise keep existing or ignore?
                // Usually receiving stock updates the cost price to the latest lot.
                const newCost = item.cost > 0 ? item.cost : variant.default_cost;

                await connection.query(
                    `UPDATE variants SET stock_qty = stock_qty + ?, default_cost = ? WHERE id = ?`,
                    [item.qty, newCost, variant.id]
                );

                // Insert into stock_logs
                // Use specific item note if available, otherwise use global note
                const logNote = item.note
                    ? `เติมสินค้าเข้าคลัง: ${item.note}`
                    : note;

                await connection.query(
                    `INSERT INTO stock_logs (variant_id, quantity, type, note) VALUES (?, ?, ?, ?)`,
                    [variant.id, item.qty, 'IN', logNote]
                );
            }

            // We return the requestNo just for frontend compatibility (to show success message).
            // const requestNo = `STOCK-UPDATED-${Date.now()}`; // Removed redeclaration

            await connection.commit();
            return { requestNo };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }







    async getRecentStockItems(limit = 5) {
        const connection = await db.getConnection();
        try {
            // Join stock_logs with variants and products
            // Removed WHERE type='IN' to show all history as requested
            const [rows] = await connection.query(`
                SELECT 
                    l.id, 
                    l.quantity, 
                    l.type,
                    l.note,
                    l.created_at,
                    v.sku,
                    v.option_name,
                    v.price as selling_price,
                    p.title,
                    p.images
                FROM stock_logs l
                JOIN variants v ON l.variant_id = v.id
                JOIN products p ON v.product_id = p.id
                ORDER BY l.created_at DESC
                LIMIT ?
            `, [Number(limit)]);

            // Parse images
            rows.forEach(item => {
                if (typeof item.images === 'string') {
                    try {
                        item.images = JSON.parse(item.images);
                    } catch (e) { item.images = []; }
                }
            });

            return rows;
        } catch (error) {
            throw error;
        } finally {
            connection.release();
        }
    }

    async getDashboardStats() {
        const connection = await db.getConnection();
        try {
            // 1. Total Cost Value (Stock * Cost)
            // Assuming default_cost exists in variants
            const [costResult] = await connection.query(`
                SELECT SUM(stock_qty * default_cost) as total_cost FROM variants
            `);
            const totalCost = costResult[0].total_cost || 0;

            // 2. Total Products (Count)
            const [prodResult] = await connection.query(`SELECT COUNT(*) as count FROM products`);
            const totalProducts = prodResult[0].count;

            // 3. New Products Today
            const [newResult] = await connection.query(`
                SELECT COUNT(*) as count FROM products 
                WHERE DATE(created_at) = CURDATE()
            `);
            const newProductsToday = newResult[0].count;

            // 4. Low Stock Variants (e.g. < 5)
            const [lowResult] = await connection.query(`
                SELECT COUNT(*) as count FROM variants WHERE stock_qty <= 5
            `);
            const lowStock = lowResult[0].count;

            return {
                totalCost,
                totalProducts,
                newProductsToday,
                lowStock
            };

        } catch (error) {
            throw error;
        } finally {
            connection.release();
        }
    }

    async getStockLogs(filters = {}, page = 1, limit = 50) {
        const connection = await db.getConnection();
        try {
            const offset = (page - 1) * limit;
            let whereClauses = [];
            let params = [];

            // Base query join
            let baseQuery = `
                FROM stock_logs l
                JOIN variants v ON l.variant_id = v.id
                JOIN products p ON v.product_id = p.id
            `;

            // Filter by Search (Product Title, SKU, or Note/Ref)
            if (filters.search) {
                whereClauses.push(`(
                    p.title LIKE ? OR 
                    v.sku LIKE ? OR 
                    l.note LIKE ?
                )`);
                params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
            }

            // Filter by Type
            if (filters.type && filters.type !== 'all') {
                if (filters.type.toLowerCase() === 'adjust') {
                    whereClauses.push(`(l.type = 'ADJUST_ADD' OR l.type = 'ADJUST_SUB')`);
                } else {
                    whereClauses.push(`l.type = ?`);
                    params.push(filters.type.toUpperCase());
                }
            }

            // Filter by Date Range
            if (filters.startDate) {
                whereClauses.push(`l.created_at >= ?`);
                params.push(filters.startDate + ' 00:00:00');
            }
            if (filters.endDate) {
                whereClauses.push(`l.created_at <= ?`);
                params.push(filters.endDate + ' 23:59:59');
            }

            // Construct WHERE
            if (whereClauses.length > 0) {
                baseQuery += ` WHERE ` + whereClauses.join(' AND ');
            }

            // 1. Count Total
            const [countResult] = await connection.query(`SELECT COUNT(*) as total ${baseQuery}`, params);
            const total = countResult[0].total;

            // 2. Fetch Data
            const query = `
                SELECT 
                    l.*,
                    v.sku, 
                    v.option_name,
                    p.title, 
                    p.images
                ${baseQuery}
                ORDER BY l.created_at DESC
                LIMIT ? OFFSET ?
            `;

            const [logs] = await connection.query(query, [...params, Number(limit), Number(offset)]);

            // Parse images
            logs.forEach(log => {
                if (typeof log.images === 'string') {
                    try {
                        log.images = JSON.parse(log.images);
                    } catch (e) { log.images = []; }
                }
            });

            return { logs, total };

        } catch (error) {
            throw error;
        } finally {
            connection.release();
        }
    }

    async getStockStats(filters = {}) {
        const connection = await db.getConnection();
        try {
            let whereClauses = [];
            let params = [];

            let query = `
                SELECT 
                    SUM(CASE WHEN type = 'IN' THEN quantity ELSE 0 END) as total_in,
                    SUM(CASE WHEN type = 'OUT' THEN quantity ELSE 0 END) as total_out,
                    SUM(CASE WHEN type = 'ADJUST_ADD' THEN quantity ELSE 0 END) as total_adjust_add,
                    SUM(CASE WHEN type = 'ADJUST_SUB' THEN quantity ELSE 0 END) as total_adjust_sub,
                    SUM(CASE WHEN type = 'RETURN' THEN quantity ELSE 0 END) as total_return
                FROM stock_logs
            `;

            // Date Range Filter (Reusing similar logic)
            if (filters.startDate) {
                whereClauses.push(`created_at >= ?`);
                params.push(filters.startDate + ' 00:00:00');
            }
            if (filters.endDate) {
                whereClauses.push(`created_at <= ?`);
                params.push(filters.endDate + ' 23:59:59');
            }

            if (whereClauses.length > 0) {
                query += ` WHERE ` + whereClauses.join(' AND ');
            }

            const [result] = await connection.query(query, params);
            const stats = result[0] || {};

            const totalIn = Number(stats.total_in || 0);
            const totalOut = Number(stats.total_out || 0);
            const totalReturn = Number(stats.total_return || 0);
            const totalAdjustAdd = Number(stats.total_adjust_add || 0);
            const totalAdjustSub = Number(stats.total_adjust_sub || 0);

            // Net Change = (In + Return + Adjust Add) - (Out + Adjust Sub)
            const netChange = (totalIn + totalReturn + totalAdjustAdd) - (totalOut + totalAdjustSub);

            return {
                in: totalIn + totalAdjustAdd, // Combine for display? Or keep separate? Let's combine "Incoming Flow"
                out: totalOut + totalAdjustSub, // Combine "Outgoing Flow"
                net: netChange
            };

        } catch (error) {
            throw error;
        } finally {
            connection.release();
        }
    }

    async updateProduct(id, data) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // 1. Update Product Info
            let updateQuery = `UPDATE products SET title = ?, category = ?, status = ?, description = ?, material = ?, part_tone = ?`;
            let params = [data.title, data.category, data.status, data.description || '', data.material || null, data.part_tone || null];

            if (data.images) {
                updateQuery += `, images = ?`;
                params.push(JSON.stringify(data.images));
            }

            updateQuery += ` WHERE id = ?`;
            params.push(id);

            await connection.query(updateQuery, params);

            // 2. Handle Variants
            if (data.variants && Array.isArray(data.variants)) {
                // Get existing IDs from DB to know what to delete
                const [existingRows] = await connection.query(`SELECT id, stock_qty FROM variants WHERE product_id = ?`, [id]);
                const existingMap = new Map(existingRows.map(r => [r.id, r]));
                const existingIds = existingRows.map(r => r.id);

                // IDs present in the payload (for updating)
                const incomingIds = data.variants.filter(v => v.id).map(v => v.id);

                // Identify IDs to delete (exist in DB but not in payload)
                const idsToDelete = existingIds.filter(eid => !incomingIds.includes(eid));

                if (idsToDelete.length > 0) {
                    // Delete omitted variants
                    await connection.query(`DELETE FROM variants WHERE id IN (?)`, [idsToDelete]);
                }

                // Upsert (Update existing / Insert new)
                for (const v of data.variants) {
                    if (v.id && existingMap.has(v.id)) {
                        // Update existing
                        await connection.query(`
                            UPDATE variants 
                            SET sku = ?, option_name = ?, price = ?
                            WHERE id = ?
                        `, [v.sku, v.option_name, v.price, v.id]);

                        // Check for Stock Change
                        const currentDbStock = existingMap.get(v.id).stock_qty;
                        const newStock = parseInt(v.stock_qty);

                        if (newStock !== currentDbStock) {
                            // Update Stock
                            await connection.query(`UPDATE variants SET stock_qty = ? WHERE id = ?`, [newStock, v.id]);

                            // Log Adjustment
                            const diff = newStock - currentDbStock;
                            const type = diff > 0 ? 'ADJUST_ADD' : 'ADJUST_SUB';

                            await connection.query(
                                `INSERT INTO stock_logs (variant_id, quantity, type, note) VALUES (?, ?, ?, ?)`,
                                [v.id, Math.abs(diff), type, `Manual Edit: ${currentDbStock} -> ${newStock}`]
                            );
                        }

                    } else {
                        // Insert New
                        // Default stock 0, or if provided (e.g. initial setup in edit?)
                        // Usually new variants in edit start at 0 but we can allow setting it.
                        const initialStock = v.stock_qty || 0;
                        const [res] = await connection.query(`
                            INSERT INTO variants (product_id, sku, option_name, price, stock_qty, default_cost)
                            VALUES (?, ?, ?, ?, ?, ?)
                        `, [id, v.sku, v.option_name, v.price, initialStock, 0]);

                        if (initialStock > 0) {
                            await connection.query(
                                `INSERT INTO stock_logs (variant_id, quantity, type, note) VALUES (?, ?, ?, ?)`,
                                [res.insertId, initialStock, 'IN', `Added to existing product`]
                            );
                        }
                    }
                }
            }

            await connection.commit();
            return { id, ...data };

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}


module.exports = new ProductService();
