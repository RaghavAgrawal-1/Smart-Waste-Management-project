const express = require('express');
const router = express.Router();
const {
  createPartner,
  getPartners,
  getPartnerById,
  updatePartner,
  verifyPartner,
  createBulkOrder,
  getBulkOrders,
  updateBulkOrderStatus,
} = require('../controllers/partnerController');
const auth = require('../middleware/auth');
const { isAdmin } = require('../middleware/roleCheck');

// Partner routes - admin protected
router.post('/', auth, isAdmin, createPartner);
router.get('/', auth, getPartners);
router.get('/bulk-orders', auth, isAdmin, getBulkOrders);
router.post('/bulk-orders', auth, isAdmin, createBulkOrder);
router.put('/bulk-orders/:id/status', auth, isAdmin, updateBulkOrderStatus);
router.get('/:id', auth, getPartnerById);
router.put('/:id', auth, isAdmin, updatePartner);
router.put('/:id/verify', auth, isAdmin, verifyPartner);

module.exports = router;
