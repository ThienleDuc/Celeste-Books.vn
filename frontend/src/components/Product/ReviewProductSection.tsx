import axios from "axios";
import React, { useEffect, useState } from "react";
interface User {
  id: string;
  username: string;
 
}
interface Review {
  id: number;
  avatar: string;
  
  user: User;
  username: string;
  created_at: string;
  productId: number;
  rating: number;
  title: string;
  content: string;
  images: string[];
}


interface ReviewProps {
  product_id: number; 
}

const ReviewProductSection: React.FC<ReviewProps> = ({ product_id }) => {
 
  const [reviewed, setReviewed] = useState<Review[]>([]); 
console.log("đay là id product");
console.log(product_id);
  
  useEffect(() => {
    if (!product_id) return; 
    const token = localStorage.getItem('access_token');

    axios.get<{ status: string; data: Review[] }>(        
        `http://localhost:8000/api/review/${product_id}`, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      )
      .then((response) => {
        console.log("lấy dữ liệu của review");
        
        if(response.data.data) {
            setReviewed(response.data.data);
        }
      })
      .catch((error) => {
        console.log("lỗi lấy dữ liệu review", error);
      });
  }, [product_id]); 

  
  if (reviewed.length === 0) return <p>Chưa có đánh giá nào.</p>;

  return (
    <div className="user-reviews mt-4">
      {reviewed.map((review) => (
        <div key={review.id} className="border p-3 mb-3 rounded user-review">
          <div className="d-flex align-items-center mb-2">
            <img
              src="https://cellphones.com.vn/sforum/wp-content/uploads/2023/10/avatar-trang-4.jpg"
              alt={review.username}
              className="rounded-circle me-2"
              width={50}
              height={50}
            />
            <div>
              <strong>{review.user.username}</strong>
              <div className="text-muted" style={{ fontSize: "0.8rem" }}>
                {review.created_at}
              </div>
            </div>
          </div>

          <div className="mb-1">
            {Array(5)
              .fill(0)
              .map((_, idx) => (
                <i
                  key={idx}
                  className={`bi bi-star${
                    idx < review.rating ? "-fill" : ""
                  } text-warning me-1`}
                ></i>
              ))}
          </div>

          <h6 className="mb-1">{review.title}</h6>
          <p>{review.content}</p>

          {review.images && review.images.length > 0 && (
            <div className="d-flex gap-2 mt-2">
              {review.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`review-${idx}`}
                  className="img-fluid"
                  style={{
                    width: "80px",
                    height: "80px",
                    objectFit: "cover",
                    borderRadius: "4px",
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