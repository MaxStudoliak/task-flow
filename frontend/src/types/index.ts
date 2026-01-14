export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  createdAt: string;
}

export interface WorkspaceMember {
  id: string;
  userId: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
  joinedAt: string;
  user: Pick<User, 'id' | 'name' | 'email' | 'avatar'>;
}

export interface Workspace {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  members: WorkspaceMember[];
  boards?: Board[];
  _count?: { boards: number };
}

export interface Board {
  id: string;
  name: string;
  description: string | null;
  background: string | null;
  position: number;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
  lists?: List[];
  members?: WorkspaceMember[];
}

export interface List {
  id: string;
  name: string;
  position: number;
  boardId: string;
  createdAt: string;
  updatedAt: string;
  cards: Card[];
}

export interface Card {
  id: string;
  title: string;
  description: string | null;
  position: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate: string | null;
  isArchived: boolean;
  listId: string;
  creatorId: string;
  assigneeId: string | null;
  createdAt: string;
  updatedAt: string;
  creator?: Pick<User, 'id' | 'name' | 'avatar'>;
  assignee?: Pick<User, 'id' | 'name' | 'avatar'> | null;
  labels?: Label[];
  checklists?: Checklist[];
  comments?: Comment[];
  attachments?: Attachment[];
  _count?: {
    comments: number;
    checklists: number;
    attachments: number;
  };
}

export interface Label {
  id: string;
  name: string;
  color: string;
  cardId: string;
}

export interface Checklist {
  id: string;
  title: string;
  isCompleted: boolean;
  position: number;
  cardId: string;
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: Pick<User, 'id' | 'name' | 'avatar'>;
}

export interface Attachment {
  id: string;
  filename: string;
  url: string;
  size: number;
  mimeType: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface SocketUser {
  id: string;
  name: string;
  avatar: string | null;
}
