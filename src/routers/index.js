import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from '../pages/home';
import { ProductsPage } from '../pages/products';
import { ProductDetailPage } from '../pages/products/detail';
import { OrderHistoryPage } from '../pages/history';
// import { CartPage } from './pages/cart';
// import { AccountPage } from './pages/account';
// import { ContactPage } from './pages/contact';

export const Routers = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/order-history" element={<OrderHistoryPage />} />
        {/* <Route path="/cart" element={<CartPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/contact" element={<ContactPage />} /> */}
      </Routes>
    </BrowserRouter>
  );
};