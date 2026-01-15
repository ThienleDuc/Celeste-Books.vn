import { useState, useEffect } from "react";

interface ProductImage {
  id: number;
  image_url: string;
}

interface Props {
  images: ProductImage[];
  mainImage: string;
  setMainImage: (url: string) => void;
  activeId: number | null;
  setActiveId: (id: number) => void;
  visibleCount?: number;
}

const ThumbnailCarousel = ({
  images = [],
  setMainImage,
  activeId,
  setActiveId,
  visibleCount = 4,
}: Props) => {
  const [start, setStart] = useState(0);

  useEffect(() => {
    setStart(0);
  }, [images]);

  if (!images || images.length === 0) return null;

  const visibleImages = images.slice(start, start + visibleCount);

  const handleImageClick = (img: ProductImage) => {
    setMainImage(img.image_url);
    setActiveId(img.id);
  };

  // Style chung cho nút
  const buttonStyle = {
    width: '34px',
    height: '34px',
    minWidth: '34px',
    cursor: 'pointer',
    zIndex: 10,
    borderColor: '#ced4da'
  };

  return (
    <div className="d-flex align-items-center justify-content-center gap-0 mt-3">
      
      {/* Prev Button */}
      <button
        type="button"
        className="btn btn-white bg-white border rounded-circle shadow-sm d-flex align-items-center justify-content-center p-0"
        disabled={start === 0}
        onClick={() => setStart((s) => Math.max(0, s - 1))}
        style={{
          ...buttonStyle,
          opacity: start === 0 ? 0.5 : 1,
          pointerEvents: start === 0 ? 'none' : 'auto',
          marginRight: '-10px'
        }}
      >
        {/* Icon Left: Thêm overflow: 'visible' để không bị mất nét */}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="10" 
          height="10" 
          fill="#000000" 
          stroke="#000000" 
          strokeWidth="1.5" 
          viewBox="0 0 16 16"
          style={{ overflow: 'visible' }} 
        >
          <path transform="translate(-1.5, 0)" fillRule="evenodd" d="M8.354 1.646a.5.5 0 0 1 0 .708L2.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
          <path transform="translate(1.5, 0)" fillRule="evenodd" d="M12.354 1.646a.5.5 0 0 1 0 .708L6.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
        </svg>
      </button>

      {/* Thumbnails Container */}
      <div className="d-flex overflow-hidden px-2" style={{ gap: '6px' }}>
        {visibleImages.map((img) => (
          <div
            key={img.id}
            onClick={() => handleImageClick(img)}
            style={{
              cursor: "pointer",
              border: activeId === img.id ? "2px solid #0d6efd" : "1px solid #dee2e6",
              borderRadius: "4px",
              padding: "2px",
              transition: "all 0.2s"
            }}
          >
            <img
              src={img.image_url}
              alt="thumb"
              style={{
                width: "60px",
                height: "60px",
                objectFit: "cover",
display: "block",
                borderRadius: "2px"
              }}
              onError={(e) => {
                e.currentTarget.src = "/img/no-image.png";
              }}
            />
          </div>
        ))}
      </div>

      {/* Next Button */}
      <button
        type="button"
        className="btn btn-white bg-white border rounded-circle shadow-sm d-flex align-items-center justify-content-center p-0"
        disabled={start + visibleCount >= images.length}
        onClick={() => setStart((s) => Math.min(images.length - visibleCount, s + 1))}
        style={{
          ...buttonStyle,
          opacity: start + visibleCount >= images.length ? 0.5 : 1,
          pointerEvents: start + visibleCount >= images.length ? 'none' : 'auto',
          marginLeft: '-10px'
        }}
      >
        {/* Icon Right: Thêm overflow: 'visible' để không bị mất nét */}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="10" 
          height="10" 
          fill="#000000" 
          stroke="#000000" 
          strokeWidth="1.5" 
          viewBox="0 0 16 16"
          style={{ overflow: 'visible' }}
        >
          <path transform="translate(-1.5, 0)" fillRule="evenodd" d="M3.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L9.293 8 3.646 2.354a.5.5 0 0 1 0-.708z"/>
          <path transform="translate(1.5, 0)" fillRule="evenodd" d="M7.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L13.293 8 7.646 2.354a.5.5 0 0 1 0-.708z"/>
        </svg>
      </button>
    </div>
  );
};

export default ThumbnailCarousel;
