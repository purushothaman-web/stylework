import type { Request, Response, NextFunction } from 'express';
import { LeadService } from '../services/lead.service';

export class LeadController {
  constructor(private readonly leadService: LeadService) {}

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(501).json({ message: 'Not implemented' });
    } catch (err) {
      next(err);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(501).json({ message: 'Not implemented' });
    } catch (err) {
      next(err);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(501).json({ message: 'Not implemented' });
    } catch (err) {
      next(err);
    }
  }
}
