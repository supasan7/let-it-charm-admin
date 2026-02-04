import React from 'react';

const ProductGeneralInfo = ({ formData, handleChange }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold mb-4 border-b pb-2">ข้อมูลทั่วไป</h2>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        ชื่อสินค้า <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                        placeholder="เช่น สร้อยข้อมือเงินแท้ ลายโซ่"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">หมวดหมู่</label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            <option value="charm">ชาร์ม (Charm)</option>
                            <option value="bracelet">สร้อยข้อมือ (Bracelet)</option>
                            <option value="necklace">สร้อยคอ (Necklace)</option>
                            <option value="bundle">เซตของขวัญ (Bundle)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            <option value="active" className="text-green-600">● เปิดขาย (Active)</option>
                            <option value="inactive" className="text-gray-500">● ปิดการขาย (Inactive)</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">วัสดุ (Material)</label>
                        <select
                            name="material"
                            value={formData.material || ''}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            <option value="">ระบุวัสดุ</option>
                            <option value="stainless">สแตนเลส (Stainless)</option>
                            <option value="alloy">โลหะผสม (Alloy)</option>
                            <option value="brass">ทองเหลือง (Brass)</option>
                            <option value="copper">ทองแดง (Copper)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">สีอะไหล่ (Tone)</label>
                        <select
                            name="part_tone"
                            value={formData.part_tone || ''}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            <option value="">ระบุสีอะไหล่</option>
                            <option value="silver">สีเงิน (Silver)</option>
                            <option value="gold">สีทอง (Gold)</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        รายละเอียด
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="3"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                        placeholder="รายละเอียดวัสดุ หรือจุดเด่นสินค้า..."
                    ></textarea>
                </div>
            </div>
        </div>
    );
};

export default ProductGeneralInfo;
