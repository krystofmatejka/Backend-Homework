import express from 'express';
import { validateUser } from '../utils/validation.js';

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
router.get('/', (req, res) => {
  res.json({
    message: 'Get users',
    data: [
      {
        _id: 'user1',
        name: 'John Doe',
        email: 'john@example.com',
        is_active: true,
        created_at: new Date('2025-01-10T08:00:00Z'),
        updated_at: new Date('2025-01-10T08:00:00Z')
      },
      {
        _id: 'user2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        is_active: true,
        created_at: new Date('2025-01-12T14:20:00Z'),
        updated_at: new Date('2025-01-12T14:20:00Z')
      }
    ]
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
