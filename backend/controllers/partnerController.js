const RecyclingPartner = require('../models/RecyclingPartner');
const BulkOrder = require('../models/BulkOrder');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// @desc    Create a new recycling partner
// @route   POST /api/partners
const createPartner = async (req, res, next) => {
  try {
    const { companyName, contactPerson, email, phone, address, acceptedCategories, purchaseRates, documents } = req.body;

    if (!companyName || !email) {
      return errorResponse(res, 'Company name and email are required', 400);
    }

    const partner = await RecyclingPartner.create({
      companyName,
      contactPerson,
      email,
      phone,
      address,
      acceptedCategories,
      purchaseRates,
      documents,
    });

    return successResponse(res, { partner }, 'Recycling partner created successfully', 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all recycling partners
// @route   GET /api/partners
const getPartners = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.isVerified !== undefined) {
      filter.isVerified = req.query.isVerified === 'true';
    }

    const partners = await RecyclingPartner.find(filter)
      .populate('acceptedCategories', 'name pricePerKg unit')
      .populate('purchaseRates.category', 'name unit')
      .sort({ createdAt: -1 });

    return successResponse(res, { partners }, 'Partners retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single recycling partner by ID
// @route   GET /api/partners/:id
const getPartnerById = async (req, res, next) => {
  try {
    const partner = await RecyclingPartner.findById(req.params.id)
      .populate('acceptedCategories', 'name description pricePerKg unit')
      .populate('purchaseRates.category', 'name unit');

    if (!partner) {
      return errorResponse(res, 'Partner not found', 404);
    }

    return successResponse(res, { partner }, 'Partner retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Update a recycling partner
// @route   PUT /api/partners/:id
const updatePartner = async (req, res, next) => {
  try {
    const allowedFields = ['companyName', 'contactPerson', 'email', 'phone', 'address', 'acceptedCategories', 'purchaseRates', 'documents'];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const partner = await RecyclingPartner.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    )
      .populate('acceptedCategories', 'name pricePerKg unit')
      .populate('purchaseRates.category', 'name unit');

    if (!partner) {
      return errorResponse(res, 'Partner not found', 404);
    }

    return successResponse(res, { partner }, 'Partner updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Verify a recycling partner
// @route   PUT /api/partners/:id/verify
const verifyPartner = async (req, res, next) => {
  try {
    const partner = await RecyclingPartner.findByIdAndUpdate(
      req.params.id,
      { isVerified: true },
      { new: true }
    );

    if (!partner) {
      return errorResponse(res, 'Partner not found', 404);
    }

    return successResponse(res, { partner }, 'Partner verified successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Create a bulk order for a partner
// @route   POST /api/partners/bulk-orders
const createBulkOrder = async (req, res, next) => {
  try {
    const { partner, categories, dispatchDate } = req.body;

    if (!partner || !categories || categories.length === 0) {
      return errorResponse(res, 'Partner and categories are required', 400);
    }

    // Calculate total value
    const totalValue = categories.reduce((sum, item) => {
      return sum + (item.quantity || 0) * (item.pricePerKg || 0);
    }, 0);

    const bulkOrder = await BulkOrder.create({
      partner,
      categories,
      totalValue,
      dispatchDate,
      status: 'pending',
    });

    return successResponse(res, { bulkOrder }, 'Bulk order created successfully', 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bulk orders
// @route   GET /api/partners/bulk-orders
const getBulkOrders = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.partner) filter.partner = req.query.partner;

    const bulkOrders = await BulkOrder.find(filter)
      .populate('partner', 'companyName email phone')
      .populate('categories.category', 'name unit')
      .sort({ createdAt: -1 });

    return successResponse(res, { bulkOrders }, 'Bulk orders retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Update bulk order status
// @route   PUT /api/partners/bulk-orders/:id/status
const updateBulkOrderStatus = async (req, res, next) => {
  try {
    const { status, dispatchDate } = req.body;

    const validStatuses = ['pending', 'approved', 'dispatched', 'completed'];
    if (!validStatuses.includes(status)) {
      return errorResponse(res, 'Invalid status value', 400);
    }

    const updateFields = { status };
    if (dispatchDate) updateFields.dispatchDate = dispatchDate;

    const bulkOrder = await BulkOrder.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    )
      .populate('partner', 'companyName email')
      .populate('categories.category', 'name unit');

    if (!bulkOrder) {
      return errorResponse(res, 'Bulk order not found', 404);
    }

    return successResponse(res, { bulkOrder }, 'Bulk order status updated successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPartner,
  getPartners,
  getPartnerById,
  updatePartner,
  verifyPartner,
  createBulkOrder,
  getBulkOrders,
  updateBulkOrderStatus,
};
