import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);

  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      password: hashedPassword,
      name: 'Demo User'
    }
  });

  const workspace = await prisma.workspace.create({
    data: {
      name: 'My Workspace',
      description: 'Default workspace for demo',
      members: {
        create: {
          userId: user.id,
          role: 'OWNER'
        }
      }
    }
  });

  const board = await prisma.board.create({
    data: {
      name: 'Project Board',
      description: 'Main project board',
      background: '#0079bf',
      position: 0,
      workspaceId: workspace.id
    }
  });

  const todoList = await prisma.list.create({
    data: {
      name: 'To Do',
      position: 0,
      boardId: board.id
    }
  });

  const inProgressList = await prisma.list.create({
    data: {
      name: 'In Progress',
      position: 1,
      boardId: board.id
    }
  });

  const doneList = await prisma.list.create({
    data: {
      name: 'Done',
      position: 2,
      boardId: board.id
    }
  });

  await prisma.card.createMany({
    data: [
      {
        title: 'Setup project structure',
        description: 'Initialize the monorepo with Turborepo',
        position: 0,
        priority: 'HIGH',
        listId: doneList.id,
        creatorId: user.id
      },
      {
        title: 'Implement authentication',
        description: 'Add JWT-based authentication',
        position: 1,
        priority: 'HIGH',
        listId: doneList.id,
        creatorId: user.id
      },
      {
        title: 'Create board UI',
        description: 'Build the kanban board interface',
        position: 0,
        priority: 'MEDIUM',
        listId: inProgressList.id,
        creatorId: user.id
      },
      {
        title: 'Add drag and drop',
        description: 'Implement card drag and drop functionality',
        position: 0,
        priority: 'MEDIUM',
        listId: todoList.id,
        creatorId: user.id
      },
      {
        title: 'Add real-time updates',
        description: 'Integrate WebSocket for live updates',
        position: 1,
        priority: 'LOW',
        listId: todoList.id,
        creatorId: user.id
      }
    ]
  });

  console.log('Seed data created successfully!');
  console.log('Demo user: demo@example.com / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
