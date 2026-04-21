import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiHome, FiAlertCircle, FiShoppingBag, FiClipboard,
  FiMessageSquare, FiBell, FiBarChart2, FiUsers,
  FiUser, FiSearch, FiLogOut, FiX, FiPlusCircle,
} from 'react-icons/fi';
import './Sidebar.css';

const navItems = {
  admin: [
    { to: '/dashboard/admin',  icon: <FiHome />,         label: 'Dashboard' },
    { to: '/complaints',       icon: <FiAlertCircle />,  label: 'Complaints' },
    { to: '/vendors',          icon: <FiShoppingBag />,  label: 'Vendors' },
    { to: '/admin/vendors',    icon: <FiPlusCircle />,   label: 'Manage Vendors' },
    { to: '/inspections',      icon: <FiClipboard />,    label: 'Inspections' },
    { to: '/analytics',        icon: <FiBarChart2 />,    label: 'Analytics' },
    { to: '/users',            icon: <FiUsers />,        label: 'Users' },
    { to: '/messages',         icon: <FiMessageSquare />,label: 'Messages' },
    { to: '/alerts',           icon: <FiBell />,         label: 'Alerts' },
    { to: '/profile',          icon: <FiUser />,         label: 'Profile' },
  ],
  officer: [
    { to: '/dashboard/officer',icon: <FiHome />,         label: 'Dashboard' },
    { to: '/complaints',       icon: <FiAlertCircle />,  label: 'Complaints' },
    { to: '/inspections',      icon: <FiClipboard />,    label: 'Inspections' },
    { to: '/vendors',          icon: <FiShoppingBag />,  label: 'Vendors' },
    { to: '/analytics',        icon: <FiBarChart2 />,    label: 'Analytics' },
    { to: '/messages',         icon: <FiMessageSquare />,label: 'Messages' },
    { to: '/alerts',           icon: <FiBell />,         label: 'Alerts' },
    { to: '/profile',          icon: <FiUser />,         label: 'Profile' },
  ],
  passenger: [
    { to: '/dashboard/passenger', icon: <FiHome />,         label: 'Dashboard' },
    { to: '/complaints/new',      icon: <FiAlertCircle />,  label: 'Submit Complaint' },
    { to: '/complaints',          icon: <FiClipboard />,    label: 'My Complaints' },
    { to: '/vendors',             icon: <FiShoppingBag />,  label: 'Vendors' },
    { to: '/pnr',                 icon: <FiSearch />,       label: 'PNR Verify' },
    { to: '/messages',            icon: <FiMessageSquare />,label: 'Messages' },
    { to: '/alerts',              icon: <FiBell />,         label: 'Alerts' },
    { to: '/profile',             icon: <FiUser />,         label: 'Profile' },
  ],
  vendor: [
    { to: '/dashboard/vendor', icon: <FiHome />,         label: 'Dashboard' },
    { to: '/vendors',          icon: <FiShoppingBag />,  label: 'My Profile' },
    { to: '/messages',         icon: <FiMessageSquare />,label: 'Messages' },
    { to: '/alerts',           icon: <FiBell />,         label: 'Alerts' },
    { to: '/profile',          icon: <FiUser />,         label: 'Account' },
  ],
};

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const items = navItems[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Close sidebar on mobile after any nav link click
  const handleNavClick = () => {
    if (window.innerWidth <= 768) {
      onClose();
    }
  };

  return (
    <>
      {/* Dark overlay — tapping it closes the sidebar on mobile */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}

      <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span className="sidebar-logo-icon">🚂</span>
            <span className="sidebar-logo-text">IRCTC Hygiene</span>
          </div>
          <button className="sidebar-close" onClick={onClose} aria-label="Close menu">
            <FiX />
          </button>
        </div>

        {/* User info */}
        <div className="sidebar-user">
          <div className="sidebar-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{user?.name}</span>
            <span className={`sidebar-role-badge role-${user?.role}`}>{user?.role}</span>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="sidebar-nav">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              end={item.to.includes('dashboard')}
              onClick={handleNavClick}   // ← closes sidebar on mobile
            >
              <span className="sidebar-link-icon">{item.icon}</span>
              <span className="sidebar-link-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <button className="sidebar-logout" onClick={handleLogout}>
          <FiLogOut />
          <span>Logout</span>
        </button>
      </aside>
    </>
  );
};

export default Sidebar;
