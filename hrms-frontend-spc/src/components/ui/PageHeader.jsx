import React from 'react';

/**
 * Standard page header with title, subtitle, and action slot.
 */
export const PageHeader = ({ title, subtitle, actions, backAction, className = '' }) => {
  return (
    <div className={`flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-[var(--border-subtle)] ${className}`}>
      <div className="flex items-center space-x-4">
        {backAction && (
          <button
            onClick={backAction}
            className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-surface-hover)] transition-colors"
            title="Go back"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
        )}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">{title}</h1>
          {subtitle && <p className="text-sm text-[var(--text-secondary)] mt-1">{subtitle}</p>}
        </div>
      </div>
      {actions && (
        <div className="flex items-center flex-wrap gap-3">
          {actions}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
