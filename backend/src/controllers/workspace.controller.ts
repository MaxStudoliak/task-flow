import { Response, NextFunction } from 'express';
import { WorkspaceService } from '../services/workspace.service.js';
import { AuthRequest } from '../types/index.js';

const workspaceService = new WorkspaceService();

export class WorkspaceController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaces = await workspaceService.getAll(req.user!.id);
      res.json({ success: true, data: workspaces });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspace = await workspaceService.getById(req.params.id, req.user!.id);
      res.json({ success: true, data: workspace });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspace = await workspaceService.create(req.body, req.user!.id);
      res.status(201).json({ success: true, data: workspace });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspace = await workspaceService.update(req.params.id, req.body, req.user!.id);
      res.json({ success: true, data: workspace });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await workspaceService.delete(req.params.id, req.user!.id);
      res.json({ success: true, message: 'Workspace deleted' });
    } catch (error) {
      next(error);
    }
  }

  async addMember(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const member = await workspaceService.addMember(req.params.id, req.body.email, req.user!.id);
      res.status(201).json({ success: true, data: member });
    } catch (error) {
      next(error);
    }
  }

  async removeMember(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await workspaceService.removeMember(req.params.id, req.params.userId, req.user!.id);
      res.json({ success: true, message: 'Member removed' });
    } catch (error) {
      next(error);
    }
  }
}
