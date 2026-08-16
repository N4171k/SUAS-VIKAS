const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err.message);
  console.error(err.stack);

  // DynamoDB conditional check (e.g. stock reservation)
  if (err.name === 'ConditionalCheckFailedException') {
    return res.status(409).json({ error: 'Conditional check failed. Resource state changed.' });
  }

  // DynamoDB item already exists
  if (err.name === 'ItemCollectionSizeLimitExceededException') {
    return res.status(409).json({ error: 'Item collection size limit exceeded.' });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token.' });
  }

  // Custom error with statusCode
  if (err.statusCode) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Default 500
  res.status(500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
  });
};

module.exports = { errorHandler };