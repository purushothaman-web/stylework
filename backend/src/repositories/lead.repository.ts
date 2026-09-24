import { prisma } from '../config/db';
import type { Lead, CreateLeadDTO, LeadStatus } from '../models/lead';

export interface ILeadRepository {
  create(data: CreateLeadDTO): Promise<Lead>;
  findAll(search?: string, status?: LeadStatus): Promise<Lead[]>;
  findById(id: string): Promise<Lead | null>;
  updateStatus(id: string, status: LeadStatus): Promise<Lead>;
}

export class LeadRepository implements ILeadRepository {
  async create(data: CreateLeadDTO): Promise<Lead> {
    return prisma.lead.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
      },
    });
  }

  async findAll(search?: string, status?: LeadStatus): Promise<Lead[]> {
    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }

    if (search && search.trim() !== '') {
      const query = search.trim();
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
        { phone: { contains: query, mode: 'insensitive' } },
      ];
    }

    return prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<Lead | null> {
    return prisma.lead.findUnique({
      where: { id },
    });
  }

  async updateStatus(id: string, status: LeadStatus): Promise<Lead> {
    return prisma.lead.update({
      where: { id },
      data: { status },
    });
  }
}
