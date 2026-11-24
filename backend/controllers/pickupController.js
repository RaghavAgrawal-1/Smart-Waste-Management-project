const PickupRequest = require('../models/PickupRequest');
const ScrapListing = require('../models/ScrapListing');
const ScrapCategory = require('../models/ScrapCategory');
const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// @desc    Get pickups for the logged-in customer
// @route   GET /api/pickups/my
const getMyPickups = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await PickupRequest.countDocuments({ customer: req.user.id });

    const pickups = await PickupRequest.find({ customer: req.user.id })
      .populate('agent', 'name phone')
      .populate({
        path: 'listing',
        populate: { path: 'items.category', select: 'name pricePerKg' },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return successResponse(
      res,
      { pickups, pagination: { total, page, limit, pages: Math.ceil(total / limit) } },
      'Pickups retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get pickups assigned to the logged-in agent
// @route   GET /api/pickups/agent
const getAgentPickups = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { agent: req.user.id };
    if (req.query.status) filter.status = req.query.status;

    const total = await PickupRequest.countDocuments(filter);

    const pickups = await PickupRequest.find(filter)
      .populate('customer', 'name phone email')
      .populate({
        path: 'listing',
        populate: { path: 'items.category', select: 'name pricePerKg unit' },
      })
      .sort({ scheduledDate: 1 })
      .skip(skip)
      .limit(limit);

    return successResponse(
      res,
      { pickups, pagination: { total, page, limit, pages: Math.ceil(total / limit) } },
      'Agent pickups retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single pickup request by ID (fully populated)
// @route   GET /api/pickups/:id
const getPickupById = async (req, res, next) => {
  try {
    const pickup = await PickupRequest.findById(req.params.id)
      .populate('customer', 'name email phone addresses')
      .populate('agent', 'name email phone')
      .populate({
        path: 'listing',
        populate: { path: 'items.category', select: 'name description pricePerKg unit' },
      });

    if (!pickup) {
      return errorResponse(res, 'Pickup request not found', 404);
    }

    return successResponse(res, { pickup }, 'Pickup request retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Update pickup status (agent)
// @route   PUT /api/pickups/:id/status
const updateStatus = async (req, res, next) => {
  try {
    const { status, agentNotes } = req.body;

    const validStatuses = ['assigned', 'accepted', 'on_the_way', 'arrived', 'scrap_collected', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return errorResponse(res, 'Invalid status value', 400);
    }

    const pickup = await PickupRequest.findById(req.params.id);
    if (!pickup) {
      return errorResponse(res, 'Pickup request not found', 404);
    }

    pickup.status = status;
    if (agentNotes) pickup.agentNotes = agentNotes;

    if (status === 'completed') {
      pickup.completedAt = new Date();

      // Update ScrapListing status to completed
      await ScrapListing.findByIdAndUpdate(pickup.listing, { status: 'completed' });
    }

    // Trigger payment flow when scrap collected
    if (status === 'scrap_collected' && pickup.actualValue) {
      const transaction = await Transaction.create({
        customer: pickup.customer,
        pickupRequest: pickup._id,
        type: 'credit',
        amount: pickup.actualValue,
        description: `Payment for scrap collected from pickup #${pickup._id}`,
        status: 'completed',
      });

      await Wallet.findOneAndUpdate(
        { user: pickup.customer },
        { $inc: { balance: pickup.actualValue } },
        { new: true, upsert: true }
      );

      // Update listing to collected
      await ScrapListing.findByIdAndUpdate(pickup.listing, { status: 'collected' });
    }

    await pickup.save();

    return successResponse(res, { pickup }, 'Pickup status updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Agent updates actual weight and calculates value
// @route   PUT /api/pickups/:id/weight
const updateWeight = async (req, res, next) => {
  try {
    const { actualWeight } = req.body;

    if (!actualWeight || actualWeight <= 0) {
      return errorResponse(res, 'Valid actual weight is required', 400);
    }

    const pickup = await PickupRequest.findById(req.params.id).populate({
      path: 'listing',
      populate: { path: 'items.category', select: 'pricePerKg' },
    });

    if (!pickup) {
      return errorResponse(res, 'Pickup request not found', 404);
    }

    // Calculate average price per kg across all categories in listing
    let totalPricePerKg = 0;
    let categoryCount = 0;

    if (pickup.listing && pickup.listing.items) {
      pickup.listing.items.forEach((item) => {
        if (item.category && item.category.pricePerKg) {
          totalPricePerKg += item.category.pricePerKg;
          categoryCount++;
        }
      });
    }

    const avgPricePerKg = categoryCount > 0 ? totalPricePerKg / categoryCount : 0;
    const actualValue = actualWeight * avgPricePerKg;

    pickup.actualWeight = actualWeight;
    pickup.actualValue = actualValue;
    await pickup.save();

    return successResponse(res, { pickup }, 'Actual weight and value updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Agent uploads verification images
// @route   POST /api/pickups/:id/images
const uploadVerificationImages = async (req, res, next) => {
  try {
    const pickup = await PickupRequest.findById(req.params.id);
    if (!pickup) {
      return errorResponse(res, 'Pickup request not found', 404);
    }

    if (!req.files || req.files.length === 0) {
      return errorResponse(res, 'No images uploaded', 400);
    }

    const imagePaths = req.files.map((file) => `/uploads/${file.filename}`);
    pickup.verificationImages.push(...imagePaths);
    await pickup.save();

    return successResponse(res, { verificationImages: pickup.verificationImages }, 'Verification images uploaded successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyPickups,
  getAgentPickups,
  getPickupById,
  updateStatus,
  updateWeight,
  uploadVerificationImages,
};
