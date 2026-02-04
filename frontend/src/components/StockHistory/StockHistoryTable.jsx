import React from 'react';
import config from '../../config';
import { Package } from 'lucide-react';

const StockHistoryTable = ({ logs, loading, pagination, onPageChange }) => {

    // Helper to format type
    const getTypeBadge = (type) => {
        switch (type) {
            case 'IN': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">รับเข้า (Stock In)</span>;
            case 'OUT': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">ขายออก (Sale)</span>;
            case 'ADJUST': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">ปรับยอด (Adjust)</span>;
            case 'RETURN': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">รับคืน (Return)</span>;
            default: return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{type}</span>;
        }
    };

    // Helper to format quantity
    const formatQty = (qty, type) => {
        let colorClass = 'text-slate-800';
        let prefix = '';
        if (type === 'IN' || type === 'RETURN') {
            colorClass = 'text-green-600';
            prefix = '+';
        } else if (type === 'OUT') {
            colorClass = 'text-red-600';
            prefix = '-';
        } else if (type === 'ADJUST') {
            colorClass = 'text-orange-600';
        }

        return <span className={`font-bold ${colorClass}`}>{prefix}{qty}</span>;
    };

    // Helper to render Pagination Info (Same as StockPage)
    const getPaginationInfo = () => {
        const start = (pagination.page - 1) * pagination.limit + 1;
        const end = Math.min(pagination.page * pagination.limit, pagination.total);
        return `แสดง ${start}-${end} จาก ${pagination.total} รายการ`;
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="p-4 text-xs font-semibold text-slate-500" style={{ width: '15%' }}>วัน-เวลา</th>
                            <th className="p-4 text-xs font-semibold text-slate-500" style={{ width: '20%' }}>สินค้า</th>
                            <th className="p-4 text-xs font-semibold text-slate-500" style={{ width: '20%' }}>ประเภท</th>
                            <th className="p-4 text-xs font-semibold text-slate-500" style={{ width: '15%' }}>จำนวน</th>
                            <th className="p-4 text-xs font-semibold text-slate-500" style={{ width: '30%' }}>อ้างอิง / หมายเหตุ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="p-8 text-center text-slate-400">กำลังโหลดข้อมูล...</td>
                            </tr>
                        ) : logs.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="p-8 text-center text-slate-400">ไม่พบข้อมูลประวัติสต๊อก</td>
                            </tr>
                        ) : (
                            logs.map(log => (
                                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4 text-slate-600">
                                        {new Date(log.created_at).toLocaleDateString('th-TH')} <br />
                                        <span className="text-xs text-slate-400">
                                            {new Date(log.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
                                                {log.images && log.images.length > 0 ? (
                                                    <img src={config.getImageUrl(log.images[0])} alt={log.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Package className="w-full h-full p-2 text-slate-300" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-800 line-clamp-1">{log.title} {log.option_name !== 'Single' ? `(${log.option_name})` : ''}</p>
                                                <p className="text-xs text-slate-500">SKU: {log.sku}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        {getTypeBadge(log.type)}
                                    </td>
                                    <td className="p-4">
                                        {formatQty(log.quantity, log.type)}
                                    </td>
                                    <td className="p-4">
                                        <div className="text-slate-700 text-sm line-clamp-2">{log.note || '-'}</div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Style matched to StockPage.jsx */}
            {pagination && (
                <div className="bg-white p-4 border-t border-gray-200 flex justify-between items-center text-sm text-gray-500">
                    <div>{getPaginationInfo()}</div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onPageChange(pagination.page - 1)}
                            disabled={pagination.page <= 1}
                            className="px-3 py-1 border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            ก่อนหน้า
                        </button>
                        <button className="px-3 py-1 border border-slate-300 rounded bg-indigo-50 text-indigo-600 font-bold">
                            {pagination.page}
                        </button>
                        <button
                            onClick={() => onPageChange(pagination.page + 1)}
                            disabled={pagination.page >= pagination.totalPages}
                            className="px-3 py-1 border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            ถัดไป
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StockHistoryTable;
