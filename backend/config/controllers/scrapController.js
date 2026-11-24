const ScrapCategory = require('../models/ScrapCategory');
const ScrapListing = require('../models/ScrapListing');
const PickupRequest = require('../models/PickupRequest');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// @desc    Get all active scrap categories
// @route   GET /api/scrap/categories
const getCategories = async (req, res, next) => {
  try {
    const categories = await ScrapCategory.find({ isActive: true }).sort({ name: 1 });
    return successResponse(res, { categories }, 'Categories retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get single category by ID
// @route   GET /api/scrap/categories/:id
const getCategoryById = async (req, res, next) => {
  try {
    const category = await ScrapCategory.findById(req.params.id);
    if (!category) {
      return errorResponse(res, 'Category not found', 404);
    }
    return successResponse(res, { category }, 'Category retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new scrap listing (also creates a PickupRequest)
// @route   POST /api/scrap/listings
const createListing = async (req, res, next) => {
  try {
    const { items, pickupAddress, preferredDate, preferredTimeSlot, additionalNotes } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return errorResponse(res, 'At least one item is required', 400);
    }

    // Calculate totals
    let totalEstimatedWeight = 0;
    let totalEstimatedValue = 0;

    for (const item of items) {
      const category = await ScrapCategory.findById(item.category);
      if (!category) {
        return errorResponse(res, `Category ${item.category} not found`, 404);
      }
      totalEstimatedWeight += item.estimatedWeight;
      totalEstimatedValue += item.estimatedWeight * category.pricePerKg;
    }

    const listing = await ScrapListing.create({
      customer: req.user.id,
      items,
      totalEstimatedWeight,
      totalEstimatedValue,
      pickupAddress,
      preferredDate,
      preferredTimeSlot,
      additionalNotes,
      status: 'pending',
    });

    // Create PickupRequest automatically
    const pickupRequest = await PickupRequest.create({
      listing: listing._id,
      customer: req.user.id,
      scheduledDate: preferredDate,
      timeSlot: preferredTimeSlot,
      address: pickupAddress,
      status: 'assigned',
    });

    return successResponse(
      res,
      { listing, pickupRequest },
      'Scrap listing created successfully',
      201
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get all listings for logged-in customer
// @route   GET /api/scrap/listings/my
const getMyListings = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await ScrapListing.countDocuments({ customer: req.user.id });

    const listings = await ScrapListing.find({ customer: req.user.id })
      .populate('items.category', 'name pricePerKg unit')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return successResponse(
      res,
      {
        listings,
        pagination: { total, page, limit, pages: Math.ceil(total / limit) },
      },
      'Listings retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single listing by ID
// @route   GET /api/scrap/listings/:id
const getListingById = async (req, res, next) => {
  try {
    const listing = await ScrapListing.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('items.category', 'name description pricePerKg unit acceptedMaterials');

    if (!listing) {
      return errorResponse(res, 'Listing not found', 404);
    }

    return successResponse(res, { listing }, 'Listing retrieved successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = { getCategories, getCategoryById, createListing, getMyListings, getListingById };
