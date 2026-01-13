import { Router } from 'express';
import { body } from 'express-validator';
import { AuthController } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';

const router = Router();
const controller = new AuthController();

router.post(
  '/register',
  validate([
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('name').notEmpty().withMessage('Name is required')
  ]),
  controller.register.bind(controller)
);

router.post(
  '/login',
  validate([
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ]),
  controller.login.bind(controller)
);

router.post('/logout', controller.logout.bind(controller));

router.get('/me', authMiddleware, controller.getProfile.bind(controller));

router.put(
  '/profile',
  authMiddleware,
  validate([body('name').optional().notEmpty().withMessage('Name cannot be empty')]),
  controller.updateProfile.bind(controller)
);

export default router;
