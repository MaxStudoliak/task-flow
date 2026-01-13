import axios from 'axios';
import type {
  User,
  Workspace,
  Board,
  List,
  Card,
  ApiResponse,
  Comment,
  Checklist,
} from '@/types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authApi = {
  register: (data: { email: string; password: string; name: string }) =>
    api.post<ApiResponse<{ user: User; token: string }>>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post<ApiResponse<{ user: User; token: string }>>('/auth/login', data),

  logout: () => api.post<ApiResponse<null>>('/auth/logout'),

  getProfile: () => api.get<ApiResponse<User>>('/auth/me'),

  updateProfile: (data: { name?: string; avatar?: string }) =>
    api.put<ApiResponse<User>>('/auth/profile', data),
};

// Workspaces
export const workspaceApi = {
  getAll: () => api.get<ApiResponse<Workspace[]>>('/workspaces'),

  getById: (id: string) => api.get<ApiResponse<Workspace>>(`/workspaces/${id}`),

  create: (data: { name: string; description?: string }) =>
    api.post<ApiResponse<Workspace>>('/workspaces', data),

  update: (id: string, data: { name?: string; description?: string }) =>
    api.put<ApiResponse<Workspace>>(`/workspaces/${id}`, data),

  delete: (id: string) => api.delete<ApiResponse<null>>(`/workspaces/${id}`),

  addMember: (id: string, email: string) =>
    api.post<ApiResponse<Workspace>>(`/workspaces/${id}/members`, { email }),

  removeMember: (id: string, userId: string) =>
    api.delete<ApiResponse<null>>(`/workspaces/${id}/members/${userId}`),
};

// Boards
export const boardApi = {
  getAll: (workspaceId: string) =>
    api.get<ApiResponse<Board[]>>('/boards', { params: { workspaceId } }),

  getById: (id: string) => api.get<ApiResponse<Board>>(`/boards/${id}`),

  create: (data: { name: string; description?: string; background?: string; workspaceId: string }) =>
    api.post<ApiResponse<Board>>('/boards', data),

  update: (id: string, data: { name?: string; description?: string; background?: string }) =>
    api.put<ApiResponse<Board>>(`/boards/${id}`, data),

  delete: (id: string) => api.delete<ApiResponse<null>>(`/boards/${id}`),

  updatePosition: (id: string, position: number) =>
    api.put<ApiResponse<Board>>(`/boards/${id}/position`, { position }),
};

// Lists
export const listApi = {
  getAll: (boardId: string) =>
    api.get<ApiResponse<List[]>>('/lists', { params: { boardId } }),

  create: (data: { name: string; boardId: string }) =>
    api.post<ApiResponse<List>>('/lists', data),

  update: (id: string, data: { name?: string }) =>
    api.put<ApiResponse<List>>(`/lists/${id}`, data),

  delete: (id: string) => api.delete<ApiResponse<null>>(`/lists/${id}`),

  updatePosition: (id: string, position: number) =>
    api.put<ApiResponse<List>>(`/lists/${id}/position`, { position }),
};

// Cards
export const cardApi = {
  getAll: (listId: string) =>
    api.get<ApiResponse<Card[]>>('/cards', { params: { listId } }),

  getById: (id: string) => api.get<ApiResponse<Card>>(`/cards/${id}`),

  create: (data: {
    title: string;
    description?: string;
    listId: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH';
    dueDate?: string;
    assigneeId?: string;
  }) => api.post<ApiResponse<Card>>('/cards', data),

  update: (
    id: string,
    data: {
      title?: string;
      description?: string;
      priority?: 'LOW' | 'MEDIUM' | 'HIGH';
      dueDate?: string;
      assigneeId?: string;
      isArchived?: boolean;
    }
  ) => api.put<ApiResponse<Card>>(`/cards/${id}`, data),

  delete: (id: string) => api.delete<ApiResponse<null>>(`/cards/${id}`),

  move: (id: string, data: { listId: string; position: number }) =>
    api.put<ApiResponse<Card>>(`/cards/${id}/move`, data),

  addComment: (id: string, content: string) =>
    api.post<ApiResponse<Comment>>(`/cards/${id}/comments`, { content }),

  addChecklist: (id: string, title: string) =>
    api.post<ApiResponse<Checklist>>(`/cards/${id}/checklists`, { title }),
};

export default api;
