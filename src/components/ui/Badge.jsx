import React from 'react';

export default function Badge({ children, className = '' }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-black/5 dark:bg-white/10 text-gray-700 dark:text-gray-200 ${className}`}>
      {children}
    </span>
  );
}

