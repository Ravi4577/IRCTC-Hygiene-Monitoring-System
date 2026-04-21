import React, { useState, useEffect } from 'react';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement,
  PointElement, LineElement, Filler,
} from 'chart.js';
import api from '../../services/api';
import StatCard from '../../components/StatCard';
import Spinner from '../../components/Spinner';
import {
  FiAlertCircle, FiShoppingBag, FiUsers, FiClipboard,
  FiCheckCircle, FiClock,
} from 'react-icons/fi';
import '../dashboard/Dashboard.css';

ChartJS.register(
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement,
  PointElement, LineElement, Filler
);

const baseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
};

const AnalyticsPage = () => {
  const [overview, setOverview] = useState(null);
  const [statusData, setStatusData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [sentimentData, setSentimentData] = useState([]);
  const [topVendors, setTopVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/analytics/overview'),
      api.get('/analytics/complaints-by-status'),
      api.get('/analytics/complaints-by-category'),
      api.get('/analytics/monthly-trends'),
      api.get('/analytics/sentiment'),
      api.get('/analytics/top-vendors'),
    ]).then(([ov, st, cat, tr, sent, tv]) => {
      setOverview(ov.data.data);
      setStatusData(st.data.data || []);
      setCategoryData(cat.data.data || []);
      setTrendData(tr.data.data || []);
      setSentimentData(sent.data.data || []);
      setTopVendors(tv.data.vendors || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner center size="lg" />;

  const statusChart = {
    labels: statusData.map((d) => d._id?.replace('_', ' ')),
    datasets: [{
      data: statusData.map((d) => d.count),
      backgroundColor: ['#f59e0b', '#3b82f6', '#10b981', '#ef4444'],
      borderWidth: 0,
      hoverOffset: 6,
    }],
  };

  const sentimentChart = {
    labels: sentimentData.map((d) => d._id),
    datasets: [{
      data: sentimentData.map((d) => d.count),
      backgroundColor: ['#10b981', '#94a3b8', '#ef4444'],
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
      <div className="welcome-banner">
        <div className="welcome-banner-text">
          <h2>Analytics Dashboard</h2>
          <p>System-wide statistics, complaint trends, and vendor performance</p>
        </div>
        <div className="welcome-banner-icon">📈</div>
      </div>

      {/* Overview stats */}
      {overview && (
        <div className="stats-grid">
          <StatCard title="Total Users"      value={overview.totalUsers || 0}       icon={<FiUsers />}       color="primary" />
          <StatCard title="Active Vendors"   value={overview.totalVendors || 0}     icon={<FiShoppingBag />} color="info" />
          <StatCard title="Total Complaints" value={overview.totalComplaints || 0}  icon={<FiAlertCircle />} color="warning" />
          <StatCard title="Pending"          value={overview.pendingComplaints || 0}icon={<FiClock />}       color="danger" />
          <StatCard title="Resolved"         value={overview.resolvedComplaints || 0}icon={<FiCheckCircle />}color="success" />
          <StatCard title="Avg Rating"       value={`${overview.averageRating || 0} ★`} icon={<FiClipboard />} color="secondary" />
        </div>
      )}

      {/* Charts row 1 — two doughnuts */}
      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <div className="chart-card-title">Complaints by Status</div>
              <div className="chart-card-subtitle">Current distribution</div>
            </div>
          </div>
          <div className="chart-container-sm">
            <Doughnut
              data={statusChart}
              options={{
                ...baseOptions,
                plugins: {
                  legend: {
                    display: true,
                    position: 'bottom',
                    labels: { boxWidth: 10, padding: 12, font: { size: 11 } },
                  },
                },
                cutout: '65%',
              }}
            />
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <div className="chart-card-title">Sentiment Analysis</div>
              <div className="chart-card-subtitle">AI-analyzed complaint tone</div>
            </div>
          </div>
          <div className="chart-container-sm">
            <Doughnut
              data={sentimentChart}
              options={{
                ...baseOptions,
                plugins: {
                  legend: {
                    display: true,
                    position: 'bottom',
                    labels: { boxWidth: 10, padding: 12, font: { size: 11 } },
                  },
                },
                cutout: '65%',
              }}
            />
          </div>
        </div>

        {/* Trend line — full width */}
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

        {/* Category bar — full width */}
        <div className="chart-card chart-wide">
          <div className="chart-card-header">
            <div>
              <div className="chart-card-title">Complaints by Category</div>
              <div className="chart-card-subtitle">Volume per category</div>
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
      </div>

      {/* Top vendors */}
      <div className="dashboard-section">
        <div className="section-header">
          <span className="section-title">Top Vendors by Rating</span>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th><th>Vendor</th><th>Station</th>
                <th>Rating</th><th>Hygiene Score</th><th>Reviews</th>
              </tr>
            </thead>
            <tbody>
              {topVendors.length === 0 ? (
                <tr><td colSpan={6} className="empty-row">No vendor data</td></tr>
              ) : topVendors.map((v, i) => (
                <tr key={v._id}>
                  <td style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{i + 1}</td>
                  <td style={{ fontWeight: 600 }}>{v.name}</td>
                  <td>{v.stationName}</td>
                  <td><span style={{ color: '#f59e0b', fontWeight: 700 }}>★ {v.averageRating}</span></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: 60, height: 6, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ width: `${v.hygieneScore}%`, height: '100%', background: getScoreColor(v.hygieneScore), borderRadius: 99 }} />
                      </div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: getScoreColor(v.hygieneScore) }}>{v.hygieneScore}</span>
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

export default AnalyticsPage;
