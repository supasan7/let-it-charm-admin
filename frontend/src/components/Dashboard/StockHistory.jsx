import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import config from '../../config';
import { STOCK_MOVEMENT_TYPES } from '../../constants';
import { Package, ArrowUpRight, ArrowDownLeft, RefreshCw, RotateCcw } from 'lucide-react';

const StockHistory = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecentStockItems = async () => {
            try {
                const response = await fetch(`${config.API_BASE_URL}/api/products/recent-stock-items?limit=4`);
                const data = await response.json();
                if (data.success) {
                    setItems(data.data);
                }
            } catch (error) {
                console.error("Failed to fetch recent stock items", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecentStockItems();
    }, []);

    const getTypeConfig = (type) => {
        const config = STOCK_MOVEMENT_TYPES[type];
        if (!config) return {
            label: type,
            icon: null,
            color: 'text-gray-600',
            bg: 'bg-gray-50',
            border: 'border-gray-100',
            prefix: ''
        };

        let icon;
        switch (type) {
            case 'IN': icon = <ArrowDownLeft className="w-3 h-3" />; break;
            case 'OUT': icon = <ArrowUpRight className="w-3 h-3" />; break;
            case 'ADJUST': icon = <RefreshCw className="w-3 h-3" />; break;
            case 'RETURN': icon = <RotateCcw className="w-3 h-3" />; break;
            default: icon = null;
        }

        return { ...config, icon };
    };

    return (
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <i className="fa-solid fa-clock-rotate-left text-lg"></i>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 text-lg leading-tight">ประวัติสต๊อกล่าสุด</h3>
                        <p className="text-xs text-gray-400 font-medium mt-0.5">รายการสต๊อกล่าสุด 4 รายการ</p>
                    </div>
                </div>
                <Link to="/stock-history" className="group text-sm font-medium text-indigo-600 hover:text-indigo-700 transition flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-indigo-50 cursor-pointer">
                    ดูทั้งหมด <i className="fa-solid fa-arrow-right text-xs transition-transform group-hover:translate-x-1"></i>
                </Link>
            </div>

            <div className="flex-1 flex flex-col justify-center">
                {loading ? (
                    <div className="text-center py-10 text-gray-300 animate-pulse text-sm">กำลังโหลดข้อมูล...</div>
                ) : items.length === 0 ? (
                    <div className="text-center py-10">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-300">
                            <Package className="w-8 h-8" />
                        </div>
                        <p className="text-gray-400 text-sm">ยังไม่มีรายการเคลื่อนไหว</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {items.map((item) => {
                            const typeConfig = getTypeConfig(item.type);
                            return (
                                <div key={item.id} className="group flex items-center p-4 rounded-2xl bg-white border border-gray-100 hover:border-indigo-100 hover:shadow-[0_4px_20px_-10px_rgba(79,70,229,0.15)] transition-all duration-300 cursor-default">

                                    {/* 1. Product Info (Expanded) */}
                                    <div className="flex items-center gap-4 flex-[2] min-w-0 pr-4">
                                        <div className="w-12 h-12 bg-gray-50 rounded-xl overflow-hidden border border-gray-200 group-hover:border-indigo-200 transition-colors shadow-sm shrink-0">
                                            {item.images && item.images.length > 0 ? (
                                                <img src={config.getImageUrl(item.images[0])} alt={item.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                    <Package className="w-5 h-5" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-bold text-gray-800 text-sm truncate group-hover:text-indigo-700 transition-colors">{item.title}</h4>
                                            <div className="text-[10px] font-mono bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200 inline-block mt-1">
                                                {item.sku}
                                            </div>
                                        </div>
                                    </div>

                                    {/* 2. Time (Larger) */}
                                    <div className="flex-1 text-center border-l border-gray-100 px-2">
                                        <div className="text-sm font-semibold text-gray-700">
                                            {new Date(item.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                                        </div>
                                        <div className="text-[10px] text-gray-400">
                                            {new Date(item.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                                        </div>
                                    </div>

                                    {/* 3. Type (Separate Column) */}
                                    <div className="flex-1 flex justify-center px-2">
                                        <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full border ${typeConfig.bg} ${typeConfig.color} ${typeConfig.border} flex items-center gap-1.5 whitespace-nowrap`}>
                                            {typeConfig.icon}
                                            {typeConfig.label}
                                        </span>
                                    </div>

                                    {/* 4. Quantity (Separate Column, Distinct) */}
                                    <div className="flex-1 text-right pl-4">
                                        <span className={`text-xl font-bold ${typeConfig.color} font-mono tracking-tight`}>
                                            {typeConfig.prefix}{item.quantity}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StockHistory;
