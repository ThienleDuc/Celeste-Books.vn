import axios from "axios";
import React, { useEffect, useState, useMemo } from "react";

// 1. Sửa interface khớp với API thực tế
interface User {
  id: string;
  username: string;
  email?: string;
  has_password?: boolean;
}

interface Review {
  id: number;
  order_item_id: number;
  user_id: string;
  rating: number;
  title: string;
  content: string;
  images: string[] | null;
  created_at: string;
  updated_at: string;
  user?: User; // Thay đổi: user là optional, vì API có thể không trả về
}

interface ReviewProps {
  product_id: number;
}

const ReviewProductSection: React.FC<ReviewProps> = ({ product_id }) => {
  const [reviewed, setReviewed] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Nếu không có product_id thì không làm gì cả (hoặc loading tắt luôn)
    if (!product_id) {
      setLoading(false); 
      return;
    }

    const token = localStorage.getItem("access_token");
    console.log("Bắt đầu gọi API review cho product:", product_id);
    
    // Đặt loading = true trước khi gọi API
    setLoading(true);

    axios
      .get<{ status: string; data: Review[] }>(
        `http://localhost:8000/api/review/${product_id}`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            Accept: "application/json",
          },
        }
      )
      .then((response) => {
        // ... (giữ nguyên logic xử lý data của bạn) ...
        if (response.data && response.data.data) {
          setReviewed(response.data.data);
        } else if (Array.isArray(response.data)) {
          setReviewed(response.data);
        } else {
          setReviewed([]);
        }
      })
      .catch((error) => {
        console.error("Lỗi API:", error);
        setError("Không thể tải đánh giá.");
      })
      .finally(() => {
        // Luôn tắt loading khi xong việc
        setLoading(false);
      });
  }, [product_id]);

  // Logic tính toán thống kê
  const stats = useMemo(() => {
    const totalReviews = reviewed.length;
    if (totalReviews === 0)
      return { average: 0, starCounts: [0, 0, 0, 0, 0], total: 0 };
    
    const sumRating = reviewed.reduce((acc, curr) => acc + curr.rating, 0);
    const average = (sumRating / totalReviews).toFixed(1);
    const starCounts = [0, 0, 0, 0, 0];
    
    reviewed.forEach((r) => {
      if (r.rating >= 1 && r.rating <= 5) starCounts[r.rating - 1]++;
    });
    
    return { average, starCounts, total: totalReviews };
  }, [reviewed]);

  // Hàm xử lý ngày tháng an toàn
  const formatDate = (dateString: string) => {
    if (!dateString) return "Chưa có ngày";
    try {
      // Thử nhiều định dạng date
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        // Nếu không parse được, thử replace space với T
        const safeDate = dateString.replace(" ", "T");
        const newDate = new Date(safeDate);
        if (!isNaN(newDate.getTime())) {
          return newDate.toLocaleDateString("vi-VN");
        }
        return dateString; // Trả về nguyên gốc nếu không parse được
      }
      return date.toLocaleDateString("vi-VN", {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error("Lỗi format date:", dateString, error);
      return dateString.substring(0, 10); // Lấy phần YYYY-MM-DD
    }
  };

  // Hàm lấy tên người dùng an toàn
  const getUsername = (review: Review) => {
    if (review.user && review.user.username) {
      return review.user.username;
    }
    // Nếu không có user object, dùng user_id
    return review.user_id || "Khách hàng";
  };

  if (loading) {
    return <div className="text-center py-4">Đang tải đánh giá...</div>;
  }

  if (error) {
    return <div className="alert alert-warning">{error}</div>;
  }

  if (reviewed.length === 0) {
    return <p className="text-muted text-center py-4">Chưa có đánh giá nào.</p>;
  }

  return (
    <div className="container mt-4">
      <div className="row">
        {/* Cột thống kê */}
        <div className="col-md-4 mb-4">
          <div className="p-3 border rounded bg-light">
            <h5 className="mb-3">Đánh giá sản phẩm</h5>
            <div className="d-flex align-items-center mb-3">
              <span className="display-4 fw-bold me-2">{stats.average}</span>
              <div className="text-warning">
                {[...Array(5)].map((_, i) => (
                  <i 
                    key={i} 
                    className={`bi bi-star${i < Math.round(Number(stats.average)) ? "-fill" : ""} me-1`}
                  ></i>
                ))}
              </div>
            </div>
            <p className="text-muted">{stats.total} đánh giá</p>
            
            {/* Hiển thị phân bố sao */}
            {stats.starCounts.map((count, index) => {
              const starIndex = 5 - index; // 5, 4, 3, 2, 1 sao
              const percentage = stats.total > 0 ? (count / stats.total * 100).toFixed(0) : 0;
              
              return (
                <div key={index} className="d-flex align-items-center mb-1">
                  <span className="me-2">{starIndex} sao</span>
                  <div className="progress flex-grow-1" style={{ height: "8px" }}>
                    <div 
                      className="progress-bar bg-warning" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="ms-2" style={{ minWidth: "30px" }}>
                    {percentage}%
                  </span>
                </div>
              );
            }).reverse()} {/* Hiển thị từ 5 sao xuống 1 sao */}
          </div>
        </div>

        {/* Cột danh sách Review */}
        <div className="col-md-8">
          <div className="user-reviews">
            {reviewed.map((review) => (
              <div key={review.id} className="border p-3 mb-3 rounded bg-white">

                <div className="d-flex align-items-center mb-2">
                  <img
                    src="https://cellphones.com.vn/sforum/wp-content/uploads/2023/10/avatar-trang-4.jpg"
                    alt="avatar"
                    className="rounded-circle me-2"
                    width={50}
                    height={50}
                    style={{objectFit: 'cover'}}
                  />
                    <strong className="d-block">
                      {getUsername(review)}
                    </strong>
                    {/* Sửa hiển thị ngày */}

                    <small className="text-muted">

                      {formatDate(review.created_at)}

                    </small>
                </div> 

                
                { <div className="mb-2">
                  {[...Array(5)].map((_, idx) => (
                    <i 
                      key={idx} 
                      className={`bi bi-star${idx < review.rating ? "-fill" : ""} text-warning me-1`}
                    ></i>
                  ))}
                  <span className="ms-2 fw-bold">{review.rating}/5</span>
                </div> }

                
                {review.title && (
                  <h6 className="fw-bold mb-1">{review.title}</h6>
                )}
                <p className="mb-2">{review.content}</p>

                {/* Hình ảnh đính kèm */}
                {review.images && review.images.length > 0 && (
                  <div className="d-flex gap-2 mt-2">
                    {review.images.map((img, idx) => (
                      <img 
                        key={idx} 
                        src={img} 
                        alt={`review-${idx}`} 
                        className="rounded" 
                        style={{ 
                          width: "80px", 
                          height: "80px", 
                          objectFit: "cover",
                          cursor: "pointer"
                        }}
                        onClick={() => window.open(img, '_blank')}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewProductSection;