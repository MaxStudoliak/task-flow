import { Server, Socket } from 'socket.io';
import { verifyToken } from '../utils/jwt.js';
import prisma from '../config/database.js';
import { SocketUser } from '../types/index.js';

interface BoardRoom {
  boardId: string;
  users: Map<string, SocketUser>;
}

const boardRooms = new Map<string, BoardRoom>();

export const setupSocketHandlers = (io: Server) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = verifyToken(token);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, name: true, avatar: true }
      });

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.data.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log(`User connected: ${socket.data.user.name}`);

    socket.on('join:board', async (boardId: string) => {
      try {
        const board = await prisma.board.findUnique({
          where: { id: boardId },
          include: {
            workspace: {
              include: { members: true }
            }
          }
        });

        if (!board) {
          socket.emit('error', { message: 'Board not found' });
          return;
        }

        const isMember = board.workspace.members.some(
          m => m.userId === socket.data.user.id
        );

        if (!isMember) {
          socket.emit('error', { message: 'Not authorized' });
          return;
        }

        socket.join(boardId);

        if (!boardRooms.has(boardId)) {
          boardRooms.set(boardId, {
            boardId,
            users: new Map()
          });
        }

        const room = boardRooms.get(boardId)!;
        room.users.set(socket.data.user.id, socket.data.user);

        io.to(boardId).emit('users:online', Array.from(room.users.values()));

        console.log(`User ${socket.data.user.name} joined board ${boardId}`);
      } catch (error) {
        console.error('Error joining board:', error);
        socket.emit('error', { message: 'Failed to join board' });
      }
    });

    socket.on('leave:board', (boardId: string) => {
      socket.leave(boardId);

      const room = boardRooms.get(boardId);
      if (room) {
        room.users.delete(socket.data.user.id);
        io.to(boardId).emit('users:online', Array.from(room.users.values()));

        if (room.users.size === 0) {
          boardRooms.delete(boardId);
        }
      }

      console.log(`User ${socket.data.user.name} left board ${boardId}`);
    });

    socket.on('card:create', (data: { boardId: string; card: unknown }) => {
      socket.to(data.boardId).emit('card:created', data.card);
    });

    socket.on('card:update', (data: { boardId: string; card: unknown }) => {
      socket.to(data.boardId).emit('card:updated', data.card);
    });

    socket.on('card:move', (data: { boardId: string; card: unknown; fromListId: string; toListId: string }) => {
      socket.to(data.boardId).emit('card:moved', data);
    });

    socket.on('card:delete', (data: { boardId: string; cardId: string; listId: string }) => {
      socket.to(data.boardId).emit('card:deleted', data);
    });

    socket.on('list:create', (data: { boardId: string; list: unknown }) => {
      socket.to(data.boardId).emit('list:created', data.list);
    });

    socket.on('list:update', (data: { boardId: string; list: unknown }) => {
      socket.to(data.boardId).emit('list:updated', data.list);
    });

    socket.on('list:delete', (data: { boardId: string; listId: string }) => {
      socket.to(data.boardId).emit('list:deleted', data);
    });

    socket.on('list:reorder', (data: { boardId: string; lists: unknown[] }) => {
      socket.to(data.boardId).emit('list:reordered', data.lists);
    });

    socket.on('disconnect', () => {
      boardRooms.forEach((room, boardId) => {
        if (room.users.has(socket.data.user.id)) {
          room.users.delete(socket.data.user.id);
          io.to(boardId).emit('users:online', Array.from(room.users.values()));

          if (room.users.size === 0) {
            boardRooms.delete(boardId);
          }
        }
      });

      console.log(`User disconnected: ${socket.data.user.name}`);
    });
  });
};
