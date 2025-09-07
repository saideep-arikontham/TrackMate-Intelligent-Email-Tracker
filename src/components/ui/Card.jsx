import React from 'react';

export function Card({ className = '', children }) {
  return (
    <div className={`bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-xl shadow-lg ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ className = '', children }) {
  return <div className={`px-6 py-4 border-b border-white/20 dark:border-white/10 ${className}`}>{children}</div>;
}

export function CardTitle({ className = '', children }) {
  return <h3 className={`text-lg font-semibold text-gray-900 dark:text-white ${className}`}>{children}</h3>;
}

export function CardContent({ className = '', children }) {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>;
}

export function CardFooter({ className = '', children }) {
  return <div className={`px-6 py-4 border-t border-white/20 dark:border-white/10 ${className}`}>{children}</div>;
}

