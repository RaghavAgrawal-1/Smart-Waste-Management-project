const express = require('express');
const router = express.Router();
const {
  getMyPickups,
  getAgentPickups,
  getPickupById,
  updateStatus,
  updateWeight,
  uploadVerificationImages,
} = require('../controllers/pickupController');
const auth = require('../middleware/auth');
const { isCustomer, isAgent, isAdminOrAgent } = require('../middleware/roleCheck');
const { uploadMultiple } = require('../middleware/upload');

// Customer routes
router.get('/my', auth, isCustomer, getMyPickups);
router.get('/my-pickups', auth, isCustomer, getMyPickups);

// Agent routes
router.get('/agent', auth, isAgent, getAgentPickups);
router.get('/agent-pickups', auth, isAgent, getAgentPickups);

// Shared routes (admin or agent)
router.get('/:id', auth, getPickupById);
router.put('/:id/status', auth, isAdminOrAgent, updateStatus);
router.patch('/:id/status', auth, isAdminOrAgent, updateStatus);
router.put('/:id/weight', auth, isAdminOrAgent, updateWeight);
router.patch('/:id/weight', auth, isAdminOrAgent, updateWeight);
router.post('/:id/images', auth, isAdminOrAgent, uploadMultiple, uploadVerificationImages);
router.post('/:id/verify-images', auth, isAdminOrAgent, uploadMultiple, uploadVerificationImages);

module.exports = router;
