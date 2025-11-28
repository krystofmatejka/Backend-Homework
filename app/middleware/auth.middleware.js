// Hardcoded API keys with associated accounts
const API_KEYS = {
  'key-abc123': { id: '1', profile: 'Authorities' },
  'key-def456': { id: '2', profile: 'Operatives' },
};

const authMiddleware = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'x-api-key header is required'
    });
  }

  const account = API_KEYS[apiKey];

  if (!account) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid API key'
    });
  }

  // Attach user to request object
  req.account = account;
  next();
};

module.exports = authMiddleware;
