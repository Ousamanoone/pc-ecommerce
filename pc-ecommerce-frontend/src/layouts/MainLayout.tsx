import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CustomerChatWidget from '../components/CustomerChatWidget';

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-base-100 text-base-content selection:bg-primary selection:text-primary-content">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
      <Footer />
      {/* Widget Chat hỗ trợ trực tuyến */}
      <CustomerChatWidget />
    </div>
  );
};

export default MainLayout;