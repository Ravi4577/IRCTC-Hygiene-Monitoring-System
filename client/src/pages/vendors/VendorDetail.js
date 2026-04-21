import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Spinner from '../../components/Spinner';
import { useAuth } from '../../context/AuthContext';
import './Vendors.css';

const StarInput = ({ value, onChange, label }) => (
  <div className="form-group">
    <label>{label}</label>
    <div className="star-input">
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          onClick={() => onChange(s)}
          style={{ color: s <= value ? '#f59e0b' : '#d1d5db' }}
        >★</span>
      ))}
    </div>
  </div>
);

const VendorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vendor, setVendor] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingForm, setRatingForm] = useState({
    overall: 0, foodQuality: 0, cleanliness: 0, service: 0, review: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const getHygieneColor = (score) => {
    if (score >= 75) return '#10b981';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  };

  useEffect(() => {
    Promise.all([api.get(`/vendors/${id}`), api.get(`/ratings/vendor/${id}`)])
      .then(([v, r]) => { setVendor(v.data.vendor); setRatings(r.data.ratings || []); })
      .catch(() => navigate('/vendors'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    if (ratingForm.overall === 0) { toast.error('Please select an overall rating'); return; }
    setSubmitting(true);
    try {
      await api.post('/ratings', { ...ratingForm, vendor: id });
      toast.success('Rating submitted!');
      const [v, r] = await Promise.all([api.get(`/vendors/${id}`), api.get(`/ratings/vendor/${id}`)]);
      setVendor(v.data.vendor);
      setRatings(r.data.ratings || []);
      setRatingForm({ overall: 0, foodQuality: 0, cleanliness: 0, service: 0, review: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner center size="lg" />;
  if (!vendor) return null;

  return (
    <div className="page-container">
      <button className="btn-link" onClick={() => navigate('/vendors')}>← Back to Vendors</button>

      {/* Vendor header */}
      <div className="vendor-detail-header">
        <div className="vendor-detail-avatar">{vendor.name.charAt(0)}</div>
        <div className="vendor-detail-info" style={{ flex: 1 }}>
          <h2>{vendor.name}</h2>
          <div className="vendor-detail-meta">
            <span>📍 {vendor.stationName}</span>
            <span>🏷️ {vendor.category?.replace('_', ' ')}</span>
            <span>📋 {vendor.licenseNumber}</span>
            {vendor.contactPhone && <span>📞 {vendor.contactPhone}</span>}
          </div>
          <div className="vendor-detail-stats">
            <div className="vendor-stat-item">
              <span className="vendor-stat-label">Rating</span>
              <span className="vendor-stat-value" style={{ color: '#f59e0b' }}>
                ★ {vendor.averageRating}
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 400, marginLeft: '0.3rem' }}>
                  ({vendor.totalRatings})
                </span>
              </span>
            </div>
            <div className="vendor-stat-item">
              <span className="vendor-stat-label">Hygiene Score</span>
              <span className="vendor-stat-value" style={{ color: getHygieneColor(vendor.hygieneScore) }}>
                {vendor.hygieneScore}/100
              </span>
            </div>
          </div>
        </div>
      </div>

      {vendor.description && (
        <div className="detail-card">
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{vendor.description}</p>
        </div>
      )}

      {/* Rating form for passengers */}
      {user?.role === 'passenger' && (
        <div className="rating-form-card">
          <div style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
            Rate this Vendor
          </div>
          <form onSubmit={handleRatingSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <StarInput label="Overall Rating *" value={ratingForm.overall}     onChange={(v) => setRatingForm({ ...ratingForm, overall: v })} />
              <StarInput label="Food Quality"     value={ratingForm.foodQuality} onChange={(v) => setRatingForm({ ...ratingForm, foodQuality: v })} />
              <StarInput label="Cleanliness"      value={ratingForm.cleanliness} onChange={(v) => setRatingForm({ ...ratingForm, cleanliness: v })} />
              <StarInput label="Service"          value={ratingForm.service}     onChange={(v) => setRatingForm({ ...ratingForm, service: v })} />
            </div>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label>Review (optional)</label>
              <textarea
                rows={3}
                placeholder="Share your experience..."
                value={ratingForm.review}
                onChange={(e) => setRatingForm({ ...ratingForm, review: e.target.value })}
              />
            </div>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Rating'}
            </button>
          </form>
        </div>
      )}

      {/* Reviews */}
      <div className="detail-card">
        <div className="section-header">
          <span className="section-title">Customer Reviews ({ratings.length})</span>
        </div>
        {ratings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">⭐</div>
            <div className="empty-state-title">No reviews yet</div>
            <div className="empty-state-text">Be the first to rate this vendor</div>
          </div>
        ) : (
          <div className="ratings-list">
            {ratings.map((r) => (
              <div key={r._id} className="rating-item">
                <div className="rating-header">
                  <span className="rating-user">{r.ratedBy?.name}</span>
                  <span className="rating-stars">{'⭐'.repeat(r.overall)}</span>
                </div>
                {r.review && <p className="rating-review">{r.review}</p>}
                <span className="rating-date">{new Date(r.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorDetail;
