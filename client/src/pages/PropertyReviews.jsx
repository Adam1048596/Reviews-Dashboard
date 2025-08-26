import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import styles from "./PropertyReviews.module.scss";

export default function PropertyReviews() {
  const { propertyId } = useParams();
  const [property, setProperty] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch property details and approved reviews
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // In a real app, you would fetch from your API
        // For demo purposes, we'll use mock data
        const mockProperty = {
          id: propertyId,
          title: "Luxury Downtown Apartment",
          location: {
            city: "Austin",
            state: "TX"
          },
          averageRating: 8.7,
          description: "Beautiful luxury apartment in the heart of downtown Austin. Walking distance to restaurants, bars, and entertainment. Features high-end finishes and stunning city views.",
          amenities: ["Wi-Fi", "Air Conditioning", "Kitchen", "Washer", "Dryer", "TV", "Pool", "Gym"],
          price: {
            perNight: 189
          },
          images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"]
        };
        
        setProperty(mockProperty);
        
        // Fetch approved reviews for this property
        // In a real app, you would fetch from your API: 
        // const reviewsResponse = await fetch(`/api/reviews/property/${propertyId}?approved=true&public=true`);
        
        // Mock reviews data for demonstration
        const mockReviews = [
          {
            id: "rev1",
            property: "Luxury Downtown Apartment",
            reviewer: "Sarah Johnson",
            ratingOverall: 9,
            text: "We had an amazing stay at this apartment. The location was perfect and the views were stunning. Would definitely recommend!",
            category: "Location",
            channel: "Airbnb",
            submittedAt: "2023-10-15T14:30:00Z",
            response: "Thank you for your kind words, Sarah! We're delighted you enjoyed your stay and hope to host you again soon."
          },
          {
            id: "rev2",
            property: "Luxury Downtown Apartment",
            reviewer: "Michael Chen",
            ratingOverall: 8,
            text: "Great apartment with all the amenities we needed. The pool and gym facilities were excellent.",
            category: "Amenities",
            channel: "Booking.com",
            submittedAt: "2023-09-22T09:15:00Z"
          },
          {
            id: "rev3",
            property: "Luxury Downtown Apartment",
            reviewer: "Jessica Williams",
            ratingOverall: 10,
            text: "Absolutely perfect in every way. The host was incredibly responsive and the apartment was even better than pictured.",
            category: "Host",
            channel: "Vrbo",
            submittedAt: "2023-11-05T16:45:00Z",
            response: "We're thrilled you had such a wonderful experience, Jessica! It was a pleasure hosting you."
          }
        ];
        
        setReviews(mockReviews);
        
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load property information.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [propertyId]);

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!property) return <div className={styles.error}>Property not found</div>;

  return (
    <div className={styles.propertyPage}>
      {/* Back to Dashboard Link */}
      <div className={styles.navContainer}>
        <Link to="/dashboard" className={styles.backLink}>
          &larr; Back to Dashboard
        </Link>
      </div>

      {/* Property Header Section */}
      <section className={styles.propertyHeader}>
        <div className={styles.propertyHero}>
          <img 
            src={property.images[0]} 
            alt={property.title}
            className={styles.propertyHeroImage}
          />
          <div className={styles.propertyOverlay}>
            <h1 className={styles.propertyTitle}>{property.title}</h1>
            <p className={styles.propertyLocation}>
              {property.location.city}, {property.location.state}
            </p>
            <div className={styles.propertyRating}>
              <span className={styles.ratingStars}>
                {"⭐".repeat(Math.round(property.averageRating || 0))}
              </span>
              <span className={styles.ratingValue}>
                {property.averageRating?.toFixed(1) || "No ratings yet"}
              </span>
              <span className={styles.reviewCount}>
                ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Property Details Section */}
      <section className={styles.propertyDetails}>
        <div className={styles.container}>
          <div className={styles.detailsGrid}>
            <div className={styles.mainDetails}>
              <h2>About this property</h2>
              <p className={styles.propertyDescription}>{property.description}</p>
              
              <div className={styles.amenitiesSection}>
                <h3>Amenities</h3>
                <div className={styles.amenitiesGrid}>
                  {property.amenities?.slice(0, 6).map((amenity, index) => (
                    <div key={index} className={styles.amenityItem}>
                      <span className={styles.amenityIcon}>✓</span>
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className={styles.bookingWidget}>
              <div className={styles.bookingCard}>
                <div className={styles.priceSection}>
                  <span className={styles.price}>${property.price?.perNight}</span>
                  <span className={styles.priceLabel}>per night</span>
                </div>
                <button className={styles.bookButton}>Check Availability</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className={styles.reviewsSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>Guest Reviews</h2>
            <div className={styles.ratingSummary}>
              <div className={styles.overallRating}>
                <span className={styles.ratingLarge}>{property.averageRating?.toFixed(1) || "0.0"}</span>
                <span className={styles.ratingMax}>/10</span>
              </div>
              <div className={styles.ratingDetails}>
                <div className={styles.ratingStarsLarge}>
                  {"⭐".repeat(Math.round(property.averageRating || 0))}
                </div>
                <p>Based on {reviews.length} reviews</p>
              </div>
            </div>
          </div>

          {reviews.length > 0 ? (
            <div className={styles.reviewsGrid}>
              {reviews.map((review) => (
                <div key={review.id} className={styles.reviewCard}>
                  <div className={styles.reviewHeader}>
                    <div className={styles.reviewerInfo}>
                      <div className={styles.reviewerAvatar}>
                        {review.reviewer.charAt(0).toUpperCase()}
                      </div>
                      <div className={styles.reviewerDetails}>
                        <h4 className={styles.reviewerName}>{review.reviewer}</h4>
                        <p className={styles.reviewDate}>
                          {new Date(review.submittedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className={styles.reviewRating}>
                      <span className={styles.reviewRatingStars}>
                        {"⭐".repeat(Math.round(review.ratingOverall))}
                      </span>
                      <span className={styles.reviewRatingValue}>
                        {review.ratingOverall}
                      </span>
                    </div>
                  </div>
                  
                  {review.category && (
                    <div className={styles.reviewCategory}>
                      <span className={styles.categoryTag}>{review.category}</span>
                    </div>
                  )}
                  
                  <div className={styles.reviewContent}>
                    <p className={styles.reviewText}>"{review.text}"</p>
                  </div>
                  
                  {review.response && (
                    <div className={styles.hostResponse}>
                      <h5>Host Response</h5>
                      <p>{review.response}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.noReviews}>
              <div className={styles.noReviewsIcon}>💬</div>
              <h3>No reviews yet</h3>
              <p>This property doesn't have any published reviews yet.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}