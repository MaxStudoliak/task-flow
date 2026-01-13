import { Request } from 'express';
import { User } from '@prisma/client';

export interface AuthRequest extends Request {
  user?: User;
}

export interface JwtPayload {
  userId: string;
  email: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  name: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface CreateWorkspaceDto {
  name: string;
  description?: string;
}

export interface UpdateWorkspaceDto {
  name?: string;
  description?: string;
}

export interface CreateBoardDto {
  name: string;
  description?: string;
  background?: string;
  workspaceId: string;
}

export interface UpdateBoardDto {
  name?: string;
  description?: string;
  background?: string;
}

export interface CreateListDto {
  name: string;
  boardId: string;
}

export interface UpdateListDto {
  name?: string;
}

export interface CreateCardDto {
  title: string;
  description?: string;
  listId: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate?: string;
  assigneeId?: string;
}

export interface UpdateCardDto {
  title?: string;
  description?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate?: string;
  assigneeId?: string;
  isArchived?: boolean;
}

export interface MoveCardDto {
  listId: string;
  position: number;
}

export interface UpdatePositionDto {
  position: number;
}

export interface SocketUser {
  id: string;
  name: string;
  avatar?: string | null;
}
