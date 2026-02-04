import React from 'react';
import Navbar from '../components/Navbar';
import StatsGrid from '../components/Dashboard/StatsGrid';
import ManagementMenu from '../components/Dashboard/ManagementMenu';
import StockHistory from '../components/Dashboard/StockHistory';
import StockAlerts from '../components/Dashboard/StockAlerts';
import { DASHBOARD_TEXT } from '../constants';

const DashboardPage = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-6xl mx-auto p-6">
                {/* Welcome Section */}
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">{DASHBOARD_TEXT.TITLE}</h1>
                        <p className="text-gray-500 mt-1">
                            ข้อมูลล่าสุด: {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })} | {new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                        </p>
                    </div>
                    <div>
                        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg shadow-lg flex items-center gap-2 transition cursor-pointer">
                            <i className="fa-solid fa-cash-register"></i> {DASHBOARD_TEXT.POS_BUTTON}
                        </button>
                    </div>
                </div>

                <StatsGrid />
                <ManagementMenu />

                {/* Bottom Columns */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <StockHistory />
                    <StockAlerts />
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
