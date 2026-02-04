import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ProductImageUpload from '../components/ProductImageUpload';
import ProductGeneralInfo from '../components/ProductGeneralInfo';
import ProductTypeSelector from '../components/ProductTypeSelector';
import SingleProductForm from '../components/ProductTypeSections/SingleProductForm';
import VariantProductForm from '../components/ProductTypeSections/VariantProductForm';
import BundleProductForm from '../components/ProductTypeSections/BundleProductForm';

import { toast } from 'react-toastify';
import config from '../config';
import { DEFAULT_CATEGORY, DEFAULT_STATUS } from '../constants';

const AddProductPage = () => {
    const [selectedType, setSelectedType] = useState('single');
    const navigate = useNavigate();

    // Form Data State
    const [images, setImages] = useState([]);
    const [generalInfo, setGeneralInfo] = useState({
        title: '',
        category: DEFAULT_CATEGORY, // Default category
        status: DEFAULT_STATUS,
        description: '',
        material: '',
        part_tone: ''
    });

    const [singleProductData, setSingleProductData] = useState({
        sku: '',
        price: 0.0, // Default price
        cost: 0 // Default cost
    });

    const [variantsData, setVariantsData] = useState([
        { id: 1, name: '', sku: '', price: 0.0, cost: 0 }
    ]);

    const [bundleData, setBundleData] = useState({
        sku: '',
        price: '',
        items: [{ id: 1, qty: 1, query: '' }]
    });

    // Handle generic input changes
    const handleGeneralChange = (e) => {
        setGeneralInfo({ ...generalInfo, [e.target.name]: e.target.value });
    };

    const handleSingleProductChange = (e) => {
        setSingleProductData({ ...singleProductData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        const formData = new FormData();

        // 1. General Info
        formData.append('title', generalInfo.title);
        formData.append('description', generalInfo.description);
        formData.append('category', generalInfo.category);
        formData.append('status', generalInfo.status);
        formData.append('material', generalInfo.material);
        formData.append('part_tone', generalInfo.part_tone);

        // --- VALIDATION (ALL FIELDS REQUIRED) ---
        formData.append('requester_name', config.DEFAULT_USER.name); // Using config default user

        if (!generalInfo.title.trim()) return toast.error('กรุณาระบุชื่อสินค้า');
        if (!generalInfo.category) return toast.error('กรุณาเลือกหมวดหมู่');
        if (images.length === 0) return toast.error('กรุณาอัพโหลดรูปภาพอย่างน้อย 1 รูป');
        // ------------------

        // 2. Images
        images.forEach(image => {
            formData.append('images', image);
        });

        // 3. Logic based on type
        if (selectedType === 'single') {
            if (!singleProductData.sku.trim()) return toast.error('กรุณาระบุ SKU');
            if (!singleProductData.price || parseFloat(singleProductData.price) <= 0) return toast.error('กรุณาระบุราคาขาย');
            if (!singleProductData.cost && singleProductData.cost !== 0) return toast.error('กรุณาระบุราคาทุน');

            const variant = {
                sku: singleProductData.sku,
                option_name: 'Single',
                price: parseFloat(singleProductData.price || 0),
                default_cost: parseFloat(singleProductData.cost || 0),
                stock_qty: parseInt(singleProductData.qty) || 0,
            };
            formData.append('variants', JSON.stringify([variant]));
        } else if (selectedType === 'variant') {
            // Check if at least one variant has all required fields
            const validVariants = variantsData.filter(v => v.sku.trim() !== '');
            if (validVariants.length === 0) return toast.error('กรุณาระบุ SKU อย่างน้อย 1 รายการ');

            // Check all variants have required data
            for (const v of validVariants) {
                if (!v.name.trim()) return toast.error('กรุณาระบุชื่อตัวเลือกทุกรายการ');
                if (!v.price || parseFloat(v.price) <= 0) return toast.error('กรุณาระบุราคาขายทุกรายการ');
                if (!v.cost && v.cost !== 0) return toast.error('กรุณาระบุราคาทุนทุกรายการ');
            }

            const variantsPayload = validVariants.map(v => ({
                sku: v.sku,
                option_name: v.name,
                price: parseFloat(v.price || 0),
                default_cost: parseFloat(v.cost || 0),
                stock_qty: parseInt(v.qty) || 0
            }));
            formData.append('variants', JSON.stringify(variantsPayload));
        } else if (selectedType === 'bundle') {
            if (!bundleData.sku.trim()) return toast.error('กรุณาระบุ SKU สำหรับ Bundle');
            if (!bundleData.price || parseFloat(bundleData.price) <= 0) return toast.error('กรุณาระบุราคาขาย Bundle');

            // Create the main bundle product marker
            const variant = {
                sku: bundleData.sku,
                option_name: 'Bundle Set',
                price: parseFloat(bundleData.price || 0),
                default_cost: 0, // Calculated from children usually, but 0 for now
                stock_qty: 0,
                is_bundle: true
            };

            // VALIDATION: Check for duplicate SKUs in bundle items
            const itemSkus = bundleData.items
                .map(item => item.query ? item.query.trim().toLowerCase() : '')
                .filter(sku => sku !== '');

            const uniqueSkus = new Set(itemSkus);
            if (itemSkus.length !== uniqueSkus.size) {
                return toast.error('ในเซตมีสินค้าซ้ำกัน กรุณาแก้ไข');
            }

            formData.append('variants', JSON.stringify([variant]));
            // TODO: We might want to save bundle components (items) separately if backend supports it
        }

        try {
            const response = await fetch(`${config.API_BASE_URL}/api/products`, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                toast.success('บันทึกสินค้าเรียบร้อย');
                navigate('/'); // Redirect to product list (or wherever)
            } else {
                toast.error('เกิดข้อผิดพลาด: ' + result.message);
            }
        } catch (error) {
            console.error('Error submitting product:', error);
            console.log('API_BASE_URL:', config.API_BASE_URL);
            toast.error(`เชื่อมต่อเซิร์ฟเวอร์ล้มเหลว: ${error.message}`);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-5xl mx-auto p-6 mb-20">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">เพิ่มสินค้าใหม่</h1>
                        <p className="text-sm text-gray-500">กรอกข้อมูลสินค้าเพื่อนำเข้าสู่คลังสินค้ากลาง</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate('/')}
                            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-600 hover:bg-gray-50 transition cursor-pointer"
                        >
                            ยกเลิก
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-lg transition flex items-center gap-2 cursor-pointer transform active:scale-95 duration-200"
                        >
                            <i className="fa-solid fa-save"></i> บันทึกสินค้า
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column */}
                    <div className="lg:col-span-1">
                        <ProductImageUpload images={images} setImages={setImages} />
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-2 space-y-6">
                        <ProductGeneralInfo formData={generalInfo} handleChange={handleGeneralChange} />

                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <h2 className="text-lg font-semibold mb-4">ประเภทสินค้าและราคา</h2>

                            <ProductTypeSelector selectedType={selectedType} onSelect={setSelectedType} />

                            <div className="mt-6">
                                {selectedType === 'single' && (
                                    <SingleProductForm
                                        formData={singleProductData}
                                        handleChange={handleSingleProductChange}
                                    />
                                )}
                                {selectedType === 'variant' && (
                                    <VariantProductForm
                                        variants={variantsData}
                                        setVariants={setVariantsData}
                                    />
                                )}
                                {selectedType === 'bundle' && (
                                    <BundleProductForm
                                        bundleData={bundleData}
                                        setBundleData={setBundleData}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddProductPage;
