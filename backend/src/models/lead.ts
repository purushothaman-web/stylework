export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'WON' | 'LOST';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: LeadStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLeadDTO {
  name: string;
  email: string;
  phone: string;
}

export interface UpdateLeadStatusDTO {
  status: LeadStatus;
}
