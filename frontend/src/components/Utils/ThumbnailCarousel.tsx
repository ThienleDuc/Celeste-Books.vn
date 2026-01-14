import { useState, useEffect } from "react";

interface ProductImage {
  id: number;
  image_url: string;
}

interface Props {
  images: ProductImage[];
  mainImage: string;
  setMainImage: (url: string) => void;
  activeId: number | null;        // ID ảnh đang hiển thị
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

  return (
    <div className="d-flex align-items-center justify-content-center gap-2 mt-2">
      {/* Prev Button */}
      <button
        type="button"
        className="btn btn-sm btn-light border"
        disabled={start === 0}
        onClick={() => setStart((s) => Math.max(0, s - 1))}
        style={{ width: '30px', height: '100%' }}
      >
        ‹
      </button>

      {/* Thumbnails */}
      <div className="d-flex gap-2 overflow-hidden">
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
        className="btn btn-sm btn-light border"
        disabled={start + visibleCount >= images.length}
        onClick={() => setStart((s) => Math.min(images.length - visibleCount, s + 1))}
        style={{ width: '30px', height: '100%' }}
      >
        ›
      </button>
    </div>
  );
};

export default ThumbnailCarousel;