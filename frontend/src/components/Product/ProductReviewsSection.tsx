import React, { useMemo, useState, useEffect } from 'react';
import axios from 'axios';

// 1. Định nghĩa Interface cho dữ liệu Review (khớp với dữ liệu trả về từ API của bạn)
export interface UserReview {
  id: number;
  productId: number;
  name: string;       // Tên người review
  avatar: string;     // URL ảnh đại diện
  rating: number;     // Số sao
  title?: string;     // Tiêu đề (optional)
  content: string;    // Nội dung comment
  date: string;       // Ngày đánh giá
  images?: string[];  // Ảnh đính kèm (optional)
}

interface ReviewProductSectionProps {
  productId: number; 
}

// 2. Component con hiển thị danh sách từng review
const ReviewList: React.FC<{ reviews: UserReview[] }> = ({ reviews }) => {
  if (!reviews.length) return <p className="text-muted">Chưa có đánh giá nào.</p>;

  return (
    <div className="user-reviews mt-4">
      {reviews.map((review) => (
        <div key={review.id} className="border p-3 mb-3 rounded user-review">
          <div className="d-flex align-items-center mb-2">
            {/* Avatar người dùng */}
            <img
              src="https://tse3.mm.bing.net/th/id/OIP.3l3TG-7-DK9UXuah4MrSzgAAAA?w=300&h=300&rs=1&pid=ImgDetMain&o=7&rm=3"
              alt={review.name}
              className="rounded-circle me-2"
              width={50}
              height={50}
              style={{ objectFit: 'cover' }}
            />
            <div>
              {/* Tên người dùng */}
              <strong>{review.name}</strong>
              <div className="text-muted" style={{ fontSize: "0.8rem" }}>
                {/* Ngày đánh giá */}
                {review.date}
              </div>
            </div>
          </div>

          {/* Số sao của comment này */}
          <div className="mb-1">
            {Array(5).fill(0).map((_, idx) => (
              <i
                key={idx}
                className={`bi bi-star${idx < review.rating ? "-fill" : ""} text-warning me-1`}
              ></i>
            ))}
          </div>

          {/* Nội dung đánh giá */}
          {review.title && <h6 className="mb-1">{review.title}</h6>}
          <p className="mb-2">{review.content}</p>

          {/* Ảnh đánh giá (nếu có) */}
          {review.images && review.images.length > 0 && (
            <div className="d-flex gap-2 mt-2 flex-wrap">
              {review.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`review-img-${idx}`}
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

// 3. Component chính
const ProductReviewsSection: React.FC<ReviewProductSectionProps> = ({ productId }) => {
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch dữ liệu từ API
  useEffect(() => {
    if (!productId) return;
    
    const fetchReviews = async () => {
      try {
        setLoading(true);
        // Lưu ý: Đảm bảo URL API đúng với Backend của bạn
        const response = await axios.get(`http://localhost:8000/api/review/${productId}`);
        
        if (response.data && response.data.data) {
          // Map dữ liệu từ API sang chuẩn Interface của Frontend (nếu cần thiết)
          // Ví dụ dưới đây giả định API trả về đúng key, nếu khác bạn cần map lại
          setReviews(response.data.data);
        }
      } catch (error) {
        console.error("Lỗi lấy dữ liệu review:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [productId]);

  

  const renderStars = (rating: number, showDecimal: boolean = true) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
      <div className="d-flex align-items-center">
        {[...Array(fullStars)].map((_, i) => (
          <i key={`full-${i}`} className="bi bi-star-fill text-warning me-1"></i>
        ))}
        {halfStar && <i className="bi bi-star-half text-warning me-1"></i>}
        {[...Array(emptyStars)].map((_, i) => (
          <i key={`empty-${i}`} className="bi bi-star text-warning me-1"></i>
        ))}
        {showDecimal && <span className="ms-2 fw-bold">{rating.toFixed(1)}</span>}
      </div>
    );
  };

  // Tính toán thống kê sao
  const ratingData = useMemo(() => {
    const totalReviews = reviews.length;
    if (totalReviews === 0) return [5, 4, 3, 2, 1].map(stars => ({ stars, percent: 0 }));

    // Đếm số lượng từng loại sao (làm tròn)
    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => {
      const rounded = Math.round(r.rating);
      if (counts[rounded] !== undefined) counts[rounded]++;
    });

    return [5, 4, 3, 2, 1].map(stars => ({
      stars,
      percent: (counts[stars] / totalReviews) * 100
    }));
  }, [reviews]);

  // Tính rating trung bình
  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, r) => sum + Number(r.rating), 0);
    return total / reviews.length;
  }, [reviews]);

  if (loading) return <p>Đang tải đánh giá...</p>;

  return (
    <>
      <h5 className="title-section mb-3">Đánh giá sản phẩm</h5>
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row">
            {/* Cột Trái: Thống kê sao */}
            <div className="col-12 col-md-4 border-end">
              <div className="text-center mb-3">
                <div className="d-flex justify-content-center align-items-center mb-2">
                  {renderStars(averageRating)}
                </div>
                <p className="text-muted mb-0">{reviews.length} đánh giá</p>
              </div>

              {ratingData.map((r) => (
                <div key={r.stars} className="d-flex align-items-center gap-2 mb-2">
                  <span style={{ width: 100 }}>{renderStars(r.stars, false)}</span>
                  <div className="progress flex-grow-1" style={{ height: 8 }}>
                    <div
                      className="progress-bar bg-warning"
                      style={{ width: `${r.percent}%` }}
                    />
                  </div>
                  <span className="text-muted" style={{ minWidth: '40px' }}>
                    {Math.round(r.percent)}%
                  </span>
                </div>
              ))}
            </div>

            {/* Cột Phải: Danh sách Review chi tiết */}
            <div className="col-12 col-md-8 ps-md-4">
                {/* Truyền dữ liệu state vào component con */}
                <ReviewList reviews={reviews} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductReviewsSection;