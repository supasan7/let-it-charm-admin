import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../../config';
import { DASHBOARD_TEXT } from '../../constants';

const StockAlerts = () => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLowStock = async () => {
            try {
                // Fetch products sorted by stock ascending to get lowest stock first
                const response = await fetch(`${config.API_BASE_URL}/api/products?sort=stock_asc&limit=10`);
                const data = await response.json();

                if (data.success && data.data) {
                    // Filter items with stock <= 5
                    const lowStockItems = data.data.filter(item => (item.stock || 0) <= 5);
                    setAlerts(lowStockItems.slice(0, 5)); // Show top 5
                }
            } catch (error) {
                console.error("Failed to fetch stock alerts", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLowStock();
    }, []);

    if (loading) return <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse h-60"></div>;

    if (alerts.length === 0) return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full flex flex-col items-center justify-center text-gray-400">
            <i className="fa-regular fa-circle-check text-4xl text-emerald-100 mb-2"></i>
            <p className="text-sm">ไม่มีสินค้าใกล้หมด</p>
        </div>
    );

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <i className="fa-solid fa-bell text-red-500"></i> {DASHBOARD_TEXT.STATS.LOW_STOCK}
            </h3>
            <div className="space-y-4">
                {alerts.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-100 transition hover:shadow-sm">
                        <div className="w-10 h-10 bg-white rounded-md flex items-center justify-center text-red-500 border border-red-100 overflow-hidden shrink-0">
                            {item.images && item.images.length > 0 ? (
                                <img src={config.getImageUrl(item.images[0])} alt={item.title} className="w-full h-full object-cover" />
                            ) : (
                                <i className="fa-solid fa-box-open"></i>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-800 truncate">{item.title}</div>
                            <div className="text-xs text-red-500">เหลือ {item.stock || 0} ชิ้น</div>
                        </div>
                        <button
                            onClick={() => navigate('/receive-stock')}
                            className="text-xs bg-white border border-red-200 text-red-600 px-2 py-1 rounded hover:bg-red-50 cursor-pointer whitespace-nowrap"
                        >
                            เติม
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StockAlerts;
