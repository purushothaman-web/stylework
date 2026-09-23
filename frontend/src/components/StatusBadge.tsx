import React from 'react';
import type { LeadStatus } from '../types/lead';

interface StatusBadgeProps {
  status: LeadStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  return <span>{status}</span>;
};
