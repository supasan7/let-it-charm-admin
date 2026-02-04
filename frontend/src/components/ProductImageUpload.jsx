import React, { useRef } from 'react';
import { toast } from 'react-toastify';

const ProductImageUpload = ({ images, setImages }) => {
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (images.length + files.length > 6) {
            toast.error('อัปโหลดได้สูงสุด 6 รูป');
            return;
        }

        // Append new files
        setImages(prev => [...prev, ...files]);
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-2">รูปภาพสินค้า</label>

            <input
                type="file"
                multiple
                accept="image/png, image/jpeg"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
            />

            <div
                onClick={() => fileInputRef.current.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl h-64 flex flex-col items-center justify-center text-gray-400 hover:border-indigo-500 hover:text-indigo-500 hover:bg-indigo-50 transition cursor-pointer group"
            >
                <i className="fa-solid fa-image text-4xl mb-3 group-hover:scale-110 transition"></i>
                <span className="text-sm">คลิกเพื่ออัปโหลดรูปภาพ</span>
                <span className="text-xs mt-1 text-gray-300">รองรับ JPG, PNG สูงสุด 6 รูป</span>
            </div>

            {images.length > 0 && (
                <div className="mt-4 grid grid-cols-4 gap-2">
                    {images.map((file, i) => (
                        <div key={i} className="relative aspect-square bg-gray-100 rounded-lg border border-gray-200 overflow-hidden group">
                            <img
                                src={URL.createObjectURL(file)}
                                alt="preview"
                                className="w-full h-full object-cover"
                            />
                            <button
                                onClick={() => removeImage(i)}
                                className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md text-red-500 opacity-0 group-hover:opacity-100 transition"
                            >
                                <i className="fa-solid fa-times text-xs"></i>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductImageUpload;
