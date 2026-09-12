import React from 'react';

/**
 * Standard empty state for lists, tables, and dashboards.
 */
export const EmptyState = ({
  icon: Icon,
  title = 'No records found',
  description = 'There is no data to display right now.',
  action,
  className = ''
}) => {
  return (
    <div className={`bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-12 text-center flex flex-col items-center justify-center ${className}`}>
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-[var(--text-muted)] mb-4">
          <Icon className="w-8 h-8" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-[var(--text-secondary)] max-w-md mb-6">{description}</p>
      {action && (
        <div>{action}</div>
      )}
    </div>
  );
};

export default EmptyState;
