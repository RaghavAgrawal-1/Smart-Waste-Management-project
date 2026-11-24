const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getUsers,
  updateUserStatus,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  bulkUpdatePrices,
  getAllPickups,
  assignAgent,
  getAllTransactions,
  getAllFeedback,
  respondToFeedback,
} = require('../controllers/adminController');
const auth = require('../middleware/auth');
const { isAdmin } = require('../middleware/roleCheck');

// All admin routes require auth + isAdmin
router.use(auth, isAdmin);

// Dashboard
router.get('/dashboard', getDashboard);

// User management
router.get('/users', getUsers);
router.put('/users/:id/status', updateUserStatus);
router.patch('/users/:id/status', updateUserStatus);

// Category management
router.get('/categories', getAllCategories);
router.post('/categories', createCategory);
router.put('/categories/bulk-prices', bulkUpdatePrices);
router.patch('/categories/bulk-prices', bulkUpdatePrices);
router.patch('/prices', bulkUpdatePrices);
router.put('/categories/:id', updateCategory);
router.patch('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// Pickup management
router.get('/pickups', getAllPickups);
router.put('/pickups/:id/assign', assignAgent);
router.patch('/pickups/:id/assign', assignAgent);
router.post('/pickups/assign-agent', assignAgent);
router.patch('/assign-agent', assignAgent);

// Transactions
router.get('/transactions', getAllTransactions);

// Feedback
router.get('/feedback', getAllFeedback);
router.put('/feedback/:id/respond', respondToFeedback);
router.post('/feedback/:id/respond', respondToFeedback);

module.exports = router;
