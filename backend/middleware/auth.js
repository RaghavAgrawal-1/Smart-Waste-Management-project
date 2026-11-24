const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/responseHelper');

const auth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'No token provided, authorization denied', 401);
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return errorResponse(res, 'No token provided, authorization denied', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (error) {
    return errorResponse(res, 'Token is not valid', 401);
  }
};

module.exports = auth;
