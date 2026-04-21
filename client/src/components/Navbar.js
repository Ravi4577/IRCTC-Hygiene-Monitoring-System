import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMenu, FiBell, FiUser, FiLogOut, FiChevronDown, FiMessageSquare } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useAlerts } from '../context/AlertContext';
import './Navbar.css';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { unreadCount, unreadMessages } = useAlerts();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <button className="navbar-menu-btn" onClick={onMenuClick} aria-label="Toggle sidebar">
        <FiMenu />
      </button>

      <div className="navbar-title">
        <h2>IRCTC Hygiene Monitoring System</h2>
      </div>

      <div className="navbar-actions">
        {/* Messages */}
        <button
          className="navbar-icon-btn"
          onClick={() => navigate('/messages')}
          aria-label="Messages"
        >
          <FiMessageSquare />
          {unreadMessages > 0 && (
            <span className="navbar-badge">{unreadMessages > 9 ? '9+' : unreadMessages}</span>
          )}
        </button>

        {/* Notifications */}
        <button
          className="navbar-icon-btn"
          onClick={() => navigate('/alerts')}
          aria-label="Notifications"
        >
          <FiBell />
          {unreadCount > 0 && (
            <span className="navbar-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
          )}
        </button>

        <div className="navbar-divider" />

        {/* User menu */}
        <div
          ref={dropdownRef}
          className={`navbar-user ${dropdownOpen ? 'open' : ''}`}
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <div className="navbar-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
          <div className="navbar-user-info">
            <span className="navbar-user-name">{user?.name}</span>
            <span className="navbar-user-role">{user?.role}</span>
          </div>
          <FiChevronDown className="navbar-chevron" />

          {dropdownOpen && (
            <div className="navbar-dropdown">
              <div className="navbar-dropdown-header">
                <div className="navbar-dropdown-name">{user?.name}</div>
                <div className="navbar-dropdown-email">{user?.email}</div>
              </div>
              <button onClick={() => { navigate('/profile'); setDropdownOpen(false); }}>
                <FiUser /> My Profile
              </button>
              <button onClick={() => { navigate('/messages'); setDropdownOpen(false); }}>
                <FiMessageSquare /> Messages
                {unreadMessages > 0 && <span style={{ marginLeft: 'auto', background: 'var(--primary)', color: 'white', fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: 99, fontWeight: 700 }}>{unreadMessages}</span>}
              </button>
              <div className="navbar-dropdown-divider" />
              <button className="danger" onClick={handleLogout}>
                <FiLogOut /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
