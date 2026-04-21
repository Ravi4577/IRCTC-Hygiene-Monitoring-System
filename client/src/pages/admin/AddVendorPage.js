import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api';
import './Admin.css';

const AddVendorPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(null);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    vendorName: '',
    ownerName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    licenseNumber: '',
    stationName: '',
    category: 'pantry',
    description: '',
    contactPhone: '',
    contactEmail: '',
    address: '',
    trainNumbers: '',
  });

  const set = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    setErrors({ ...errors, [field]: '' });
  };

  const validate = () => {
    const errs = {};
    if (!form.vendorName.trim()) errs.vendorName = 'Vendor/shop name is required';
    if (!form.ownerName.trim()) errs.ownerName = 'Owner name is required';
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.phone || !/^[0-9]{10}$/.test(form.phone)) errs.phone = 'Enter a valid 10-digit phone number';
    if (!form.licenseNumber.trim()) errs.licenseNumber = 'License number is required';
    if (!form.stationName.trim()) errs.stationName = 'Station name is required';
    if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const res = await api.post('/vendors/admin-create', form);
      setSuccess(res.data);
      toast.success('Vendor created successfully!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create vendor';
      toast.error(msg);
      if (msg.toLowerCase().includes('email')) setErrors({ email: msg });
      if (msg.toLowerCase().includes('license')) setErrors({ licenseNumber: msg });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="page-container">
        <div className="admin-success-card">
          <div className="admin-success-icon"><FiCheckCircle /></div>
          <h2>Vendor Created Successfully!</h2>
          <p>The vendor account has been created. They can now log in with the credentials below.</p>
          <div className="admin-credentials-box">
            <div className="admin-cred-row">
              <span className="admin-cred-label">Vendor Name</span>
              <span className="admin-cred-value">{success.vendor?.name}</span>
            </div>
            <div className="admin-cred-row">
              <span className="admin-cred-label">Login Email</span>
              <span className="admin-cred-value">{success.vendorUser?.email}</span>
            </div>
            <div className="admin-cred-row">
              <span className="admin-cred-label">Station</span>
              <span className="admin-cred-value">{success.vendor?.stationName}</span>
            </div>
            <div className="admin-cred-row">
              <span className="admin-cred-label">Category</span>
              <span className="admin-cred-value" style={{ textTransform: 'capitalize' }}>{success.vendor?.category?.replace('_', ' ')}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1.5rem' }}>
            <button className="btn-secondary" onClick={() => { setSuccess(null); setForm({ vendorName: '', ownerName: '', email: '', phone: '', password: '', confirmPassword: '', licenseNumber: '', stationName: '', category: 'pantry', description: '', contactPhone: '', contactEmail: '', address: '', trainNumbers: '' }); }}>
              Add Another Vendor
            </button>
            <button className="btn-primary" onClick={() => navigate('/admin/vendors')}>
              View All Vendors
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header-row">
        <div>
          <button className="btn-link" onClick={() => navigate('/admin/vendors')} style={{ marginBottom: '0.5rem' }}>
            <FiArrowLeft /> Back to Vendors
          </button>
          <h1 className="page-title">Add New Vendor</h1>
          <p className="page-subtitle">Create a vendor account and profile</p>
        </div>
      </div>

      <div className="admin-form-card">
        <form onSubmit={handleSubmit} noValidate>
          {/* Section: Account Info */}
          <div className="admin-form-section">
            <div className="admin-form-section-title">👤 Owner / Account Details</div>
            <div className="admin-form-grid">
              <div className="form-group">
                <label>Owner Full Name *</label>
                <input type="text" placeholder="Owner's full name" value={form.ownerName} onChange={set('ownerName')} className={errors.ownerName ? 'error' : ''} />
                {errors.ownerName && <span className="form-error">{errors.ownerName}</span>}
              </div>
              <div className="form-group">
                <label>Login Email *</label>
                <input type="email" placeholder="vendor@example.com" value={form.email} onChange={set('email')} className={errors.email ? 'error' : ''} />
                {errors.email && <span className="form-error">{errors.email}</span>}
              </div>
              <div className="form-group">
                <label>Phone Number *</label>
                <input type="tel" placeholder="10-digit mobile number" value={form.phone} onChange={set('phone')} className={errors.phone ? 'error' : ''} />
                {errors.phone && <span className="form-error">{errors.phone}</span>}
              </div>
              <div className="form-group">
                <label>Password *</label>
                <div className="password-field">
                  <input type={showPwd ? 'text' : 'password'} placeholder="Min. 6 characters" value={form.password} onChange={set('password')} className={errors.password ? 'error' : ''} />
                  <button type="button" className="password-toggle" onClick={() => setShowPwd(!showPwd)}>
                    {showPwd ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {errors.password && <span className="form-error">{errors.password}</span>}
              </div>
              <div className="form-group">
                <label>Confirm Password *</label>
                <div className="password-field">
                  <input type={showConfirm ? 'text' : 'password'} placeholder="Re-enter password" value={form.confirmPassword} onChange={set('confirmPassword')} className={errors.confirmPassword ? 'error' : ''} />
                  <button type="button" className="password-toggle" onClick={() => setShowConfirm(!showConfirm)}>
                    {showConfirm ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
              </div>
            </div>
          </div>

          {/* Section: Vendor Info */}
          <div className="admin-form-section">
            <div className="admin-form-section-title">🏪 Vendor / Business Details</div>
            <div className="admin-form-grid">
              <div className="form-group">
                <label>Vendor / Shop Name *</label>
                <input type="text" placeholder="e.g. Suresh Caterers Pvt Ltd" value={form.vendorName} onChange={set('vendorName')} className={errors.vendorName ? 'error' : ''} />
                {errors.vendorName && <span className="form-error">{errors.vendorName}</span>}
              </div>
              <div className="form-group">
                <label>License Number *</label>
                <input type="text" placeholder="e.g. LIC001" value={form.licenseNumber} onChange={set('licenseNumber')} className={errors.licenseNumber ? 'error' : ''} />
                {errors.licenseNumber && <span className="form-error">{errors.licenseNumber}</span>}
              </div>
              <div className="form-group">
                <label>Station Name *</label>
                <input type="text" placeholder="e.g. New Delhi" value={form.stationName} onChange={set('stationName')} className={errors.stationName ? 'error' : ''} />
                {errors.stationName && <span className="form-error">{errors.stationName}</span>}
              </div>
              <div className="form-group">
                <label>Category *</label>
                <select value={form.category} onChange={set('category')}>
                  <option value="pantry">Pantry Car</option>
                  <option value="platform_stall">Platform Stall</option>
                  <option value="catering">Catering</option>
                  <option value="packaged_food">Packaged Food</option>
                </select>
              </div>
              <div className="form-group">
                <label>Train Numbers <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(comma separated)</span></label>
                <input type="text" placeholder="e.g. 12301, 12302" value={form.trainNumbers} onChange={set('trainNumbers')} />
              </div>
              <div className="form-group">
                <label>Contact Phone</label>
                <input type="tel" placeholder="Business phone" value={form.contactPhone} onChange={set('contactPhone')} />
              </div>
              <div className="form-group">
                <label>Contact Email</label>
                <input type="email" placeholder="Business email" value={form.contactEmail} onChange={set('contactEmail')} />
              </div>
              <div className="form-group">
                <label>Address</label>
                <input type="text" placeholder="Business address" value={form.address} onChange={set('address')} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Description</label>
                <textarea rows={3} placeholder="Brief description of the vendor..." value={form.description} onChange={set('description')} />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => navigate('/admin/vendors')}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating Vendor...' : 'Create Vendor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVendorPage;
