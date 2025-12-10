import express from 'express';
import { validateUser } from './users.validation.js';
import { getUserById, getUsers, createUser } from './users.service.js';

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

const router = express.Router();

// Get user
router.get('/:userId', async (req, res) => {
  const userId = req.params.userId;

  const user = await getUserById(userId);

  res.json({
    message: 'Get user',
    data: user
  });
});

// Get users
router.get('/', async (req, res) => {
  const cursor = req.query.cursor
  const limit = clamp(parseInt(req.query.limit ?? '10'), 1, 10);

  const usersPaginated = await getUsers(cursor, limit);

  res.json({
    message: 'Get users',
    data: usersPaginated.users,
    pagination: usersPaginated.pagination,
  });
});

// Create user
router.post('/', async (req, res) => {
  const { name, email } = req.body;

  // Validate input
  const validation = validateUser({ name, email });
  if (!validation.isValid) {
    return res.status(400).json({
      error: 'Validation failed',
      errors: validation.errors
    });
  }

  const result = await createUser(name, email);

  res.status(201).json({
    message: 'Create user',
    data: result
  });
});

export default router;
