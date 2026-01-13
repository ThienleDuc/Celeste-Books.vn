import React, { useMemo } from 'react';
import type { UserReview } from "../../models/Order/userReviews.model";
import { sampleProducts } from "../../models/Product/product.model";
import { sampleUserReviews } from "../../models/Order/userReviews.model";
import { useParams } from "react-router-dom";

// Component con hiển thị danh sách reviews
const ReviewList: React.FC<{ reviews: UserReview[] }> = ({ reviews }) => {
  if (!reviews.length) return <p className="text-muted">Chưa có đánh giá nào.</p>;

  return (
    <div className="user-reviews mt-4">
      {reviews.map((review) => (
        <div key={review.id} className="border p-3 mb-3 rounded user-review">
          <div className="d-flex align-items-center mb-2">
            <img
              src={review.avatar}
              alt={review.name}
              className="rounded-circle me-2"
              width={50}
              height={50}
            />
            <div>
              <strong>{review.name}</strong>
              <div className="text-muted" style={{ fontSize: "0.8rem" }}>
                {review.date} - {sampleProducts.find(p => p.product.id === review.productId)?.product.name}
              </div>
            </div>
          </div>

          <div className="mb-1">
            {Array(5).fill(0).map((_, idx) => (
              <i
                key={idx}
                className={`bi bi-star${idx < review.rating ? "-fill" : ""} text-warning me-1`}
              ></i>
            ))}
          </div>

          <h6 className="mb-1">{review.title}</h6>
          <p className="mb-2">{review.content}</p>

          {review.images && review.images.length > 0 && (
            <div className="d-flex gap-2 mt-2 flex-wrap">
              {review.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`review-${idx}`}
                  className="img-fluid"
                  style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "4px" }}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const ProductReviewsSection: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);

  // Lọc reviews theo productId
  const userReviews: UserReview[] = useMemo(() => {
    return sampleUserReviews.filter(
      (r) => r.productId === productId
    );
  }, [productId]);

  // Hàm tính percent dựa trên khoảng rating
  const calculatePercentByRatingRange = (rating: number): number => {
    if (rating <= 0) return 0;
    if (rating >= 5) return 100;
    
    const ranges = [
      { min: 0, max: 0.5, percent: 0 },
      { min: 0.5, max: 1, percent: 10 },
      { min: 1, max: 1.5, percent: 20 },
      { min: 1.5, max: 2, percent: 30 },
      { min: 2, max: 2.5, percent: 40 },
      { min: 2.5, max: 3, percent: 50 },
      { min: 3, max: 3.5, percent: 60 },
      { min: 3.5, max: 4, percent: 70 },
      { min: 4, max: 4.5, percent: 80 },
      { min: 4.5, max: 5, percent: 90 }
    ];
    
    const range = ranges.find(r => rating >= r.min && rating < r.max);
    return range ? range.percent : 100;
  };

  // Hàm hiển thị sao với nửa sao
  const renderStars = (rating: number, showDecimal: boolean = true) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
      <div className="d-flex align-items-center">
        {[...Array(fullStars)].map((_, i) => (
          <i key={`full-${i}`} className="bi bi-star-fill text-warning me-1"></i>
        ))}
        {halfStar && (
          <i className="bi bi-star-half text-warning me-1"></i>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <i key={`empty-${i}`} className="bi bi-star text-warning me-1"></i>
        ))}
        {showDecimal && (
          <span className="ms-2 fw-bold">{rating.toFixed(1)}</span>
        )}
      </div>
    );
  };

  // Tạo ratingData từ reviews
  const ratingData = useMemo(() => {
    const ratings = userReviews.map(review => review.rating);
    
    // Nhóm ratings theo số sao
    const starCategories: Record<string, number> = {
      '5': 0, '4.5': 0, '4': 0, '3.5': 0, '3': 0, '2.5': 0, '2': 0, '1.5': 0, '1': 0, '0.5': 0
    };
    
    ratings.forEach(rating => {
      const roundedRating = Math.round(rating * 2) / 2;
      const key = roundedRating.toString();
      if (starCategories[key] !== undefined) {
        starCategories[key]++;
      }
    });
    
    // Gom nhóm thành 5, 4, 3, 2, 1 sao cho thanh progress
    const starCounts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    const starSum: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    
    Object.entries(starCategories).forEach(([key, count]) => {
      const starValue = parseFloat(key);
      const starGroup = Math.round(starValue);
      if (starGroup >= 1 && starGroup <= 5) {
        starCounts[starGroup] += count;
        starSum[starGroup] += starValue * count;
      }
    });
    
    // Tính percent cho mỗi số sao
    return [5, 4, 3, 2, 1].map(stars => {
      const count = starCounts[stars];
      if (count === 0) {
        return { stars, percent: 0 };
      }
      
      const avgRatingForStar = starSum[stars] / count;
      const percent = calculatePercentByRatingRange(avgRatingForStar);
      
      return { stars, percent };
    });
  }, [userReviews]);

  // Tính rating trung bình
  const averageRating = useMemo(() => {
    if (userReviews.length === 0) return 0;
    const total = userReviews.reduce((sum, review) => sum + review.rating, 0);
    return total / userReviews.length;
  }, [userReviews]);

  return (
    <>
      <h5 className="title-section mb-3">Đánh giá sản phẩm</h5>
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-12 col-md-4 border-end">
              <div className="text-center mb-3">
                <div className="d-flex justify-content-center align-items-center mb-2">
                  {renderStars(averageRating)}
                </div>
                <p className="text-muted mb-0">
                  {userReviews.length} đánh giá
                </p>
              </div>

              {ratingData.map((r) => (
                <div
                  key={r.stars}
                  className="d-flex align-items-center gap-2 mb-2"
                >
                  <span style={{ width: 100 }}>
                    {renderStars(r.stars, false)}
                  </span>
                  <div className="progress flex-grow-1" style={{ height: 8 }}>
                    <div
                      className="progress-bar bg-warning"
                      style={{ width: `${r.percent}%` }}
                    />
                  </div>
                  <span className="text-muted" style={{ minWidth: '40px' }}>
                    {r.percent}%
                  </span>
                </div>
              ))}
            </div>

            <div className="col-12 col-md-8 ps-md-4">
              <ReviewList reviews={userReviews} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductReviewsSection;