import React from 'react';

export default function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full rounded-lg border border-white/30 dark:border-white/10 bg-white/80 dark:bg-gray-800/60 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent ${className}`}
      {...props}
    />
  );
}

