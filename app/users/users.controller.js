import express from 'express';
import { validateUser } from '../utils/validation.js';
import { getDb } from '../lib/database.js';

const router = express.Router();

// Get user
router.get('/:userId', (req, res) => {
  res.json({
    message: 'Get user',
    userId: req.params.userId,
    data: {
      _id: req.params.userId,
      name: 'John Doe',
      email: 'john@example.com',
      is_active: true,
      created_at: new Date('2025-01-15T10:30:00Z'),
      updated_at: new Date('2025-01-15T10:30:00Z')
    }
  });
});

// Get users
router.get('/', async (req, res) => {
  const mongodb = getDb();
  const users = await mongodb.collection('users').find().toArray();

  res.json({
    message: 'Get users',
    data: users
  });
});

// Create user
router.post('/', (req, res) => {
  const { name, email, password } = req.body;

  // Validate input
  const validation = validateUser({ name, email, password });
  if (!validation.isValid) {
    return res.status(400).json({
      error: 'Validation failed',
      errors: validation.errors
    });
  }

  const now = new Date();
  res.status(201).json({
    message: 'Create user',
    data: {
      _id: 'newuser_' + Date.now(),
      name,
      email,
      is_active: true,
      created_at: now,
      updated_at: now
    }
  });
});

export default router;
