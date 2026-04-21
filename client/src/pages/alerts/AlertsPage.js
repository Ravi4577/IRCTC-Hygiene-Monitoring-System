import React from 'react';
import { FiBell, FiCheckCircle } from 'react-icons/fi';
import { useAlerts } from '../../context/AlertContext';
import './Alerts.css';

const typeEmoji = { info: 'ℹ️', warning: '⚠️', danger: '🚨', success: '✅' };

const AlertsPage = () => {
  const { alerts, unreadCount, markRead, markAllRead } = useAlerts();

  return (
    <div className="page-container">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Alerts & Notifications</h1>
          <p className="page-subtitle">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button className="btn-secondary" onClick={markAllRead}>
            <FiCheckCircle /> Mark all read
          </button>
        )}
      </div>

      <div className="alerts-list">
        {alerts.length === 0 ? (
          <div className="alerts-empty">
            <FiBell size={44} />
            <p>No alerts yet</p>
          </div>
        ) : alerts.map((alert) => (
          <div
            key={alert._id}
            className={`alert-item alert-item--${alert.type}`}
            onClick={() => markRead(alert._id)}
          >
            <div className="alert-icon">{typeEmoji[alert.type] || 'ℹ️'}</div>
            <div className="alert-content">
              <div className="alert-title">{alert.title}</div>
              <div className="alert-message">{alert.message}</div>
              <div className="alert-time">{new Date(alert.createdAt).toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertsPage;
