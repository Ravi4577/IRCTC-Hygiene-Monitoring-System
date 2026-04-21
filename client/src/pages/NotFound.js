import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '100vh', gap: '1rem',
      background: 'var(--bg)', padding: '2rem', textAlign: 'center',
    }}>
      <div style={{ fontSize: '5rem', lineHeight: 1 }}>🚂</div>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>404</h1>
      <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Page not found</p>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: 320 }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <button
        onClick={() => navigate('/dashboard')}
        className="btn-primary"
        style={{ marginTop: '0.5rem' }}
      >
        Go to Dashboard
      </button>
    </div>
  );
};

export default NotFound;
