import prisma from '../config/database.js';
import { CreateListDto, UpdateListDto } from '../types/index.js';

export class ListService {
  async getAll(boardId: string, userId: string) {
    const board = await prisma.board.findUnique({
      where: { id: boardId },
      include: {
        workspace: { include: { members: true } }
      }
    });

    if (!board) {
      throw { statusCode: 404, message: 'Board not found' };
    }

    const isMember = board.workspace.members.some(m => m.userId === userId);
    if (!isMember) {
      throw { statusCode: 403, message: 'Not authorized' };
    }

    const lists = await prisma.list.findMany({
      where: { boardId },
      orderBy: { position: 'asc' },
      include: {
        cards: {
          where: { isArchived: false },
          orderBy: { position: 'asc' }
        }
      }
    });

    return lists;
  }

  async create(data: CreateListDto, userId: string) {
    const board = await prisma.board.findUnique({
      where: { id: data.boardId },
      include: {
        workspace: { include: { members: true } }
      }
    });

    if (!board) {
      throw { statusCode: 404, message: 'Board not found' };
    }

    const member = board.workspace.members.find(m => m.userId === userId);
    if (!member || member.role === 'VIEWER') {
      throw { statusCode: 403, message: 'Not authorized to create lists' };
    }

    const maxPosition = await prisma.list.aggregate({
      where: { boardId: data.boardId },
      _max: { position: true }
    });

    const list = await prisma.list.create({
      data: {
        name: data.name,
        boardId: data.boardId,
        position: (maxPosition._max.position ?? -1) + 1
      },
      include: {
        cards: true
      }
    });

    return list;
  }

  async update(listId: string, data: UpdateListDto, userId: string) {
    const list = await prisma.list.findUnique({
      where: { id: listId },
      include: {
        board: {
          include: {
            workspace: { include: { members: true } }
          }
        }
      }
    });

    if (!list) {
      throw { statusCode: 404, message: 'List not found' };
    }

    const member = list.board.workspace.members.find(m => m.userId === userId);
    if (!member || member.role === 'VIEWER') {
      throw { statusCode: 403, message: 'Not authorized to update this list' };
    }

    const updatedList = await prisma.list.update({
      where: { id: listId },
      data
    });

    return updatedList;
  }

  async delete(listId: string, userId: string) {
    const list = await prisma.list.findUnique({
      where: { id: listId },
      include: {
        board: {
          include: {
            workspace: { include: { members: true } }
          }
        }
      }
    });

    if (!list) {
      throw { statusCode: 404, message: 'List not found' };
    }

    const member = list.board.workspace.members.find(m => m.userId === userId);
    if (!member || member.role === 'VIEWER') {
      throw { statusCode: 403, message: 'Not authorized to delete this list' };
    }

    await prisma.list.delete({
      where: { id: listId }
    });
  }

  async updatePosition(listId: string, position: number, userId: string) {
    const list = await prisma.list.findUnique({
      where: { id: listId },
      include: {
        board: {
          include: {
            workspace: { include: { members: true } }
          }
        }
      }
    });

    if (!list) {
      throw { statusCode: 404, message: 'List not found' };
    }

    const member = list.board.workspace.members.find(m => m.userId === userId);
    if (!member || member.role === 'VIEWER') {
      throw { statusCode: 403, message: 'Not authorized' };
    }

    const lists = await prisma.list.findMany({
      where: { boardId: list.boardId },
      orderBy: { position: 'asc' }
    });

    const oldIndex = lists.findIndex(l => l.id === listId);
    const [movedList] = lists.splice(oldIndex, 1);
    lists.splice(position, 0, movedList);

    await prisma.$transaction(
      lists.map((l, index) =>
        prisma.list.update({
          where: { id: l.id },
          data: { position: index }
        })
      )
    );

    return await prisma.list.findUnique({
      where: { id: listId },
      include: { cards: true }
    });
  }
}
