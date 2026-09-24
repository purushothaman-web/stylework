import { LeadStatus } from '@prisma/client';
import type { Lead as PrismaLead } from '@prisma/client';

export { LeadStatus };
export type Lead = PrismaLead;

export interface CreateLeadDTO {
  name: string;
  email: string;
  phone: string;
}

export interface UpdateLeadStatusDTO {
  status: LeadStatus;
}
