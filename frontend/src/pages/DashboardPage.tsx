import React, { useState } from 'react';
import { SearchBar } from '../components/SearchBar';
import { StatusFilter } from '../components/StatusFilter';
import { LeadTable } from '../components/LeadTable';
import { LeadFormModal } from '../components/LeadFormModal';
import type { Lead, LeadStatus, CreateLeadPayload } from '../types/lead';

export const DashboardPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<LeadStatus | ''>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leads] = useState<Lead[]>([]);

  const handleCreateLead = async (_data: CreateLeadPayload): Promise<void> => {
    // Feature implementation in subsequent step
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Lead Tracker</h1>
        <button onClick={() => setIsModalOpen(true)}>+ Add Lead</button>
      </header>

      <section className="dashboard-controls">
        <SearchBar value={search} onChange={setSearch} />
        <StatusFilter value={status} onChange={setStatus} />
      </section>

      <main className="dashboard-content">
        <LeadTable leads={leads} />
      </main>

      <LeadFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateLead}
      />
    </div>
  );
};
