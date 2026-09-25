import type { Lead, CreateLeadPayload, UpdateLeadStatusPayload } from '../types/lead';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export class ApiError extends Error {
  public statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const leadApi = {
  async getLeads(search?: string, status?: string): Promise<Lead[]> {
    const params = new URLSearchParams();
    if (search && search.trim()) {
      params.append('search', search.trim());
    }
    if (status && status.trim()) {
      params.append('status', status.trim());
    }

    const queryString = params.toString();
    const url = `${API_BASE_URL}/leads${queryString ? `?${queryString}` : ''}`;

    const res = await fetch(url);
    const body = await res.json();

    if (!res.ok) {
      throw new ApiError(res.status, body.message || 'Failed to fetch leads');
    }

    return body.data;
  },

  async createLead(payload: CreateLeadPayload): Promise<Lead> {
    const res = await fetch(`${API_BASE_URL}/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const body = await res.json();

    if (!res.ok) {
      throw new ApiError(res.status, body.message || 'Failed to create lead');
    }

    return body.data;
  },

  async updateLeadStatus(id: string, payload: UpdateLeadStatusPayload): Promise<Lead> {
    const res = await fetch(`${API_BASE_URL}/leads/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const body = await res.json();

    if (!res.ok) {
      throw new ApiError(res.status, body.message || 'Failed to update lead status');
    }

    return body.data;
  },
};
