const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategoryById,
  createListing,
  getMyListings,
  getListingById,
} = require('../controllers/scrapController');
const auth = require('../middleware/auth');
const { isCustomer } = require('../middleware/roleCheck');

// Categories - public
router.get('/categories', getCategories);
router.get('/categories/:id', getCategoryById);

// Listings - protected
router.post('/listings', auth, isCustomer, createListing);
router.get('/listings/my', auth, isCustomer, getMyListings);
router.get('/listings/:id', auth, getListingById);

module.exports = router;
