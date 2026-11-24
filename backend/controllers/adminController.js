const User = require('../models/User');
const ScrapCategory = require('../models/ScrapCategory');
const PickupRequest = require('../models/PickupRequest');
const Transaction = require('../models/Transaction');
const Feedback = require('../models/Feedback');
const ScrapListing = require('../models/ScrapListing');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard
const getDashboard = async (req, res, next) => {
  try {
    const [
      totalCustomers,
      totalAgents,
      totalPickups,
      pendingPickups,
      completedPickups,
      revenueResult,
      scrapResult,
      recentPickups,
    ] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'agent' }),
      PickupRequest.countDocuments({}),
      PickupRequest.countDocuments({ status: { $nin: ['completed', 'cancelled'] } }),
      PickupRequest.countDocuments({ status: 'completed' }),
      Transaction.aggregate([
        { $match: { type: 'credit', status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      PickupRequest.aggregate([
        { $match: { status: 'completed', actualWeight: { $exists: true } } },
        { $group: { _id: null, total: { $sum: '$actualWeight' } } },
      ]),
      PickupRequest.find({})
        .populate('customer', 'name email')
        .populate('agent', 'name')
        .sort({ createdAt: -1 })
        .limit(10),
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;
    const totalScrapCollected = scrapResult.length > 0 ? scrapResult[0].total : 0;

    return successResponse(
      res,
      {
        totalCustomers,
        totalAgents,
        totalPickups,
        pendingPickups,
        completedPickups,
        totalRevenue,
        totalScrapCollected,
        recentPickups,
      },
      'Dashboard data retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users with filters and pagination
// @route   GET /api/admin/users
const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [{ name: searchRegex }, { email: searchRegex }];
    }

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return successResponse(
      res,
      { users, pagination: { total, page, limit, pages: Math.ceil(total / limit) } },
      'Users retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user active status
// @route   PUT /api/admin/users/:id/status
const updateUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    user.isActive = !user.isActive;
    await user.save();

    return successResponse(res, { user }, `User ${user.isActive ? 'activated' : 'deactivated'} successfully`);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all scrap categories (including inactive)
// @route   GET /api/admin/categories
const getAllCategories = async (req, res, next) => {
  try {
    const categories = await ScrapCategory.find({}).sort({ name: 1 });
    return successResponse(res, { categories }, 'Categories retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new scrap category
// @route   POST /api/admin/categories
const createCategory = async (req, res, next) => {
  try {
    const { name, description, image, pricePerKg, unit, acceptedMaterials, conditionRequirements } = req.body;

    if (!name || pricePerKg === undefined) {
      return errorResponse(res, 'Name and pricePerKg are required', 400);
    }

    const category = await ScrapCategory.create({
      name,
      description,
      image,
      pricePerKg,
      unit,
      acceptedMaterials,
      conditionRequirements,
    });

    return successResponse(res, { category }, 'Category created successfully', 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a scrap category
// @route   PUT /api/admin/categories/:id
const updateCategory = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'description', 'image', 'pricePerKg', 'unit', 'acceptedMaterials', 'conditionRequirements', 'isActive'];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const category = await ScrapCategory.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!category) {
      return errorResponse(res, 'Category not found', 404);
    }

    return successResponse(res, { category }, 'Category updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Soft-delete a category (set isActive=false)
// @route   DELETE /api/admin/categories/:id
const deleteCategory = async (req, res, next) => {
  try {
    const category = await ScrapCategory.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!category) {
      return errorResponse(res, 'Category not found', 404);
    }

    return successResponse(res, { category }, 'Category deactivated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk update prices for multiple categories
// @route   PUT /api/admin/categories/bulk-prices
const bulkUpdatePrices = async (req, res, next) => {
  try {
    const { updates } = req.body; // [{id, pricePerKg}]

    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return errorResponse(res, 'Updates array is required', 400);
    }

    const results = await Promise.all(
      updates.map(({ id, pricePerKg }) =>
        ScrapCategory.findByIdAndUpdate(id, { pricePerKg }, { new: true })
      )
    );

    return successResponse(res, { updated: results.filter(Boolean) }, 'Prices updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get all pickups with filters and pagination (admin)
// @route   GET /api/admin/pickups
const getAllPickups = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.agent) filter.agent = req.query.agent;
    if (req.query.startDate || req.query.endDate) {
      filter.scheduledDate = {};
      if (req.query.startDate) filter.scheduledDate.$gte = new Date(req.query.startDate);
      if (req.query.endDate) filter.scheduledDate.$lte = new Date(req.query.endDate);
    }

    const total = await PickupRequest.countDocuments(filter);

    const pickups = await PickupRequest.find(filter)
      .populate('customer', 'name email phone')
      .populate('agent', 'name email phone')
      .populate('listing', 'totalEstimatedWeight totalEstimatedValue status')
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

// @desc    Assign an agent to a pickup request
// @route   PUT /api/admin/pickups/:id/assign
const assignAgent = async (req, res, next) => {
  try {
    const { agentId } = req.body;

    if (!agentId) {
      return errorResponse(res, 'Agent ID is required', 400);
    }

    const agent = await User.findOne({ _id: agentId, role: 'agent' });
    if (!agent) {
      return errorResponse(res, 'Agent not found', 404);
    }

    const pickupId = req.params.id || req.body.pickupId || req.body.id;
    if (!pickupId) {
      return errorResponse(res, 'Pickup ID is required', 400);
    }

    const pickup = await PickupRequest.findByIdAndUpdate(
      pickupId,
      { agent: agentId, status: 'assigned' },
      { new: true }
    )
      .populate('customer', 'name email')
      .populate('agent', 'name email phone');

    if (!pickup) {
      return errorResponse(res, 'Pickup request not found', 404);
    }

    return successResponse(res, { pickup }, 'Agent assigned successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get all transactions (admin)
// @route   GET /api/admin/transactions
const getAllTransactions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.type) filter.type = req.query.type;
    if (req.query.status) filter.status = req.query.status;

    const total = await Transaction.countDocuments(filter);

    const transactions = await Transaction.find(filter)
      .populate('customer', 'name email')
      .populate('pickupRequest', 'status scheduledDate')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return successResponse(
      res,
      { transactions, pagination: { total, page, limit, pages: Math.ceil(total / limit) } },
      'Transactions retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get all feedback (admin)
// @route   GET /api/admin/feedback
const getAllFeedback = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.isResolved !== undefined) {
      filter.isResolved = req.query.isResolved === 'true';
    }

    const total = await Feedback.countDocuments(filter);

    const feedbacks = await Feedback.find(filter)
      .populate('customer', 'name email')
      .populate('pickupRequest', 'status scheduledDate')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return successResponse(
      res,
      { feedbacks, pagination: { total, page, limit, pages: Math.ceil(total / limit) } },
      'Feedback retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Admin responds to feedback
// @route   PUT /api/admin/feedback/:id/respond
const respondToFeedback = async (req, res, next) => {
  try {
    const { adminResponse } = req.body;

    if (!adminResponse) {
      return errorResponse(res, 'Admin response is required', 400);
    }

    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { adminResponse, isResolved: true },
      { new: true }
    )
      .populate('customer', 'name email')
      .populate('pickupRequest', 'status');

    if (!feedback) {
      return errorResponse(res, 'Feedback not found', 404);
    }

    return successResponse(res, { feedback }, 'Feedback responded to successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
