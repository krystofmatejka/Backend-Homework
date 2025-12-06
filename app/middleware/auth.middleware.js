const PROFILES = {
  AUTHORITIES: 'Authorities',
  OPERATIVES: 'Operatives',
  USERS: 'Users'
}

const API_KEYS = {
  'key-abc123': { id: '1', profile: PROFILES.AUTHORITIES },
  'key-def456': { id: '2', profile: PROFILES.OPERATIVES },
  'key-ghi789': { id: '3', profile: PROFILES.USERS },
  'key-jkl012': { id: '4', profile: PROFILES.USERS },
  'key-mno345': { id: '5', profile: PROFILES.USERS },
};

const authMiddleware = (req, res, next) => {
  if (process.env.DISABLE_AUTH === 'true') {
    console.warn('Authentication is disabled via DISABLE_AUTH=true');
    return next();
  }

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

export default authMiddleware;
