import type { Lead, CreateLeadDTO, UpdateLeadStatusDTO } from '../models/lead';

export interface ILeadRepository {
  create(data: CreateLeadDTO): Promise<Lead>;
  findAll(search?: string, status?: string): Promise<Lead[]>;
  findById(id: string): Promise<Lead | null>;
  updateStatus(id: string, data: UpdateLeadStatusDTO): Promise<Lead | null>;
}

export class LeadRepository implements ILeadRepository {
  async create(_data: CreateLeadDTO): Promise<Lead> {
    throw new Error('Not implemented');
  }

  async findAll(_search?: string, _status?: string): Promise<Lead[]> {
    throw new Error('Not implemented');
  }

  async findById(_id: string): Promise<Lead | null> {
    throw new Error('Not implemented');
  }

  async updateStatus(_id: string, _data: UpdateLeadStatusDTO): Promise<Lead | null> {
    throw new Error('Not implemented');
  }
}
