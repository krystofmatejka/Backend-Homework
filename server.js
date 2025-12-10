import express from 'express';
import dotenv from 'dotenv';
import authMiddleware from './app/middleware/auth.middleware.js';
import usersController from './app/users/users.controller.js';
import listsController from './app/lists/lists.controller.js';
import { usersSeed } from './app/users/users.seed.js';

dotenv.config();

const app = express();
const PORT = 3000;

async function main() {
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

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

main().catch(err => {
  console.error('Error starting server:', err);
  process.exit(1);
});