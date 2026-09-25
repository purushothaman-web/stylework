import type { ILeadRepository } from '../repositories/lead.repository';
import { LeadStatus } from '../models/lead';
import type { Lead, CreateLeadDTO } from '../models/lead';
import { AppError } from '../middleware/errorHandler';

// RFC-compliant email regex
const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

// Standard telephone format allowing international (+), spaces, hyphens, parentheses, but strictly NO alphabets
const PHONE_REGEX = /^\+?[0-9\s\-()]{7,20}$/;

// Name regex ensuring valid letters (including international Unicode characters like José/Müller), spaces, apostrophes, hyphens, and disallowing digits/HTML
const NAME_REGEX = /^[\p{L}\s'.-]{2,60}$/u;

export class LeadService {
  constructor(private readonly leadRepository: ILeadRepository) {}

  async createLead(data: CreateLeadDTO): Promise<Lead> {
    if (!data || typeof data !== 'object') {
      throw new AppError(400, 'Request body is required');
    }

    // 1. Strict Name Validation
    if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
      throw new AppError(400, 'Name is required');
    }
    const trimmedName = data.name.trim();
    if (trimmedName.length < 2 || trimmedName.length > 60) {
      throw new AppError(400, 'Name must be between 2 and 60 characters');
    }
    if (!NAME_REGEX.test(trimmedName)) {
      throw new AppError(400, 'Name must contain only letters, spaces, hyphens, or apostrophes');
    }

    // 2. Strict Email Validation & Sanitization
    if (!data.email || typeof data.email !== 'string') {
      throw new AppError(400, 'Email address is required');
    }
    const trimmedEmail = data.email.trim().toLowerCase();
    if (trimmedEmail.length > 100 || !EMAIL_REGEX.test(trimmedEmail)) {
      throw new AppError(400, 'A valid email address is required (e.g. name@example.com)');
    }

    // 3. Strict Phone Validation (Rejecting alphabetic characters like 9123456780f)
    if (!data.phone || typeof data.phone !== 'string') {
      throw new AppError(400, 'Phone number is required');
    }
    const trimmedPhone = data.phone.trim();
    if (/[a-zA-Z]/.test(trimmedPhone)) {
      throw new AppError(400, 'Phone number cannot contain alphabetic characters');
    }
    if (!PHONE_REGEX.test(trimmedPhone)) {
      throw new AppError(400, 'Invalid phone number format');
    }
    const digitCount = (trimmedPhone.match(/\d/g) || []).length;
    if (digitCount < 7 || digitCount > 15) {
      throw new AppError(400, 'Phone number must contain between 7 and 15 digits');
    }

    try {
      return await this.leadRepository.create({
        name: trimmedName,
        email: trimmedEmail,
        phone: trimmedPhone,
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
