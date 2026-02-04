import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import StockInPage from './pages/StockInPage';
import AddProductPage from './pages/AddProductPage';
import StockPage from './pages/StockPage';
import StockHistoryPage from './pages/StockHistoryPage';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import LoginPage from './pages/LoginPage';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <ToastContainer position="top-center" autoClose={3000} />
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route path="/" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />

          <Route path="/add-product" element={
            <ProtectedRoute>
              <AddProductPage />
            </ProtectedRoute>
          } />

          <Route path="/receive-stock" element={
            <ProtectedRoute>
              <StockInPage />
            </ProtectedRoute>
          } />

          <Route path="/stock" element={
            <ProtectedRoute>
              <StockPage />
            </ProtectedRoute>
          } />

          <Route path="/stock-history" element={
            <ProtectedRoute>
              <StockHistoryPage />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
