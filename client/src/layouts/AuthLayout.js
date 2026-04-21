import React from 'react';
import { Outlet } from 'react-router-dom';
import './AuthLayout.css';

const AuthLayout = () => (
  <div className="auth-layout">
    <div className="auth-brand">
      <div className="auth-brand-content">
        <div className="auth-logo">🚂</div>
        <h1>IRCTC Hygiene Monitor</h1>
        <p>Ensuring safe and hygienic food services across Indian Railways</p>
        <div className="auth-features">
          <div className="auth-feature">✅ Real-time complaint tracking</div>
          <div className="auth-feature">✅ Vendor hygiene ratings</div>
          <div className="auth-feature">✅ AI-powered sentiment analysis</div>
          <div className="auth-feature">✅ Officer inspection management</div>
        </div>
      </div>
    </div>
    <div className="auth-form-container">
      <Outlet />
    </div>
  </div>
);

export default AuthLayout;
