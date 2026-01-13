import prisma from '../config/database.js';
import { CreateWorkspaceDto, UpdateWorkspaceDto } from '../types/index.js';

export class WorkspaceService {
  async getAll(userId: string) {
    const workspaces = await prisma.workspace.findMany({
      where: {
        members: {
          some: { userId }
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true }
            }
          }
        },
        _count: { select: { boards: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return workspaces;
  }

  async getById(workspaceId: string, userId: string) {
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        members: { some: { userId } }
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true }
            }
          }
        },
        boards: {
          orderBy: { position: 'asc' }
        }
      }
    });

    if (!workspace) {
      throw { statusCode: 404, message: 'Workspace not found' };
    }

    return workspace;
  }

  async create(data: CreateWorkspaceDto, userId: string) {
    const workspace = await prisma.workspace.create({
      data: {
        name: data.name,
        description: data.description,
        members: {
          create: {
            userId,
            role: 'OWNER'
          }
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true }
            }
          }
        }
      }
    });

    return workspace;
  }

  async update(workspaceId: string, data: UpdateWorkspaceDto, userId: string) {
    const member = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId,
        role: { in: ['OWNER', 'ADMIN'] }
      }
    });

    if (!member) {
      throw { statusCode: 403, message: 'Not authorized to update this workspace' };
    }

    const workspace = await prisma.workspace.update({
      where: { id: workspaceId },
      data,
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true }
            }
          }
        }
      }
    });

    return workspace;
  }

  async delete(workspaceId: string, userId: string) {
    const member = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId,
        role: 'OWNER'
      }
    });

    if (!member) {
      throw { statusCode: 403, message: 'Only owner can delete workspace' };
    }

    await prisma.workspace.delete({
      where: { id: workspaceId }
    });
  }

  async addMember(workspaceId: string, email: string, userId: string) {
    const member = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId,
        role: { in: ['OWNER', 'ADMIN'] }
      }
    });

    if (!member) {
      throw { statusCode: 403, message: 'Not authorized to add members' };
    }

    const userToAdd = await prisma.user.findUnique({
      where: { email }
    });

    if (!userToAdd) {
      throw { statusCode: 404, message: 'User not found' };
    }

    const existingMember = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: userToAdd.id,
          workspaceId
        }
      }
    });

    if (existingMember) {
      throw { statusCode: 400, message: 'User is already a member' };
    }

    const newMember = await prisma.workspaceMember.create({
      data: {
        userId: userToAdd.id,
        workspaceId,
        role: 'MEMBER'
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true }
        }
      }
    });

    return newMember;
  }

  async removeMember(workspaceId: string, memberUserId: string, userId: string) {
    const member = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId,
        role: { in: ['OWNER', 'ADMIN'] }
      }
    });

    if (!member) {
      throw { statusCode: 403, message: 'Not authorized to remove members' };
    }

    const memberToRemove = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: memberUserId,
          workspaceId
        }
      }
    });

    if (!memberToRemove) {
      throw { statusCode: 404, message: 'Member not found' };
    }

    if (memberToRemove.role === 'OWNER') {
      throw { statusCode: 400, message: 'Cannot remove workspace owner' };
    }

    await prisma.workspaceMember.delete({
      where: { id: memberToRemove.id }
    });
  }
}
