import express from 'express';
import dotenv from 'dotenv';
import usersController from './app/users/users.controller.js';
import listsController from './app/lists/lists.controller.js';
import { authMiddleware } from './app/middleware/auth.middleware.js';
import { errorHandlerMiddleware } from './app/middleware/error-handler.middleware.js';
import { usersSeed } from './app/users/users.seed.js';

dotenv.config();

const app = express();
const PORT = 3000;

if (process.env.ALWAYS_SEED === 'true') {
  console.log('Seeding users collection...');
  await usersSeed();
}

// JSON Middleware
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('It works!');
});

// Auth Middleware
app.use(authMiddleware);

// API v1 Routes
app.use('/api/v1/users', usersController);
app.use('/api/v1/lists', listsController);

// Global Error Handler Middleware
app.use(errorHandlerMiddleware);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
