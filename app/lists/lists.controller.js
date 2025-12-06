import express from 'express';
import { validateList, validateItem, validateListUpdate, validateItemUpdate } from '../utils/validation.js';

const router = express.Router();

// Get shopping list
router.get('/:listId', (req, res) => {
  res.json({
    message: 'Get shopping list',
    listId: req.params.listId,
    data: {
      _id: req.params.listId,
      title: 'Grocery Shopping',
      owner_id: 'user123',
      member_ids: ['user123', 'user456'],
      items: [
        {
          _id: 'item1',
          name: 'Milk',
          quantity: 2,
          purchased_at: null,
          created_by_user_id: 'user123',
          created_at: new Date('2025-11-20T10:00:00Z'),
          updated_at: new Date('2025-11-20T10:00:00Z')
        },
        {
          _id: 'item2',
          name: 'Bread',
          quantity: 1,
          purchased_at: new Date('2025-11-21T15:30:00Z'),
          created_by_user_id: 'user123',
          created_at: new Date('2025-11-20T10:00:00Z'),
          updated_at: new Date('2025-11-21T15:30:00Z')
        }
      ],
      created_at: new Date('2025-11-20T09:00:00Z'),
      updated_at: new Date('2025-11-21T15:30:00Z'),
      archived_at: null
    }
  });
});

// Get shopping lists
router.get('/', (req, res) => {
  res.json({
    message: 'Get shopping lists',
    data: [
      {
        _id: 'list1',
        title: 'Grocery Shopping',
        owner_id: req.user.id,
        member_ids: [req.user.id, 'user456'],
        items: [],
        created_at: new Date('2025-11-20T09:00:00Z'),
        updated_at: new Date('2025-11-20T09:00:00Z'),
        archived_at: null
      },
      {
        _id: 'list2',
        title: 'Hardware Store',
        owner_id: req.user.id,
        member_ids: [req.user.id],
        items: [],
        created_at: new Date('2025-11-18T14:00:00Z'),
        updated_at: new Date('2025-11-18T14:00:00Z'),
        archived_at: null
      }
    ]
  });
});

// Create shopping list
router.post('/', (req, res) => {
  const { title } = req.body;

  // Validate input
  const validation = validateList({ title });
  if (!validation.isValid) {
    return res.status(400).json({
      error: 'Validation failed',
      errors: validation.errors
    });
  }

  const now = new Date();
  res.status(201).json({
    message: 'Create shopping list',
    data: {
      _id: 'list_' + Date.now(),
      title,
      owner_id: req.user.id,
      member_ids: [req.user.id],
      items: [],
      created_at: now,
      updated_at: now,
      archived_at: null
    }
  });
});

// Edit shopping list
router.patch('/:listId', (req, res) => {
  const { title, member_ids } = req.body;

  // Validate input
  const validation = validateListUpdate({ title, member_ids });
  if (!validation.isValid) {
    return res.status(400).json({
      error: 'Validation failed',
      errors: validation.errors
    });
  }

  res.json({
    message: 'Edit shopping list',
    listId: req.params.listId,
    data: {
      _id: req.params.listId,
      title: title || 'Updated List Name',
      owner_id: 'user123',
      member_ids: member_ids || ['user123', 'user456'],
      items: [],
      created_at: new Date('2025-11-20T09:00:00Z'),
      updated_at: new Date(),
      archived_at: null
    }
  });
});

// Leave shopping list
router.patch('/:listId/leave', (req, res) => {
  res.json({
    message: 'Leave shopping list',
    requestedBy: { id: req.user.id, name: req.user.name },
    listId: req.params.listId,
    data: {
      _id: req.params.listId,
      title: 'Some Shopping List',
      owner_id: 'user123',
      member_ids: ['user123'],
      items: [],
      created_at: new Date('2025-11-20T09:00:00Z'),
      updated_at: new Date(),
      archived_at: null
    }
  });
});

// Archive shopping list
router.patch('/:listId/archive', (req, res) => {
  res.json({
    message: 'Archive shopping list',
    listId: req.params.listId,
    data: {
      _id: req.params.listId,
      title: 'Archived Shopping List',
      owner_id: req.user.id,
      member_ids: [req.user.id],
      items: [],
      created_at: new Date('2025-11-20T09:00:00Z'),
      updated_at: new Date(),
      archived_at: new Date()
    }
  });
});

// Remove shopping list
router.delete('/:listId/remove', (req, res) => {
  res.status(200).json({
    message: 'Remove shopping list',
    listId: req.params.listId,
    data: {
      success: true,
      deletedId: req.params.listId
    }
  });
});

// Add item
router.post('/:listId/item', (req, res) => {
  const { name, quantity } = req.body;

  // Validate input
  const validation = validateItem({ name, quantity: quantity || 1 });
  if (!validation.isValid) {
    return res.status(400).json({
      error: 'Validation failed',
      errors: validation.errors
    });
  }

  const now = new Date();
  res.status(201).json({
    message: 'Add item',
    listId: req.params.listId,
    data: {
      _id: 'item_' + Date.now(),
      name,
      quantity: quantity || 1,
      purchased_at: null,
      created_by_user_id: req.user.id,
      created_at: now,
      updated_at: now
    }
  });
});

// Edit item
router.patch('/:listId/item/:itemId', (req, res) => {
  const { name, quantity, purchased } = req.body;

  // Validate input
  const validation = validateItemUpdate({ name, quantity, purchased });
  if (!validation.isValid) {
    return res.status(400).json({
      error: 'Validation failed',
      errors: validation.errors
    });
  }

  const now = new Date();
  res.json({
    message: 'Edit item',
    listId: req.params.listId,
    itemId: req.params.itemId,
    data: {
      _id: req.params.itemId,
      name: name || 'Updated Item',
      quantity: quantity || 1,
      purchased_at: purchased ? now : null,
      created_by_user_id: 'user123',
      created_at: new Date('2025-11-20T10:00:00Z'),
      updated_at: now
    }
  });
});

// Remove item
router.delete('/:listId/item/:itemId', (req, res) => {
  res.status(200).json({
    message: 'Remove item',
    listId: req.params.listId,
    itemId: req.params.itemId,
    data: {
      success: true,
      deletedItemId: req.params.itemId
    }
  });
});

export default router;
