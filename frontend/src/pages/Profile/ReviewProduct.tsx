import React, { useState, useEffect, useRef } from 'react';
import { FaStar, FaCamera, FaTimes } from 'react-icons/fa';
import axios from 'axios';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: number;
  orderItemId: number;
  onSubmit: (data: any) => void;
}

interface User {
  id: number;
  name?: string; // Có thể thêm các trường khác nếu cần
}

const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, productId,orderItemId, onSubmit }) => {
  // --- STATE ---
  const [productRating, setProductRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]); 
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State data
  const [detailedProduct, setDetailedProduct] = useState<any>(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);
  const [userLogged, setUserLogged] = useState<User | null>(null);

  // --- 1. LẤY USER TỪ TOKEN KHI MỞ MODAL ---
  useEffect(() => {
    if (isOpen) {
      const token = localStorage.getItem('access_token'); 

      if (token) {
        axios.get<User>('http://localhost:8000/api/user', {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          }
        })
        .then(response => {
          console.log("User loaded:", response.data);
          setUserLogged(response.data);
        })
        .catch(error => {
          console.error("Lỗi token:", error);
          // Nếu token lỗi, có thể cân nhắc logout user
          // localStorage.removeItem('access_token');
        });
      }
    }
  }, [isOpen]);

  // --- 2. FETCH SẢN PHẨM ---
  useEffect(() => {
    if (isOpen && productId) {
      // Reset form
      setProductRating(5);
      setComment('');
      setSelectedFiles([]);
      setDetailedProduct(null);
      
      fetchProductDetails(productId);
    }
  }, [isOpen, productId]);

  const fetchProductDetails = async (id: number) => {
    setIsLoadingProduct(true);
    try {
      const response = await fetch(`http://localhost:8000/api/products/${id}`);
      const result = await response.json();
      if (result.status && result.data) {
          setDetailedProduct(result.data);
      }
    } catch (error) {
      console.error("Lỗi tải sản phẩm:", error);
    } finally {
      setIsLoadingProduct(false);
    }
  };

  // --- HELPER FUNCTIONS ---
  const getRatingText = (star: number) => {
    const texts = ['Tệ', 'Không hài lòng', 'Bình thường', 'Hài lòng', 'Tuyệt vời'];
    return texts[star - 1] || 'Tuyệt vời';
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
       setSelectedFiles(Array.from(event.target.files));
    }
  };

  const handleInsertReviewImage = async (reviewId: any, imageFile: File) => {
    try {
      const formData = new FormData();
      formData.append('review_id', reviewId); 
      formData.append('image_url', imageFile); 
      

      // API upload ảnh thường cũng cần Token, bạn nên thêm vào nếu backend yêu cầu
      await fetch(`http://localhost:8000/api/review-image`, {
        method: 'POST',
        body: formData, 
      });
    } catch (error) {
      console.error('Lỗi upload ảnh:', error);
    }
  };

  // --- 3. SUBMIT (ĐÃ SỬA) ---
  const handleSubmit = async () => {
    const token = localStorage.getItem('access_token');

    // Kiểm tra kỹ cả userLogged và token
    if (!userLogged || !token) {
        alert("Vui lòng đăng nhập để đánh giá.");
        return;
    }

    const reviewData = {
      product_id: productId,
      rating: productRating, 
      title: comment,
      content: comment,
      user_id: userLogged.id,
      order_item_id: orderItemId
    };

    try {
      const response = await fetch(`http://localhost:8000/api/review`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json',     // <--- QUAN TRỌNG: Để Laravel trả về JSON lỗi thay vì Redirect
            'Authorization': `Bearer ${token}` // <--- QUAN TRỌNG: Gửi kèm token xác thực
        },
        body: JSON.stringify(reviewData),
      });

      if (!response.ok) {
          // Log lỗi chi tiết từ server nếu có
          const errorData = await response.json();
          console.error("Server Error:", errorData);
          throw new Error(errorData.message || 'Lỗi gửi đánh giá');
      }

      const result = await response.json();
      
      // Upload ảnh
      const newReviewId = result.data?.id || result.id; 
      if (newReviewId && selectedFiles.length > 0) {
         for (const file of selectedFiles) {
             await handleInsertReviewImage(newReviewId, file);
         }
      }

      onSubmit(reviewData);
      onClose();

    } catch (error) {
      console.error('Error submit review:', error);
      alert("Có lỗi xảy ra, vui lòng thử lại.");
    }
  };

  if (!isOpen) return null;

  const displayImage = detailedProduct?.url_image || detailedProduct?.image || "https://placehold.co/150";
  const displayName = detailedProduct?.name || "Đang tải thông tin...";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in" style={{zIndex: 1300}}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-medium text-gray-800">Đánh Giá Sản Phẩm</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex gap-4 items-start">
            {isLoadingProduct ? (
                 <div className="text-gray-500">Đang tải sản phẩm...</div>
            ) : (
                <>
                    <img 
                      src={displayImage} 
                      alt={displayName} 
                      className="w-16 h-16 object-cover rounded border"
                      onError={(e) => {e.currentTarget.src = "https://placehold.co/150"}}
                    />
                    <div>
                      <h3 className="font-medium text-gray-800 line-clamp-2">{displayName}</h3>
                      {detailedProduct?.author && <p className="text-sm text-gray-500 mt-1">Tác giả: {detailedProduct.author}</p>}
                    </div>
                </>
            )}
          </div>

          <div className="flex items-center gap-4">
            <span className="font-medium text-gray-700">Chất lượng sản phẩm</span>
            <div className="flex items-center gap-1">
               {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={star}
                    className={`cursor-pointer text-2xl ${star <= productRating ? 'text-yellow-400' : 'text-gray-300'}`}
                    onClick={() => setProductRating(star)}
                  />
               ))}
            </div>
            <span className="text-yellow-600 font-medium ml-2">{getRatingText(productRating)}</span>
          </div>

          <div className="border border-gray-200 rounded-lg bg-gray-50 p-4">
            <textarea
              className="w-full bg-transparent border-none focus:ring-0 text-sm text-gray-700 placeholder-gray-400 resize-none min-h-[100px] outline-none"
              placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            {selectedFiles.length > 0 && (
                <div className="mt-2 text-sm text-gray-500">Đã chọn {selectedFiles.length} ảnh</div>
            )}
            <div className="flex gap-2 mt-4">
              <input type="file" accept="image/*" multiple hidden ref={fileInputRef} onChange={handleFileChange} />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 border border-orange-500 text-orange-500 rounded text-sm hover:bg-orange-50 transition-colors"
              >
                <FaCamera /> Thêm Hình ảnh
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-white">
          <button onClick={onClose} className="px-6 py-2 rounded text-gray-600 hover:bg-gray-100 transition-colors font-medium">Đóng</button>
          <button 
            onClick={handleSubmit} 
            disabled={isLoadingProduct || !userLogged}
            className={`px-6 py-2 rounded text-white font-medium shadow-sm transition-colors ${isLoadingProduct || !userLogged ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'}`}
          >
            HOÀN THÀNH
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;