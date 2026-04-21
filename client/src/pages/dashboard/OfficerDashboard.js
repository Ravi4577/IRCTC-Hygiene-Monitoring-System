import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiAlertCircle, FiClipboard, FiCheckCircle,
  FiClock, FiPlusCircle, FiList,
} from 'react-icons/fi';
import api from '../../services/api';
import StatCard from '../../components/StatCard';
import Badge from '../../components/Badge';
import Spinner from '../../components/Spinner';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

const OfficerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/complaints?limit=5'),
      api.get('/inspections?limit=5'),
    ]).then(([c, i]) => {
      setComplaints(c.data.complaints || []);
      setInspections(i.data.inspections || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const pendingComplaints   = complaints.filter((c) => c.status !== 'resolved').length;
  const completedInspections = inspections.filter((i) => i.status === 'completed').length;
  const scheduledInspections = inspections.filter((i) => i.status === 'scheduled').length;

  return (
    <div className="dashboard-page">
      <div className="welcome-banner">
        <div className="welcome-banner-text">
          <h2>Officer Dashboard</h2>
          <p>Badge: {user?.badgeNumber || 'N/A'} · Station: {user?.assignedStation || 'Not assigned'}</p>
        </div>
        <div className="welcome-banner-icon">🛡️</div>
      </div>

      <div className="stats-grid">
        <StatCard title="Open Complaints"    value={pendingComplaints}    icon={<FiAlertCircle />} color="warning" />
        <StatCard title="Total Inspections"  value={inspections.length}   icon={<FiClipboard />}   color="primary" />
        <StatCard title="Completed"          value={completedInspections} icon={<FiCheckCircle />} color="success" />
        <StatCard title="Scheduled"          value={scheduledInspections} icon={<FiClock />}       color="info" />
      </div>

      <div className="quick-actions">
        <button className="quick-action-btn" onClick={() => navigate('/inspections')}>
          <FiPlusCircle /> New Inspection
        </button>
        <button className="quick-action-btn" onClick={() => navigate('/complaints')}>
          <FiAlertCircle /> Complaints
        </button>
        <button className="quick-action-btn" onClick={() => navigate('/analytics')}>
          <FiList /> Analytics
        </button>
      </div>

      {loading ? <Spinner center /> : (
        <>
          <div className="dashboard-section">
            <div className="section-header">
              <span className="section-title">Recent Complaints</span>
              <button className="btn-link" onClick={() => navigate('/complaints')}>View all →</button>
            </div>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr><th>Title</th><th>Category</th><th>Priority</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {complaints.length === 0 ? (
                    <tr><td colSpan={4} className="empty-row">No complaints assigned</td></tr>
                  ) : complaints.map((c) => (
                    <tr key={c._id} className="clickable-row" onClick={() => navigate(`/complaints/${c._id}`)}>
                      <td style={{ fontWeight: 500 }}>{c.title}</td>
                      <td style={{ textTransform: 'capitalize' }}>{c.category?.replace('_', ' ')}</td>
                      <td><Badge label={c.priority} type={c.priority} /></td>
                      <td><Badge label={c.status?.replace('_', ' ')} type={c.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="dashboard-section">
            <div className="section-header">
              <span className="section-title">Upcoming Inspections</span>
              <button className="btn-link" onClick={() => navigate('/inspections')}>View all →</button>
            </div>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr><th>Vendor</th><th>Station</th><th>Scheduled</th><th>Type</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {inspections.length === 0 ? (
                    <tr><td colSpan={5} className="empty-row">No inspections scheduled</td></tr>
                  ) : inspections.map((i) => (
                    <tr key={i._id} className="clickable-row" onClick={() => navigate(`/inspections/${i._id}`)}>
                      <td style={{ fontWeight: 500 }}>{i.vendor?.name}</td>
                      <td>{i.stationName}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{new Date(i.scheduledDate).toLocaleDateString()}</td>
                      <td style={{ textTransform: 'capitalize' }}>{i.type?.replace('_', ' ')}</td>
                      <td><Badge label={i.status} type={i.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OfficerDashboard;
