import React from 'react';
import type { Lead, LeadStatus } from '../types/lead';
import { StatusBadge } from './StatusBadge';

interface LeadRowProps {
  lead: Lead;
  onStatusChange?: (id: string, status: LeadStatus) => void;
}

export const LeadRow: React.FC<LeadRowProps> = ({ lead }) => {
  return (
    <tr>
      <td>{lead.name}</td>
      <td>{lead.email}</td>
      <td>{lead.phone}</td>
      <td>
        <StatusBadge status={lead.status} />
      </td>
      <td>{new Date(lead.createdAt).toLocaleDateString()}</td>
    </tr>
  );
};
