const express = require('express');
const router = express.Router();
const { createPayment, getPaymentHistory, getWallet, requestWithdrawal } = require('../controllers/paymentController');
const auth = require('../middleware/auth');

// All payment routes require authentication
router.use(auth);

router.post('/create', createPayment);
router.get('/history', getPaymentHistory);
router.get('/wallet', getWallet);
router.post('/withdraw', requestWithdrawal);

module.exports = router;
