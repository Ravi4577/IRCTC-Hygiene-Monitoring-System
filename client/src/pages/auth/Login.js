import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff, FiAlertCircle } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    const errs = {};
    // Trim and lowercase before validating — fixes mobile keyboard quirks
    const email = form.email.trim().toLowerCase();
    if (!email) errs.email = 'Email address is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Enter a valid email address';
    if (!form.password) errs.password = 'Password is required';
    return errs;
  };

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    if (errors[field] || errors.general) setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation(); // prevent any parent handlers on mobile

    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setErrors({});

    // Always trim + lowercase email before sending — critical for mobile
    const email = form.email.trim().toLowerCase();
    const password = form.password;

    try {
      const user = await login(email, password);
      // Navigate based on role
      const dashboards = {
        admin:     '/dashboard/admin',
        officer:   '/dashboard/officer',
        vendor:    '/dashboard/vendor',
        passenger: '/dashboard/passenger',
      };
      navigate(dashboards[user.role] || '/dashboard', { replace: true });
    } catch (err) {
      const status = err.response?.status;
      const msg    = err.response?.data?.message || 'Login failed. Please try again.';

      if (status === 401) {
        setErrors({ general: 'Invalid email or password. Please check your credentials.' });
      } else if (status === 403) {
        setErrors({ general: msg });
      } else {
        setErrors({ general: msg });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-logo-mark">🚂</div>
      <h2 className="auth-title">Sign In</h2>
      <p className="auth-subtitle">Enter your email and password to continue.</p>

      {errors.general && (
        <div className="auth-error-banner" role="alert">
          <FiAlertCircle />
          <span>{errors.general}</span>
        </div>
      )}

      {/* noValidate disables browser native validation which can behave oddly on mobile */}
      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        <div className="form-group">
          <label htmlFor="login-email">Email address</label>
          <input
            id="login-email"
            type="email"
            inputMode="email"          /* shows email keyboard on mobile */
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange('email')}
            className={errors.email ? 'error' : ''}
            autoComplete="email"
            autoCapitalize="none"      /* prevents iOS from capitalising email */
            autoCorrect="off"          /* prevents autocorrect mangling email */
            spellCheck="false"
            /* NO autoFocus — causes keyboard pop + viewport shift on mobile */
          />
          {errors.email && <span className="form-error">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="login-password">Password</label>
          <div className="password-field">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange('password')}
              className={errors.password ? 'error' : ''}
              autoComplete="current-password"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((p) => !p)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={-1}            /* don't steal tab focus from submit */
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
          {errors.password && <span className="form-error">{errors.password}</span>}
        </div>

        <button
          type="submit"
          className="auth-submit-btn"
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>

      <p className="auth-footer">
        New passenger? <Link to="/register">Create an account</Link>
      </p>
    </div>
  );
};

export default Login;
