import React from 'react';
import type { LeadStatus } from '../types/lead';

interface StatusFilterProps {
  value: string;
  onChange: (status: LeadStatus | '') => void;
}

export const StatusFilter: React.FC<StatusFilterProps> = ({ value, onChange }) => {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value as LeadStatus | '')}>
      <option value="">All Statuses</option>
      <option value="NEW">New</option>
      <option value="CONTACTED">Contacted</option>
      <option value="QUALIFIED">Qualified</option>
      <option value="WON">Won</option>
      <option value="LOST">Lost</option>
    </select>
  );
};
