import React from 'react';

const IconButton = ({ 
  children, 
  onClick, 
  title,
  className = '',
  ...props 
}) => {
  return (
    <button
      className={`
        inline-flex items-center justify-center w-8 h-8 rounded-lg 
        bg-white/10 backdrop-blur text-white border border-white/20 
        hover:bg-white/15 active:scale-[0.95] transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-0
        ${className}
      `}
      onClick={onClick}
      title={title}
      {...props}
    >
      {children}
    </button>
  );
};

export default IconButton;
