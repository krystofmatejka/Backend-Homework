const userIdMiddleware = (req, res, next) => {
  const userId = req.headers['x-user-id'];

  if (!userId) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'x-user-id header is required'
    });
  }

  // Attach user to request object
  req.account = {
    id: userId,
  };
  next();
};

export default userIdMiddleware;
