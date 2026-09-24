import type { ILeadRepository } from '../repositories/lead.repository';
import { LeadStatus } from '../models/lead';
import type { Lead, CreateLeadDTO } from '../models/lead';
import { AppError } from '../middleware/errorHandler';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class LeadService {
  constructor(private readonly leadRepository: ILeadRepository) {}

  async createLead(data: CreateLeadDTO): Promise<Lead> {
    if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
      throw new AppError(400, 'Name is required');
    }

    if (!data.email || typeof data.email !== 'string' || !EMAIL_REGEX.test(data.email.trim())) {
      throw new AppError(400, 'A valid email address is required');
    }

    if (!data.phone || typeof data.phone !== 'string' || data.phone.trim().length < 7) {
      throw new AppError(400, 'A valid phone number with at least 7 digits is required');
    }

    try {
      return await this.leadRepository.create({
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone.trim(),
      });
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'code' in err && (err as { code: string }).code === 'P2002') {
        throw new AppError(409, 'A lead with this email already exists');
      }
      throw err;
    }
  }

  async getLeads(search?: string, status?: string): Promise<Lead[]> {
    let leadStatus: LeadStatus | undefined;

    if (status && status.trim() !== '') {
      const normalizedStatus = status.trim().toUpperCase() as LeadStatus;
      if (!Object.values(LeadStatus).includes(normalizedStatus)) {
        throw new AppError(
          400,
          `Invalid status filter. Allowed values: ${Object.values(LeadStatus).join(', ')}`
        );
      }
      leadStatus = normalizedStatus;
    }

    return this.leadRepository.findAll(search?.trim(), leadStatus);
  }

  async getLeadById(id: string): Promise<Lead> {
    if (!id || id.trim() === '') {
      throw new AppError(400, 'Lead ID is required');
    }

    const lead = await this.leadRepository.findById(id);
    if (!lead) {
      throw new AppError(404, 'Lead not found');
    }

    return lead;
  }

  async updateLeadStatus(id: string, status: string): Promise<Lead> {
    if (!id || id.trim() === '') {
      throw new AppError(400, 'Lead ID is required');
    }

    if (!status || typeof status !== 'string') {
      throw new AppError(400, 'Status is required');
    }

    const normalizedStatus = status.trim().toUpperCase() as LeadStatus;
    if (!Object.values(LeadStatus).includes(normalizedStatus)) {
      throw new AppError(
        400,
        `Invalid status. Allowed values: ${Object.values(LeadStatus).join(', ')}`
      );
    }

    try {
      return await this.leadRepository.updateStatus(id, normalizedStatus);
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'code' in err && (err as { code: string }).code === 'P2025') {
        throw new AppError(404, 'Lead not found');
      }
      throw err;
    }
  }
}
