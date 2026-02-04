import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import config from '../config';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();

    return (
        <nav className="bg-white shadow-sm border-b border-gray-200 px-6 py-3 flex justify-between items-center sticky top-0 z-50">
            <div className="flex items-center gap-3">
                {location.pathname !== '/' && (
                    <button
                        onClick={() => navigate(-1)}
                        className="mr-1 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 hover:text-indigo-600 transition cursor-pointer"
                        title="ย้อนกลับ"
                    >
                        <i className="fa-solid fa-arrow-left"></i>
                    </button>
                )}
                <div className="bg-indigo-600 text-white p-2 rounded-lg">
                    <i className="fa-solid fa-gem"></i>
                </div>
                <span className="font-semibold text-xl text-gray-800"><Link to="/">Let It Charm (Admin)</Link></span>
            </div>
            <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                    <div className="text-sm font-medium text-gray-900">{config.DEFAULT_USER.name}</div>
                    <div className="text-xs text-gray-500">{config.DEFAULT_USER.branch}</div>
                </div>
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold border-2 border-white shadow-sm">
                    {config.DEFAULT_USER.initial}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
