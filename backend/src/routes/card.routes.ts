import { Router } from 'express';
import { body } from 'express-validator';
import { CardController } from '../controllers/card.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';

const router = Router();
const controller = new CardController();

router.use(authMiddleware);

router.get('/', controller.getAll.bind(controller));

router.get('/:id', controller.getById.bind(controller));

router.post(
  '/',
  validate([
    body('title').notEmpty().withMessage('Card title is required'),
    body('listId').notEmpty().withMessage('List ID is required')
  ]),
  controller.create.bind(controller)
);

router.put(
  '/:id',
  validate([body('title').optional().notEmpty().withMessage('Title cannot be empty')]),
  controller.update.bind(controller)
);

router.delete('/:id', controller.delete.bind(controller));

router.put(
  '/:id/move',
  validate([
    body('listId').notEmpty().withMessage('List ID is required'),
    body('position').isInt({ min: 0 }).withMessage('Valid position is required')
  ]),
  controller.move.bind(controller)
);

router.post(
  '/:id/comments',
  validate([body('content').notEmpty().withMessage('Comment content is required')]),
  controller.addComment.bind(controller)
);

router.post(
  '/:id/checklists',
  validate([body('title').notEmpty().withMessage('Checklist title is required')]),
  controller.addChecklist.bind(controller)
);

router.put(
  '/:id/checklists/:checklistId',
  controller.toggleChecklist.bind(controller)
);

router.delete(
  '/:id/checklists/:checklistId',
  controller.deleteChecklist.bind(controller)
);

router.post(
  '/:id/labels',
  validate([
    body('name').notEmpty().withMessage('Label name is required'),
    body('color').notEmpty().withMessage('Label color is required')
  ]),
  controller.addLabel.bind(controller)
);

router.delete(
  '/:id/labels/:labelId',
  controller.deleteLabel.bind(controller)
);

export default router;
