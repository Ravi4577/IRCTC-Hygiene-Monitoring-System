import React from 'react';
import './Spinner.css';

const Spinner = ({ size = 'md', center = false }) => (
  <div className={`spinner-wrapper ${center ? 'spinner-center' : ''}`}>
    <div className={`spinner spinner--${size}`} />
  </div>
);

export default Spinner;
