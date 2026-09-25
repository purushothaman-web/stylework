import type { Request, Response, NextFunction } from 'express';
import { LeadService } from '../services/lead.service';

export class LeadController {
  constructor(private readonly leadService: LeadService) {}

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payload = req.body ?? {};
      const lead = await this.leadService.createLead(payload);
      res.status(201).json({
        success: true,
        data: lead,
      });
    } catch (err) {
      next(err);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { search, status } = req.query;
      const leads = await this.leadService.getLeads(
        typeof search === 'string' ? search : undefined,
        typeof status === 'string' ? status : undefined
      );

      res.status(200).json({
        success: true,
        count: leads.length,
        data: leads,
      });
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = typeof req.params.id === 'string' ? req.params.id : '';
      const lead = await this.leadService.getLeadById(id);

      res.status(200).json({
        success: true,
        data: lead,
      });
    } catch (err) {
      next(err);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = typeof req.params.id === 'string' ? req.params.id : '';
      const { status } = req.body;
      const lead = await this.leadService.updateLeadStatus(id, status);

      res.status(200).json({
        success: true,
        data: lead,
      });
    } catch (err) {
      next(err);
    }
  }
}
