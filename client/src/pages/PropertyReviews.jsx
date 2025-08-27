import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import styles from "./PropertyReviews.module.scss";
const API_BASE_URL = 'https://reviews-dashboard-server-production.up.railway.app/';

const PropertyReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("PropertyReviews: Component mounted, fetching reviews...");
    
    // Fetch reviews from API
    fetch(`${API_BASE_URL}/api/reviews/public`)
      .then((res) => {
        console.log("PropertyReviews: Response status:", res.status);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("PropertyReviews: API data received:", data);
        console.log("PropertyReviews: Reviews array:", data.reviews);
        console.log("PropertyReviews: Reviews length:", data.reviews?.length || 0);
        
        setReviews(data.reviews || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("PropertyReviews: Error fetching reviews:", err);
        setError(err.message);
        setLoading(false);
        
        // Set some test data for debugging
        console.log("PropertyReviews: Setting test data for debugging");
        setReviews([
          {
            id: 1,
            text: "Test review - API is not working, showing fallback data",
            reviewer: "Test User",
            property: "Test Property",
            ratingOverall: 8
          },
          {
            id: 2,
            text: "Another test review to check carousel functionality",
            reviewer: "John Doe",
            property: "Sample Company",
            ratingOverall: 9
          }
        ]);
      });
  }, []);

  // Debug log when reviews change
  useEffect(() => {
    console.log("PropertyReviews: Reviews state updated:", reviews);
    console.log("PropertyReviews: Loading state:", loading);
    console.log("PropertyReviews: Error state:", error);
  }, [reviews, loading, error]);

  // Convert 0-10 rating to 1-5 stars
  const convertRatingToStars = (rating) => {
    return Math.round((rating / 10) * 5);
  };

  // Custom arrow components
  const CustomPrevArrow = ({ onClick }) => (
    <button
      className={`${styles.customArrow} ${styles.prevArrow}`}
      onClick={onClick}
      aria-label="Previous review"
    >
      ←
    </button>
  );

  const CustomNextArrow = ({ onClick }) => (
    <button
      className={`${styles.customArrow} ${styles.nextArrow}`}
      onClick={onClick}
      aria-label="Next review"
    >
      →
    </button>
  );

  // Slider settings
  const settings = {
    dots: true,
    infinite: reviews.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: reviews.length > 1,
    autoplay: false, // Disable autoplay for debugging
    autoplaySpeed: 5000,
    adaptiveHeight: false, // Disable adaptive height for debugging
    pauseOnHover: true,
    prevArrow: <CustomPrevArrow />,
    nextArrow: <CustomNextArrow />,
    customPaging: (i) => (
      <div className={styles.customDot} aria-label={`Go to slide ${i + 1}`}></div>
    ),
    appendDots: (dots) => (
      <div>
        <ul className={styles.dotsContainer}>{dots}</ul>
      </div>
    ),
    responsive: [
      {
        breakpoint: 768,
        settings: {
          arrows: false,
          dots: true,
        }
      }
    ]
  };

  console.log("PropertyReviews: Rendering component. Loading:", loading, "Reviews count:", reviews.length);

  return (
    <div className={styles.reviewsSection}>
      <div className={styles.container}>
        <h2 className={styles.title}>What Our Clients Think</h2>
        <p className={styles.subtitle}>
          Hear from the companies we work with. Discover how our flexible corporate rental solutions help them simplify relocations, support staff, and secure reliable short- and long-term housing with ease.
        </p>


        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Loading reviews...</p>
          </div>
        ) : reviews.length > 0 ? (
          <div className={styles.sliderContainer}>
            <Slider {...settings}>
              {reviews.map((review, index) => {
                console.log(`PropertyReviews: Rendering review ${index}:`, review);
                return (
                  <div key={review.id || index} className={styles.slide}>
                    <div className={styles.reviewCard}>
                      <div className={styles.quoteIcon}>"</div>
                      
                      <div className={styles.profileImage}>
                        <img 
                          src={review.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.reviewer || 'User')}&background=ff9a44&color=fff&size=120`} 
                          alt={review.reviewer || 'User'}
                          className={styles.avatar}
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=User&background=ff9a44&color=fff&size=120`;
                          }}
                        />
                      </div>

                      <div className={styles.stars}>
                        {"★".repeat(convertRatingToStars(review.ratingOverall || 5))}
                      </div>
                      
                      <p className={styles.comment}>
                        {review.text || "Great service and excellent experience!"}
                      </p>

                      <div className={styles.reviewerInfo}>
                        <h4 className={styles.reviewer}>{review.reviewer || "Anonymous"}</h4>
                        <p className={styles.property}>{review.property || "Verified Customer"}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </Slider>
          </div>
        ) : (
          <div className={styles.noReviews}>
            <div className={styles.noReviewsIcon}>💬</div>
            <p>No reviews available yet.</p>
            <p style={{ color: 'red', fontSize: '12px' }}>
              Error: {error || 'API returned empty data'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyReviews;