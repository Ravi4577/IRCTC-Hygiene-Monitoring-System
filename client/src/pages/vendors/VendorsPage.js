import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiStar, FiFilter } from 'react-icons/fi';
import api from '../../services/api';
import Spinner from '../../components/Spinner';
import './Vendors.css';

const VendorsPage = () => {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: 20 });
      if (search) params.set('stationName', search);
      if (category) params.set('category', category);
      const res = await api.get(`/vendors?${params}`);
      setVendors(res.data.vendors || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchVendors(); }, [search, category]);

  const getHygieneColor = (score) => {
    if (score >= 75) return '#10b981';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="page-container">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Vendors</h1>
          <p className="page-subtitle">Browse and rate food vendors across Indian Railways</p>
        </div>
      </div>

      <div className="filter-bar">
        <FiFilter style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        <span className="filter-label">Filter:</span>
        <div style={{ position: 'relative', flex: 1, maxWidth: 240 }}>
          <FiSearch style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.85rem' }} />
          <input
            type="text"
            placeholder="Search by station..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2rem' }}
          />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          <option value="pantry">Pantry Car</option>
          <option value="platform_stall">Platform Stall</option>
          <option value="catering">Catering</option>
          <option value="packaged_food">Packaged Food</option>
        </select>
      </div>

      {loading ? <Spinner center /> : vendors.length === 0 ? (
        <div className="empty-state" style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          <div className="empty-state-icon">🏪</div>
          <div className="empty-state-title">No vendors found</div>
          <div className="empty-state-text">Try adjusting your search or filters</div>
        </div>
      ) : (
        <div className="vendors-grid">
          {vendors.map((v) => (
            <div key={v._id} className="vendor-card" onClick={() => navigate(`/vendors/${v._id}`)}>
              <div className="vendor-card-header">
                <div className="vendor-avatar">{v.name.charAt(0)}</div>
                <div>
                  <div className="vendor-name">{v.name}</div>
                  <div className="vendor-station">📍 {v.stationName}</div>
                </div>
              </div>

              <div className="vendor-category-tag">{v.category?.replace('_', ' ')}</div>

              <div className="vendor-stats">
                <div className="vendor-rating-row">
                  <div className="vendor-rating-value">
                    <span style={{ color: '#f59e0b' }}>★</span>
                    {v.averageRating}
                    <span className="vendor-rating-count">({v.totalRatings} reviews)</span>
                  </div>
                </div>
                <div className="vendor-hygiene-row">
                  <span className="vendor-hygiene-label">Hygiene</span>
                  <div className="vendor-hygiene-bar">
                    <div
                      className="vendor-hygiene-fill"
                      style={{ width: `${v.hygieneScore}%`, background: getHygieneColor(v.hygieneScore) }}
                    />
                  </div>
                  <span className="vendor-hygiene-score" style={{ color: getHygieneColor(v.hygieneScore) }}>
                    {v.hygieneScore}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorsPage;
