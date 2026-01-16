
import axios from "axios";
import React, { useEffect, useState, useMemo, useRef } from "react";

// --- INTERFACES (Giữ nguyên) ---
interface User {
  id: string;
  username: string;
  email?: string;
  has_password?: boolean;
  role_id?: string;
  is_active?: boolean;
}

interface ReviewImage {
  id: number;
  review_id: number;
  image_url: string;
  created_at: string;
}

interface Review {
  id: number;
  order_item_id: number;
  user_id: string;
  rating: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  user?: User;
  images?: ReviewImage[];
}

interface ReviewProps {
  product_id: number;
}

const ReviewProductSection: React.FC<ReviewProps> = ({ product_id }) => {
  const [reviewed, setReviewed] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State cho phân trang
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;

  // ✅ 1. State & Ref để đồng bộ chiều cao
  const statsRef = useRef<HTMLDivElement>(null);
  const [listHeight, setListHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!product_id) {
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("access_token");
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
        if (response.data && response.data.data) {
          setReviewed(response.data.data);
        } else if (Array.isArray(response.data)) {
          setReviewed(response.data as any);
        } else {
          setReviewed([]);
        }
        setCurrentPage(1);
      })
      .catch((error) => {
        console.error("Lỗi API:", error);
        setError("Không thể tải đánh giá.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [product_id]);

  // ✅ 2. UseEffect để đo chiều cao cột trái sau khi render
  useEffect(() => {
    if (statsRef.current) {
      setListHeight(statsRef.current.offsetHeight);
    }
  }, [reviewed, loading]); // Cập nhật lại khi dữ liệu thay đổi

  // --- LOGIC TÍNH TOÁN ---
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

  // Logic cắt mảng dữ liệu
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentReviews = reviewed.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(reviewed.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Helper functions
  const formatDate = (dateString: string) => {
    if (!dateString) return "Chưa có ngày";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString.substring(0, 10);
      return date.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const getUsername = (review: Review) => {
    return review.user?.username || review.user_id || "Khách hàng";
  };

  if (loading)
    return <div className="text-center py-4">Đang tải đánh giá...</div>;
  if (error) return <div className="alert alert-warning">{error}</div>;
  if (reviewed.length === 0)
    return <p className="text-muted text-center py-4">Chưa có đánh giá nào.</p>;

  return (
    <div className="container mt-4">
      {/* ✅ CSS ẩn thanh cuộn (nhúng trực tiếp để đảm bảo chạy ngay) */}
      <style>
        {`
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .hide-scrollbar {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
          }
        `}
      </style>

      <div className="row">
        {/* Cột thống kê (Bên trái) */}
        <div className="col-md-4 mb-4">
          <div 
            ref={statsRef} // ✅ Gắn Ref để đo chiều cao
            className="p-3 border rounded bg-light sticky-top" 
            style={{ top: "20px", zIndex: 1 }}
          >
            <h5 className="mb-3">Đánh giá sản phẩm</h5>
            <div className="d-flex align-items-center mb-3">
              <span className="display-4 fw-bold me-2">{stats.average}</span>
              <div className="text-warning">
                {[...Array(5)].map((_, i) => (
                  <i
                    key={i}
                    className={`bi bi-star${
                      i < Math.round(Number(stats.average)) ? "-fill" : ""
                    } me-1`}
                  ></i>
                ))}
              </div>
            </div>
            <p className="text-muted">{stats.total} đánh giá</p>
            {stats.starCounts
              .map((count, index) => {
                const starIndex = 5 - index;
                const percentage =
                  stats.total > 0 ? ((count / stats.total) * 100).toFixed(0) : 0;
                return (
                  <div key={index} className="d-flex align-items-center mb-1">
                    <span className="me-2">{starIndex} sao</span>
                    <div
                      className="progress flex-grow-1"
                      style={{ height: "8px" }}
                    >
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
              })
              .reverse()}
          </div>
        </div>

        {/* Cột danh sách Review (Bên phải) */}
        <div className="col-md-8">
          
          {/* ✅ Wrapper cuộn dọc: Chiều cao bằng cột trái + Ẩn Scrollbar */}
          <div 
            className="user-reviews-scrollable hide-scrollbar"
            style={{ 
              height: listHeight ? `${listHeight}px` : "auto", // Đồng bộ chiều cao
              overflowY: "scroll",  // Vẫn cho phép cuộn
              paddingRight: "5px" 
            }}
          >
            {currentReviews.map((review) => (
              <div
                key={review.id}
                className="border p-3 mb-3 rounded bg-white shadow-sm"
              >
                <div className="d-flex align-items-center mb-2">
                  <img
                    src="https://cellphones.com.vn/sforum/wp-content/uploads/2023/10/avatar-trang-4.jpg"
                    alt="avatar"
                    className="rounded-circle me-2"
                    width={50}
                    height={50}
                    style={{ objectFit: "cover" }}
                  />
                  <div>
                    <strong className="d-block">{getUsername(review)}</strong>
                    <small className="text-muted">
                      {formatDate(review.created_at)}
                    </small>
                  </div>
                </div>

                <div className="mb-2">
                  {[...Array(5)].map((_, idx) => (
                    <i
                      key={idx}
                      className={`bi bi-star${
                        idx < review.rating ? "-fill" : ""
                      } text-warning me-1`}
                    ></i>
                  ))}
                  <span className="ms-2 fw-bold">{review.rating}/5</span>
                </div>

                {review.title && (
                  <h6 className="fw-bold mb-1">{review.title}</h6>
                )}
                <p className="mb-2">{review.content}</p>

                {review.images && review.images.length > 0 && (
                  <div className="d-flex gap-2 mt-2 flex-wrap">
                    {review.images.map((imgObj) => (
                      <img
                        key={imgObj.id}
                        src={imgObj.image_url}
                        alt={`review-img-${imgObj.id}`}
                        className="rounded border"
                        style={{
                          width: "80px",
                          height: "80px",
                          objectFit: "cover",
                          cursor: "pointer",
                        }}
                        onClick={() => window.open(imgObj.image_url, "_blank")}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Điều hướng phân trang (Pagination) */}
          {totalPages > 1 && (
            <nav className="mt-4 d-flex justify-content-center">
              <ul className="pagination">
                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                  <button 
                    className="page-link" 
                    onClick={() => paginate(currentPage - 1)}
                  >
                    Trước
                  </button>
                </li>
                
                {[...Array(totalPages)].map((_, i) => (
                  <li 
                    key={i + 1} 
                    className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
                  >
                    <button 
                      className="page-link" 
                      onClick={() => paginate(i + 1)}
                    >
                      {i + 1}
                    </button>
                  </li>
                ))}

                <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                  <button 
                    className="page-link" 
                    onClick={() => paginate(currentPage + 1)}
                  >
                    Sau
                  </button>
                </li>
              </ul>
            </nav>
          )}

        </div>
      </div>
    </div>
  );
};

export default ReviewProductSection;
