import React, { useState, useEffect, useRef } from 'react';
import config from '../../config';

const BundleItemRow = ({ item, onChange, onRemove, index }) => {
    const [results, setResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (item.query && item.query.length >= 2 && showResults) {
                try {
                    const response = await fetch(`${config.API_BASE_URL}/api/products?search=${item.query}`);
                    const data = await response.json();
                    if (data.success) {
                        setResults(data.data);
                    } else {
                        setResults([]);
                    }
                } catch (error) {
                    console.error("Search error", error);
                }
            } else {
                setResults([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [item.query, showResults]);

    const handleSelectProduct = (product) => {
        // Prefer SKU from variant, or product title
        const sku = product.variants && product.variants.length > 0 ? product.variants[0].sku : product.title;
        onChange(item.id, 'query', sku); // Update display/value
        setShowResults(false);
    };

    return (
        <div className="flex items-center gap-3 p-3 relative">
            <div className="flex-1 relative" ref={searchRef}>
                <div className="text-xs text-gray-500 mb-1">ค้นหาสินค้า (ชื่อ/SKU)</div>
                <input
                    type="text"
                    value={item.query || ''}
                    onChange={(e) => {
                        onChange(item.id, 'query', e.target.value);
                        setShowResults(true);
                    }}
                    onFocus={() => setShowResults(true)}
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-text"
                    placeholder="พิมพ์ชื่อ หรือ SKU (เช่น N01...)"
                />

                {/* Search Results Dropdown */}
                {showResults && results.length > 0 && (
                    <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                        {results.map((product) => (
                            <div
                                key={product.id}
                                onClick={() => handleSelectProduct(product)}
                                className="p-2 hover:bg-indigo-50 cursor-pointer border-b border-gray-50 last:border-0 flex items-center gap-2"
                            >
                                <div className="w-8 h-8 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center overflow-hidden">
                                    {product.images && product.images.length > 0 ? (
                                        <img src={config.getImageUrl(product.images[0])} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <i className="fa-solid fa-gem text-gray-300 text-xs"></i>
                                    )}
                                </div>
                                <div className="overflow-hidden">
                                    <div className="text-sm font-bold text-gray-800 truncate">{product.title}</div>
                                    <div className="text-xs text-gray-500 font-mono">
                                        {product.variants && product.variants.length > 0 ? product.variants[0].sku : '-'}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className="w-24">
                <div className="text-xs text-gray-500 mb-1">จำนวน</div>
                <input
                    type="number"
                    value={item.qty}
                    onChange={(e) => onChange(item.id, 'qty', e.target.value)}
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm text-center focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-text"
                />
            </div>
            <div className="pt-5">
                <button
                    onClick={() => onRemove(item.id)}
                    className="text-red-400 hover:text-red-600 px-2 cursor-pointer transition-transform hover:scale-110"
                >
                    <i className="fa-solid fa-trash"></i>
                </button>
            </div>
        </div>
    );
};

const BundleProductForm = ({ bundleData, setBundleData }) => {

    const addItem = () => {
        setBundleData({
            ...bundleData,
            items: [...bundleData.items, { id: Date.now(), qty: 1, query: '' }]
        });
    };

    const removeItem = (id) => {
        setBundleData({
            ...bundleData,
            items: bundleData.items.filter((item) => item.id !== id)
        });
    };

    const handleInfoChange = (e) => {
        setBundleData({ ...bundleData, [e.target.name]: e.target.value });
    };

    const handleItemChange = (id, field, value) => {
        setBundleData({
            ...bundleData,
            items: bundleData.items.map(item => item.id === id ? { ...item, [field]: value } : item)
        });
    };

    return (
        <div className="space-y-4">
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 flex items-start gap-3">
                <i className="fa-solid fa-circle-info text-orange-500 mt-1"></i>
                <div className="text-sm text-orange-800">
                    <span className="font-bold">ระบบตัดสต็อกอัตโนมัติ:</span>{' '}
                    เมื่อมีการขายเซตนี้ ระบบจะไปตัดสต็อกสินค้าลูกตามรายการที่คุณระบุด้านล่าง
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        SKU ของเซต
                    </label>
                    <input
                        type="text"
                        name="sku"
                        value={bundleData.sku || ''}
                        onChange={handleInfoChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-text"
                        placeholder="เช่น SET-VAL01"
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        ราคาขายทั้งเซต
                    </label>
                    <input
                        type="number"
                        name="price"
                        value={bundleData.price || ''}
                        onChange={handleInfoChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-text"
                        placeholder="990.00"
                    />
                </div>
            </div>

            <div className="border rounded-lg border-gray-200 overflow-visible">
                <div className="bg-gray-50 px-4 py-2 border-b text-xs font-bold text-gray-500 uppercase rounded-t-lg">
                    ส่วนประกอบในเซต
                </div>
                <div className="divide-y divide-gray-100 bg-white rounded-b-lg">
                    {bundleData.items.length === 0 && (
                        <div className="p-4 text-center text-gray-400 text-sm italic">
                            ยังไม่มีสินค้าในเซต
                        </div>
                    )}
                    {bundleData.items.map((item, index) => (
                        <BundleItemRow
                            key={item.id}
                            item={item}
                            index={index}
                            onChange={handleItemChange}
                            onRemove={removeItem}
                        />
                    ))}
                </div>
            </div>
            <button
                onClick={addItem}
                className="w-full py-2 border-2 border-dashed border-indigo-200 text-indigo-600 rounded-lg hover:bg-indigo-50 transition font-medium cursor-pointer"
            >
                <i className="fa-solid fa-plus"></i> เพิ่มสินค้าในเซต
            </button>
        </div>
    );
};

export default BundleProductForm;
