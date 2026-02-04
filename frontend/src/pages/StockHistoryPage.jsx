import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import config from '../config';
import StockHistoryFilters from '../components/StockHistory/StockHistoryFilters';
import StockSummaryCards from '../components/StockHistory/StockSummaryCards';
import StockHistoryTable from '../components/StockHistory/StockHistoryTable';
import { History, Download } from 'lucide-react';

const StockHistoryPage = () => {
    // State
    const [logs, setLogs] = useState([]);
    const [stats, setStats] = useState({ in: 0, out: 0, net: 0 });
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
    const [loading, setLoading] = useState(false);

    // Filters
    const [filters, setFilters] = useState({
        search: '',
        type: 'all',
        dateRangeStr: '30days',
        startDate: '',
        endDate: ''
    });

    // Handle date range preset logic
    useEffect(() => {
        const today = new Date();
        let start = new Date();
        let end = new Date(); // Today

        switch (filters.dateRangeStr) {
            case 'today':
                // start is today
                break;
            case '7days':
                start.setDate(today.getDate() - 7);
                break;
            case '30days':
                start.setDate(today.getDate() - 30);
                break;
            case 'all_time':
                start = null; // No start filter
                break;
            default: // custom
                // keep manual inputs if implemented, or just dont change dates
                return;
        }

        const formatDate = (d) => {
            if (!d) return '';
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        setFilters(prev => ({
            ...prev,
            startDate: start ? formatDate(start) : '',
            endDate: formatDate(end)
        }));

    }, [filters.dateRangeStr]);

    // Fetch Data
    const fetchData = async (page = 1) => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                page,
                limit: pagination.limit,
                search: filters.search,
                type: filters.type,
                startDate: filters.startDate,
                endDate: filters.endDate
            });

            const response = await fetch(`${config.API_BASE_URL}/api/products/stock-logs?${queryParams}`);
            const data = await response.json();

            if (data.success) {
                setLogs(data.data);
                setStats(data.stats);
                setPagination(data.pagination);
            }
        } catch (error) {
            console.error("Failed to fetch stock logs", error);
        } finally {
            setLoading(false);
        }
    };

    // Trigger fetch on filters or page change
    // Using a debounce for search text would be ideal, but for now specific effect on dependencies
    useEffect(() => {
        const delaySearch = setTimeout(() => {
            fetchData(1); // Reset to page 1 on filter change
        }, 500);
        return () => clearTimeout(delaySearch);
    }, [filters.search, filters.type, filters.startDate, filters.endDate]);

    const handlePageChange = (newPage) => {
        fetchData(newPage);
    };

    const handleFilterChange = (name, value) => {
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="min-h-screen bg-gray-50 font-kanit text-slate-800">
            <Navbar />

            <div className="max-w-7xl mx-auto p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                            <History className="w-8 h-8 text-indigo-600" />
                            ประวัติความเคลื่อนไหวสต๊อก (Stock History)
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">ตรวจสอบรายการ รับเข้า-ขายออก และการปรับปรุงสต๊อกย้อนหลัง</p>
                    </div>
                </div>

                <StockHistoryFilters
                    filters={filters}
                    onFilterChange={handleFilterChange}
                />

                <StockSummaryCards stats={stats} />

                <StockHistoryTable
                    logs={logs}
                    loading={loading}
                    pagination={pagination}
                    onPageChange={handlePageChange}
                />
            </div>
        </div>
    );
};

export default StockHistoryPage;
