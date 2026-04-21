import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff, FiAlertCircle } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import './Auth.css';

// Allowed roles for public registration — admin is intentionally excluded
const ROLES = [
  { value: 'passenger', label: 'Passenger' },
  { value: 'vendor',    label: 'Vendor / Food Stall Owner' },
  { value: 'officer',   label: 'Hygiene Officer' },
];

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    role: 'passenger',
    password: '', confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const set = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    if (errors[field]) setErrors({ ...errors, [field]: '' });
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Full name is required';

    if (!form.email.trim()) errs.email = 'Email address is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email address';

    if (!form.phone.trim()) {
      errs.phone = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(form.phone.trim())) {
      errs.phone = 'Enter a valid 10-digit phone number';
    }

    if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setErrors({});

    try {
      const { confirmPassword, ...data } = form;
      await register(data);
      toast.success('Account created! Welcome aboard 🎉');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(msg);
      if (msg.toLowerCase().includes('email')) setErrors({ email: msg });
      else setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-logo-mark">🚂</div>
      <h2 className="auth-title">Create Account</h2>
      <p className="auth-subtitle">Join the IRCTC Hygiene Monitoring System</p>

      {errors.general && (
        <div className="auth-error-banner">
          <FiAlertCircle />
          <span>{errors.general}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        {/* Full Name */}
        <div className="form-group">
          <label htmlFor="reg-name">Full Name <span className="required-star">*</span></label>
          <input
            id="reg-name"
            type="text"
            placeholder="Your full name"
            value={form.name}
            onChange={set('name')}
            className={errors.name ? 'error' : ''}
            autoComplete="name"
            autoFocus
          />
          {errors.name && <span className="form-error">{errors.name}</span>}
        </div>

        {/* Email */}
        <div className="form-group">
          <label htmlFor="reg-email">Email Address <span className="required-star">*</span></label>
          <input
            id="reg-email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={set('email')}
            className={errors.email ? 'error' : ''}
            autoComplete="email"
          />
          {errors.email && <span className="form-error">{errors.email}</span>}
        </div>

        {/* Phone */}
        <div className="form-group">
          <label htmlFor="reg-phone">Phone Number <span className="required-star">*</span></label>
          <input
            id="reg-phone"
            type="tel"
            placeholder="10-digit mobile number"
            value={form.phone}
            onChange={set('phone')}
            className={errors.phone ? 'error' : ''}
            autoComplete="tel"
            maxLength={10}
          />
          {errors.phone && <span className="form-error">{errors.phone}</span>}
        </div>

        {/* Role — admin intentionally excluded */}
        <div className="form-group">
          <label htmlFor="reg-role">I am registering as <span className="required-star">*</span></label>
          <select id="reg-role" value={form.role} onChange={set('role')}>
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>

        {/* Password */}
        <div className="form-group">
          <label htmlFor="reg-password">Password <span className="required-star">*</span></label>
          <div className="password-field">
            <input
              id="reg-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Minimum 6 characters"
              value={form.password}
              onChange={set('password')}
              className={errors.password ? 'error' : ''}
              autoComplete="new-password"
            />
            <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
          {errors.password && <span className="form-error">{errors.password}</span>}
        </div>

        {/* Confirm Password */}
        <div className="form-group">
          <label htmlFor="reg-confirm">Confirm Password <span className="required-star">*</span></label>
          <div className="password-field">
            <input
              id="reg-confirm"
              type={showConfirm ? 'text' : 'password'}
              placeholder="Re-enter your password"
              value={form.confirmPassword}
              onChange={set('confirmPassword')}
              className={errors.confirmPassword ? 'error' : ''}
              autoComplete="new-password"
            />
            <button type="button" className="password-toggle" onClick={() => setShowConfirm(!showConfirm)}>
              {showConfirm ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
          {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
        </div>

        <button type="submit" className="auth-submit-btn" disabled={loading}>
          {loading ? 'Creating account…' : 'Create Account'}
        </button>
      </form>

      <p className="auth-footer">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </div>
  );
};

export default Register;
