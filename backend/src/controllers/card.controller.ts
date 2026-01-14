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

  async toggleChecklist(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const checklist = await cardService.toggleChecklist(req.params.id, req.params.checklistId, req.user!.id);
      res.json({ success: true, data: checklist });
    } catch (error) {
      next(error);
    }
  }

  async deleteChecklist(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await cardService.deleteChecklist(req.params.id, req.params.checklistId, req.user!.id);
      res.json({ success: true, message: 'Checklist deleted' });
    } catch (error) {
      next(error);
    }
  }

  async addLabel(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const label = await cardService.addLabel(req.params.id, req.body.name, req.body.color, req.user!.id);
      res.status(201).json({ success: true, data: label });
    } catch (error) {
      next(error);
    }
  }

  async deleteLabel(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await cardService.deleteLabel(req.params.id, req.params.labelId, req.user!.id);
      res.json({ success: true, message: 'Label deleted' });
    } catch (error) {
      next(error);
    }
  }
}
