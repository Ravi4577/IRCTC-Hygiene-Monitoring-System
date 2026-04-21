import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiAlertCircle, FiShoppingBag, FiSearch,
  FiPlusCircle, FiCheckCircle, FiClock, FiList,
} from 'react-icons/fi';
import api from '../../services/api';
import StatCard from '../../components/StatCard';
import Badge from '../../components/Badge';
import Spinner from '../../components/Spinner';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

const PassengerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/complaints?limit=5')
      .then((res) => setComplaints(res.data.complaints || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const pending  = complaints.filter((c) => c.status === 'pending').length;
  const resolved = complaints.filter((c) => c.status === 'resolved').length;

  return (
    <div className="dashboard-page">
      <div className="welcome-banner">
        <div className="welcome-banner-text">
          <h2>Hello, {user?.name?.split(' ')[0]} 👋</h2>
          <p>Track your complaints, rate vendors, and verify your PNR</p>
        </div>
        <div className="welcome-banner-icon">🚆</div>
      </div>

      <div className="stats-grid">
        <StatCard title="My Complaints" value={complaints.length} icon={<FiAlertCircle />} color="primary" />
        <StatCard title="Pending"       value={pending}           icon={<FiClock />}       color="warning" />
        <StatCard title="Resolved"      value={resolved}          icon={<FiCheckCircle />} color="success" />
      </div>

      <div className="quick-actions">
        <button className="quick-action-btn" onClick={() => navigate('/complaints/new')}>
          <FiPlusCircle /> Submit Complaint
        </button>
        <button className="quick-action-btn" onClick={() => navigate('/vendors')}>
          <FiShoppingBag /> Rate Vendors
        </button>
        <button className="quick-action-btn" onClick={() => navigate('/pnr')}>
          <FiSearch /> Verify PNR
        </button>
        <button className="quick-action-btn" onClick={() => navigate('/complaints')}>
          <FiList /> All Complaints
        </button>
      </div>

      <div className="dashboard-section">
        <div className="section-header">
          <span className="section-title">Recent Complaints</span>
          <button className="btn-link" onClick={() => navigate('/complaints')}>View all →</button>
        </div>
        {loading ? <Spinner center /> : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {complaints.length === 0 ? (
                  <tr>
                    <td colSpan={4}>
                      <div className="empty-state">
                        <div className="empty-state-icon">📋</div>
                        <div className="empty-state-title">No complaints yet</div>
                        <div className="empty-state-text">Submit your first complaint to get started</div>
                      </div>
                    </td>
                  </tr>
                ) : complaints.map((c) => (
                  <tr
                    key={c._id}
                    className="clickable-row"
                    onClick={() => navigate(`/complaints/${c._id}`)}
                  >
                    <td style={{ fontWeight: 500 }}>{c.title}</td>
                    <td style={{ textTransform: 'capitalize' }}>{c.category?.replace('_', ' ')}</td>
                    <td><Badge label={c.status?.replace('_', ' ')} type={c.status} /></td>
                    <td style={{ color: 'var(--text-secondary)' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PassengerDashboard;
