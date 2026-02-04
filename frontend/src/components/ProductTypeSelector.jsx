import { PRODUCT_TYPES } from '../constants';

const ProductTypeSelector = ({ selectedType, onSelect }) => {

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {PRODUCT_TYPES.map((type) => (
                <div
                    key={type.id}
                    className={`type-card cursor-pointer p-4 rounded-xl border bg-white flex flex-col items-center text-center gap-2 ${selectedType === type.id ? 'selected' : ''
                        }`}
                    onClick={() => onSelect(type.id)}
                >
                    <div
                        className={`w-10 h-10 rounded-full ${type.colorBg} ${type.colorText} flex items-center justify-center`}
                    >
                        <i className={`fa-solid ${type.icon}`}></i>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-800">{type.title}</h3>
                        <p className="text-xs text-gray-500">{type.desc}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ProductTypeSelector;
