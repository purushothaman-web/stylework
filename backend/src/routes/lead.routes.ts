import { Router } from 'express';
import { LeadController } from '../controllers/lead.controller';
import { LeadService } from '../services/lead.service';
import { LeadRepository } from '../repositories/lead.repository';

export function createLeadRouter(): Router {
  const router = Router();
  const repository = new LeadRepository();
  const service = new LeadService(repository);
  const controller = new LeadController(service);

  router.post('/', controller.create.bind(controller));
  router.get('/', controller.getAll.bind(controller));
  router.patch('/:id/status', controller.updateStatus.bind(controller));

  return router;
}
