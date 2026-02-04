import React from 'react';

const SingleProductForm = ({ formData, handleChange }) => {
    return (
        <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        SKU (รหัสสั้น) <i className="fa-solid fa-circle-info text-gray-400" title="ต้องตรงกับหน้าซอง"></i>
                    </label>
                    <input
                        type="text"
                        name="sku"
                        value={formData.sku || ''}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="เช่น N01-CHAIN"
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">ราคาขาย</label>
                    <div className="relative">
                        <input
                            type="number"
                            name="price"
                            value={formData.price || ''}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md pl-8"
                            placeholder="0.00"
                        />
                        <span className="absolute left-3 top-2 text-gray-400">฿</span>
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-yellow-700 uppercase tracking-wide mb-1 flex items-center gap-1">
                        <i className="fa-solid fa-lock"></i> ราคาทุน
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            name="cost"
                            value={formData.cost || ''}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border input-cost rounded-md pl-8"
                            placeholder="ระบุทุน..."
                        />
                        <span className="absolute left-3 top-2 text-yellow-600">฿</span>
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-green-700 uppercase tracking-wide mb-1 flex items-center gap-1">
                        <i className="fa-solid fa-boxes-stacked"></i> รับเข้าสต็อก
                    </label>
                    <input
                        type="number"
                        name="qty"
                        value={formData.qty || ''}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-green-200 bg-green-50 rounded-md text-green-800 font-bold"
                        placeholder="0"
                    />
                </div>
            </div>
        </div>
    );
};

export default SingleProductForm;
