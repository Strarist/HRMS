import React from 'react';

/**
 * Standard loading spinner component.
 */
export const LoadingState = ({ message = 'Loading...', minHeight = 'h-64', className = '' }) => {
  return (
    <div className={`flex flex-col items-center justify-center ${minHeight} ${className}`}>
      <div className="w-10 h-10 border-3 border-[var(--border-subtle)] border-t-[var(--brand-primary)] rounded-full animate-spin"></div>
      {message && (
        <p className="mt-4 text-sm text-[var(--text-secondary)]">{message}</p>
      )}
    </div>
  );
};

export default LoadingState;
