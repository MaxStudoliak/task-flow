import prisma from '../config/database.js';
import { CreateBoardDto, UpdateBoardDto } from '../types/index.js';

export class BoardService {
  async getAll(workspaceId: string, userId: string) {
    const member = await prisma.workspaceMember.findFirst({
      where: { workspaceId, userId }
    });

    if (!member) {
      throw { statusCode: 403, message: 'Not a member of this workspace' };
    }

    const boards = await prisma.board.findMany({
      where: { workspaceId },
      orderBy: { position: 'asc' }
    });

    return boards;
  }

  async getById(boardId: string, userId: string) {
    const board = await prisma.board.findUnique({
      where: { id: boardId },
      include: {
        workspace: {
          include: {
            members: true
          }
        },
        lists: {
          orderBy: { position: 'asc' },
          include: {
            cards: {
              where: { isArchived: false },
              orderBy: { position: 'asc' },
              include: {
                creator: {
                  select: { id: true, name: true, avatar: true }
                },
                assignee: {
                  select: { id: true, name: true, avatar: true }
                },
                labels: true,
                _count: {
                  select: { comments: true, checklists: true, attachments: true }
                }
              }
            }
          }
        }
      }
    });

    if (!board) {
      throw { statusCode: 404, message: 'Board not found' };
    }

    const isMember = board.workspace.members.some(m => m.userId === userId);
    if (!isMember) {
      throw { statusCode: 403, message: 'Not authorized to access this board' };
    }

    const { workspace, ...boardData } = board;
    return { ...boardData, workspaceId: workspace.id };
  }

  async create(data: CreateBoardDto, userId: string) {
    const member = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId: data.workspaceId,
        userId,
        role: { in: ['OWNER', 'ADMIN', 'MEMBER'] }
      }
    });

    if (!member) {
      throw { statusCode: 403, message: 'Not authorized to create boards' };
    }

    const maxPosition = await prisma.board.aggregate({
      where: { workspaceId: data.workspaceId },
      _max: { position: true }
    });

    const board = await prisma.board.create({
      data: {
        name: data.name,
        description: data.description,
        background: data.background || '#0079bf',
        workspaceId: data.workspaceId,
        position: (maxPosition._max.position ?? -1) + 1
      }
    });

    return board;
  }

  async update(boardId: string, data: UpdateBoardDto, userId: string) {
    const board = await prisma.board.findUnique({
      where: { id: boardId },
      include: {
        workspace: {
          include: { members: true }
        }
      }
    });

    if (!board) {
      throw { statusCode: 404, message: 'Board not found' };
    }

    const member = board.workspace.members.find(m => m.userId === userId);
    if (!member || member.role === 'VIEWER') {
      throw { statusCode: 403, message: 'Not authorized to update this board' };
    }

    const updatedBoard = await prisma.board.update({
      where: { id: boardId },
      data
    });

    return updatedBoard;
  }

  async delete(boardId: string, userId: string) {
    const board = await prisma.board.findUnique({
      where: { id: boardId },
      include: {
        workspace: {
          include: { members: true }
        }
      }
    });

    if (!board) {
      throw { statusCode: 404, message: 'Board not found' };
    }

    const member = board.workspace.members.find(m => m.userId === userId);
    if (!member || !['OWNER', 'ADMIN'].includes(member.role)) {
      throw { statusCode: 403, message: 'Not authorized to delete this board' };
    }

    await prisma.board.delete({
      where: { id: boardId }
    });
  }

  async updatePosition(boardId: string, position: number, userId: string) {
    const board = await prisma.board.findUnique({
      where: { id: boardId },
      include: {
        workspace: {
          include: { members: true }
        }
      }
    });

    if (!board) {
      throw { statusCode: 404, message: 'Board not found' };
    }

    const member = board.workspace.members.find(m => m.userId === userId);
    if (!member || member.role === 'VIEWER') {
      throw { statusCode: 403, message: 'Not authorized' };
    }

    const boards = await prisma.board.findMany({
      where: { workspaceId: board.workspaceId },
      orderBy: { position: 'asc' }
    });

    const oldIndex = boards.findIndex(b => b.id === boardId);
    const [movedBoard] = boards.splice(oldIndex, 1);
    boards.splice(position, 0, movedBoard);

    await prisma.$transaction(
      boards.map((b, index) =>
        prisma.board.update({
          where: { id: b.id },
          data: { position: index }
        })
      )
    );

    return await prisma.board.findUnique({ where: { id: boardId } });
  }
}
