import React from "react";
import type { UserReview } from "../../models/Order/userReviews.model";
import { sampleProducts } from "../../models/Product/product.model";

interface ReviewProductSectionProps {
  reviews: UserReview[];
}

const ReviewProductSection: React.FC<ReviewProductSectionProps> = ({ reviews }) => {
  if (!reviews.length) return <p>Chưa có đánh giá nào.</p>;

  return (
    <div className="user-reviews mt-4">
      {reviews.map(review => (
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
          <p>{review.content}</p>

          {review.images.length > 0 && (
            <div className="d-flex gap-2 mt-2">
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

export default ReviewProductSection;
