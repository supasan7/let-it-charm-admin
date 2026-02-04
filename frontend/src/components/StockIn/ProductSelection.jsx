import React, { useState, useEffect, useRef } from 'react';
import config from '../../config';
import { Search, Package, Plus, FileText } from 'lucide-react';

const ProductSelection = ({ onAddToCart }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [qty, setQty] = useState(1);
    const [cost, setCost] = useState(0);
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);

    // Debounce search
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchTerm.trim() && !selectedProduct) {
                setLoading(true);
                try {
                    const response = await fetch(`${config.API_BASE_URL}/api/products?search=${searchTerm}&limit=10`);
                    const data = await response.json();
                    if (data.success) {
                        setSearchResults(data.data);
                    } else {
                        setSearchResults([]);
                    }
                } catch (err) {
                    console.error(err);
                    setSearchResults([]);
                } finally {
                    setLoading(false);
                }
            } else {
                setSearchResults([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, selectedProduct]);

    const handleSelectProduct = (product) => {
        // Find the best matching variant or default to first
        // Simple logic: if user searched for SKU, pick that variant. 
        // Otherwise picker UI might be needed, but for now let's pick the first variant or the main product info.

        let targetVariant = product.variants[0];

        // Try to find exact SKU match if possible
        const skuMatch = product.variants.find(v => v.sku.toLowerCase().includes(searchTerm.toLowerCase()));
        if (skuMatch) targetVariant = skuMatch;

        const productData = {
            id: product.id,
            variant_id: targetVariant.id,
            sku: targetVariant.sku,
            name: product.title + (targetVariant.option_name !== 'Single' ? ` (${targetVariant.option_name})` : ''),
            image: product.images && product.images.length > 0 ? config.getImageUrl(product.images[0]) : null,
            currentStock: targetVariant.stock_qty || 0
        };

        if (targetVariant.default_cost) setCost(targetVariant.default_cost);
        else setCost(0);

        setSelectedProduct(productData);
        setSearchTerm('');
        setSearchResults([]);
        setQty(1);
        setNote('');
    };

    const handleAdd = () => {
        if (!selectedProduct) return;
        if (qty <= 0) return;

        onAddToCart({
            ...selectedProduct,
            ...selectedProduct,
            qty: parseInt(qty),
            cost: parseFloat(cost),
            note: note.trim()
        });

        // Reset
        setSelectedProduct(null);
        setQty(1);
        setCost(0);
        setNote('');
        setSearchTerm('');
    };

    return (
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 relative h-full flex flex-col">
            <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
                เลือกสินค้าเข้าสต็อก
            </h3>

            {/* Search Input */}
            <div className="relative mb-4">
                <Search className="absolute left-3 top-2.5 text-slate-400 w-5 h-5" />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        if (selectedProduct) setSelectedProduct(null); // Reset selection on new search
                    }}
                    placeholder="ค้นหาชื่อสินค้า, SKU..."
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />

                {/* Dropdown Results */}
                {searchResults.length > 0 && !selectedProduct && (
                    <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                        {searchResults.map(product => (
                            <div
                                key={product.id}
                                onClick={() => handleSelectProduct(product)}
                                className="p-3 hover:bg-indigo-50 cursor-pointer flex items-center gap-3 border-b border-slate-100 last:border-0"
                            >
                                <div className="w-10 h-10 rounded bg-slate-100 overflow-hidden shrink-0">
                                    {product.images && product.images.length > 0 ? (
                                        <img src={config.getImageUrl(product.images[0])} alt={product.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <Package className="w-full h-full p-2 text-slate-400" />
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-slate-800 truncate">{product.title}</p>
                                    <p className="text-xs text-slate-500 truncate">
                                        {product.variants.map(v => v.sku).join(', ')}
                                    </p>
                                </div>
                                <div className="ml-auto text-xs font-semibold bg-slate-100 px-2 py-1 rounded whitespace-nowrap">
                                    Total: {product.variants.reduce((sum, v) => sum + (v.stock_qty || 0), 0)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Content Area */}
            {selectedProduct ? (
                <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 animate-fade-in flex-1 flex flex-col">
                    <div className="flex gap-4 mb-4">
                        <div className="w-20 h-20 rounded-lg bg-white shadow-sm border border-indigo-100 overflow-hidden shrink-0">
                            {selectedProduct.image ? (
                                <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                    <Package className="w-8 h-8" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-indigo-600 mb-1">{selectedProduct.sku}</p>
                            <h4 className="font-semibold text-slate-800 line-clamp-2">{selectedProduct.name}</h4>
                            <p className="text-sm text-slate-500 mt-1">คงเหลือ: <span className="font-medium text-slate-900">{selectedProduct.currentStock}</span> ชิ้น</p>
                        </div>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-indigo-200 mt-auto">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">หมายเหตุสินค้า (Optional)</label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                                <input
                                    type="text"
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="เช่น งานซ่อม, เคลม..."
                                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex items-end gap-3">
                            <div className="flex-1">
                                <label className="block text-xs font-semibold text-slate-600 mb-1">จำนวน</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={qty}
                                    onChange={(e) => setQty(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-center font-bold text-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs font-semibold text-slate-600 mb-1">ต้นทุน (ต่อชิ้น)</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={cost}
                                    onChange={(e) => setCost(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-center font-medium text-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-600"
                                />
                            </div>
                            <button
                                onClick={handleAdd}
                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-medium flex justify-center items-center gap-2 transition-colors shadow-sm"
                            >
                                <Plus className="w-5 h-5" /> เพิ่ม
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="h-64 border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 flex-1">
                    <Package className="w-12 h-12 mb-2 opacity-50" />
                    <p className="text-sm font-medium">ค้นหาและเลือกสินค้า</p>
                    <p className="text-xs mt-1">เพื่อระบุจำนวนและเพิ่มในรายการ</p>
                </div>
            )}
        </div>
    );
};

export default ProductSelection;
