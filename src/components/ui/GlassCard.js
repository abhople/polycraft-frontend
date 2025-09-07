import React from 'react';

const GlassCard = ({ children, className = '' }) => {
  return (
    <div className={`glass-card rounded-2xl p-6 md:p-8 shadow-glass ${className}`}>
      {children}
    </div>
  );
};

export default GlassCard;
