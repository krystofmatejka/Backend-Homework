const express = require('express');
const router = express.Router();

// Get user
router.get('/:userId', (req, res) => {
  res.json({
    message: 'Get user',
    userId: req.params.userId,
    data: {
      id: req.params.userId,
      name: 'John Doe',
      email: 'john@example.com'
    }
  });
});

// Get users
router.get('/', (req, res) => {
  res.json({
    message: 'Get users',
    data: [
      { id: '1', name: 'John Doe', email: 'john@example.com' },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com' }
    ]
  });
});

// Create user
router.post('/', (req, res) => {
  res.json({
    message: 'Create user',
    data: {
      id: '123',
      name: 'New User',
      email: 'newuser@example.com'
    }
  });
});

module.exports = router;
