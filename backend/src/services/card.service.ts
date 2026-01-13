import prisma from '../config/database.js';
import { CreateCardDto, UpdateCardDto, MoveCardDto } from '../types/index.js';

export class CardService {
  async getAll(listId: string, userId: string) {
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

    const isMember = list.board.workspace.members.some(m => m.userId === userId);
    if (!isMember) {
      throw { statusCode: 403, message: 'Not authorized' };
    }

    const cards = await prisma.card.findMany({
      where: { listId, isArchived: false },
      orderBy: { position: 'asc' },
      include: {
        creator: { select: { id: true, name: true, avatar: true } },
        assignee: { select: { id: true, name: true, avatar: true } },
        labels: true,
        _count: { select: { comments: true, checklists: true, attachments: true } }
      }
    });

    return cards;
  }

  async getById(cardId: string, userId: string) {
    const card = await prisma.card.findUnique({
      where: { id: cardId },
      include: {
        list: {
          include: {
            board: {
              include: {
                workspace: { include: { members: true } }
              }
            }
          }
        },
        creator: { select: { id: true, name: true, avatar: true } },
        assignee: { select: { id: true, name: true, avatar: true } },
        labels: true,
        checklists: { orderBy: { position: 'asc' } },
        comments: {
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { id: true, name: true, avatar: true } }
          }
        },
        attachments: { orderBy: { createdAt: 'desc' } }
      }
    });

    if (!card) {
      throw { statusCode: 404, message: 'Card not found' };
    }

    const isMember = card.list.board.workspace.members.some(m => m.userId === userId);
    if (!isMember) {
      throw { statusCode: 403, message: 'Not authorized' };
    }

    return card;
  }

  async create(data: CreateCardDto, userId: string) {
    const list = await prisma.list.findUnique({
      where: { id: data.listId },
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
      throw { statusCode: 403, message: 'Not authorized to create cards' };
    }

    const maxPosition = await prisma.card.aggregate({
      where: { listId: data.listId },
      _max: { position: true }
    });

    const card = await prisma.card.create({
      data: {
        title: data.title,
        description: data.description,
        listId: data.listId,
        creatorId: userId,
        assigneeId: data.assigneeId,
        priority: data.priority || 'MEDIUM',
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        position: (maxPosition._max.position ?? -1) + 1
      },
      include: {
        creator: { select: { id: true, name: true, avatar: true } },
        assignee: { select: { id: true, name: true, avatar: true } },
        labels: true,
        _count: { select: { comments: true, checklists: true, attachments: true } }
      }
    });

    return card;
  }

  async update(cardId: string, data: UpdateCardDto, userId: string) {
    const card = await prisma.card.findUnique({
      where: { id: cardId },
      include: {
        list: {
          include: {
            board: {
              include: {
                workspace: { include: { members: true } }
              }
            }
          }
        }
      }
    });

    if (!card) {
      throw { statusCode: 404, message: 'Card not found' };
    }

    const member = card.list.board.workspace.members.find(m => m.userId === userId);
    if (!member || member.role === 'VIEWER') {
      throw { statusCode: 403, message: 'Not authorized to update this card' };
    }

    const updatedCard = await prisma.card.update({
      where: { id: cardId },
      data: {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined
      },
      include: {
        creator: { select: { id: true, name: true, avatar: true } },
        assignee: { select: { id: true, name: true, avatar: true } },
        labels: true,
        _count: { select: { comments: true, checklists: true, attachments: true } }
      }
    });

    return updatedCard;
  }

  async delete(cardId: string, userId: string) {
    const card = await prisma.card.findUnique({
      where: { id: cardId },
      include: {
        list: {
          include: {
            board: {
              include: {
                workspace: { include: { members: true } }
              }
            }
          }
        }
      }
    });

    if (!card) {
      throw { statusCode: 404, message: 'Card not found' };
    }

    const member = card.list.board.workspace.members.find(m => m.userId === userId);
    if (!member || member.role === 'VIEWER') {
      throw { statusCode: 403, message: 'Not authorized to delete this card' };
    }

    await prisma.card.delete({
      where: { id: cardId }
    });
  }

  async move(cardId: string, data: MoveCardDto, userId: string) {
    const card = await prisma.card.findUnique({
      where: { id: cardId },
      include: {
        list: {
          include: {
            board: {
              include: {
                workspace: { include: { members: true } }
              }
            }
          }
        }
      }
    });

    if (!card) {
      throw { statusCode: 404, message: 'Card not found' };
    }

    const member = card.list.board.workspace.members.find(m => m.userId === userId);
    if (!member || member.role === 'VIEWER') {
      throw { statusCode: 403, message: 'Not authorized' };
    }

    const targetList = await prisma.list.findUnique({
      where: { id: data.listId }
    });

    if (!targetList) {
      throw { statusCode: 404, message: 'Target list not found' };
    }

    const sourceListId = card.listId;
    const targetListId = data.listId;
    const newPosition = data.position;

    if (sourceListId === targetListId) {
      const cards = await prisma.card.findMany({
        where: { listId: sourceListId, isArchived: false },
        orderBy: { position: 'asc' }
      });

      const oldIndex = cards.findIndex(c => c.id === cardId);
      const [movedCard] = cards.splice(oldIndex, 1);
      cards.splice(newPosition, 0, movedCard);

      await prisma.$transaction(
        cards.map((c, index) =>
          prisma.card.update({
            where: { id: c.id },
            data: { position: index }
          })
        )
      );
    } else {
      const sourceCards = await prisma.card.findMany({
        where: { listId: sourceListId, isArchived: false, id: { not: cardId } },
        orderBy: { position: 'asc' }
      });

      const targetCards = await prisma.card.findMany({
        where: { listId: targetListId, isArchived: false },
        orderBy: { position: 'asc' }
      });

      targetCards.splice(newPosition, 0, card);

      await prisma.$transaction([
        ...sourceCards.map((c, index) =>
          prisma.card.update({
            where: { id: c.id },
            data: { position: index }
          })
        ),
        ...targetCards.map((c, index) =>
          prisma.card.update({
            where: { id: c.id },
            data: {
              position: index,
              listId: targetListId
            }
          })
        )
      ]);
    }

    return await prisma.card.findUnique({
      where: { id: cardId },
      include: {
        creator: { select: { id: true, name: true, avatar: true } },
        assignee: { select: { id: true, name: true, avatar: true } },
        labels: true,
        _count: { select: { comments: true, checklists: true, attachments: true } }
      }
    });
  }

  async addComment(cardId: string, content: string, userId: string) {
    const card = await prisma.card.findUnique({
      where: { id: cardId },
      include: {
        list: {
          include: {
            board: {
              include: {
                workspace: { include: { members: true } }
              }
            }
          }
        }
      }
    });

    if (!card) {
      throw { statusCode: 404, message: 'Card not found' };
    }

    const isMember = card.list.board.workspace.members.some(m => m.userId === userId);
    if (!isMember) {
      throw { statusCode: 403, message: 'Not authorized' };
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        cardId,
        userId
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } }
      }
    });

    return comment;
  }

  async addChecklist(cardId: string, title: string, userId: string) {
    const card = await prisma.card.findUnique({
      where: { id: cardId },
      include: {
        list: {
          include: {
            board: {
              include: {
                workspace: { include: { members: true } }
              }
            }
          }
        }
      }
    });

    if (!card) {
      throw { statusCode: 404, message: 'Card not found' };
    }

    const member = card.list.board.workspace.members.find(m => m.userId === userId);
    if (!member || member.role === 'VIEWER') {
      throw { statusCode: 403, message: 'Not authorized' };
    }

    const maxPosition = await prisma.checklist.aggregate({
      where: { cardId },
      _max: { position: true }
    });

    const checklist = await prisma.checklist.create({
      data: {
        title,
        cardId,
        position: (maxPosition._max.position ?? -1) + 1
      }
    });

    return checklist;
  }
}
