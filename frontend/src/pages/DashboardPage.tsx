import React, { useState, useEffect, useCallback } from 'react';
import { LeadTable } from '../components/LeadTable';
import { LeadFormModal } from '../components/LeadFormModal';
import { SearchBar } from '../components/SearchBar';
import { StatusFilter } from '../components/StatusFilter';
import { leadApi } from '../api/leadApi';
import type { Lead, LeadStatus, CreateLeadPayload } from '../types/lead';

interface Toast {
  message: string;
  type: 'success' | 'error';
}

export const DashboardPage: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | ''>('');

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const fetchLeads = useCallback(async (searchQuery = search, statusQuery = statusFilter): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await leadApi.getLeads(searchQuery, statusQuery);
      setLeads(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load leads');
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter]);

  // Fetch leads on mount and whenever search or status filter changes
  useEffect(() => {
    fetchLeads(search, statusFilter);
  }, [search, statusFilter, fetchLeads]);

  const handleCreateLead = async (data: CreateLeadPayload): Promise<void> => {
    const newLead = await leadApi.createLead(data);
    setLeads((prev) => [newLead, ...prev]);
    showToast(`Lead "${newLead.name}" was successfully added!`, 'success');
  };

  // Optimistic Status Update
  const handleStatusChange = async (id: string, newStatus: LeadStatus): Promise<void> => {
    const previousLead = leads.find((l) => l.id === id);
    if (!previousLead || previousLead.status === newStatus) return;

    const oldStatus = previousLead.status;

    // 1. Optimistically update local state immediately
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l))
    );

    try {
      // 2. Fire API call in background
      await leadApi.updateLeadStatus(id, { status: newStatus });
      showToast(`Status updated to ${newStatus}`, 'success');
    } catch (err: unknown) {
      // 3. Rollback on failure
      setLeads((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status: oldStatus } : l))
      );
      showToast(
        err instanceof Error ? err.message : 'Failed to update status. Reverted.',
        'error'
      );
    }
  };

  // Metric stats
  const totalCount = leads.length;
  const wonCount = leads.filter((l) => l.status === 'WON').length;
  const qualifiedCount = leads.filter((l) => l.status === 'QUALIFIED').length;

  return (
    <div className="min-h-screen bg-canvas py-8 px-4 sm:px-6 lg:px-8 relative selection:bg-[#fde047] selection:text-espresso">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 animate-in slide-in-from-top-2 duration-300">
          <div
            className={`px-4 py-3 rounded-xl shadow-lg border text-sm font-medium flex items-center gap-2.5 ${
              toast.type === 'success'
                ? 'bg-[#f0fdf4] text-[#166534] border-[#bbf7d0]'
                : 'bg-[#fef2f2] text-[#991b1b] border-[#fecaca]'
            }`}
          >
            {toast.type === 'success' ? (
              <svg className="w-4 h-4 text-[#16a34a] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-[#ef4444] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span>{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 text-[#78716c] hover:text-espresso cursor-pointer"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Editorial Top Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-stone-border">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-3xl sm:text-4xl font-normal text-espresso tracking-tight">
                Lead Tracker
              </h1>
              {!isLoading && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#f0eee6] text-[#44403c] border border-[#dfdbcf]">
                  {totalCount} {totalCount === 1 ? 'prospect' : 'prospects'}
                </span>
              )}
            </div>
            <p className="text-sm text-[#78716c] mt-1 font-sans">
              Pipeline management for converting high-value opportunities.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-terracotta hover:bg-[#9a3412] active:scale-98 transition-all shadow-xs hover:shadow-sm rounded-xl cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Lead
            </button>
          </div>
        </header>

        {/* Editorial Metrics Bar */}
        <section className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-card-bg p-4 sm:p-5 rounded-2xl border border-stone-border shadow-2xs">
            <span className="text-[11px] font-semibold text-[#78716c] uppercase tracking-wider">Total Pipeline</span>
            <div className="font-display text-2xl sm:text-3xl font-medium text-espresso mt-1.5 tabular-nums">{totalCount}</div>
          </div>
          <div className="bg-card-bg p-4 sm:p-5 rounded-2xl border border-stone-border shadow-2xs">
            <span className="text-[11px] font-semibold text-[#4338ca] uppercase tracking-wider">Qualified</span>
            <div className="font-display text-2xl sm:text-3xl font-medium text-[#3730a3] mt-1.5 tabular-nums">{qualifiedCount}</div>
          </div>
          <div className="col-span-2 sm:col-span-1 bg-card-bg p-4 sm:p-5 rounded-2xl border border-stone-border shadow-2xs">
            <span className="text-[11px] font-semibold text-[#166534] uppercase tracking-wider">Won Deals</span>
            <div className="font-display text-2xl sm:text-3xl font-medium text-[#15803d] mt-1.5 tabular-nums">{wonCount}</div>
          </div>
        </section>

        {/* Search & Filter Controls */}
        <section className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1">
            <SearchBar value={search} onChange={setSearch} />
          </div>
          <StatusFilter value={statusFilter} onChange={setStatusFilter} />
        </section>

        {/* Error notification if fetch failed */}
        {error && (
          <div className="rounded-xl bg-[#fef2f2] border border-[#fecaca] p-4 text-sm text-[#991b1b] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[#ef4444]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
            <button
              onClick={() => fetchLeads()}
              className="underline font-semibold hover:text-[#7f1d1d] cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Lead Table / List View */}
        <main>
          <LeadTable
            leads={leads}
            isLoading={isLoading}
            onStatusChange={handleStatusChange}
            onAddLeadClick={() => setIsModalOpen(true)}
          />
        </main>

        <LeadFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateLead}
        />
      </div>
    </div>
  );
};
