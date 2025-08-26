if (response.data && response.data.status === "success" && Array.isArray(response.data.result)) {
  // COMMON PATH: The structure is valid and we have an array
  if (response.data.result.length > 0) {
    // SUBCASE 1: Array has data
    reviewsData = response.data.result;
    source = 'Hostaway API';
    console.log(`Successfully fetched ${reviewsData.length} reviews from ${source}.`);
  } else {
    // SUBCASE 2: Array is empty (Sandbox)
    console.warn("Live API returned an empty array. Falling back to mock data.");
    source = 'mock (empty live response)';
    reviewsData = mockReviews.result;
  }
}

    if (response.data && response.data.status === "success" && Array.isArray(response.data.result) && response.data.result.length > 0) {
      reviewsData = response.data.result;
      source = 'Hostaway API';
      console.log(`Successfully fetched ${reviewsData.length} reviews from ${source}.`);
    } 
    else if (response.data && response.data.status === "success" && Array.isArray(response.data.result)) {
      // 3. SUCCESS BUT EMPTY
      console.warn("Live API returned an empty array. Falling back to mock data.");
      source = 'mock (empty live response)';
      reviewsData = mockReviews.result;
    }







  console.error(`❌ Hostaway API request failed: ${error.message}. Falling back to mock data for demonstration.`);

      console.error(`Hostaway API request failed:`, error.message);
    console.log(`Falling back to mock data for demonstration.`);





















    ai help me comment on code




     modify the dashboard to move the filters to a sidebar and make the overview data and property performance data respond to the applied filters in real-time.