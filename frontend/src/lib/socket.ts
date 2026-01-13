import { io, Socket } from 'socket.io-client';
import type { Card, List, SocketUser } from '@/types';

let socket: Socket | null = null;

export const connectSocket = (token: string): Socket => {
  if (socket?.connected) {
    return socket;
  }

  socket = io(window.location.origin, {
    auth: { token },
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    console.log('Socket connected');
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = (): Socket | null => socket;

export const joinBoard = (boardId: string) => {
  socket?.emit('join:board', boardId);
};

export const leaveBoard = (boardId: string) => {
  socket?.emit('leave:board', boardId);
};

export const emitCardCreate = (boardId: string, card: Card) => {
  socket?.emit('card:create', { boardId, card });
};

export const emitCardUpdate = (boardId: string, card: Card) => {
  socket?.emit('card:update', { boardId, card });
};

export const emitCardMove = (
  boardId: string,
  card: Card,
  fromListId: string,
  toListId: string
) => {
  socket?.emit('card:move', { boardId, card, fromListId, toListId });
};

export const emitCardDelete = (boardId: string, cardId: string, listId: string) => {
  socket?.emit('card:delete', { boardId, cardId, listId });
};

export const emitListCreate = (boardId: string, list: List) => {
  socket?.emit('list:create', { boardId, list });
};

export const emitListUpdate = (boardId: string, list: List) => {
  socket?.emit('list:update', { boardId, list });
};

export const emitListDelete = (boardId: string, listId: string) => {
  socket?.emit('list:delete', { boardId, listId });
};

export const emitListReorder = (boardId: string, lists: List[]) => {
  socket?.emit('list:reorder', { boardId, lists });
};

export interface SocketEvents {
  'card:created': (card: Card) => void;
  'card:updated': (card: Card) => void;
  'card:moved': (data: { card: Card; fromListId: string; toListId: string }) => void;
  'card:deleted': (data: { cardId: string; listId: string }) => void;
  'list:created': (list: List) => void;
  'list:updated': (list: List) => void;
  'list:deleted': (data: { listId: string }) => void;
  'list:reordered': (lists: List[]) => void;
  'users:online': (users: SocketUser[]) => void;
  error: (data: { message: string }) => void;
}

export const onSocketEvent = <K extends keyof SocketEvents>(
  event: K,
  callback: SocketEvents[K]
) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  socket?.on(event, callback as any);
};

export const offSocketEvent = <K extends keyof SocketEvents>(
  event: K,
  callback?: SocketEvents[K]
) => {
  if (callback) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    socket?.off(event, callback as any);
  } else {
    socket?.off(event);
  }
};
