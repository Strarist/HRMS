import React from 'react';

/**
 * Standard metric / KPI card for dashboards.
 */
export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'purple',
  onClick,
  className = ''
}) => {
  const colorMap = {
    purple: 'from-[#A88BFF] to-[#8B6FE8] text-[#A88BFF]',
    blue: 'from-blue-500 to-indigo-600 text-blue-400',
    green: 'from-emerald-500 to-teal-600 text-emerald-400',
    amber: 'from-amber-500 to-orange-600 text-amber-400',
    red: 'from-rose-500 to-red-600 text-rose-400'
  };

  const selectedColor = colorMap[color] || colorMap.purple;

  return (
    <div
      onClick={onClick}
      className={`bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-6 transition-all duration-200 hover:shadow-lg ${
        onClick ? 'cursor-pointer hover:border-[var(--brand-primary)]' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-[var(--text-secondary)]">{title}</span>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${selectedColor.split(' ').pop()}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="mt-4 flex items-baseline justify-between">
        <span className="text-3xl font-bold tracking-tight text-white">{value}</span>
        {trend && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            trend.isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
          }`}>
            {trend.value}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="mt-2 text-xs text-[var(--text-muted)]">{subtitle}</p>
      )}
    </div>
  );
};

export default StatCard;
