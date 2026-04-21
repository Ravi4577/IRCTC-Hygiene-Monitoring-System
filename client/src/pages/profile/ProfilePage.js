import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { FiUser, FiPhone, FiShield, FiMapPin } from 'react-icons/fi';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/Badge';

const ProfilePage = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    assignedStation: user?.assignedStation || '',
    badgeNumber: user?.badgeNumber || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/users/${user._id}`, form);
      toast.success('Profile updated successfully!');
    } catch { toast.error('Failed to update profile'); }
    finally { setLoading(false); }
  };

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div className="page-container">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Manage your account information</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.25rem', alignItems: 'start' }}>
        {/* Profile card */}
        <div className="detail-card" style={{ textAlign: 'center' }}>
          <div style={{
            width: 72, height: 72, borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.75rem', fontWeight: 800, margin: '0 auto 1rem',
            boxShadow: '0 4px 16px rgba(37,99,235,0.3)',
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.3rem' }}>{user?.name}</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>{user?.email}</div>
          <Badge label={user?.role} type={user?.role} />

          {user?.role === 'officer' && (
            <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--bg)', borderRadius: 'var(--radius)', fontSize: '0.82rem' }}>
              {user?.badgeNumber && <div style={{ marginBottom: '0.3rem' }}>🛡️ Badge: <strong>{user.badgeNumber}</strong></div>}
              {user?.assignedStation && <div>📍 Station: <strong>{user.assignedStation}</strong></div>}
            </div>
          )}
        </div>

        {/* Edit form */}
        <div className="form-card">
          <div className="form-card-title">Edit Information</div>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label><FiUser style={{ marginRight: '0.3rem' }} />Full Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={set('name')}
                  placeholder="Your full name"
                  style={{ padding: '0.65rem 0.9rem', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '0.875rem', outline: 'none', width: '100%', transition: 'var(--transition-fast)' }}
                  onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>

              <div className="form-group">
                <label><FiPhone style={{ marginRight: '0.3rem' }} />Phone Number</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={set('phone')}
                  placeholder="Mobile number"
                  style={{ padding: '0.65rem 0.9rem', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '0.875rem', outline: 'none', width: '100%', transition: 'var(--transition-fast)' }}
                  onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>

              {user?.role === 'officer' && (
                <>
                  <div className="form-group">
                    <label><FiShield style={{ marginRight: '0.3rem' }} />Badge Number</label>
                    <input
                      type="text"
                      value={form.badgeNumber}
                      onChange={set('badgeNumber')}
                      placeholder="e.g. OFF001"
                      style={{ padding: '0.65rem 0.9rem', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '0.875rem', outline: 'none', width: '100%', transition: 'var(--transition-fast)' }}
                      onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }}
                      onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                  <div className="form-group">
                    <label><FiMapPin style={{ marginRight: '0.3rem' }} />Assigned Station</label>
                    <input
                      type="text"
                      value={form.assignedStation}
                      onChange={set('assignedStation')}
                      placeholder="e.g. New Delhi"
                      style={{ padding: '0.65rem 0.9rem', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '0.875rem', outline: 'none', width: '100%', transition: 'var(--transition-fast)' }}
                      onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }}
                      onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
