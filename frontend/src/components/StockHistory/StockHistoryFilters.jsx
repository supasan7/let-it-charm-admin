import React from 'react';
import { Search } from 'lucide-react';

const StockHistoryFilters = ({ filters, onFilterChange }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        onFilterChange(name, value);
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                {/* Search */}
                <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">ค้นหาสินค้า / เลขที่เอกสาร</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            name="search"
                            value={filters.search}
                            onChange={(e) => {
                                // Debounce could be handled here or in parent
                                onFilterChange('search', e.target.value);
                            }}
                            placeholder="พิมพ์ชื่อสินค้า, SKU, หรือ Ref No."
                            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                </div>

                {/* Type Filter */}
                <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">ประเภทรายการ</label>
                    <select
                        name="type"
                        value={filters.type}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                    >
                        <option value="all">ทั้งหมด (All Types)</option>
                        <option value="in">รับเข้า (Stock In)</option>
                        <option value="out">ขายออก (Sale)</option>
                        <option value="adjust">ปรับปรุง (Adjustment)</option>
                        <option value="return">รับคืน (Return)</option>
                    </select>
                </div>

                {/* Date Range Pre-sets */}
                <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">ช่วงเวลา</label>
                    <select
                        name="dateRangeStr" // Helper for predefined ranges
                        value={filters.dateRangeStr || '30days'}
                        onChange={(e) => onFilterChange('dateRangeStr', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                    >
                        <option value="today">วันนี้</option>
                        <option value="7days">7 วันล่าสุด</option>
                        <option value="30days">30 วันล่าสุด</option>
                        <option value="all_time">ทั้งหมด</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

export default StockHistoryFilters;
