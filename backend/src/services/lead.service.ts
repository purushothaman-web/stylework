import type { ILeadRepository } from '../repositories/lead.repository';
import type { Lead, CreateLeadDTO, UpdateLeadStatusDTO } from '../models/lead';

export class LeadService {
  constructor(private readonly leadRepository: ILeadRepository) {}

  async createLead(_data: CreateLeadDTO): Promise<Lead> {
    throw new Error('Not implemented');
  }

  async getLeads(_search?: string, _status?: string): Promise<Lead[]> {
    throw new Error('Not implemented');
  }

  async updateLeadStatus(_id: string, _data: UpdateLeadStatusDTO): Promise<Lead | null> {
    throw new Error('Not implemented');
  }
}
