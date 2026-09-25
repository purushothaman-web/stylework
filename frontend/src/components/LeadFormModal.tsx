import React, { useState, useEffect } from 'react';
import type { CreateLeadPayload } from '../types/lead';

interface LeadFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateLeadPayload) => Promise<void>;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const LeadFormModal: React.FC<LeadFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<CreateLeadPayload>({
    name: '',
    email: '',
    phone: '',
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens or closes
  useEffect(() => {
    if (isOpen) {
      setFormData({ name: '', email: '', phone: '' });
      setTouched({});
      setErrors({});
      setServerError(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Handle ESC key to dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const validateField = (field: keyof CreateLeadPayload, value: string): string | undefined => {
    switch (field) {
      case 'name':
        if (!value.trim()) return 'Name is required';
        if (value.trim().length < 2) return 'Name must be at least 2 characters';
        return undefined;
      case 'email':
        if (!value.trim()) return 'Email address is required';
        if (!EMAIL_REGEX.test(value.trim())) return 'Please enter a valid email address';
        return undefined;
      case 'phone':
        if (!value.trim()) return 'Phone number is required';
        if (value.trim().length < 7) return 'Phone must contain at least 7 characters';
        return undefined;
    }
  };

  const handleChange = (field: keyof CreateLeadPayload, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setServerError(null);
    if (touched[field]) {
      const err = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: err || '' }));
    }
  };

  const handleBlur = (field: keyof CreateLeadPayload) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateField(field, formData[field]);
    setErrors((prev) => ({ ...prev, [field]: err || '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const nameErr = validateField('name', formData.name);
    const emailErr = validateField('email', formData.email);
    const phoneErr = validateField('phone', formData.phone);

    setTouched({ name: true, email: true, phone: true });
    setErrors({
      name: nameErr || '',
      email: emailErr || '',
      phone: phoneErr || '',
    });

    if (nameErr || emailErr || phoneErr) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
      });
      onClose();
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : 'Failed to save lead');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={!isSubmitting ? onClose : undefined} />

      <div className="relative w-full max-w-md bg-white rounded-2xl border border-slate-200/90 shadow-2xl p-6 sm:p-7 z-10">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Add New Lead</h2>
            <p className="text-xs text-slate-500 mt-0.5">Enter contact information to add to pipeline</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-slate-400 hover:text-slate-600 rounded-lg p-1.5 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Server Error / Duplicate Conflict Alert */}
        {serverError && (
          <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2.5">
            <svg className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <span className="font-semibold">Unable to save:</span> {serverError}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Alex Morgan"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              onBlur={() => handleBlur('name')}
              disabled={isSubmitting}
              className={`w-full px-3.5 py-2 text-sm rounded-xl border ${
                errors.name ? 'border-rose-400 bg-rose-50/30 ring-1 ring-rose-400' : 'border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
              } outline-none transition-all`}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-rose-600 font-medium">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              placeholder="e.g. alex@example.com"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              disabled={isSubmitting}
              className={`w-full px-3.5 py-2 text-sm rounded-xl border ${
                errors.email ? 'border-rose-400 bg-rose-50/30 ring-1 ring-rose-400' : 'border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
              } outline-none transition-all`}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-rose-600 font-medium">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Phone Number <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              placeholder="e.g. +1 555-0149"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              onBlur={() => handleBlur('phone')}
              disabled={isSubmitting}
              className={`w-full px-3.5 py-2 text-sm rounded-xl border ${
                errors.phone ? 'border-rose-400 bg-rose-50/30 ring-1 ring-rose-400' : 'border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
              } outline-none transition-all`}
            />
            {errors.phone && (
              <p className="mt-1 text-xs text-rose-600 font-medium">{errors.phone}</p>
            )}
          </div>

          {/* Action buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 active:scale-98 transition-all disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Saving...</span>
                </>
              ) : (
                'Save Lead'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
