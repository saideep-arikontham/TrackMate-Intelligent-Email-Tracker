import React from 'react';

export default function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-md bg-black/10 dark:bg-white/10 ${className}`} />;
}

