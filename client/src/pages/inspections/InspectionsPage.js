import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiFilter } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Badge from '../../components/Badge';
import Spinner from '../../components/Spinner';
import { useAuth } from '../../context/AuthContext';
import './Inspections.css';

const InspectionsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [inspections, setInspections] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ vendor: '', scheduledDate: '', type: 'routine', stationName: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([api.get('/inspections'), api.get('/vendors')])
      .then(([i, v]) => {
        setInspections(i.data.inspections || []);
        setVendors(v.data.vendors || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/inspections', form);
      setInspections([res.data.inspection, ...inspections]);
      setShowForm(false);
      setForm({ vendor: '', scheduledDate: '', type: 'routine', stationName: '' });
      toast.success('Inspection scheduled successfully');
    } catch { toast.error('Failed to create inspection'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="page-container">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Inspections</h1>
          <p className="page-subtitle">{inspections.length} total inspections</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          <FiPlus /> Schedule Inspection
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <div className="form-card-title">Schedule New Inspection</div>
          <form onSubmit={handleCreate}>
            <div className="form-grid">
              <div className="form-group">
                <label>Vendor *</label>
                <select
                  value={form.vendor}
                  onChange={(e) => setForm({ ...form, vendor: e.target.value })}
                  required
                  style={{ padding: '0.65rem 0.9rem', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '0.875rem', outline: 'none', width: '100%' }}
                >
                  <option value="">Select vendor</option>
                  {vendors.map((v) => <option key={v._id} value={v._id}>{v.name} — {v.stationName}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Scheduled Date *</label>
                <input
                  type="date"
                  value={form.scheduledDate}
                  onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })}
                  required
                  style={{ padding: '0.65rem 0.9rem', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '0.875rem', outline: 'none', width: '100%' }}
                />
              </div>
              <div className="form-group">
                <label>Inspection Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  style={{ padding: '0.65rem 0.9rem', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '0.875rem', outline: 'none', width: '100%' }}
                >
                  <option value="routine">Routine</option>
                  <option value="surprise">Surprise</option>
                  <option value="follow_up">Follow Up</option>
                  <option value="complaint_based">Complaint Based</option>
                </select>
              </div>
              <div className="form-group">
                <label>Station Name</label>
                <input
                  type="text"
                  placeholder="Station name"
                  value={form.stationName}
                  onChange={(e) => setForm({ ...form, stationName: e.target.value })}
                  style={{ padding: '0.65rem 0.9rem', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '0.875rem', outline: 'none', width: '100%' }}
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Scheduling...' : 'Schedule Inspection'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? <Spinner center /> : (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Vendor</th>
                <th>Station</th>
                <th>Type</th>
                <th>Scheduled</th>
                <th>Status</th>
                <th>Grade</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {inspections.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      <div className="empty-state-icon">🔍</div>
                      <div className="empty-state-title">No inspections yet</div>
                      <div className="empty-state-text">Schedule your first inspection</div>
                    </div>
                  </td>
                </tr>
              ) : inspections.map((i) => (
                <tr key={i._id} className="clickable-row" onClick={() => navigate(`/inspections/${i._id}`)}>
                  <td style={{ fontWeight: 600 }}>{i.vendor?.name}</td>
                  <td>{i.stationName || '—'}</td>
                  <td style={{ textTransform: 'capitalize' }}>{i.type?.replace('_', ' ')}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{new Date(i.scheduledDate).toLocaleDateString()}</td>
                  <td><Badge label={i.status} type={i.status} /></td>
                  <td>{i.grade ? <span className={`grade grade-${i.grade}`}>{i.grade}</span> : '—'}</td>
                  <td style={{ fontWeight: 600 }}>{i.overallScore !== undefined ? `${i.overallScore}/100` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default InspectionsPage;
