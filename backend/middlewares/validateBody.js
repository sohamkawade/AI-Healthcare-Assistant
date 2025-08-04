const validateBody = (requiredFields) => {
  return (req, res, next) => {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Invalid request body',
      });
    }

    const missingFields = requiredFields.filter(field => {
      return !req.body[field] || req.body[field].toString().trim() === '';
    });

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing or empty required fields: ${missingFields.join(', ')}`,
      });
    }

    next();
  };
};

module.exports = validateBody;
