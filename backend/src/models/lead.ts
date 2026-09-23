import type { Lead as PrismaLead, LeadStatus as PrismaLeadStatus } from '@prisma/client';

export type LeadStatus = PrismaLeadStatus;
export type Lead = PrismaLead;

export interface CreateLeadDTO {
  name: string;
  email: string;
  phone: string;
}

export interface UpdateLeadStatusDTO {
  status: LeadStatus;
}
