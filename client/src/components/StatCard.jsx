import React from 'react';

export const StatCard = ({ label, value, subtext, icon: Icon, colorType = 'primary' }) => {
  return (
    <div className="stat-card">
      <div className="stat-info">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{value}</span>
        {subtext && <span className="stat-subtext">{subtext}</span>}
      </div>
      <div className={`stat-icon-wrapper stat-icon-${colorType}`}>
        <Icon size={24} />
      </div>
    </div>
  );
};
