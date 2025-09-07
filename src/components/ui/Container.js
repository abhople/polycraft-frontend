import React from 'react';

const Container = ({ children, className = '' }) => {
  return (
    <div className={`mx-auto max-w-6xl px-6 md:px-10 py-14 ${className}`}>
      {children}
    </div>
  );
};

export default Container;
