import React from 'react';

const base =
  'inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

const variants = {
  primary:
    'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 focus:ring-indigo-500 dark:focus:ring-indigo-400',
  secondary:
    'bg-white/70 dark:bg-gray-800/70 text-gray-900 dark:text-gray-100 border border-white/30 dark:border-white/10 hover:bg-white/90 dark:hover:bg-gray-800/90',
  ghost:
    'bg-transparent text-gray-700 dark:text-gray-200 hover:bg-black/5 dark:hover:bg-white/10',
};

const sizes = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-base',
};

export default function Button({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  ...props
}) {
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
}

