import React from 'react';

const RecentSales = () => {
    return (
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800">รายการขายล่าสุด</h3>
                <button className="text-sm text-indigo-600 hover:underline cursor-pointer">ดูทั้งหมด</button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-gray-500 border-b bg-gray-50">
                        <tr>
                            <th className="py-2 px-3">เวลา</th>
                            <th className="py-2 px-3">สินค้า</th>
                            <th className="py-2 px-3">ยอดรวม</th>
                            <th className="py-2 px-3">ช่องทาง</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        <tr>
                            <td className="py-3 px-3 text-gray-500">14:25</td>
                            <td className="py-3 px-3">
                                <div className="font-medium text-gray-800">สร้อยข้อมือเงินแท้</div>
                                <div className="text-xs text-gray-400">N01-CHAIN</div>
                            </td>
                            <td className="py-3 px-3 font-medium">฿590</td>
                            <td className="py-3 px-3">
                                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                                    หน้าร้าน
                                </span>
                            </td>
                        </tr>
                        <tr>
                            <td className="py-3 px-3 text-gray-500">14:10</td>
                            <td className="py-3 px-3">
                                <div className="font-medium text-gray-800">Set Valentine A</div>
                                <div className="text-xs text-gray-400">SET-VAL01</div>
                            </td>
                            <td className="py-3 px-3 font-medium">฿990</td>
                            <td className="py-3 px-3">
                                <span className="bg-black text-white px-2 py-1 rounded text-xs">
                                    <i className="fa-brands fa-tiktok"></i> TikTok
                                </span>
                            </td>
                        </tr>
                        <tr>
                            <td className="py-3 px-3 text-gray-500">13:45</td>
                            <td className="py-3 px-3">
                                <div className="font-medium text-gray-800">ชาร์มหัวใจ (แดง)</div>
                                <div className="text-xs text-gray-400">C01-RED</div>
                            </td>
                            <td className="py-3 px-3 font-medium">฿150</td>
                            <td className="py-3 px-3">
                                <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs">
                                    <i className="fa-solid fa-bag-shopping"></i> Shopee
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RecentSales;
