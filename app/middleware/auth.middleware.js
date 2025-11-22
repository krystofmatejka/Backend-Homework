// Hardcoded API keys with associated users
const API_KEYS = {
  'key-user1-abc123': { id: 'user1', name: 'John Doe' },
  'key-user2-def456': { id: 'user2', name: 'Jane Smith' },
  'key-user3-ghi789': { id: 'user3', name: 'Bob Johnson' }
};

const authMiddleware = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'x-api-key header is required'
    });
  }

  const user = API_KEYS[apiKey];

  if (!user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid API key'
    });
  }

  // Attach user to request object
  req.user = user;
  next();
};

module.exports = authMiddleware;
