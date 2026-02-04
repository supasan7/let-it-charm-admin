import React, { createContext, useState, useEffect, useContext } from 'react';
import config from '../config';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            const response = await fetch(`${config.API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (data.success) {
                // Save user to state and local storage
                setUser(data.data);
                localStorage.setItem('user', JSON.stringify(data.data));
                toast.success('เข้าสู่ระบบสำเร็จ');
                return true;
            } else {
                toast.error(data.message || 'เข้าสู่ระบบไม่สำเร็จ');
                return false;
            }
        } catch (error) {
            console.error('Login error:', error);
            toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อ');
            return false;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        toast.info('ออกจากระบบแล้ว');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
