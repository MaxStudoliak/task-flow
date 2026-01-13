import { Response, NextFunction } from 'express';
import { CardService } from '../services/card.service.js';
import { AuthRequest } from '../types/index.js';

const cardService = new CardService();

export class CardController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const listId = req.query.listId as string;
      if (!listId) {
        res.status(400).json({ success: false, message: 'listId is required' });
        return;
      }
      const cards = await cardService.getAll(listId, req.user!.id);
      res.json({ success: true, data: cards });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const card = await cardService.getById(req.params.id, req.user!.id);
      res.json({ success: true, data: card });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const card = await cardService.create(req.body, req.user!.id);
      res.status(201).json({ success: true, data: card });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const card = await cardService.update(req.params.id, req.body, req.user!.id);
      res.json({ success: true, data: card });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await cardService.delete(req.params.id, req.user!.id);
      res.json({ success: true, message: 'Card deleted' });
    } catch (error) {
      next(error);
    }
  }

  async move(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const card = await cardService.move(req.params.id, req.body, req.user!.id);
      res.json({ success: true, data: card });
    } catch (error) {
      next(error);
    }
  }

  async addComment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const comment = await cardService.addComment(req.params.id, req.body.content, req.user!.id);
      res.status(201).json({ success: true, data: comment });
    } catch (error) {
      next(error);
    }
  }

  async addChecklist(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const checklist = await cardService.addChecklist(req.params.id, req.body.title, req.user!.id);
      res.status(201).json({ success: true, data: checklist });
    } catch (error) {
      next(error);
    }
  }
}
