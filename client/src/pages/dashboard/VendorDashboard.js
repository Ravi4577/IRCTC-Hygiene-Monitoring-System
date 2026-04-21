import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiStar, FiMessageSquare, FiBell, FiTrendingUp, FiUser } from 'react-icons/fi';
import api from '../../services/api';
import StatCard from '../../components/StatCard';
import Spinner from '../../components/Spinner';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

const VendorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/vendors').then((res) => {
      const myVendor = res.data.vendors?.find(
        (v) => v.owner?._id === user?._id || v.owner === user?._id
      );
      setVendor(myVendor || null);
      if (myVendor) {
        api.get(`/ratings/vendor/${myVendor._id}?limit=5`)
          .then((r) => setRatings(r.data.ratings || []))
          .catch(() => {});
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  const getHygieneColor = (score) => {
    if (score >= 75) return 'success';
    if (score >= 50) return 'warning';
    return 'danger';
  };

  return (
    <div className="dashboard-page">
      <div className="welcome-banner">
        <div className="welcome-banner-text">
          <h2>{vendor?.name || 'Vendor Dashboard'}</h2>
          <p>{vendor ? `📍 ${vendor.stationName} · ${vendor.category?.replace('_', ' ')}` : 'Manage your vendor profile and ratings'}</p>
        </div>
        <div className="welcome-banner-icon">🏪</div>
      </div>

      {loading ? <Spinner center /> : (
        <>
          <div className="stats-grid">
            <StatCard
              title="Average Rating"
              value={`${vendor?.averageRating || 0} ★`}
              icon={<FiStar />}
              color="warning"
              subtitle={`${vendor?.totalRatings || 0} reviews`}
            />
            <StatCard
              title="Hygiene Score"
              value={`${vendor?.hygieneScore || 0}/100`}
              icon={<FiTrendingUp />}
              color={getHygieneColor(vendor?.hygieneScore || 0)}
            />
            <StatCard
              title="Total Reviews"
              value={vendor?.totalRatings || 0}
              icon={<FiUser />}
              color="primary"
            />
          </div>

          <div className="quick-actions">
            <button className="quick-action-btn" onClick={() => navigate('/messages')}>
              <FiMessageSquare /> Messages
            </button>
            <button className="quick-action-btn" onClick={() => navigate('/alerts')}>
              <FiBell /> Alerts
            </button>
            {vendor && (
              <button className="quick-action-btn" onClick={() => navigate(`/vendors/${vendor._id}`)}>
                <FiStar /> View Profile
              </button>
            )}
          </div>

          <div className="dashboard-section">
            <div className="section-header">
              <span className="section-title">Recent Customer Reviews</span>
            </div>
            {ratings.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">⭐</div>
                <div className="empty-state-title">No reviews yet</div>
                <div className="empty-state-text">Customer ratings will appear here</div>
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
        </>
      )}
    </div>
  );
};

export default VendorDashboard;
