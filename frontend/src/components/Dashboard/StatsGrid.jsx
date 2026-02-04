import React, { useState, useEffect } from 'react';
import config from '../../config';
import { DASHBOARD_TEXT } from '../../constants';

const StatsGrid = () => {
    const [stats, setStats] = useState({
        totalCost: 0,
        totalProducts: 0,
        newProductsToday: 0,
        lowStock: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch(`${config.API_BASE_URL}/api/products/stats`);
                const data = await response.json();
                if (data.success) {
                    setStats(data.data);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const formatCurrency = (num) => {
        return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(num);
    };

    if (loading) {
        return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 text-center text-gray-400">Loading stats...</div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Stock Value */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm stat-card">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-gray-500 text-sm font-medium">{DASHBOARD_TEXT.STATS.TOTAL_COST}</p>
                        <h3 className="text-2xl font-bold text-gray-800 mt-1">{formatCurrency(stats.totalCost)}</h3>
                    </div>
                    <div className="bg-emerald-100 text-emerald-600 p-2 rounded-lg">
                        <i className="fa-solid fa-sack-dollar"></i>
                    </div>
                </div>
                <p className="text-xs text-emerald-600 flex items-center gap-1">
                    <i className="fa-solid fa-calculator"></i> คำนวณจากต้นทุนปัจจุบัน
                </p>
            </div>

            {/* Total Products */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm stat-card">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-gray-500 text-sm font-medium">{DASHBOARD_TEXT.STATS.TOTAL_PRODUCTS}</p>
                        <h3 className="text-2xl font-bold text-gray-800 mt-1">{stats.totalProducts}</h3>
                    </div>
                    <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                        <i className="fa-solid fa-cubes"></i>
                    </div>
                </div>
                <p className="text-xs text-gray-400">รายการ (SKU)</p>
            </div>

            {/* New Products Today */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm stat-card">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-gray-500 text-sm font-medium">{DASHBOARD_TEXT.STATS.NEW_PRODUCTS}</p>
                        <h3 className="text-2xl font-bold text-gray-800 mt-1">{stats.newProductsToday}</h3>
                    </div>
                    <div className="bg-purple-100 text-purple-600 p-2 rounded-lg">
                        <i className="fa-solid fa-calendar-plus"></i>
                    </div>
                </div>
                <p className="text-xs text-purple-600 flex items-center gap-1">
                    <i className="fa-solid fa-clock"></i> เพิ่มเมื่อ {new Date().toLocaleDateString('th-TH')}
                </p>
            </div>

            {/* Low Stock */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm stat-card">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-gray-500 text-sm font-medium">{DASHBOARD_TEXT.STATS.LOW_STOCK}</p>
                        <h3 className="text-2xl font-bold text-red-500 mt-1">{stats.lowStock}</h3>
                    </div>
                    <div className="bg-red-100 text-red-500 p-2 rounded-lg">
                        <i className="fa-solid fa-triangle-exclamation"></i>
                    </div>
                </div>
                <p className="text-xs text-red-400">น้อยกว่า 5 ชิ้น</p>
            </div>
        </div>
    );
};

export default StatsGrid;
