import React from 'react';
import { ArrowDownLeft, ArrowUpRight, Activity } from 'lucide-react';

const StockSummaryCards = ({ stats }) => {
    const { in: totalIn, out: totalOut, net: netChange } = stats;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                    <ArrowDownLeft className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-xs text-slate-500 font-medium">รับเข้า (In)</p>
                    <p className="text-xl font-bold text-slate-800">
                        {totalIn > 0 ? '+' : ''}{totalIn.toLocaleString()} <span className="text-xs font-normal text-slate-400">ชิ้น</span>
                    </p>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="p-3 rounded-full bg-red-100 text-red-600">
                    <ArrowUpRight className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-xs text-slate-500 font-medium">ขายออก (Out)</p>
                    <p className="text-xl font-bold text-slate-800">
                        {totalOut > 0 ? '-' : ''}{totalOut.toLocaleString()} <span className="text-xs font-normal text-slate-400">ชิ้น</span>
                    </p>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
                    <Activity className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-xs text-slate-500 font-medium">เคลื่อนไหวสุทธิ (Net)</p>
                    <p className={`text-xl font-bold ${netChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {netChange > 0 ? '+' : ''}{netChange.toLocaleString()} <span className="text-xs font-normal text-slate-800">ชิ้น</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default StockSummaryCards;
