import React from 'react';
import type { Lead, LeadStatus } from '../types/lead';
import { InlineStatusSelect } from './InlineStatusSelect';

interface LeadRowProps {
  lead: Lead;
  onStatusChange?: (id: string, status: LeadStatus) => void;
}

export const LeadRow: React.FC<LeadRowProps> = ({ lead, onStatusChange }) => {
  const formattedDate = new Date(lead.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors">
      <td className="py-3.5 px-4 text-sm font-medium text-slate-900">
        {lead.name}
      </td>
      <td className="py-3.5 px-4 text-sm text-slate-600">
        {lead.email}
      </td>
      <td className="py-3.5 px-4 text-sm text-slate-600 font-mono text-xs">
        {lead.phone}
      </td>
      <td className="py-3.5 px-4 text-sm">
        <InlineStatusSelect
          status={lead.status}
          onChange={onStatusChange ? (newStatus) => onStatusChange(lead.id, newStatus) : undefined}
        />
      </td>
      <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
        {formattedDate}
      </td>
    </tr>
  );
};
