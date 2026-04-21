import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Badge from '../../components/Badge';
import Spinner from '../../components/Spinner';
import { useAuth } from '../../context/AuthContext';
import './Complaints.css';

const inputStyle = {
  padding: '0.6rem 0.85rem',
  border: '1.5px solid var(--border)',
  borderRadius: 'var(--radius)',
  fontSize: '0.875rem',
  outline: 'none',
  width: '100%',
  fontFamily: 'inherit',
  color: 'var(--text-primary)',
  background: 'white',
  transition: 'border-color 0.15s, box-shadow 0.15s',
};

const ComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [statusForm, setStatusForm] = useState({ status: '', note: '', resolution: '' });

  useEffect(() => {
    api.get(`/complaints/${id}`)
      .then((res) => {
        setComplaint(res.data.complaint);
        setStatusForm({ status: res.data.complaint.status, note: '', resolution: '' });
      })
      .catch(() => navigate('/complaints'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await api.patch(`/complaints/${id}/status`, statusForm);
      setComplaint(res.data.complaint);
      toast.success('Status updated successfully');
    } catch { toast.error('Failed to update status'); }
    finally { setUpdating(false); }
  };

  if (loading) return <Spinner center size="lg" />;
  if (!complaint) return null;

  const canUpdate = ['admin', 'officer'].includes(user?.role);

  return (
    <div className="page-container">
      <button className="btn-link" onClick={() => navigate('/complaints')}>← Back to Complaints</button>

      {/* Main detail card */}
      <div className="detail-card">
        <div className="detail-header">
          <div style={{ flex: 1 }}>
            <div className="detail-title">{complaint.title}</div>
            <div className="detail-badges">
              <Badge label={complaint.status?.replace('_', ' ')} type={complaint.status} />
              <Badge label={complaint.priority} type={complaint.priority} />
              <Badge label={complaint.category?.replace('_', ' ')} type="default" />
              {complaint.sentiment?.label && (
                <Badge label={`${complaint.sentiment.label} sentiment`} type={complaint.sentiment.label} />
              )}
            </div>
          </div>
        </div>

        <div className="detail-meta">
          <div className="meta-item">
            <label>Submitted By</label>
            <span>{complaint.submittedBy?.name || 'Unknown'}</span>
          </div>
          <div className="meta-item">
            <label>Assigned To</label>
            <span>{complaint.assignedTo?.name || 'Unassigned'}</span>
          </div>
          {complaint.vendor && (
            <div className="meta-item">
              <label>Vendor</label>
              <span>{complaint.vendor?.name}</span>
            </div>
          )}
          {complaint.trainNumber && (
            <div className="meta-item">
              <label>Train Number</label>
              <span>{complaint.trainNumber}</span>
            </div>
          )}
          {complaint.stationName && (
            <div className="meta-item">
              <label>Station</label>
              <span>{complaint.stationName}</span>
            </div>
          )}
          {complaint.pnrNumber && (
            <div className="meta-item">
              <label>PNR Number</label>
              <span style={{ fontFamily: 'monospace', letterSpacing: '0.05em' }}>{complaint.pnrNumber}</span>
            </div>
          )}
          <div className="meta-item">
            <label>Submitted On</label>
            <span>{new Date(complaint.createdAt).toLocaleString()}</span>
          </div>
          {complaint.resolvedAt && (
            <div className="meta-item">
              <label>Resolved On</label>
              <span>{new Date(complaint.resolvedAt).toLocaleString()}</span>
            </div>
          )}
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
            Description
          </div>
          <div className="detail-description">{complaint.description}</div>
        </div>

        {complaint.resolution && (
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
              Resolution
            </div>
            <div className="detail-description" style={{ borderColor: '#86efac', background: '#f0fdf4' }}>
              {complaint.resolution}
            </div>
          </div>
        )}

        {/* Complaint images */}
        {complaint.images?.length > 0 && (
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
              Attached Images
            </div>
            <div className="complaint-images">
              {complaint.images.map((img, i) => (
                <div key={i} className="complaint-image-thumb" onClick={() => window.open(`${process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000'}${img}`, '_blank')}>
                  <img src={`${process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000'}${img}`} alt={`Complaint image ${i + 1}`} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status history */}
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.85rem' }}>
            Status History
          </div>
          <div className="status-history">
            {complaint.statusHistory?.map((h, i) => (
              <div key={i} className="history-item">
                <div className="history-dot" />
                <div className="history-content">
                  <strong>{h.status?.replace('_', ' ')}</strong>
                  {h.note && ` — ${h.note}`}
                  <div style={{ marginTop: '0.15rem' }}>{new Date(h.updatedAt).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Status update form */}
      {canUpdate && (
        <div className="status-update-card">
          <div style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
            Update Complaint Status
          </div>
          <form onSubmit={handleStatusUpdate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>New Status</label>
                <select
                  value={statusForm.status}
                  onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                  style={inputStyle}
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Note</label>
                <input
                  type="text"
                  placeholder="Add a note..."
                  value={statusForm.note}
                  onChange={(e) => setStatusForm({ ...statusForm, note: e.target.value })}
                  style={inputStyle}
                />
              </div>
              {statusForm.status === 'resolved' && (
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Resolution Details</label>
                  <textarea
                    rows={3}
                    placeholder="Describe how the complaint was resolved..."
                    value={statusForm.resolution}
                    onChange={(e) => setStatusForm({ ...statusForm, resolution: e.target.value })}
                    style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                  />
                </div>
              )}
            </div>
            <button type="submit" className="btn-primary" disabled={updating}>
              {updating ? 'Updating...' : 'Update Status'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ComplaintDetail;
