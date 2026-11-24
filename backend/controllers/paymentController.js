const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// @desc    Create a payment (credit simulation)
// @route   POST /api/payments/create
const createPayment = async (req, res, next) => {
  try {
    const { pickupRequest, amount, description, paymentMethod } = req.body;

    if (!amount || amount <= 0) {
      return errorResponse(res, 'Valid amount is required', 400);
    }

    const transaction = await Transaction.create({
      customer: req.user.id,
      pickupRequest: pickupRequest || undefined,
      type: 'credit',
      amount,
      description: description || 'Payment received',
      paymentMethod: paymentMethod || 'wallet',
      status: 'completed',
      referenceId: `TXN-${Date.now()}`,
    });

    // Add amount to wallet
    await Wallet.findOneAndUpdate(
      { user: req.user.id },
      { $inc: { balance: amount } },
      { new: true, upsert: true }
    );

    return successResponse(res, { transaction }, 'Payment processed successfully', 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment/transaction history for logged-in user
// @route   GET /api/payments/history
const getPaymentHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { customer: req.user.id };
    if (req.query.type) filter.type = req.query.type;
    if (req.query.status) filter.status = req.query.status;

    const total = await Transaction.countDocuments(filter);

    const transactions = await Transaction.find(filter)
      .populate('pickupRequest', 'status scheduledDate')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return successResponse(
      res,
      { transactions, pagination: { total, page, limit, pages: Math.ceil(total / limit) } },
      'Payment history retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get wallet details for logged-in user
// @route   GET /api/payments/wallet
const getWallet = async (req, res, next) => {
  try {
    let wallet = await Wallet.findOne({ user: req.user.id }).populate('user', 'name email');

    if (!wallet) {
      wallet = await Wallet.create({ user: req.user.id, balance: 0 });
    }

    return successResponse(res, { wallet }, 'Wallet retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Request a withdrawal from wallet
// @route   POST /api/payments/withdraw
const requestWithdrawal = async (req, res, next) => {
  try {
    const { amount, paymentMethod, description } = req.body;

    if (!amount || amount <= 0) {
      return errorResponse(res, 'Valid amount is required', 400);
    }

    const wallet = await Wallet.findOne({ user: req.user.id });
    if (!wallet) {
      return errorResponse(res, 'Wallet not found', 404);
    }

    if (wallet.balance < amount) {
      return errorResponse(res, 'Insufficient wallet balance', 400);
    }

    // Create debit transaction (pending state for withdrawal)
    const transaction = await Transaction.create({
      customer: req.user.id,
      type: 'debit',
      amount,
      description: description || 'Withdrawal request',
      paymentMethod: paymentMethod || 'bank_transfer',
      status: 'pending',
      referenceId: `WDR-${Date.now()}`,
    });

    // Deduct from wallet
    wallet.balance -= amount;
    await wallet.save();

    return successResponse(res, { transaction, wallet }, 'Withdrawal request submitted successfully', 201);
  } catch (error) {
    next(error);
  }
};

module.exports = { createPayment, getPaymentHistory, getWallet, requestWithdrawal };
