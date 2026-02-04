import React, { useState } from 'react';

const VariantProductForm = ({ variants, setVariants }) => {
    const addRow = () => {
        setVariants([...variants, { id: Date.now(), name: '', sku: '', price: 150, cost: '', qty: 0 }]);
    };

    const removeRow = (id) => {
        setVariants(variants.filter((v) => v.id !== id));
    };

    const handleChange = (id, field, value) => {
        setVariants(variants.map(v => v.id === id ? { ...v, [field]: value } : v));
    };

    return (
        <div>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                        <tr>
                            <th className="px-4 py-3">ชื่อตัวเลือก (สี/ไซส์)</th>
                            <th className="px-4 py-3">SKU (รหัสสั้น)</th>
                            <th className="px-4 py-3">ราคาขาย</th>
                            <th className="px-4 py-3 text-yellow-700">
                                <i className="fa-solid fa-lock"></i> ราคาทุน
                            </th>
                            <th className="px-4 py-3 text-green-700">
                                <i className="fa-solid fa-boxes-stacked"></i> รับเข้า
                            </th>
                            <th className="px-4 py-3 text-center">ลบ</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white">
                        {variants.map((variant) => (
                            <tr key={variant.id} className="border-b hover:bg-gray-50 transition">
                                <td className="px-4 py-2">
                                    <input
                                        type="text"
                                        value={variant.name}
                                        onChange={(e) => handleChange(variant.id, 'name', e.target.value)}
                                        className="w-full border-gray-300 rounded-md border px-2 py-1"
                                        placeholder="เช่น สีแดง"
                                    />
                                </td>
                                <td className="px-4 py-2">
                                    <input
                                        type="text"
                                        value={variant.sku}
                                        onChange={(e) => handleChange(variant.id, 'sku', e.target.value)}
                                        className="w-full border-gray-300 rounded-md border px-2 py-1"
                                        placeholder="C01-RED"
                                    />
                                </td>
                                <td className="px-4 py-2">
                                    <input
                                        type="number"
                                        value={variant.price}
                                        onChange={(e) => handleChange(variant.id, 'price', e.target.value)}
                                        className="w-full border-gray-300 rounded-md border px-2 py-1"
                                    />
                                </td>
                                <td className="px-4 py-2">
                                    <input
                                        type="number"
                                        value={variant.cost}
                                        onChange={(e) => handleChange(variant.id, 'cost', e.target.value)}
                                        className="w-full input-cost rounded-md border px-2 py-1"
                                        placeholder="80"
                                    />
                                </td>
                                <td className="px-4 py-2">
                                    <input
                                        type="number"
                                        value={variant.qty}
                                        onChange={(e) => handleChange(variant.id, 'qty', e.target.value)}
                                        className="w-full border-green-200 bg-green-50 text-green-800 font-bold rounded-md border px-2 py-1"
                                        placeholder="0"
                                    />
                                </td>
                                <td className="px-4 py-2 text-center">
                                    <button
                                        onClick={() => removeRow(variant.id)}
                                        className="text-red-400 hover:text-red-600 cursor-pointer"
                                    >
                                        <i className="fa-solid fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <button
                onClick={addRow}
                className="mt-3 w-full py-2 border-2 border-dashed border-indigo-200 text-indigo-600 rounded-lg hover:bg-indigo-50 transition font-medium cursor-pointer"
            >
                <i className="fa-solid fa-plus"></i> เพิ่มตัวเลือกสินค้า
            </button>
        </div>
    );
};

export default VariantProductForm;
