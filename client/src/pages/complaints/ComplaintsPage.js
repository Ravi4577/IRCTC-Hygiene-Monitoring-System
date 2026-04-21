import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiFilter } from 'react-icons/fi';
import api from '../../services/api';
import Badge from '../../components/Badge';
import Spinner from '../../components/Spinner';
import { useAuth } from '../../context/AuthContext';
import './Complaints.css';

const ComplaintsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', category: '' });
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (filters.status) params.set('status', filters.status);
      if (filters.category) params.set('category', filters.category);
      const res = await api.get(`/complaints?${params}`);
      setComplaints(res.data.complaints || []);
      setTotal(res.data.total || 0);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchComplaints(); }, [page, filters]);

  const totalPages = Math.ceil(total / 10) || 1;

  return (
    <div className="page-container">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Complaints</h1>
          <p className="page-subtitle">{total} total complaint{total !== 1 ? 's' : ''}</p>
        </div>
        {user?.role === 'passenger' && (
          <button className="btn-primary" onClick={() => navigate('/complaints/new')}>
            <FiPlus /> Submit Complaint
          </button>
        )}
      </div>

      <div className="filter-bar">
        <FiFilter style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        <span className="filter-label">Filter:</span>
        <select
          value={filters.status}
          onChange={(e) => { setFilters({ ...filters, status: e.target.value }); setPage(1); }}
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="rejected">Rejected</option>
        </select>
        <select
          value={filters.category}
          onChange={(e) => { setFilters({ ...filters, category: e.target.value }); setPage(1); }}
        >
          <option value="">All Categories</option>
          <option value="food_quality">Food Quality</option>
          <option value="cleanliness">Cleanliness</option>
          <option value="service">Service</option>
          <option value="pricing">Pricing</option>
          <option value="other">Other</option>
        </select>
      </div>

      {loading ? <Spinner center /> : (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Sentiment</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {complaints.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">
                      <div className="empty-state-icon">📋</div>
                      <div className="empty-state-title">No complaints found</div>
                      <div className="empty-state-text">Try adjusting your filters</div>
                    </div>
                  </td>
                </tr>
              ) : complaints.map((c) => (
                <tr
                  key={c._id}
                  className="clickable-row"
                  onClick={() => navigate(`/complaints/${c._id}`)}
                >
                  <td>
                    <div className="complaint-title">{c.title}</div>
                    {c.trainNumber && <div className="complaint-meta">🚂 Train {c.trainNumber}</div>}
                    {c.stationName && <div className="complaint-meta">📍 {c.stationName}</div>}
                  </td>
                  <td style={{ textTransform: 'capitalize' }}>{c.category?.replace('_', ' ')}</td>
                  <td><Badge label={c.priority} type={c.priority} /></td>
                  <td><Badge label={c.status?.replace('_', ' ')} type={c.status} /></td>
                  <td>
                    {c.sentiment?.label
                      ? <Badge label={c.sentiment.label} type={c.sentiment.label} />
                      : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                  </td>
                  <td style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination">
            <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>← Prev</button>
            <span>Page {page} of {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next →</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintsPage;
