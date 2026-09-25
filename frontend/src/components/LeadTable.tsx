import React from 'react';
import type { Lead, LeadStatus } from '../types/lead';
import { LeadRow } from './LeadRow';
import { LeadCard } from './LeadCard';

interface LeadTableProps {
  leads: Lead[];
  isLoading?: boolean;
  onStatusChange?: (id: string, status: LeadStatus) => void;
  onAddLeadClick?: () => void;
}

export const LeadTable: React.FC<LeadTableProps> = ({
  leads,
  isLoading,
  onStatusChange,
  onAddLeadClick,
}) => {
  if (isLoading) {
    return (
      <div className="bg-card-bg rounded-2xl border border-stone-border p-6 shadow-xs overflow-hidden">
        <div className="animate-pulse space-y-4">
          <div className="h-5 bg-[#f0eee6] rounded-md w-1/4" />
          <div className="space-y-3 pt-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-11 bg-[#f9f8f5] rounded-xl w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="bg-card-bg rounded-2xl border border-dashed border-[#d6d3cb] p-12 text-center shadow-xs">
        <div className="w-12 h-12 rounded-full bg-[#fef3c7] text-[#92400e] flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        </div>
        <h3 className="text-base font-bold text-espresso">No leads in pipeline</h3>
        <p className="text-sm text-[#78716c] mt-1 max-w-sm mx-auto">
          No leads match your search or filter. Begin by adding your first prospect.
        </p>
        {onAddLeadClick && (
          <button
            onClick={onAddLeadClick}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-terracotta hover:bg-[#9a3412] rounded-xl transition-colors shadow-xs cursor-pointer"
          >
            + Add First Lead
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table View */}
      <div className="hidden md:block bg-card-bg rounded-2xl border border-stone-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto min-h-65">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f5f4ef] border-b border-stone-border text-[11px] font-bold text-[#78716c] uppercase tracking-wider">
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <LeadRow
                  key={lead.id}
                  lead={lead}
                  onStatusChange={onStatusChange}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Stacked Card View */}
      <div className="md:hidden flex flex-col gap-3">
        {leads.map((lead) => (
          <LeadCard
            key={lead.id}
            lead={lead}
            onStatusChange={onStatusChange}
          />
        ))}
      </div>
    </div>
  );
};
