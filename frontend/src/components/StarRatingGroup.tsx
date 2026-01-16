import React from 'react';
import { FaStar } from 'react-icons/fa';

interface StarRatingGroupProps {
  rating: number;
  setRating: (rating: number) => void; // Hàm set state từ cha
  label: string;
  showText?: boolean; // Tùy chọn hiển thị text (Tuyệt vời, Tệ...)
}

const StarRatingGroup: React.FC<StarRatingGroupProps> = ({ 
  rating, 
  setRating, 
  label, 
  showText = false 
}) => {

  // Hàm helper lấy text hiển thị (đặt trong này hoặc tách ra file utils riêng)
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

  return (
    <div className="flex items-center gap-4 mb-2">
      <span className="text-gray-600 text-sm min-w-[150px]">{label}</span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={`cursor-pointer text-xl transition-colors ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
            onClick={() => setRating(star)}
          />
        ))}
      </div>
      {showText && (
        <span className="text-yellow-600 text-sm font-medium ml-2">
          {getRatingText(rating)}
        </span>
      )}
    </div>
  );
};

export default StarRatingGroup;