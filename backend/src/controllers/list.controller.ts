import { Response, NextFunction } from 'express';
import { ListService } from '../services/list.service.js';
import { AuthRequest } from '../types/index.js';

const listService = new ListService();

export class ListController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const boardId = req.query.boardId as string;
      if (!boardId) {
        res.status(400).json({ success: false, message: 'boardId is required' });
        return;
      }
      const lists = await listService.getAll(boardId, req.user!.id);
      res.json({ success: true, data: lists });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const list = await listService.create(req.body, req.user!.id);
      res.status(201).json({ success: true, data: list });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const list = await listService.update(req.params.id, req.body, req.user!.id);
      res.json({ success: true, data: list });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await listService.delete(req.params.id, req.user!.id);
      res.json({ success: true, message: 'List deleted' });
    } catch (error) {
      next(error);
    }
  }

  async updatePosition(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const list = await listService.updatePosition(req.params.id, req.body.position, req.user!.id);
      res.json({ success: true, data: list });
    } catch (error) {
      next(error);
    }
  }
}
