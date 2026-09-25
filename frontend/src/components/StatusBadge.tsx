import React from 'react';
import type { LeadStatus } from '../types/lead';

interface StatusBadgeProps {
  status: LeadStatus;
}

const statusConfig: Record<
  LeadStatus,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  NEW: {
    label: 'New',
    bg: 'bg-[#f0eee6]',
    text: 'text-[#44403c]',
    border: 'border-[#dfdbcf]',
    dot: 'bg-[#78716c]',
  },
  CONTACTED: {
    label: 'Contacted',
    bg: 'bg-[#fef3c7]',
    text: 'text-[#92400e]',
    border: 'border-[#fde68a]',
    dot: 'bg-[#d97706]',
  },
  QUALIFIED: {
    label: 'Qualified',
    bg: 'bg-[#ede9fe]',
    text: 'text-[#4338ca]',
    border: 'border-[#ddd6fe]',
    dot: 'bg-[#6366f1]',
  },
  WON: {
    label: 'Won',
    bg: 'bg-[#dcfce7]',
    text: 'text-[#166534]',
    border: 'border-[#bbf7d0]',
    dot: 'bg-[#16a34a]',
  },
  LOST: {
    label: 'Lost',
    bg: 'bg-[#ffe4e6]',
    text: 'text-[#9f1239]',
    border: 'border-[#fecdd3]',
    dot: 'bg-[#e11d48]',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = statusConfig[status] || statusConfig.NEW;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border} shadow-2xs transition-colors`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};
