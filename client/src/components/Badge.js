import React from 'react';
import './Badge.css';

const Badge = ({ label, type = 'default' }) => (
  <span className={`badge-pill badge-pill--${type}`}>{label}</span>
);

export default Badge;
