import React from 'react';

/**
 * Standard page wrapper ensuring uniform padding, maximum width, and theme background.
 */
export const PageContainer = ({ children, maxWidth = 'max-w-7xl', className = '' }) => {
  return (
    <div className={`min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] p-4 sm:p-6 lg:p-8 ${className}`}>
      <div className={`mx-auto ${maxWidth} space-y-6`}>
        {children}
      </div>
    </div>
  );
};

export default PageContainer;
