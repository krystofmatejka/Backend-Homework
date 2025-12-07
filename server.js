import express from 'express';
import dotenv from 'dotenv';
import authMiddleware from './app/middleware/auth.middleware.js';
import usersController from './app/users/users.controller.js';
import listsController from './app/lists/lists.controller.js';

dotenv.config();

const app = express();
const PORT = 3000;

async function main() {
  console.log('Connecting to MongoDB...');
  // Middleware
  app.use(express.json());
  //app.use((req, res, next) => {
  //  req.mongodb = mongodb;
  //  next();
  //});

  // Routes
  app.get('/', (req, res) => {
    res.send('It works!');
  });

  app.use('/api/v1/users', authMiddleware, usersController);
  app.use('/api/v1/lists', authMiddleware, listsController);

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

main().catch(err => {
  console.error('Error starting server:', err);
  process.exit(1);
});