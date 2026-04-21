import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff, FiAlertCircle, FiWifi } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');          // single string, not object
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    const email = form.email.trim().toLowerCase();
    if (!email) return 'Email address is required';
    if (!/\S+@\S+\.\S+/.test(email)) return 'Enter a valid email address';
    if (!form.password) return 'Password is required';
    return null;
  };

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    if (error) setError('');   // clear error as soon as user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    setError('');

    const email    = form.email.trim().toLowerCase();
    const password = form.password;

    try {
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      if (err.response) {
        // Server replied — show the real message
        const status   = err.response.status;
        const msg      = err.response.data?.message;
        const firstErr = err.response.data?.errors?.[0]?.message;

        if (status === 401) {
          setError('Invalid email or password. Please check your credentials.');
        } else if (status === 403) {
          setError(msg || 'Account access denied. Contact support.');
        } else if (status === 400) {
          setError(firstErr || msg || 'Please check your input and try again.');
        } else {
          setError(msg || `Server error (${status}). Please try again.`);
        }
      } else if (err.request) {
        // Request sent but no response — server unreachable or CORS blocked
        setError(
          'Cannot reach the server. Please check your internet connection and try again.'
        );
      } else {
        setError(err.message || 'An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  const emailError    = !form.email && error === 'Email address is required';
  const passwordError = !form.password && error === 'Password is required';

  return (
    <div className="auth-card">
      <div className="auth-logo-mark">🚂</div>
      <h2 className="auth-title">Sign In</h2>
      <p className="auth-subtitle">Enter your email and password to continue.</p>

      {error && (
        <div className="auth-error-banner" role="alert">
          <FiAlertCircle />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        <div className="form-group">
          <label htmlFor="login-email">Email address</label>
          <input
            id="login-email"
            type="email"
            inputMode="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange('email')}
            className={emailError ? 'error' : ''}
            autoComplete="email"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck="false"
          />
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
              className={passwordError ? 'error' : ''}
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
              tabIndex={-1}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
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
