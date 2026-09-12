import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen theme-bg" style={{ backgroundColor: 'var(--color-background)' }}>
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="lg:pl-64">
        <Header toggleSidebar={toggleSidebar} />
        
        <main className="p-6">
          {children}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
