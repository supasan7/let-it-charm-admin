import React, { useState } from 'react';
import { toast } from 'react-toastify';
import config from '../config';
import Navbar from '../components/Navbar';
import ProductSelection from '../components/StockIn/ProductSelection';
import InboundList from '../components/StockIn/InboundList';
import { Package } from 'lucide-react';

const StockInPage = () => {
    const [stockInList, setStockInList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Add item to list (or update if exists)
    const handleAddToCart = (newItem) => {
        setStockInList(prevList => {
            const existingIndex = prevList.findIndex(item => item.sku === newItem.sku);
            if (existingIndex >= 0) {
                // Update existing
                const updatedList = [...prevList];
                const existingItem = updatedList[existingIndex];

                updatedList[existingIndex] = {
                    ...existingItem,
                    qty: existingItem.qty + newItem.qty,
                    note: newItem.note
                        ? (existingItem.note ? `${existingItem.note}, ${newItem.note}` : newItem.note)
                        : existingItem.note
                };
                return updatedList;
            } else {
                // Add new
                return [...prevList, newItem];
            }
        });
    };

    const handleRemoveFromList = (index) => {
        setStockInList(prevList => prevList.filter((_, i) => i !== index));
    };

    const handleClearList = () => {
        if (window.confirm('ต้องการล้างรายการทั้งหมดใช่หรือไม่?')) {
            setStockInList([]);
        }
    };

    const handleSaveStock = async () => {
        if (stockInList.length === 0) return;
        setLoading(true);

        try {
            // Prepare payload
            // Note: backend expects { items: [{sku, qty, note}], requesterName, note }
            // We pass per-item note in the item object, and generic note in top level

            const payload = {
                items: stockInList.map(item => ({
                    sku: item.sku,
                    qty: item.qty,
                    cost: item.cost, // Pass cost
                    note: item.note // Pass note per item
                })),
                requesterName: 'Staff (Front)',
                note: 'เติมสินค้าเข้าคลัง' // Global note
            };

            const response = await fetch(`${config.API_BASE_URL}/api/products/stock-in`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();

            if (result.success) {
                setIsSuccess(true);
                toast.success('บันทึกข้อมูลสำเร็จ!');
                setTimeout(() => {
                    setStockInList([]);
                    setIsSuccess(false);
                }, 1500);
            } else {
                toast.error('Failed: ' + result.message);
            }
        } catch (error) {
            console.error(error);
            toast.error('Server error occurred');
        } finally {
            setLoading(false);
        }
    };

    const currentDate = new Date().toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div className="min-h-screen bg-gray-50 font-kanit text-slate-800">
            <Navbar />

            <div className="max-w-7xl mx-auto p-4 md:p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                            <Package className="w-8 h-8 text-indigo-600" />
                            รับสินค้าเข้าสต๊อก (Stock In)
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">จัดการเพิ่มจำนวนสินค้าจากการสั่งซื้อหรือผลิต</p>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200 text-right hidden md:block">
                        <p className="text-xs text-slate-400">วันที่ทำรายการ</p>
                        <p className="font-semibold text-slate-700">{currentDate}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Product Selection */}
                    <div className="lg:col-span-1">
                        <ProductSelection onAddToCart={handleAddToCart} />
                    </div>

                    {/* Right Column: List & Action */}
                    <div className="lg:col-span-2">
                        <InboundList
                            list={stockInList}
                            onRemove={handleRemoveFromList}
                            onClear={handleClearList}
                            onSubmit={handleSaveStock}
                            loading={loading}
                            isSuccess={isSuccess}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StockInPage;
