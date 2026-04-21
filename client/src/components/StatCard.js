import React from 'react';
import './StatCard.css';

const StatCard = ({ title, value, icon, color = 'primary', subtitle }) => (
  <div className={`stat-card stat-card--${color}`}>
    <div className="stat-card-body">
      <div className="stat-card-info">
        <p className="stat-card-title">{title}</p>
        <h3 className="stat-card-value">{value}</h3>
        {subtitle && <p className="stat-card-subtitle">{subtitle}</p>}
      </div>
      <div className="stat-card-icon-wrap">{icon}</div>
    </div>
  </div>
);

export default StatCard;
