import React from 'react';
import type { CreateLeadPayload } from '../types/lead';

interface LeadFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateLeadPayload) => Promise<void>;
}

export const LeadFormModal: React.FC<LeadFormModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>Add Lead</h2>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};
