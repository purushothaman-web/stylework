import type { Lead, CreateLeadPayload, UpdateLeadStatusPayload } from '../types/lead';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const leadApi = {
  async getLeads(_search?: string, _status?: string): Promise<Lead[]> {
    throw new Error('Not implemented');
  },

  async createLead(_payload: CreateLeadPayload): Promise<Lead> {
    throw new Error('Not implemented');
  },

  async updateLeadStatus(_id: string, _payload: UpdateLeadStatusPayload): Promise<Lead> {
    throw new Error('Not implemented');
  },
};
