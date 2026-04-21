import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiUsers, FiAlertCircle, FiShoppingBag, FiClipboard,
  FiCheckCircle, FiClock, FiTrendingUp, FiStar,
} from 'react-icons/fi';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, PointElement,
  LineElement, Title, Filler,
} from 'chart.js';
import api from '../../services/api';
import StatCard from '../../components/StatCard';
import Badge from '../../components/Badge';
import Spinner from '../../components/Spinner';
import './Dashboard.css';

// Register all Chart.js components
ChartJS.register(
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement,
  PointElement, LineElement, Title, Filler
);

// Shared chart options
const baseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [statusData, setStatusData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [topVendors, setTopVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [ov, st, cat, tr, tv] = await Promise.all([
          api.get('/analytics/overview'),
          api.get('/analytics/complaints-by-status'),
          api.get('/analytics/complaints-by-category'),
          api.get('/analytics/monthly-trends'),
          api.get('/analytics/top-vendors'),
        ]);
        setOverview(ov.data.data);
        setStatusData(st.data.data || []);
        setCategoryData(cat.data.data || []);
        setTrendData(tr.data.data || []);
        setTopVendors(tv.data.vendors || []);
      } catch {}
      setLoading(false);
    };
    fetchAll();
  }, []);

  if (loading) return <Spinner center size="lg" />;

  // Chart data
  const statusColors = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444'];
  const statusChart = {
    labels: statusData.map((d) => d._id?.replace('_', ' ')),
    datasets: [{
      data: statusData.map((d) => d.count),
      backgroundColor: statusColors,
      borderWidth: 0,
      hoverOffset: 6,
    }],
  };

  const categoryChart = {
    labels: categoryData.map((d) => d._id?.replace('_', ' ')),
    datasets: [{
      label: 'Complaints',
      data: categoryData.map((d) => d.count),
      backgroundColor: 'rgba(37, 99, 235, 0.85)',
      borderRadius: 6,
      borderSkipped: false,
    }],
  };

  const trendChart = {
    labels: trendData.map((d) => {
      const months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[d._id?.month] || ''} ${d._id?.year || ''}`;
    }),
    datasets: [{
      label: 'Complaints',
      data: trendData.map((d) => d.count),
      borderColor: '#2563eb',
      backgroundColor: 'rgba(37, 99, 235, 0.08)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#2563eb',
      pointRadius: 4,
      pointHoverRadius: 6,
    }],
  };

  const getScoreColor = (score) => {
    if (score >= 75) return '#10b981';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="welcome-banner">
        <div className="welcome-banner-text">
          <h2>Admin Dashboard</h2>
          <p>System overview — complaints, vendors, inspections, and analytics</p>
        </div>
        <div className="welcome-banner-icon">📊</div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatCard title="Total Users"       value={overview?.totalUsers || 0}       icon={<FiUsers />}       color="primary" />
        <StatCard title="Active Vendors"    value={overview?.totalVendors || 0}      icon={<FiShoppingBag />} color="info" />
        <StatCard title="Total Complaints"  value={overview?.totalComplaints || 0}   icon={<FiAlertCircle />} color="warning" />
        <StatCard title="Pending"           value={overview?.pendingComplaints || 0} icon={<FiClock />}       color="danger" />
        <StatCard title="Resolved"          value={overview?.resolvedComplaints || 0}icon={<FiCheckCircle />} color="success" />
        <StatCard title="Avg Rating"        value={`${overview?.averageRating || 0} ★`} icon={<FiStar />}    color="secondary" />
      </div>

      {/* Quick actions */}
      <div className="quick-actions">
        <button className="quick-action-btn" onClick={() => navigate('/admin/vendors/add')}>
          <FiShoppingBag /> Add Vendor
        </button>
        <button className="quick-action-btn" onClick={() => navigate('/admin/vendors')}>
          <FiUsers /> Manage Vendors
        </button>
        <button className="quick-action-btn" onClick={() => navigate('/complaints')}>
          <FiAlertCircle /> View Complaints
        </button>
        <button className="quick-action-btn" onClick={() => navigate('/analytics')}>
          <FiTrendingUp /> Analytics
        </button>
      </div>

      {/* Charts row 1 */}
      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <div className="chart-card-title">Complaints by Status</div>
              <div className="chart-card-subtitle">{overview?.totalComplaints || 0} total</div>
            </div>
          </div>
          <div className="chart-container-sm">
            <Doughnut
              data={statusChart}
              options={{
                ...baseOptions,
                plugins: {
                  legend: { display: true, position: 'bottom', labels: { boxWidth: 10, padding: 12, font: { size: 11 } } },
                },
                cutout: '65%',
              }}
            />
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <div className="chart-card-title">Complaints by Category</div>
              <div className="chart-card-subtitle">Distribution across categories</div>
            </div>
          </div>
          <div className="chart-container">
            <Bar
              data={categoryChart}
              options={{
                ...baseOptions,
                scales: {
                  y: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { font: { size: 11 } } },
                  x: { grid: { display: false }, ticks: { font: { size: 11 } } },
                },
              }}
            />
          </div>
        </div>

        <div className="chart-card chart-wide">
          <div className="chart-card-header">
            <div>
              <div className="chart-card-title">Monthly Complaint Trends</div>
              <div className="chart-card-subtitle">Last 12 months</div>
            </div>
          </div>
          <div className="chart-container">
            <Line
              data={trendChart}
              options={{
                ...baseOptions,
                plugins: {
                  legend: { display: false },
                  tooltip: { mode: 'index', intersect: false },
                },
                scales: {
                  y: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { font: { size: 11 } } },
                  x: { grid: { display: false }, ticks: { font: { size: 11 } } },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Top vendors table */}
      <div className="dashboard-section">
        <div className="section-header">
          <span className="section-title">Top Vendors by Rating</span>
          <button className="btn-link" onClick={() => navigate('/vendors')}>View all →</button>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Vendor</th>
                <th>Station</th>
                <th>Rating</th>
                <th>Hygiene Score</th>
                <th>Reviews</th>
              </tr>
            </thead>
            <tbody>
              {topVendors.length === 0 ? (
                <tr><td colSpan={6} className="empty-row">No vendor data yet</td></tr>
              ) : topVendors.map((v, i) => (
                <tr
                  key={v._id}
                  className="clickable-row"
                  onClick={() => navigate(`/vendors/${v._id}`)}
                >
                  <td style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{i + 1}</td>
                  <td style={{ fontWeight: 600 }}>{v.name}</td>
                  <td>{v.stationName}</td>
                  <td>
                    <span style={{ color: '#f59e0b', fontWeight: 700 }}>★ {v.averageRating}</span>
                  </td>
                  <td>
                    <div className="vendor-score-bar">
                      <div className="vendor-score-track">
                        <div
                          className="vendor-score-fill"
                          style={{ width: `${v.hygieneScore}%`, background: getScoreColor(v.hygieneScore) }}
                        />
                      </div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: getScoreColor(v.hygieneScore) }}>
                        {v.hygieneScore}
                      </span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{v.totalRatings}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
