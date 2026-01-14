import React, { useState, useEffect, useRef } from 'react'; // 1. Thêm useRef
import { FaStar, FaCamera, FaTimes } from 'react-icons/fa';

// Định nghĩa kiểu dữ liệu
interface ProductToReview {
  id: string | number;
  name: string;
  image: string;
  variant?: string;
}

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductToReview | null;
  onSubmit: (data: any) => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, product, onSubmit }) => {
  // --- STATE ---
  const [productRating, setProductRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  
  // 2. Thêm state quản lý file ảnh
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]); 
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref để kích hoạt input file

  const userId = localStorage.getItem('userId');

  // Reset form khi mở modal mới
  useEffect(() => {
    if (isOpen) {
      setProductRating(5);
      setComment('');
      setSelectedFiles([]); // Reset ảnh
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const getRatingText = (star: number) => {
    switch (star) {
      case 1: return 'Tệ';
      case 2: return 'Không hài lòng';
      case 3: return 'Bình thường';
      case 4: return 'Hài lòng';
      case 5: return 'Tuyệt vời';
      default: return 'Tuyệt vời';
    }
  };

  // 3. Hàm xử lý khi người dùng chọn ảnh
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
        // Chuyển FileList thành mảng và lưu vào state
        setSelectedFiles(Array.from(event.target.files));
    }
  };

  // 4. API tạo Review Image (SỬA LOGIC DÙNG FORMDATA)
  const handleInsertReviewImage = async (reviewId: any, imageFile: File) => {
    try {
      const formData = new FormData();
      // 'review_id' phải khớp với bảng trong DB
      formData.append('review_id', reviewId); 
      // 'image_url' là tên trường bạn dùng trong ReviewImage::create, nhưng gửi lên là File
      // Lưu ý: Bên Laravel Request hoặc Controller cần xử lý upload file này để lấy đường dẫn string
      formData.append('image_url', imageFile); 

      const response = await fetch(`http://localhost:8000/api/review-image`, {
        method: 'POST',
        // LƯU Ý QUAN TRỌNG: Không để Content-Type: application/json
        // Fetch tự động set Content-Type là multipart/form-data khi body là FormData
        body: formData, 
      });

      if (!response.ok) {
        throw new Error('Lỗi khi gửi ảnh');
      }

      const result = await response.json();
      console.log('Upload ảnh thành công:', result);
    } catch (error) {
      console.error('Lỗi upload ảnh:', error);
    }
  };

  // 5. API tạo Review chính
  const handleInsertReview = async (data: any) => {
    try {
      const response = await fetch(`http://localhost:8000/api/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Lỗi khi gửi đánh giá');
      }

      const result = await response.json();
      console.log('Tạo review thành công:', result);
      
      // LOGIC QUAN TRỌNG: Lấy ID của review vừa tạo để gắn ảnh vào
      // Giả sử Laravel trả về: { status: 'success', data: { id: 10, ... } }
      const newReviewId = result.data?.id || result.id; 

      if (newReviewId && selectedFiles.length > 0) {
         // Duyệt qua từng ảnh đã chọn và upload
         for (const file of selectedFiles) {
             await handleInsertReviewImage(newReviewId, file);
         }
      }

    } catch (error) {
      console.error('Error:', error);
    }
  };

  // 6. Hàm Submit Form
  const handleSubmit = async () => {
    const reviewData = {
      productId: product.id,
      productRating,
      comment,
      userId
    };

    // Gọi hàm tạo review -> bên trong hàm này sẽ tự gọi tiếp hàm tạo ảnh
    await handleInsertReview(reviewData);

    onSubmit(reviewData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-medium text-gray-800">Đánh Giá Sản Phẩm</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FaTimes />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Thông tin sản phẩm */}
          <div className="flex gap-4 items-start">
            <img 
              src={product.image || "https://via.placeholder.com/80"} 
              alt={product.name} 
              className="w-16 h-16 object-cover rounded border"
            />
            <div>
              <h3 className="font-medium text-gray-800 line-clamp-2">{product.name}</h3>
              {product.variant && <p className="text-sm text-gray-500 mt-1">Phân loại: {product.variant}</p>}
            </div>
          </div>

          {/* Đánh giá chất lượng */}
          <div className="flex items-center gap-4">
            <span className="font-medium text-gray-700">Chất lượng sản phẩm</span>
            <div className="flex items-center gap-1">
               {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={star}
                    className={`cursor-pointer text-2xl ${
                      star <= productRating ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                    onClick={() => setProductRating(star)}
                  />
                ))}
            </div>
            <span className="text-yellow-600 font-medium ml-2">{getRatingText(productRating)}</span>
          </div>

          {/* Form nhập liệu */}
          <div className="border border-gray-200 rounded-lg bg-gray-50 p-4">
            <textarea
              className="w-full bg-transparent border-none focus:ring-0 text-sm text-gray-700 placeholder-gray-400 resize-none min-h-[100px]"
              placeholder="Hãy chia sẻ những điều bạn thích về sản phẩm này với những người mua khác nhé."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            
            {/* Hiển thị tên file đã chọn (Optional UX) */}
            {selectedFiles.length > 0 && (
                <div className="mt-2 text-sm text-gray-500">
                    Đã chọn {selectedFiles.length} ảnh
                </div>
            )}

            <div className="flex gap-2 mt-4">
              {/* INPUT FILE ẨN */}
              <input 
                 type="file" 
                 accept="image/*" 
                 multiple 
                 hidden 
                 ref={fileInputRef}
                 onChange={handleFileChange}
              />
              
              {/* Nút bấm kích hoạt input file */}
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 border border-orange-500 text-orange-500 rounded text-sm hover:bg-orange-50 transition-colors"
              >
                <FaCamera /> Thêm Hình ảnh
              </button>
            </div>
          </div>

        </div>

        {/* Footer Buttons */}
        <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-white">
          <button 
            onClick={onClose}
            className="px-6 py-2 rounded text-gray-600 hover:bg-gray-100 transition-colors font-medium"
          >
            Đóng
          </button>
          <button 
            onClick={handleSubmit}
            className="px-6 py-2 rounded bg-orange-500 text-white hover:bg-orange-600 transition-colors shadow-sm font-medium"
          >
            HOÀN THÀNH
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;