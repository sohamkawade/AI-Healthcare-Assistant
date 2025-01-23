const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    req.user = decoded;
    next();

  } catch (error) {
    console.error('Authentication error:', error.message, error.stack);
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

module.exports = { authenticate };
