import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import config from '../../config';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, TextField } from '@mui/material';

const EditProductModal = ({ product, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        status: '',
        material: '',
        part_tone: '',
        variants: []
    });

    const [originalVariants, setOriginalVariants] = useState([]);

    // Image State
    const [existingImages, setExistingImages] = useState([]);
    const [newImages, setNewImages] = useState([]); // Array of { file, previewUrl }
    const fileInputRef = useRef(null);

    // Confirmation Dialog State (Delete Variant)
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [variantToDelete, setVariantToDelete] = useState(null);

    // Security Dialog States for Stock Update
    const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
    const [password, setPassword] = useState('');
    const [stockConfirmDialogOpen, setStockConfirmDialogOpen] = useState(false);
    const [stockChanges, setStockChanges] = useState([]);

    useEffect(() => {
        if (product) {
            const variants = product.variants ? product.variants.map(v => ({ ...v })) : [];
            setFormData({
                title: product.title || '',
                description: product.description || '',
                category: product.category || 'charm',
                status: product.status || 'active',
                material: product.material || '',
                part_tone: product.part_tone || '',
                variants: variants
            });
            // Deep copy for comparison
            setOriginalVariants(JSON.parse(JSON.stringify(variants)));

            // Safe parse images
            let imgs = [];
            if (Array.isArray(product.images)) {
                imgs = product.images;
            } else if (typeof product.images === 'string') {
                try { imgs = JSON.parse(product.images); } catch (e) { }
            }
            setExistingImages(imgs);
            setNewImages([]);
        }
    }, [product]);

    // Cleanup previews
    useEffect(() => {
        return () => {
            newImages.forEach(img => URL.revokeObjectURL(img.previewUrl));
        };
    }, [newImages]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleVariantChange = (index, field, value) => {
        const updatedVariants = [...formData.variants];
        updatedVariants[index][field] = value;
        setFormData(prev => ({ ...prev, variants: updatedVariants }));
    };

    const handleAddVariant = () => {
        setFormData(prev => ({
            ...prev,
            variants: [
                ...prev.variants,
                {
                    sku: '',
                    option_name: 'ตัวเลือกใหม่',
                    price: 0,
                    stock_qty: 0,
                    default_cost: 0,
                    is_new: true
                }
            ]
        }));
    };

    const handleRemoveVariantClick = (index) => {
        // Prevent deleting if it's the last variant
        if (formData.variants.length <= 1) {
            toast.error("ต้องมีตัวเลือกสินค้าอย่างน้อย 1 รายการ");
            return;
        }
        setVariantToDelete(index);
        setConfirmDialogOpen(true);
    };

    const handleConfirmDeleteVariant = () => {
        if (variantToDelete !== null) {
            const updatedVariants = formData.variants.filter((_, i) => i !== variantToDelete);
            setFormData(prev => ({ ...prev, variants: updatedVariants }));
            setVariantToDelete(null);
            setConfirmDialogOpen(false);
            toast.success("ลบตัวเลือกเรียบร้อยแล้ว");
        }
    };

    const handleCloseConfirmDialog = () => {
        setConfirmDialogOpen(false);
        setVariantToDelete(null);
    };

    const handleImageBoxClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files);
            const newImageObjects = files.map(file => ({
                file,
                previewUrl: URL.createObjectURL(file)
            }));
            setNewImages(prev => [...prev, ...newImageObjects]);
        }
        // Reset input
        e.target.value = '';
    };

    const handleRemoveExistingImage = (indexToRemove) => {
        setExistingImages(prev => prev.filter((_, i) => i !== indexToRemove));
    };

    const handleRemoveNewImage = (indexToRemove) => {
        setNewImages(prev => {
            const target = prev[indexToRemove];
            if (target) URL.revokeObjectURL(target.previewUrl);
            return prev.filter((_, i) => i !== indexToRemove);
        });
    };

    // --- Secure Stock Logic ---

    const calculateStockChanges = () => {
        const changes = [];
        formData.variants.forEach(currentVar => {
            // Find in original
            const originalVar = originalVariants.find(ov => ov.id === currentVar.id);

            // If it's a new variant (no ID) and has stock > 0, we can treat it as a change too if we want, 
            // but requirements specifically mention editing stock checks "old -> new". 
            // New variants technically go 0 -> N, which is fine to just proceed or confirm.
            // Let's focus on existing variants modifications.
            if (originalVar) {
                if (parseInt(currentVar.stock_qty) !== parseInt(originalVar.stock_qty)) {
                    changes.push({
                        sku: currentVar.sku,
                        name: currentVar.option_name,
                        oldStock: parseInt(originalVar.stock_qty),
                        newStock: parseInt(currentVar.stock_qty)
                    });
                }
            }
        });
        return changes;
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();

        // Check for stock changes
        const changes = calculateStockChanges();
        if (changes.length > 0) {
            setStockChanges(changes);
            setPassword('');
            setPasswordDialogOpen(true);
        } else {
            // No stock changes, proceed normally
            submitData();
        }
    };

    const handlePasswordSubmit = () => {
        if (password === 'getrich') {
            setPasswordDialogOpen(false);
            setStockConfirmDialogOpen(true);
        } else {
            toast.error("รหัสผ่านไม่ถูกต้อง");
        }
    };

    const handleStockConfirm = () => {
        setStockConfirmDialogOpen(false);
        submitData();
    };

    const submitData = () => {
        onUpdate({
            ...formData,
            existingImages: existingImages,
            newImageFiles: newImages.map(img => img.file)
        });
    };

    if (!product) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
                <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                    {/* Modal Header */}
                    <div className="p-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                        <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                            <i className="fa-solid fa-pen text-indigo-500"></i> แก้ไขสินค้า
                        </h3>
                        <button onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 w-8 h-8 rounded-full hover:bg-gray-200 flex items-center justify-center transition cursor-pointer">
                            <i className="fa-solid fa-xmark text-lg"></i>
                        </button>
                    </div>

                    {/* Modal Body */}
                    <div className="flex-1 overflow-y-auto p-6 modal-scroll">
                        <form id="editForm" onSubmit={handleFormSubmit} className="space-y-5">

                            {/* ส่วนที่ 1: ข้อมูลหลัก */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">รูปภาพสินค้า</label>
                                    <div className="flex flex-wrap gap-3">
                                        {/* Existing Images */}
                                        {existingImages.map((imgSrc, idx) => (
                                            <div key={`existing-${idx}`} className="relative group w-24 h-24 border border-gray-200 rounded-lg overflow-hidden">
                                                <img src={config.getImageUrl(imgSrc)} alt="Product" className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveExistingImage(idx)}
                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition cursor-pointer"
                                                >
                                                    <i className="fa-solid fa-times"></i>
                                                </button>
                                            </div>
                                        ))}

                                        {/* New Images */}
                                        {newImages.map((imgObj, idx) => (
                                            <div key={`new-${idx}`} className="relative group w-24 h-24 border border-indigo-200 rounded-lg overflow-hidden ring-2 ring-indigo-100">
                                                <img src={imgObj.previewUrl} alt="New" className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveNewImage(idx)}
                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs cursor-pointer"
                                                >
                                                    <i className="fa-solid fa-times"></i>
                                                </button>
                                                <div className="absolute bottom-0 w-full bg-indigo-500 text-white text-[10px] text-center py-0.5">ใหม่</div>
                                            </div>
                                        ))}

                                        {/* Add Button */}
                                        <div
                                            onClick={handleImageBoxClick}
                                            className="w-24 h-24 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-indigo-500 hover:text-indigo-500 hover:bg-indigo-50 transition"
                                        >
                                            <i className="fa-solid fa-camera text-xl mb-1"></i>
                                            <span className="text-[10px]">เพิ่มรูป</span>
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                className="hidden"
                                                accept="image/*"
                                                multiple
                                                onChange={handleFileChange}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อสินค้า</label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                            placeholder="ชื่อสินค้า"
                                            required
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียดสินค้า</label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none"
                                            placeholder="รายละเอียดสินค้า..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">หมวดหมู่</label>
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white cursor-pointer"
                                        >
                                            <option value="charm">ชาร์ม</option>
                                            <option value="bracelet">สร้อยข้อมือ</option>
                                            <option value="necklace">สร้อยคอ</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
                                        <select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white cursor-pointer"
                                        >
                                            <option value="active">เปิดขาย</option>
                                            <option value="inactive">ปิดการขาย</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">วัสดุ (Material)</label>
                                        <select
                                            name="material"
                                            value={formData.material || ''}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white cursor-pointer"
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
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white cursor-pointer"
                                        >
                                            <option value="">ระบุสีอะไหล่</option>
                                            <option value="silver">สีเงิน (Silver)</option>
                                            <option value="gold">สีทอง (Gold)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* ส่วนที่ 2: รายการ Variants */}
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                <label className="block text-sm font-bold text-gray-700 mb-3 flex justify-between items-center">
                                    <span>รายการตัวเลือก (Variants)</span>
                                    <span className="text-xs text-gray-400 font-normal">*แก้ไข SKU ไม่ได้</span>
                                </label>

                                <div className="space-y-3" id="editVariantsContainer">
                                    {formData.variants.map((variant, index) => (
                                        <div key={index} className="flex gap-3 items-center bg-white p-3 rounded-lg border border-gray-200 shadow-sm relative group">
                                            <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs shrink-0">
                                                <i className="fa-solid fa-tag"></i>
                                            </div>
                                            <div className="flex-1">
                                                {variant.is_new ? (
                                                    <input
                                                        type="text"
                                                        value={variant.sku}
                                                        onChange={(e) => handleVariantChange(index, 'sku', e.target.value)}
                                                        className="text-xs font-mono text-indigo-600 border-b border-dashed border-gray-300 focus:border-indigo-500 outline-none w-full mb-1"
                                                        placeholder="NEW-SKU"
                                                    />
                                                ) : (
                                                    <div className="text-xs text-gray-500 font-mono">{variant.sku}</div>
                                                )}

                                                <input
                                                    type="text"
                                                    value={variant.option_name}
                                                    onChange={(e) => handleVariantChange(index, 'option_name', e.target.value)}
                                                    className="text-sm font-medium text-gray-800 border-b border-dashed border-gray-300 focus:border-indigo-500 outline-none w-full"
                                                    placeholder="ชื่อตัวเลือก"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] text-gray-400">ราคาขาย</label>
                                                <input
                                                    type="number"
                                                    value={variant.price}
                                                    onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                                                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-right focus:ring-1 focus:ring-indigo-500 outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] text-gray-400">สต็อก</label>
                                                {/* Stock is now editable */}
                                                <input
                                                    type="number"
                                                    value={variant.stock_qty}
                                                    onChange={(e) => handleVariantChange(index, 'stock_qty', e.target.value)}
                                                    className={`w-20 px-2 py-1 border rounded text-sm text-center font-bold outline-none focus:ring-1 focus:ring-indigo-500
                                                        ${parseInt(variant.stock_qty) !== (originalVariants.find(ov => ov.id === variant.id)?.stock_qty ?? parseInt(variant.stock_qty))
                                                            ? 'border-yellow-400 bg-yellow-50 text-indigo-700'
                                                            : 'border-gray-200 bg-gray-50 text-gray-600'}`}
                                                />
                                            </div>

                                            {/* Delete Variant Button */}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveVariantClick(index)}
                                                className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition ml-1 cursor-pointer"
                                                title="ลบตัวเลือก"
                                            >
                                                <i className="fa-solid fa-trash-can"></i>
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-3 text-right">
                                    <button
                                        type="button"
                                        onClick={handleAddVariant}
                                        className="text-xs text-indigo-600 hover:underline cursor-pointer"
                                    >
                                        + เพิ่มตัวเลือกใหม่
                                    </button>
                                </div>
                            </div>

                            {/* Footer (Actions) */}
                            <div className="pt-2 border-t border-gray-100 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm hover:bg-gray-50 transition cursor-pointer"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-md transition cursor-pointer"
                                >
                                    บันทึกการแก้ไข
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>

            {/* Confirm Delete Dialog */}
            <Dialog
                open={confirmDialogOpen}
                onClose={handleCloseConfirmDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                sx={{ '& .MuiDialog-paper': { borderRadius: '16px', padding: '10px' } }}
            >
                <DialogTitle id="alert-dialog-title" sx={{ fontFamily: 'Kanit, sans-serif', fontWeight: 'bold', color: '#1f2937' }}>
                    {"ยืนยันการลบตัวเลือกสินค้า?"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description" sx={{ fontFamily: 'Kanit, sans-serif', color: '#4b5563' }}>
                        คุณแน่ใจหรือไม่ที่จะลบตัวเลือกสินค้านี้?
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ padding: '0 24px 20px' }}>
                    <Button onClick={handleCloseConfirmDialog} sx={{ fontFamily: 'Kanit, sans-serif', color: '#6b7280' }}>ยกเลิก</Button>
                    <Button onClick={handleConfirmDeleteVariant} autoFocus sx={{ fontFamily: 'Kanit, sans-serif', backgroundColor: '#ef4444', color: 'white', '&:hover': { backgroundColor: '#dc2626' }, borderRadius: '8px', padding: '6px 16px' }}>ลบตัวเลือก</Button>
                </DialogActions>
            </Dialog>

            {/* Password Dialog */}
            <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)} sx={{ '& .MuiDialog-paper': { borderRadius: '16px', padding: '10px' } }}>
                <DialogTitle sx={{ fontFamily: 'Kanit, sans-serif', fontWeight: 'bold' }}>รหัสยืนยัน (Security Code)</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ fontFamily: 'Kanit, sans-serif', mb: 2 }}>
                        มีการแก้ไขจำนวนสต๊อก กรุณาระบุรหัสผ่านเพื่อยืนยันการเปลี่ยนแปลง
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="password"
                        label="รหัสผ่าน"
                        type="password"
                        fullWidth
                        variant="outlined"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handlePasswordSubmit(); }}
                        InputProps={{ style: { fontFamily: 'Kanit, sans-serif' } }}
                        InputLabelProps={{ style: { fontFamily: 'Kanit, sans-serif' } }}
                    />
                </DialogContent>
                <DialogActions sx={{ padding: '0 24px 20px' }}>
                    <Button onClick={() => setPasswordDialogOpen(false)} sx={{ fontFamily: 'Kanit, sans-serif', color: '#6b7280' }}>ยกเลิก</Button>
                    <Button onClick={handlePasswordSubmit} variant="contained" sx={{ fontFamily: 'Kanit, sans-serif', backgroundColor: '#4f46e5', '&:hover': { backgroundColor: '#4338ca' } }}>
                        ยืนยัน
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Stock Confirmation Dialog */}
            <Dialog open={stockConfirmDialogOpen} onClose={() => setStockConfirmDialogOpen(false)} sx={{ '& .MuiDialog-paper': { borderRadius: '16px', padding: '10px', minWidth: '400px' } }}>
                <DialogTitle sx={{ fontFamily: 'Kanit, sans-serif', fontWeight: 'bold' }}>ยืนยันการปรับสต๊อก</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ fontFamily: 'Kanit, sans-serif', mb: 2 }}>
                        กรุณาตรวจสอบความถูกต้องของรายการที่เปลี่ยนแปลง:
                    </DialogContentText>
                    <div className="bg-gray-50 rounded-lg p-3 space-y-2 border border-gray-100">
                        {stockChanges.map((change, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm">
                                <span className="font-medium text-gray-700">{change.sku} ({change.name})</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-400 line-through">{change.oldStock}</span>
                                    <i className="fa-solid fa-arrow-right text-xs text-gray-400"></i>
                                    <span className="font-bold text-indigo-600">{change.newStock}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </DialogContent>
                <DialogActions sx={{ padding: '0 24px 20px' }}>
                    <Button onClick={() => setStockConfirmDialogOpen(false)} sx={{ fontFamily: 'Kanit, sans-serif', color: '#6b7280' }}>ยกเลิก</Button>
                    <Button onClick={handleStockConfirm} variant="contained" sx={{ fontFamily: 'Kanit, sans-serif', backgroundColor: '#10b981', '&:hover': { backgroundColor: '#059669' } }}>
                        ยืนยันการบันทึก
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default EditProductModal;
