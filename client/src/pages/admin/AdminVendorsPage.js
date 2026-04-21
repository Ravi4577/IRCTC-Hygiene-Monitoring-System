import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Badge from '../../components/Badge';
import Spinner from '../../components/Spinner';
import './Admin.css';

const AdminVendorsPage = () => {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: 50 });
      if (search) params.set('search', search);
      // Use the admin all-vendors endpoint
      const res = await api.get(`/vendors/admin/all?${params}`);
      setVendors(res.data.vendors || []);
      setTotal(res.data.total || 0);
    } catch {
      // Fallback to public endpoint
      try {
        const res = await api.get('/vendors?limit=50');
        setVendors(res.data.vendors || []);
        setTotal(res.data.total || 0);
      } catch {}
    }
    setLoading(false);
  };

  useEffect(() => { fetchVendors(); }, [search]);

  const handleToggle = async (id) => {
    try {
      const res = await api.patch(`/vendors/${id}/toggle-status`);
      setVendors(vendors.map((v) => v._id === id ? { ...v, isActive: res.data.vendor.isActive } : v));
      toast.success(res.data.message);
    } catch { toast.error('Failed to update vendor status'); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete vendor "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/vendors/${id}`);
      setVendors(vendors.filter((v) => v._id !== id));
      toast.success('Vendor deleted');
    } catch { toast.error('Failed to delete vendor'); }
  };

  return (
    <div className="page-container">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Vendor Management</h1>
          <p className="page-subtitle">{total} vendors registered</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/admin/vendors/add')}>
          <FiPlus /> Add Vendor
        </button>
      </div>

      <div className="filter-bar">
        <FiSearch style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Search vendors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, maxWidth: 280 }}
        />
      </div>

      {loading ? <Spinner center /> : (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Vendor</th>
                <th>Owner</th>
                <th>Station</th>
                <th>Category</th>
                <th>Rating</th>
                <th>Hygiene</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vendors.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="empty-state">
                      <div className="empty-state-icon">🏪</div>
                      <div className="empty-state-title">No vendors yet</div>
                      <div className="empty-state-text">Click "Add Vendor" to create the first one</div>
                    </div>
                  </td>
                </tr>
              ) : vendors.map((v) => (
                <tr key={v._id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{v.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{v.licenseNumber}</div>
                  </td>
                  <td>
                    <div>{v.owner?.name || '—'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{v.owner?.email}</div>
                  </td>
                  <td>{v.stationName}</td>
                  <td style={{ textTransform: 'capitalize' }}>{v.category?.replace('_', ' ')}</td>
                  <td><span style={{ color: '#f59e0b', fontWeight: 700 }}>★ {v.averageRating}</span></td>
                  <td>
                    <span style={{ fontWeight: 600, color: v.hygieneScore >= 75 ? '#10b981' : v.hygieneScore >= 50 ? '#f59e0b' : '#ef4444' }}>
                      {v.hygieneScore}/100
                    </span>
                  </td>
                  <td>
                    <Badge label={v.isActive ? 'active' : 'inactive'} type={v.isActive ? 'active' : 'inactive'} />
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        className="admin-action-btn"
                        title={v.isActive ? 'Deactivate' : 'Activate'}
                        onClick={() => handleToggle(v._id)}
                      >
                        {v.isActive ? <FiToggleRight style={{ color: '#10b981' }} /> : <FiToggleLeft style={{ color: '#94a3b8' }} />}
                      </button>
                      <button
                        className="admin-action-btn"
                        title="View"
                        onClick={() => navigate(`/vendors/${v._id}`)}
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        className="admin-action-btn danger"
                        title="Delete"
                        onClick={() => handleDelete(v._id, v.name)}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminVendorsPage;
