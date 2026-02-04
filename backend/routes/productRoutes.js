const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

const upload = require('../middleware/upload');

router.post('/', upload.array('images', 6), productController.createProduct);
router.get('/', productController.getProducts.bind(productController));
router.post('/stock-in', productController.receiveStock.bind(productController));
router.get('/recent-stock-items', productController.getRecentStockItems.bind(productController));
router.get('/stock-logs', productController.getStockLogs.bind(productController));
router.get('/stats', productController.getDashboardStats.bind(productController));
router.put('/:id', upload.array('images', 10), productController.updateProduct.bind(productController));

module.exports = router;
