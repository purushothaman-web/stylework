import React from 'react';
import type { Lead, LeadStatus } from '../types/lead';
import { LeadRow } from './LeadRow';

interface LeadTableProps {
  leads: Lead[];
  onStatusChange?: (id: string, status: LeadStatus) => void;
}

export const LeadTable: React.FC<LeadTableProps> = ({ leads, onStatusChange }) => {
  if (leads.length === 0) {
    return <div>No leads found.</div>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Phone</th>
          <th>Status</th>
          <th>Created</th>
        </tr>
      </thead>
      <tbody>
        {leads.map((lead) => (
          <LeadRow key={lead.id} lead={lead} onStatusChange={onStatusChange} />
        ))}
      </tbody>
    </table>
  );
};
