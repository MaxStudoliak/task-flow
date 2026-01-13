import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';
import { AuthRequest } from '../types/index.js';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.register(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.login(req.body);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await authService.getProfile(req.user!.id);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await authService.updateProfile(req.user!.id, req.body);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async logout(_req: Request, res: Response): Promise<void> {
    res.json({ success: true, message: 'Logged out successfully' });
  }
}
