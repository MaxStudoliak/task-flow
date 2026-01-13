import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server } from 'socket.io';

import authRoutes from './routes/auth.routes.js';
import workspaceRoutes from './routes/workspace.routes.js';
import boardRoutes from './routes/board.routes.js';
import listRoutes from './routes/list.routes.js';
import cardRoutes from './routes/card.routes.js';
import { errorMiddleware } from './middleware/error.middleware.js';
import { setupSocketHandlers } from './socket/socket.manager.js';

const app = express();
const httpServer = createServer(app);

const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';

const io = new Server(httpServer, {
  cors: {
    origin: corsOrigin,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

app.use(helmet());
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/lists', listRoutes);
app.use('/api/cards', cardRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

setupSocketHandlers(io);

app.use(errorMiddleware);

const PORT = process.env.PORT || 4000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { app, httpServer, io };
