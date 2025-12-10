export function errorHandlerMiddleware(err, req, res, next) {
  console.error('Global error handler:', err);

  if (err.name === 'ValidationFailed') {
    return res.status(400).json({
      message: 'Bad Request',
      errors: err.errors
    });
  }

  if (err.name === 'NotFound') {
    return res.status(400).json({
      message: 'Entity Not Found',
    });
  }

  res.status(500).send({
    message: 'Internal Server Error',
  });
}