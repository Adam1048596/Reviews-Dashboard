const express = require("express");
const axios = require("axios");
const router = express.Router();

// Import the normalization utility
const { normalizeHostaway } = require("../utils/normalizeHostaway");

// mock data import
const mockReviews = require("../reviews.json");

// hostaway API Access
const ACCOUNT_ID = "61148";
const HOSTAWAY_API_URL = `https://api.hostaway.com/v1/reviews?accountId=${ACCOUNT_ID}`;
const API_KEY = "f94377ebbbb479490bb3ec364649168dc443dda2e4830facaf5de2e74ccc9152";

// GET /api/reviews/hostaway
router.get("/hostaway", async (req, res) => {
  // Track where the data came from
  let source ;
  // This variable will store the raw review data from the successful source (API, mock).
  let reviewsData = [];

  try {
    console.log(`Attempting to fetch live reviews from Hostaway API...`);
    
    // 1. ATTEMPT API CALL
    const response = await axios.get(HOSTAWAY_API_URL, {
      headers: { Authorization: `Bearer ${API_KEY}` },
      timeout: 10000,
    });

    if (response.data && response.data.status === "success" && Array.isArray(response.data.result)) {
      // The structure is valid and we have an array
      if (response.data.result.length > 0) {
        // Array has data
        reviewsData = response.data.result;
        source = 'Hostaway API';
        console.log(`Successfully fetched ${reviewsData.length} reviews from ${source}.`);
      } else {
        // Array is empty (Sandbox)
        console.warn("Live API returned an empty array. Falling back to mock data.");
        source = 'mock (empty live response)';
        reviewsData = mockReviews.result;
      }
    } else {
      // The API responded but not with the expected structure
      const errorMessage = `Invalid API response structure. Received status: ${response.status}`;
      console.error(errorMessage, "Full response:", response.data);
      
      // Create a custom error and add the response for better debugging
      const validationError = new Error(errorMessage);
      validationError.type = 'API_VALIDATION_ERROR'; // Custom property to identify error type
      validationError.response = response; // Attach the full response for deep debugging
      
      throw validationError; // This will be caught by the general catch block below
    }

  } catch (error) {
    // 4. HANDLE ANY ERRORS (Network error, 403, 500, timeout, etc.)
    source = 'mock (API error)';
    console.error(`Hostaway API request failed: ${error.message}. Falling back to mock data for demonstration.`);
    reviewsData = mockReviews.result;
  }

  // 5. NORMALIZE DATA FROM WHATEVER SOURCE WE ENDED UP WITH
  const normalizedReviews = reviewsData.map(normalizeHostaway);
  console.log(`Sending ${normalizedReviews.length} normalized review (source: ${source}).`);

  // 6. ALWAYS RETURN A CONSISTENT STRUCTURED RESPONSE
  res.json({
    status: "success",
    source,
    count: normalizedReviews.length,
    reviews: normalizedReviews
  });
});



//GET /api/reviews/public (ONLY reviews with publicDisplay = true)
router.get("/public", async (req, res) => {
  let source;
  let reviewsData = [];

  try {
    console.log(`Attempting to fetch live reviews from Hostaway API...`);

    const response = await axios.get(HOSTAWAY_API_URL, {
      headers: { Authorization: `Bearer ${API_KEY}` },
      timeout: 10000,
    });

    if (
      response.data &&
      response.data.status === "success" &&
      Array.isArray(response.data.result)
    ) {
      if (response.data.result.length > 0) {
        reviewsData = response.data.result;
        source = "Hostaway API";
      } else {
        source = "mock (empty live response)";
        reviewsData = mockReviews.result;
      }
    } else {
      const errorMessage = `Invalid API response structure. Received status: ${response.status}`;
      console.error(errorMessage, "Full response:", response.data);

      const validationError = new Error(errorMessage);
      validationError.type = "API_VALIDATION_ERROR";
      validationError.response = response;
      throw validationError;
    }
  } catch (error) {
    source = "mock (API error)";
    reviewsData = mockReviews.result;
  }

  const normalizedReviews = reviewsData.map(normalizeHostaway);
  const publicReviews = normalizedReviews.filter((r) => r.publicDisplay);

  console.log(`Sending ${publicReviews.length} public reviews (source: ${source}).`);

  res.json({
    status: "success",
    source,
    count: publicReviews.length,
    reviews: publicReviews,
  });
});


// -------------------- NEW PATCH ROUTE --------------------
router.patch("/hostaway/:id/public", (req, res) => {
  const { id } = req.params;
  const { publicDisplay } = req.body;

  // Find review inside mock data
  const review = mockReviews.result.find(r => r.id == id);
  if (!review) {
    return res.status(404).json({ success: false, message: "Review not found" });
  }

  // Update in memory (not persistent!)
  review.PublicDisplayStatus = publicDisplay;

  res.json({
    success: true,
    message: `Review ${id} visibility updated`,
    review
  });
});


module.exports = router;