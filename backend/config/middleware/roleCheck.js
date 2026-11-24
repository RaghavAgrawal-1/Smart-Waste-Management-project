const { errorResponse } = require('../utils/responseHelper');

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return errorResponse(res, 'Access denied. Admin role required.', 403);
};

const isAgent = (req, res, next) => {
  if (req.user && req.user.role === 'agent') {
    return next();
  }
  return errorResponse(res, 'Access denied. Agent role required.', 403);
};

const isCustomer = (req, res, next) => {
  if (req.user && req.user.role === 'customer') {
    return next();
  }
  return errorResponse(res, 'Access denied. Customer role required.', 403);
};

const isAdminOrAgent = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'agent')) {
    return next();
  }
  return errorResponse(res, 'Access denied. Admin or Agent role required.', 403);
};

module.exports = { isAdmin, isAgent, isCustomer, isAdminOrAgent };
