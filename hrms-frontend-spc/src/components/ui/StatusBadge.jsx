import React from 'react';

/**
 * Standard status badge with semantic color mapping.
 */
export const StatusBadge = ({ status, label, size = 'sm', className = '' }) => {
  const normalized = (status || '').toLowerCase().trim();

  const statusStyles = {
    // Positive
    active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    approved: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    completed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    joined: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    available: 'bg-teal-500/15 text-teal-300 border-teal-500/30',

    // In Progress / Warning
    pending: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    'in-progress': 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    screening: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    'interview-scheduled': 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
    'offer-extended': 'bg-purple-500/15 text-purple-400 border-purple-500/30',

    // Neutral
    draft: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
    inactive: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
    archived: 'bg-gray-500/15 text-gray-400 border-gray-500/30',

    // Negative
    rejected: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    cancelled: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    terminated: 'bg-rose-500/15 text-rose-400 border-rose-500/30'
  };

  const style = statusStyles[normalized] || 'bg-gray-500/15 text-gray-300 border-gray-600/30';
  const sizeClass = size === 'lg' ? 'px-3 py-1 text-sm' : 'px-2.5 py-0.5 text-xs';

  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${style} ${sizeClass} ${className}`}>
      {label || status}
    </span>
  );
};

export default StatusBadge;
