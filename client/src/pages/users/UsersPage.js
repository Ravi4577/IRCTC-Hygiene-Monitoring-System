import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FiFilter } from 'react-icons/fi';
import api from '../../services/api';
import Badge from '../../components/Badge';
import Spinner from '../../components/Spinner';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = roleFilter ? `?role=${roleFilter}` : '';
      const res = await api.get(`/users${params}`);
      setUsers(res.data.users || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, [roleFilter]);

  const toggleStatus = async (id) => {
    try {
      const res = await api.patch(`/users/${id}/toggle-status`);
      setUsers(users.map((u) => u._id === id ? { ...u, isActive: res.data.user.isActive } : u));
      toast.success(res.data.message);
    } catch { toast.error('Failed to update user status'); }
  };

  return (
    <div className="page-container">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-subtitle">{users.length} registered users</p>
        </div>
      </div>

      <div className="filter-bar">
        <FiFilter style={{ color: 'var(--text-muted)' }} />
        <span className="filter-label">Role:</span>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="officer">Officer</option>
          <option value="passenger">Passenger</option>
          <option value="vendor">Vendor</option>
        </select>
      </div>

      {loading ? <Spinner center /> : (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={6} className="empty-row">No users found</td></tr>
              ) : users.map((u) => (
                <tr key={u._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: 'var(--radius-sm)',
                        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                        color: 'white', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0,
                      }}>
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 600 }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                  <td><Badge label={u.role} type={u.role} /></td>
                  <td><Badge label={u.isActive ? 'active' : 'inactive'} type={u.isActive ? 'active' : 'inactive'} /></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      onClick={() => toggleStatus(u._id)}
                      className={u.isActive ? 'btn-danger btn-sm' : 'btn-success btn-sm'}
                      style={{ padding: '0.3rem 0.7rem', fontSize: '0.75rem' }}
                    >
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
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

export default UsersPage;
