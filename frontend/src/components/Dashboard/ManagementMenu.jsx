import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Package, List } from 'lucide-react';
import { MENU_ITEMS } from '../../constants';

const ManagementMenu = () => {

    const getIcon = (iconName) => {
        switch (iconName) {
            case 'Plus': return <Plus className="w-6 h-6" />;
            case 'List': return <List className="w-6 h-6" />;
            case 'Package': return <Package className="w-6 h-6" />;
            default: return <Package className="w-6 h-6" />;
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {MENU_ITEMS.map((item, index) => (
                <Link
                    key={index}
                    to={item.to}
                    className="group bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between h-32"
                >
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div>
                            <h3 className={`text-lg font-bold text-slate-800 group-hover:text-${item.colorClass}-600 transition-colors`}>{item.title}</h3>
                            <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                        </div>
                        <div className={`bg-${item.colorClass}-100 text-${item.colorClass}-600 p-2 rounded-lg group-hover:bg-${item.colorClass}-600 group-hover:text-white transition-colors`}>
                            {getIcon(item.icon)}
                        </div>
                    </div>
                    {/* Decorative Circle */}
                    <div className={`absolute right-[-10px] top-[-10px] w-24 h-24 ${item.decorativeClass} rounded-full group-hover:scale-125 transition-transform duration-500 z-0`}></div>
                </Link>
            ))}
        </div>
    );
};

export default ManagementMenu;
