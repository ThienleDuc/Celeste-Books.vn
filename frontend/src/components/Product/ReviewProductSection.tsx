interface Review {
  id: number;
  user_id: string;
  rating: number;
  title: string;
  content: string;
  images: string[] | null;
  created_at: string;
}

const ReviewProductSection = ({ reviews }: { reviews: Review[] }) => {
  if (!reviews.length) {
    return <p className="text-muted">Chưa có đánh giá nào.</p>;
  }

  return (
    <div
      className="user-reviews mt-4 pe-2"
      style={{
        height: "250px",        // 👈 chiều cao tối đa (bạn chỉnh tùy)
        overflowY: "auto",         // 👈 bật scroll dọc
      }}
    >
      {reviews.map((review) => (
        <div key={review.id} className="border p-3 mb-3 rounded">
          {/* USER */}
          <div className="mb-2">
            <strong>User {review.user_id}</strong>
            <div className="text-muted" style={{ fontSize: "0.8rem" }}>
              {review.created_at}
            </div>
          </div>

          {/* STAR */}
          <div className="mb-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <i
                key={i}
                className={`bi bi-star${i < review.rating ? "-fill" : ""} text-warning me-1`}
              />
            ))}
          </div>

          {/* TITLE + CONTENT */}
          <h6 className="mb-1">{review.title}</h6>
          <p className="mb-0">{review.content}</p>

          {/* IMAGES */}
          {review.images && review.images.length > 0 && (
            <div className="d-flex gap-2 mt-2">
              {review.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt="review"
                  style={{
                    width: 80,
                    height: 80,
                    objectFit: "cover",
                    borderRadius: 4,
                  }}
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
