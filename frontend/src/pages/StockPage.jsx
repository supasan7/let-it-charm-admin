import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import EditProductModal from '../components/Stock/EditProductModal';
import { Search, Package, Filter, ArrowRight, AlertCircle, CheckCircle2, CornerDownRight } from 'lucide-react';
import { toast } from 'react-toastify';
import config from '../config';
import { CATEGORIES, PRODUCT_STATUSES, SORT_OPTIONS } from '../constants';

const StockPage = () => {
    // State
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'stock_desc', 'stock_asc'

    // Pagination State
    const [pagination, setPagination] = useState({
        page: 1,
        limit: config.DEFAULT_PAGINATION_LIMIT,
        total: 0,
        totalPages: 1
    });

    // Expansion State
    const [expandedRows, setExpandedRows] = useState(new Set());

    // Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    // Fetch Products
    const fetchProducts = async (page = 1) => {
        setLoading(true);
        try {
            // Build query params
            const params = new URLSearchParams();
            params.append('page', page);
            params.append('limit', pagination.limit);
            if (searchTerm) params.append('search', searchTerm);
            if (selectedCategory !== 'all') params.append('category', selectedCategory);
            if (selectedStatus !== 'all') params.append('status', selectedStatus);

            // Map sort values to backend expected values
            if (sortBy === 'stock_desc') params.append('sort', 'stock_desc');
            else if (sortBy === 'stock_asc') params.append('sort', 'stock_asc');
            else if (sortBy === 'oldest') params.append('sort', 'oldest');
            // default is newest (created_at desc)

            const response = await fetch(`${config.API_BASE_URL}/api/products?${params.toString()}`);
            const data = await response.json();

            if (data.data) {
                setProducts(data.data);
                if (data.pagination) {
                    setPagination({
                        page: Number(data.pagination.page),
                        limit: Number(data.pagination.limit || config.DEFAULT_PAGINATION_LIMIT),
                        total: data.pagination.total,
                        totalPages: data.pagination.pages
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('ไม่สามารถโหลดข้อมูลสินค้าได้');
        } finally {
            setLoading(false);
        }
    };

    // Effect for fetching
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchProducts(1);
        }, 500);

        return () => clearTimeout(delayDebounce);
    }, [searchTerm, selectedCategory, selectedStatus, sortBy]);

    // Handlers
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchProducts(newPage);
        }
    };

    const toggleRow = (productId) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(productId)) {
            newExpanded.delete(productId);
        } else {
            newExpanded.add(productId);
        }
        setExpandedRows(newExpanded);
    };

    const handleEditClick = (product) => {
        setSelectedProduct(product);
        setIsEditModalOpen(true);
    };

    const handleUpdateProduct = async (updatedData) => {
        try {
            const formData = new FormData();
            formData.append('title', updatedData.title);
            formData.append('description', updatedData.description);
            formData.append('category', updatedData.category);
            formData.append('status', updatedData.status);
            formData.append('variants', JSON.stringify(updatedData.variants));

            // Handle Images
            if (updatedData.existingImages) {
                formData.append('existingImages', JSON.stringify(updatedData.existingImages));
            }

            if (updatedData.newImageFiles && updatedData.newImageFiles.length > 0) {
                updatedData.newImageFiles.forEach((file) => {
                    formData.append('images', file);
                });
            }

            const response = await fetch(`${config.API_BASE_URL}/api/products/${selectedProduct.id}`, {
                method: 'PUT',
                body: formData
            });

            if (response.ok) {
                toast.success('แก้ไขสินค้าสำเร็จ');
                setIsEditModalOpen(false);
                fetchProducts(pagination.page);
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update');
            }
        } catch (error) {
            console.error('Update error:', error);
            toast.error(error.message || 'เกิดข้อผิดพลาดในการแก้ไขสินค้า');
        }
    };

    // Helper to render Pagination Info
    const getPaginationInfo = () => {
        const start = (pagination.page - 1) * pagination.limit + 1;
        const end = Math.min(pagination.page * pagination.limit, pagination.total);
        return `แสดง ${start}-${end} จาก ${pagination.total} รายการ`;
    };

    return (
        <div className="min-h-screen bg-gray-50 font-kanit">
            <Navbar />

            <div className="max-w-7xl mx-auto p-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                            <Package className="w-8 h-8 text-indigo-600" />
                            สินค้าทั้งหมด
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">รายการสินค้าทั้งหมดในระบบ</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-4 relative">
                        <Search className="absolute left-3 top-2.5 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="ค้นหาชื่อสินค้า, SKU..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none cursor-text"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}


                        >
                            <option value="all">ทุกหมวดหมู่</option>
                            {CATEGORIES.map(cat => (
                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="md:col-span-3">
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}


                        >
                            <option value="all">ทุกสถานะ</option>
                            {PRODUCT_STATUSES.map(status => (
                                <option key={status.value} value={status.value}>{status.label}</option>
                            ))}
                        </select>
                    </div>
                    {/* Sort Filter */}
                    <div className="md:col-span-3">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}


                        >
                            {SORT_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Product List Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold border-b border-gray-200">
                                <tr>
                                    <th className="p-4 w-[60px]">รูปภาพ</th>
                                    <th className="p-4 w-[30%]">ชื่อสินค้า / SKU</th>
                                    <th className="p-4 w-[12%]">หมวดหมู่</th>
                                    <th className="p-4 w-[15%] text-right">ราคาขาย</th>
                                    <th className="p-4 w-[15%] text-center">คงเหลือ</th>
                                    <th className="p-4 w-[12%] text-center">สถานะ</th>
                                    <th className="p-4 w-[8%] text-center">จัดการ</th>
                                </tr>
                            </thead>

                            {loading ? (
                                <tbody>
                                    <tr>
                                        <td colSpan="7" className="p-8 text-center text-slate-400">กำลังโหลดข้อมูล...</td>
                                    </tr>
                                </tbody>
                            ) : products.length === 0 ? (
                                <tbody>
                                    <tr>
                                        <td colSpan="7" className="p-8 text-center text-slate-400">ไม่พบสินค้า</td>
                                    </tr>
                                </tbody>
                            ) : (
                                products.map(product => {
                                    const hasVariants = product.variants && product.variants.length > 1;
                                    const isExpanded = expandedRows.has(product.id);
                                    const variants = product.variants || [];

                                    return (
                                        <tbody key={product.id} className="border-b border-gray-100 last:border-none">
                                            <tr
                                                className={`hover:bg-indigo-50/30 transition-colors cursor-pointer ${isExpanded ? 'bg-indigo-50/30' : ''}`}
                                                onClick={() => hasVariants && toggleRow(product.id)}
                                            >
                                                <td className="p-4">
                                                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border border-gray-200 overflow-hidden shadow-sm">
                                                        {product.images && product.images.length > 0 ? (
                                                            <img src={config.getImageUrl(product.images[0])} alt={product.title} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <Package className="w-6 h-6 text-gray-300" />
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="font-bold text-gray-800">{product.title}</div>
                                                    <div className="text-xs text-gray-500 font-mono flex items-center gap-1">
                                                        {hasVariants ? (
                                                            <>
                                                                <span className="bg-indigo-100 text-indigo-700 px-1.5 rounded text-[10px] uppercase font-bold tracking-wider">Multi</span>
                                                                <span>{variants.length} ตัวเลือก</span>
                                                                <i className={`fa-solid fa-chevron-down text-[10px] ml-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`}></i>
                                                            </>
                                                        ) : (
                                                            variants.length > 0 ? variants[0].sku : '-'
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded text-xs ${product.category === 'charm' ? 'bg-purple-50 text-purple-700' :
                                                        product.category === 'bracelet' ? 'bg-blue-50 text-blue-700' :
                                                            'bg-gray-100 text-gray-600'
                                                        }`}>
                                                        {product.category === 'charm' ? 'ชาร์ม' : product.category === 'bracelet' ? 'สร้อยข้อมือ' : product.category}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right font-medium text-gray-700">
                                                    {variants.length > 0 ? `฿${Number(variants[0].price).toLocaleString()}` : '-'}
                                                </td>
                                                <td className="p-4 text-center">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span className={`font-bold px-3 py-1 rounded-full text-xs box-border border ${(product.stock || 0) > 0
                                                            ? (product.stock < 10 ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-green-50 text-green-600 border-green-200')
                                                            : 'bg-red-50 text-red-600 border-red-200'
                                                            }`}>
                                                            {product.stock || 0}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span className={`text-xs flex items-center justify-center gap-1.5 ${product.status === 'active' ? 'text-green-600' : 'text-gray-400'
                                                        }`}>
                                                        {product.status === 'active' ? (
                                                            <CheckCircle2 className="w-3 h-3" />
                                                        ) : (
                                                            <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                                                        )}
                                                        {product.status === 'active' ? 'ขายอยู่' : 'ปิดการขาย'}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEditClick(product);
                                                        }}
                                                        className="text-gray-400 hover:text-indigo-600 transition p-2 rounded-full hover:bg-white border border-transparent hover:border-gray-200 shadow-sm hover:shadow cursor-pointer"
                                                    >
                                                        <i className="fa-solid fa-pen-to-square"></i>
                                                    </button>
                                                </td>
                                            </tr>

                                            {/* Expanded Variants Rows (Direct Siblings in tbody) */}
                                            {hasVariants && isExpanded && variants.map((variant, idx) => (
                                                <tr key={`${product.id}-v-${idx}`} className="bg-slate-50 border-none transition-colors group">
                                                    {/* Colspan 3: Indented Title + SKU */}
                                                    <td colSpan="3" className="p-3 pl-20 relative">
                                                        <div className="flex items-center gap-3">
                                                            <CornerDownRight className="w-4 h-4 text-gray-300 shrink-0" />
                                                            <div className="flex flex-col">
                                                                <span className="text-sm text-gray-700 font-medium">{variant.option_name}</span>
                                                                <span className="text-xs text-gray-400 font-mono tracking-wide">{variant.sku}</span>
                                                            </div>
                                                        </div>
                                                        {/* Optional vertical line to connect visually */}
                                                        {idx !== variants.length - 1 && (
                                                            <div className="absolute left-[88px] top-8 bottom-0 w-px bg-gray-200"></div>
                                                        )}
                                                    </td>

                                                    {/* Aligned Price */}
                                                    <td className="p-3 text-right text-sm text-gray-600">
                                                        ฿{Number(variant.price).toLocaleString()}
                                                    </td>

                                                    {/* Aligned Stock */}
                                                    <td className="p-3 text-center">
                                                        <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-bold ${variant.stock_qty <= 5 ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'
                                                            }`}>
                                                            {variant.stock_qty <= 5 && <AlertCircle className="w-3 h-3" />}
                                                            {variant.stock_qty}
                                                        </div>
                                                    </td>

                                                    {/* Empty Status/Manage cols */}
                                                    <td colSpan="2" className="p-3"></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    );
                                })
                            )}
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="bg-white p-4 border-t border-gray-200 flex justify-between items-center text-sm text-gray-500">
                        <div>{getPaginationInfo()}</div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handlePageChange(pagination.page - 1)}
                                disabled={pagination.page <= 1}
                                className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                                ก่อนหน้า
                            </button>

                            <button className="px-3 py-1 border border-gray-300 rounded bg-indigo-50 text-indigo-600 font-bold">
                                {pagination.page}
                            </button>

                            <button
                                onClick={() => handlePageChange(pagination.page + 1)}
                                disabled={pagination.page >= pagination.totalPages}
                                className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                                ถัดไป
                            </button>
                        </div>
                    </div>
                </div>

                {isEditModalOpen && (
                    <EditProductModal
                        product={selectedProduct}
                        onClose={() => setIsEditModalOpen(false)}
                        onUpdate={handleUpdateProduct}
                    />
                )}
            </div>
        </div>
    );
};

export default StockPage;
