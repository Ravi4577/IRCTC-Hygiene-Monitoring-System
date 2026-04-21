import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Chatbot from '../components/Chatbot';
import { useAuth } from '../context/AuthContext';
import './DashboardLayout.css';

const DashboardLayout = () => {
  const { user } = useAuth();

  // On mobile (≤768px) start with sidebar closed so it doesn't cover content
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth > 768);

  // If the window is resized from mobile → desktop, re-open the sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="dashboard-main">
        <Navbar onMenuClick={() => setSidebarOpen((prev) => !prev)} />
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
      {user?.role === 'passenger' && <Chatbot />}
    </div>
  );
};

export default DashboardLayout;
