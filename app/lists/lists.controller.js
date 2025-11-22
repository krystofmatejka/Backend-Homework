const express = require('express');
const router = express.Router();

// Get shopping list
router.get('/:listId', (req, res) => {
  res.json({
    message: 'Get shopping list',
    requestedBy: { id: req.user.id, name: req.user.name },
    listId: req.params.listId,
    data: {
      id: req.params.listId,
      name: 'Grocery Shopping',
      owner: 'user123',
      members: ['user456'],
      items: [
        { id: 'item1', name: 'Milk', purchased: false },
        { id: 'item2', name: 'Bread', purchased: true }
      ]
    }
  });
});

// Get shopping lists
router.get('/', (req, res) => {
  res.json({
    message: 'Get shopping lists',
    requestedBy: { id: req.user.id, name: req.user.name },
    data: [
      { id: 'list1', name: 'Grocery Shopping', owner: 'user123' },
      { id: 'list2', name: 'Hardware Store', owner: 'user123' }
    ]
  });
});

// Create shopping list
router.post('/', (req, res) => {
  res.json({
    message: 'Create shopping list',
    requestedBy: { id: req.user.id, name: req.user.name },
    data: {
      id: 'newlist123',
      name: 'New Shopping List',
      owner: req.user.id,
      members: [],
      items: []
    }
  });
});

// Edit shopping list
router.patch('/:listId', (req, res) => {
  res.json({
    message: 'Edit shopping list',
    requestedBy: { id: req.user.id, name: req.user.name },
    listId: req.params.listId,
    data: {
      id: req.params.listId,
      name: 'Updated List Name',
      owner: 'user123'
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
      success: true
    }
  });
});

// Archive shopping list
router.patch('/:listId/archive', (req, res) => {
  res.json({
    message: 'Archive shopping list',
    requestedBy: { id: req.user.id, name: req.user.name },
    listId: req.params.listId,
    data: {
      id: req.params.listId,
      archived: true
    }
  });
});

// Remove shopping list
router.delete('/:listId/remove', (req, res) => {
  res.json({
    message: 'Remove shopping list',
    requestedBy: { id: req.user.id, name: req.user.name },
    listId: req.params.listId,
    data: {
      success: true
    }
  });
});

// Add item
router.post('/:listId/item', (req, res) => {
  res.json({
    message: 'Add item',
    requestedBy: { id: req.user.id, name: req.user.name },
    listId: req.params.listId,
    data: {
      id: 'newitem123',
      name: 'New Item',
      purchased: false
    }
  });
});

// Edit item
router.patch('/:listId/item/:itemId', (req, res) => {
  res.json({
    message: 'Edit item',
    requestedBy: { id: req.user.id, name: req.user.name },
    listId: req.params.listId,
    itemId: req.params.itemId,
    data: {
      id: req.params.itemId,
      name: 'Updated Item',
      purchased: true
    }
  });
});

// Remove item
router.post('/:listId/item/remove/:itemId', (req, res) => {
  res.json({
    message: 'Remove item',
    requestedBy: { id: req.user.id, name: req.user.name },
    listId: req.params.listId,
    itemId: req.params.itemId,
    data: {
      success: true
    }
  });
});

module.exports = router;
