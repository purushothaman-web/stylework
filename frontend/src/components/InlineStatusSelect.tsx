import React from 'react';
import type { LeadStatus } from '../types/lead';

interface InlineStatusSelectProps {
  status: LeadStatus;
  onChange?: (status: LeadStatus) => void;
  disabled?: boolean;
}

const statusConfig: Record<
  LeadStatus,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  NEW: {
    label: 'New',
    bg: 'bg-sky-50 hover:bg-sky-100/80',
    text: 'text-sky-700',
    border: 'border-sky-200',
    dot: 'bg-sky-500',
  },
  CONTACTED: {
    label: 'Contacted',
    bg: 'bg-amber-50 hover:bg-amber-100/80',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
  },
  QUALIFIED: {
    label: 'Qualified',
    bg: 'bg-purple-50 hover:bg-purple-100/80',
    text: 'text-purple-700',
    border: 'border-purple-200',
    dot: 'bg-purple-500',
  },
  WON: {
    label: 'Won',
    bg: 'bg-emerald-50 hover:bg-emerald-100/80',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
  },
  LOST: {
    label: 'Lost',
    bg: 'bg-rose-50 hover:bg-rose-100/80',
    text: 'text-rose-700',
    border: 'border-rose-200',
    dot: 'bg-rose-500',
  },
};

const allStatuses: LeadStatus[] = ['NEW', 'CONTACTED', 'QUALIFIED', 'WON', 'LOST'];

export const InlineStatusSelect: React.FC<InlineStatusSelectProps> = ({
  status,
  onChange,
  disabled = false,
}) => {
  const config = statusConfig[status] || statusConfig.NEW;

  if (!onChange || disabled) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border} shadow-2xs`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
        {config.label}
      </span>
    );
  }

  return (
    <div className="relative inline-flex items-center">
      <select
        value={status}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value as LeadStatus)}
        className={`appearance-none cursor-pointer pl-6 pr-6 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border} shadow-2xs focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-400 transition-all`}
        title="Click to change lead status"
      >
        {allStatuses.map((s) => (
          <option key={s} value={s} className="bg-white text-slate-800 font-medium py-1">
            {statusConfig[s].label}
          </option>
        ))}
      </select>
      {/* Indicator dot */}
      <span className={`absolute left-2.5 w-1.5 h-1.5 rounded-full ${config.dot} pointer-events-none`} />
      {/* Small caret */}
      <svg
        className={`absolute right-2 w-3 h-3 ${config.text} pointer-events-none opacity-70`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
};
