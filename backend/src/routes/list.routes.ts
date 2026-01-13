import { Router } from 'express';
import { body } from 'express-validator';
import { ListController } from '../controllers/list.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';

const router = Router();
const controller = new ListController();

router.use(authMiddleware);

router.get('/', controller.getAll.bind(controller));

router.post(
  '/',
  validate([
    body('name').notEmpty().withMessage('List name is required'),
    body('boardId').notEmpty().withMessage('Board ID is required')
  ]),
  controller.create.bind(controller)
);

router.put(
  '/:id',
  validate([body('name').optional().notEmpty().withMessage('Name cannot be empty')]),
  controller.update.bind(controller)
);

router.delete('/:id', controller.delete.bind(controller));

router.put(
  '/:id/position',
  validate([body('position').isInt({ min: 0 }).withMessage('Valid position is required')]),
  controller.updatePosition.bind(controller)
);

export default router;
