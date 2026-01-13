import { Router } from 'express';
import { body } from 'express-validator';
import { WorkspaceController } from '../controllers/workspace.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';

const router = Router();
const controller = new WorkspaceController();

router.use(authMiddleware);

router.get('/', controller.getAll.bind(controller));

router.get('/:id', controller.getById.bind(controller));

router.post(
  '/',
  validate([body('name').notEmpty().withMessage('Workspace name is required')]),
  controller.create.bind(controller)
);

router.put(
  '/:id',
  validate([body('name').optional().notEmpty().withMessage('Name cannot be empty')]),
  controller.update.bind(controller)
);

router.delete('/:id', controller.delete.bind(controller));

router.post(
  '/:id/members',
  validate([body('email').isEmail().withMessage('Valid email is required')]),
  controller.addMember.bind(controller)
);

router.delete('/:id/members/:userId', controller.removeMember.bind(controller));

export default router;
