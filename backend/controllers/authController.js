const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const signToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone } = req.body;

    if (!name || !email || !password) {
      return errorResponse(res, 'Name, email, and password are required', 400);
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return errorResponse(res, 'Email already in use', 400);
    }

    const user = await User.create({ name, email, password, role: role || 'customer', phone });

    // Create wallet for customer
    if (user.role === 'customer') {
      await Wallet.create({ user: user._id, balance: 0 });
    }

    const token = signToken(user);

    const userObj = user.toObject();
    delete userObj.password;

    return successResponse(res, { token, user: userObj }, 'Registration successful', 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 'Email and password are required', 400);
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    if (!user.isActive) {
      return errorResponse(res, 'Your account has been deactivated. Contact support.', 403);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    const token = signToken(user);

    const userObj = user.toObject();
    delete userObj.password;

    return successResponse(res, { token, user: userObj }, 'Login successful');
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }
    return successResponse(res, { user }, 'Profile retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, profileImage } = req.body;

    const updateFields = {};
    if (name) updateFields.name = name;
    if (phone) updateFields.phone = phone;
    if (profileImage) updateFields.profileImage = profileImage;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    return successResponse(res, { user }, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Add an address to user profile
// @route   POST /api/auth/address
const addAddress = async (req, res, next) => {
  try {
    const { label, street, city, state, pincode, isDefault } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    // If new address is default, unset others
    if (isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    user.addresses.push({ label, street, city, state, pincode, isDefault: isDefault || false });
    await user.save();

    return successResponse(res, { addresses: user.addresses }, 'Address added successfully', 201);
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getProfile, updateProfile, addAddress };
