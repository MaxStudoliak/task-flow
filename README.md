# TaskFlow

Modern task management system with drag-and-drop interface and real-time updates.

## Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, @dnd-kit, Socket.io Client, Zustand
- **Backend:** Node.js, Express, TypeScript, Prisma, PostgreSQL, Socket.io
- **Infrastructure:** Docker, Turborepo

## Quick Start

### Prerequisites

- Node.js 20+
- Yarn
- PostgreSQL (or Docker)

### Development Setup

1. **Clone and install dependencies:**

```bash
git clone <repo-url> task-flow
cd task-flow
yarn install
```

2. **Start PostgreSQL with Docker:**

```bash
docker-compose -f docker/docker-compose.dev.yml up -d
```

3. **Setup environment variables:**

```bash
cp backend/.env.example backend/.env
```

4. **Run database migrations:**

```bash
yarn db:generate
yarn db:migrate
```

5. **Seed the database (optional):**

```bash
yarn db:seed
```

6. **Start development servers:**

```bash
yarn dev
```

The frontend will be available at http://localhost:3000 and the API at http://localhost:4000.

### Demo Account

After seeding, you can login with:
- Email: `demo@example.com`
- Password: `password123`

## Project Structure

```
task-flow/
├── frontend/          # React frontend
├── backend/           # Express backend
├── packages/          # Shared packages
│   └── types/         # Shared TypeScript types
└── docker/            # Docker configuration
```

## Available Scripts

- `yarn dev` - Start all services in development mode
- `yarn build` - Build all packages
- `yarn lint` - Lint all packages
- `yarn db:generate` - Generate Prisma client
- `yarn db:migrate` - Run database migrations
- `yarn db:seed` - Seed the database

## Docker Deployment

```bash
cd docker
docker-compose up -d
```

## Features

- User authentication (JWT)
- Workspaces with role-based access
- Kanban boards with drag-and-drop
- Real-time updates via WebSocket
- Card management (priority, due dates, comments)
- Team collaboration

## License

MIT
