export function errorHandlerMiddleware(err, req, res, next) {
  console.error('Global error handler:', err);

  if (err.name === 'ValidationFailed') {
    return res.status(400).json({
      message: 'Bad Request',
      errors: err.errors
    });
  }

  res.status(500).send({
    message: 'Internal Server Error',
  });
}