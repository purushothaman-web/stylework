import React, { useState, useRef, useEffect } from 'react';
import type { LeadStatus } from '../types/lead';

interface StatusFilterProps {
  value: string;
  onChange: (status: LeadStatus | '') => void;
}

const statusOptions: { label: string; value: LeadStatus | ''; dot?: string }[] = [
  { label: 'All Statuses', value: '' },
  { label: 'New', value: 'NEW', dot: 'bg-[#78716c]' },
  { label: 'Contacted', value: 'CONTACTED', dot: 'bg-[#d97706]' },
  { label: 'Qualified', value: 'QUALIFIED', dot: 'bg-[#6366f1]' },
  { label: 'Won', value: 'WON', dot: 'bg-[#16a34a]' },
  { label: 'Lost', value: 'LOST', dot: 'bg-[#e11d48]' },
];

export const StatusFilter: React.FC<StatusFilterProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = statusOptions.find((opt) => opt.value === value) || statusOptions[0];

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (val: LeadStatus | '') => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative min-w-44 sm:min-w-48">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between pl-3.5 pr-3 py-2.5 text-sm bg-card-bg border border-stone-border rounded-xl text-espresso font-medium shadow-2xs hover:border-[#d6d3cb] focus:outline-none focus:ring-1 focus:ring-terracotta transition-all cursor-pointer"
      >
        <div className="flex items-center gap-2">
          {selectedOption.dot ? (
            <span className={`w-2 h-2 rounded-full ${selectedOption.dot} shrink-0`} />
          ) : (
            <svg className="w-4 h-4 text-stone-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          )}
          <span>{selectedOption.label}</span>
        </div>

        <svg
          className={`w-4 h-4 text-stone-400 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Floating Popover Menu */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute left-0 right-0 mt-1.5 bg-card-bg border border-stone-border rounded-xl shadow-lg p-1.5 z-40 animate-in fade-in zoom-in-95 duration-100"
        >
          {statusOptions.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(opt.value)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-canvas text-espresso font-semibold'
                    : 'text-stone-700 hover:bg-canvas hover:text-espresso'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {opt.dot ? (
                    <span className={`w-2 h-2 rounded-full ${opt.dot} shrink-0`} />
                  ) : (
                    <span className="w-2 h-2 rounded-full border border-dashed border-stone-400 shrink-0" />
                  )}
                  <span>{opt.label}</span>
                </div>
                {isSelected && (
                  <svg className="w-3.5 h-3.5 text-terracotta shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
