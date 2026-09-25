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
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 relative">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 animate-in slide-in-from-top-2 duration-300">
          <div
            className={`px-4 py-3 rounded-xl shadow-lg border text-sm font-medium flex items-center gap-2.5 ${
              toast.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            {toast.type === 'success' ? (
              <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-rose-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span>{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Lead Tracker
              </h1>
              {!isLoading && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {totalCount} {totalCount === 1 ? 'lead' : 'leads'}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Capture, qualify, and convert your pipeline leads in real-time.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 active:scale-98 transition-all shadow-sm hover:shadow-md cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Lead
            </button>
          </div>
        </header>

        {/* Quick Metrics Bar */}
        <section className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Leads</span>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">{totalCount}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
            <span className="text-xs font-medium text-purple-600 uppercase tracking-wider">Qualified</span>
            <div className="text-xl sm:text-2xl font-bold text-purple-700 mt-1">{qualifiedCount}</div>
          </div>
          <div className="col-span-2 sm:col-span-1 bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
            <span className="text-xs font-medium text-emerald-600 uppercase tracking-wider">Won Deals</span>
            <div className="text-xl sm:text-2xl font-bold text-emerald-700 mt-1">{wonCount}</div>
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
          <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
            <button
              onClick={() => fetchLeads()}
              className="underline font-medium hover:text-rose-900 cursor-pointer"
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
