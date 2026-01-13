import { Response, NextFunction } from 'express';
import { BoardService } from '../services/board.service.js';
import { AuthRequest } from '../types/index.js';

const boardService = new BoardService();

export class BoardController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.query.workspaceId as string;
      if (!workspaceId) {
        res.status(400).json({ success: false, message: 'workspaceId is required' });
        return;
      }
      const boards = await boardService.getAll(workspaceId, req.user!.id);
      res.json({ success: true, data: boards });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const board = await boardService.getById(req.params.id, req.user!.id);
      res.json({ success: true, data: board });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const board = await boardService.create(req.body, req.user!.id);
      res.status(201).json({ success: true, data: board });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const board = await boardService.update(req.params.id, req.body, req.user!.id);
      res.json({ success: true, data: board });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await boardService.delete(req.params.id, req.user!.id);
      res.json({ success: true, message: 'Board deleted' });
    } catch (error) {
      next(error);
    }
  }

  async updatePosition(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const board = await boardService.updatePosition(req.params.id, req.body.position, req.user!.id);
      res.json({ success: true, data: board });
    } catch (error) {
      next(error);
    }
  }
}
