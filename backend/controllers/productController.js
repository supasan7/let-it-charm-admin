const productService = require('../services/productService');

class ProductController {
    async createProduct(req, res) {
        try {
            const data = { ...req.body };
            console.log('Raw req.body:', req.body);
            console.log('Raw variants type:', typeof req.body.variants);
            console.log('Raw variants value:', req.body.variants);

            // Handle file uploads
            if (req.files && req.files.length > 0) {
                data.images = req.files.map(file => `/uploads/${file.filename}`);
            } else {
                data.images = [];
            }

            // Parse variants if sent as JSON string
            if (typeof data.variants === 'string') {
                try {
                    data.variants = JSON.parse(data.variants);
                } catch (e) {
                    console.warn('Failed to parse variants JSON', e);
                    return res.status(400).json({ success: false, message: 'Invalid variants JSON format' });
                }
            }

            // --- VALIDATION ---
            if (!data.title || !data.title.trim()) {
                return res.status(400).json({ success: false, message: 'Product title is required' });
            }
            if (!data.category) {
                return res.status(400).json({ success: false, message: 'Category is required' });
            }

            // Validate Variants / SKU
            if (!data.variants || !Array.isArray(data.variants) || data.variants.length === 0) {
                return res.status(400).json({ success: false, message: 'At least one product variant (SKU) is required' });
            }

            // Check if at least one variant has a SKU
            const hasValidSku = data.variants.some(v => v.sku && v.sku.trim() !== '');
            if (!hasValidSku) {
                return res.status(400).json({ success: false, message: 'Product SKU is required' });
            }
            // ------------------

            console.log('Data passed to service:', JSON.stringify(data, null, 2));

            const product = await productService.createProduct(data);
            res.status(201).json({
                success: true,
                message: 'Product created successfully',
                data: product
            });
        } catch (error) {
            console.error('Error creating product:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create product',
                error: error.message
            });
        }
    }

    async getProducts(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const filters = {
                search: req.query.search,
                category: req.query.category,
                status: req.query.status,
                sort: req.query.sort
            };

            const { products, total } = await productService.getAllProducts(filters, page, limit);

            res.status(200).json({
                success: true,
                count: products.length,
                pagination: {
                    total,
                    page,
                    pages: Math.ceil(total / limit)
                },
                data: products
            });
        } catch (error) {
            console.error('Error fetching products:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch products',
                error: error.message
            });
        }
    }

    async receiveStock(req, res) {
        try {
            const { items, requesterName, note } = req.body;

            if (!items || !Array.isArray(items) || items.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid items data'
                });
            }

            const result = await productService.createStockRequest(items, requesterName, note);

            res.status(200).json({
                success: true,
                message: 'Stock request created successfully',
                data: result
            });
        } catch (error) {
            console.error('Error creating stock request:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create stock request',
                error: error.message
            });
        }
    }






    async getStockLogs(req, res) {
        try {
            const {
                page = 1,
                limit = 50,
                search,
                type,
                startDate,
                endDate
            } = req.query;

            const filters = { search, type, startDate, endDate };

            const { logs, total } = await productService.getStockLogs(filters, page, limit);
            const stats = await productService.getStockStats(filters);

            res.status(200).json({
                success: true,
                data: logs,
                stats: stats,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total: total,
                    totalPages: Math.ceil(total / limit)
                }
            });

        } catch (error) {
            console.error('Error fetching stock logs:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch stock logs',
                error: error.message
            });
        }
    }

    async getDashboardStats(req, res) {
        try {
            const stats = await productService.getDashboardStats();
            res.status(200).json({
                success: true,
                data: stats
            });
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch dashboard stats',
                error: error.message
            });
        }
    }

    async getRecentStockItems(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 5;
            const items = await productService.getRecentStockItems(limit);
            res.status(200).json({
                success: true,
                data: items
            });
        } catch (error) {
            console.error('Error fetching recent stock items:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch recent stock items',
                error: error.message
            });
        }
    }

    async updateProduct(req, res) {
        try {
            const { id } = req.params;
            const data = { ...req.body };

            // 1. Parse Variants
            if (typeof data.variants === 'string') {
                try {
                    data.variants = JSON.parse(data.variants);
                } catch (e) {
                    return res.status(400).json({ success: false, message: 'Invalid variants JSON' });
                }
            }

            // 2. Handle Images
            let finalImages = [];

            // a) Existing images (sent as JSON string of array)
            if (data.existingImages) {
                try {
                    const existing = JSON.parse(data.existingImages);
                    if (Array.isArray(existing)) {
                        finalImages = [...existing];
                    }
                } catch (e) {
                    console.warn('Failed to parse existingImages', e);
                }
            }

            // b) New images (files)
            if (req.files && req.files.length > 0) {
                const newPaths = req.files.map(file => `/uploads/${file.filename}`);
                finalImages = [...finalImages, ...newPaths];
            }

            // If we are updating, we update with the combined list
            // Note: If request didn't send existingImages/files at all (e.g. quick edit), 
            // we should be careful. But frontend sends what it has.
            // If existingImages is sent, it implies "this is the state".
            if (data.existingImages || (req.files && req.files.length > 0)) {
                data.images = finalImages;
            }

            const result = await productService.updateProduct(id, data);

            res.status(200).json({
                success: true,
                message: 'Product updated successfully',
                data: result
            });

        } catch (error) {
            console.error('Error updating product:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update product',
                error: error.message
            });
        }
    }
}

module.exports = new ProductController();
