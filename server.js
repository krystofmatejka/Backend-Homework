import express from 'express';
import dotenv from 'dotenv';
import authMiddleware from './app/middleware/auth.middleware.js';
import userIdMiddleware from './app/middleware/user-id.middleware.js';
import usersController from './app/users/users.controller.js';
import listsController from './app/lists/lists.controller.js';

dotenv.config();

const app = express();
const PORT = 3000;

async function main() {
  console.log('Connecting to MongoDB...');
  // Middleware
  app.use(express.json());

  // Routes
  app.get('/', (req, res) => {
    res.send('It works!');
  });

  if (process.env.AUTH_MIDDLEWARE === 'api-key') {
    app.use(authMiddleware);
  }
  if (process.env.AUTH_MIDDLEWARE === 'user-id') {
    app.use(userIdMiddleware);
  }

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