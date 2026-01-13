export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Workspace {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Board {
  id: string;
  name: string;
  description: string | null;
  background: string | null;
  position: number;
  workspaceId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface List {
  id: string;
  name: string;
  position: number;
  boardId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Card {
  id: string;
  title: string;
  description: string | null;
  position: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate: Date | null;
  isArchived: boolean;
  listId: string;
  creatorId: string;
  assigneeId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type WorkspaceRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
export type CardPriority = 'LOW' | 'MEDIUM' | 'HIGH';
