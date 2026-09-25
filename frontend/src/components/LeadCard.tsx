import React from 'react';
import type { Lead, LeadStatus } from '../types/lead';
import { StatusBadge } from './StatusBadge';

interface LeadCardProps {
  lead: Lead;
  onStatusChange?: (id: string, status: LeadStatus) => void;
}

export const LeadCard: React.FC<LeadCardProps> = ({ lead }) => {
  const formattedDate = new Date(lead.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs hover:border-slate-300 transition-all flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{lead.name}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{formattedDate}</p>
        </div>
        <StatusBadge status={lead.status} />
      </div>

      <div className="text-xs text-slate-600 flex flex-col gap-1.5 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span className="truncate">{lead.email}</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <span>{lead.phone}</span>
        </div>
      </div>
    </div>
  );
};
