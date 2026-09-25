import React from 'react';
import type { Lead, LeadStatus } from '../types/lead';
import { InlineStatusSelect } from './InlineStatusSelect';

interface LeadCardProps {
  lead: Lead;
  onStatusChange?: (id: string, status: LeadStatus) => void;
}

export const LeadCard: React.FC<LeadCardProps> = ({ lead, onStatusChange }) => {
  const formattedDate = new Date(lead.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="bg-card-bg rounded-xl border border-stone-border p-4 shadow-2xs hover:border-[#d6d3cb] transition-all flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-espresso">{lead.name}</h3>
          <p className="text-xs text-[#78716c] mt-0.5">{formattedDate}</p>
        </div>
        <InlineStatusSelect
          status={lead.status}
          onChange={onStatusChange ? (newStatus) => onStatusChange(lead.id, newStatus) : undefined}
        />
      </div>

      <div className="text-xs text-[#57534e] flex flex-col gap-1.5 pt-2.5 border-t border-[#f2f0ea]">
        <div className="flex items-center gap-2">
          <svg className="w-3.5 h-3.5 text-[#a8a29e] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span className="truncate">{lead.email}</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-3.5 h-3.5 text-[#a8a29e] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <span className="font-mono text-[11px]">{lead.phone}</span>
        </div>
      </div>
    </div>
  );
};
