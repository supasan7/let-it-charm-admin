import React from 'react';
import { Package, RefreshCw, Trash2, FileText, CheckCircle, Save, Loader2 } from 'lucide-react';

const InboundList = ({ list, onRemove, onClear, onSubmit, loading, isSuccess }) => {

    // Calculate totals
    const totalItems = list.reduce((sum, item) => sum + item.qty, 0);
    // Note: 'price' might not be available in 'item' if not passed correctly. 
    // In ProductSelection we passed 'selectedProduct' spread which has 'currentStock', but we didn't explicitly include 'price'.
    // However, the backend doesn't really need price for Stock In, but UI shows 'Estimated Value'.
    // Let's assume we want to show it, we need to ensure ProductSelection passes it. 
    // I'll update ProductSelection or just display 0 if missing.
    // Wait, let's fix ProductSelection logic in next step if needed. 
    // Actually in ProductSelection I constructed 'productData' without price. I should add it.

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden h-full min-h-[500px]">
            <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                    รายการที่จะรับเข้า (Inbound List)
                    <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full">{list.length}</span>
                </h3>
                {list.length > 0 && (
                    <button
                        onClick={onClear}
                        className="text-xs text-red-500 hover:text-red-700 hover:underline"
                    >
                        ล้างรายการทั้งหมด
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-auto bg-white relative">
                {list.length > 0 ? (
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="p-4 text-xs font-semibold text-slate-500 border-b border-slate-200">สินค้า</th>
                                <th className="p-4 text-xs font-semibold text-slate-500 border-b border-slate-200 text-center">คงเหลือเดิม</th>
                                <th className="p-4 text-xs font-semibold text-slate-500 border-b border-slate-200 text-center w-32">จำนวนที่เพิ่ม</th>
                                <th className="p-4 text-xs font-semibold text-slate-500 border-b border-slate-200 text-right w-20">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {list.map((item, index) => (
                                <tr key={index} className="hover:bg-slate-50 group transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
                                                {item.image ? (
                                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Package className="w-full h-full p-3 text-slate-300" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-800 text-sm">{item.name}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <p className="text-xs text-slate-500 font-mono">{item.sku}</p>
                                                    {item.note && (
                                                        <span className="text-[10px] bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded border border-yellow-200 flex items-center gap-1">
                                                            <FileText className="w-3 h-3" /> {item.note}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center text-sm text-slate-500">
                                        {item.currentStock}
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className="inline-block bg-green-100 text-green-700 font-bold px-3 py-1 rounded-md text-sm border border-green-200">
                                            +{item.qty}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => onRemove(index)} // Using index as ID might be duplicate if logic allows. Ideally use ID/SKU but index is safe for simplistic list.
                                            className="text-slate-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <RefreshCw className="w-8 h-8 text-slate-300" />
                        </div>
                        <p>ยังไม่มีรายการสินค้า</p>
                        <p className="text-sm mt-1">เพิ่มสินค้าจากด้านซ้ายเพื่อเตรียมบันทึก</p>
                    </div>
                )}
            </div>

            {/* Footer Summary */}
            <div className="p-5 bg-slate-50 border-t border-slate-200">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-slate-600 text-sm">จำนวนสินค้ารวม</span>
                    <span className="text-xl font-bold text-slate-800">{totalItems} <span className="text-sm font-normal text-slate-500">ชิ้น</span></span>
                </div>
                {/* 
                <div className="flex justify-between items-center mb-6">
                    <span className="text-slate-600 text-sm">มูลค่ารวม (ประมาณการ)</span>
                    <span className="text-slate-800 font-semibold">- <span className="text-sm font-normal text-slate-500">บาท</span></span>
                </div>
                */}

                <button
                    onClick={onSubmit}
                    disabled={list.length === 0 || loading}
                    className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 text-white font-semibold shadow-md transition-all 
                        ${list.length > 0 && !loading ? 'bg-green-600 hover:bg-green-700 hover:shadow-lg transform active:scale-[0.98]' : 'bg-slate-300 cursor-not-allowed'}`}
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            กำลังบันทึก...
                        </>
                    ) : isSuccess ? (
                        <>
                            <CheckCircle className="w-5 h-5" />
                            บันทึกสำเร็จ!
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            ยืนยันการรับเข้าสต็อก
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default InboundList;
