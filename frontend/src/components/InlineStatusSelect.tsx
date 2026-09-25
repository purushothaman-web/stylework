import React, { useState, useRef, useEffect } from 'react';
import type { LeadStatus } from '../types/lead';

interface InlineStatusSelectProps {
  status: LeadStatus;
  onChange?: (status: LeadStatus) => void;
  disabled?: boolean;
}

const statusConfig: Record<
  LeadStatus,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  NEW: {
    label: 'New',
    bg: 'bg-[#f0eee6] hover:bg-[#e8e5dc]',
    text: 'text-[#44403c]',
    border: 'border-[#dfdbcf]',
    dot: 'bg-[#78716c]',
  },
  CONTACTED: {
    label: 'Contacted',
    bg: 'bg-[#fef3c7] hover:bg-[#fde68a]',
    text: 'text-[#92400e]',
    border: 'border-[#fde68a]',
    dot: 'bg-[#d97706]',
  },
  QUALIFIED: {
    label: 'Qualified',
    bg: 'bg-[#ede9fe] hover:bg-[#ddd6fe]',
    text: 'text-[#4338ca]',
    border: 'border-[#ddd6fe]',
    dot: 'bg-[#6366f1]',
  },
  WON: {
    label: 'Won',
    bg: 'bg-[#dcfce7] hover:bg-[#bbf7d0]',
    text: 'text-[#166534]',
    border: 'border-[#bbf7d0]',
    dot: 'bg-[#16a34a]',
  },
  LOST: {
    label: 'Lost',
    bg: 'bg-[#ffe4e6] hover:bg-[#fecdd3]',
    text: 'text-[#9f1239]',
    border: 'border-[#fecdd3]',
    dot: 'bg-[#e11d48]',
  },
};

const allStatuses: LeadStatus[] = ['NEW', 'CONTACTED', 'QUALIFIED', 'WON', 'LOST'];

export const InlineStatusSelect: React.FC<InlineStatusSelectProps> = ({
  status,
  onChange,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const config = statusConfig[status] || statusConfig.NEW;

  // Handle click outside & keyboard escape
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
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

  const toggleDropdown = () => {
    if (disabled || !onChange) return;

    if (!isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      // If less than 200px space below, open upward
      setOpenUpward(spaceBelow < 200);
    }

    setIsOpen((prev) => !prev);
  };

  const handleSelect = (newStatus: LeadStatus) => {
    if (newStatus !== status && onChange) {
      onChange(newStatus);
    }
    setIsOpen(false);
  };

  if (!onChange || disabled) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border} shadow-2xs`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
        {config.label}
      </span>
    );
  }

  return (
    <div ref={containerRef} className="relative inline-flex items-center">
      {/* Custom Trigger Button */}
      <button
        type="button"
        onClick={toggleDropdown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`inline-flex items-center gap-1.5 pl-2.5 pr-2 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${config.bg} ${config.text} ${config.border} shadow-2xs hover:shadow-xs focus:outline-none focus:ring-1 focus:ring-terracotta active:scale-97`}
        title="Click to update lead status"
      >
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot} shrink-0`} />
        <span>{config.label}</span>
        <svg
          className={`w-3 h-3 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''} opacity-70`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Floating Custom Popover Menu */}
      {isOpen && (
        <div
          role="listbox"
          className={`absolute right-0 ${
            openUpward ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
          } w-40 bg-card-bg border border-stone-border rounded-xl shadow-lg p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100`}
        >
          <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider px-2 py-1 border-b border-stone-100 mb-1">
            Update Status
          </div>
          {allStatuses.map((s) => {
            const itemConfig = statusConfig[s];
            const isSelected = s === status;
            return (
              <button
                key={s}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(s)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-canvas text-espresso font-semibold'
                    : 'text-stone-700 hover:bg-canvas hover:text-espresso'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${itemConfig.dot} shrink-0`} />
                  <span>{itemConfig.label}</span>
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

