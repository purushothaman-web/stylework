import React from 'react';
import type { LeadStatus } from '../types/lead';

interface StatusFilterProps {
  value: string;
  onChange: (status: LeadStatus | '') => void;
}

const statusOptions: { label: string; value: LeadStatus | '' }[] = [
  { label: 'All Statuses', value: '' },
  { label: 'New', value: 'NEW' },
  { label: 'Contacted', value: 'CONTACTED' },
  { label: 'Qualified', value: 'QUALIFIED' },
  { label: 'Won', value: 'WON' },
  { label: 'Lost', value: 'LOST' },
];

export const StatusFilter: React.FC<StatusFilterProps> = ({ value, onChange }) => {
  return (
    <div className="relative min-w-[160px] sm:min-w-[180px]">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
      </div>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value as LeadStatus | '')}
        className="w-full pl-9 pr-8 py-2.5 text-sm bg-white border border-slate-200/90 rounded-xl text-slate-700 font-medium appearance-none focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-2xs transition-all cursor-pointer"
      >
        {statusOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
};
