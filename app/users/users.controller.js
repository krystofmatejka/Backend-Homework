import express from 'express';
import { ObjectId } from 'mongodb';
import { validateUser } from '../utils/validation.js';
import { getDb } from '../lib/database.js';

const router = express.Router();

// Get user
router.get('/:userId', async (req, res) => {
  const userId = req.params.userId;

  const mongodb = getDb();
  const user = await mongodb.collection('users').findOne({ _id: new ObjectId(userId) });

  res.json({
    message: 'Get user',
    data: user
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

  const mongodb = getDb();

  const now = new Date();
  const newUser = {
    name,
    email,
    is_active: true,
    created_at: now,
    updated_at: now
  }

  const result = await mongodb.collection('users').insertOne(newUser);

  res.status(201).json({
    message: 'Create user',
    data: {
      _id: result.insertedId,
      ...newUser,
    }
  });
});

export default router;
