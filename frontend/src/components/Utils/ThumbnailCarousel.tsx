import { useState, useRef, useEffect } from "react";

interface Props {
  images: { id: number; imageUrl: string }[];
  mainImage: string;
  setMainImage: (url: string) => void;
  visibleCount?: number; // số ảnh hiển thị cùng lúc
}

const ThumbnailCarousel = ({ images, mainImage, setMainImage, visibleCount = 4 }: Props) => {
  const [startIndex, setStartIndex] = useState(0);
  const [showButtons, setShowButtons] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const totalWidth = images.length * 60 + (images.length - 1) * 8; // 60px ảnh + 8px gap
      setShowButtons(totalWidth > containerWidth);
    }
  }, [images]);

  const handlePrev = () => setStartIndex((prev) => Math.max(prev - 1, 0));
  const handleNext = () =>
    setStartIndex((prev) => Math.min(prev + 1, images.length - visibleCount));

  const visibleImages = images.slice(startIndex, startIndex + visibleCount);

  return (
    <div className="thumbnail-carousel position-relative d-flex align-items-center overflow-hidden" ref={containerRef}>
      {showButtons && (
        <button
          className="thumb-btn prev-btn"
          onClick={handlePrev}
          disabled={startIndex === 0}
        >
          &laquo;
        </button>
      )}

      <div className="thumbnails d-flex gap-2 flex-grow-1 mx-4">
        {visibleImages.map((img) => (
          <img
            key={img.id}
            src={img.imageUrl}
            alt="thumb"
            className={`thumb-img ${mainImage === img.imageUrl ? "border-primary" : ""}`}
            onClick={() => setMainImage(img.imageUrl)}
          />
        ))}
      </div>

      {showButtons && (
        <button
          className="thumb-btn next-btn"
          onClick={handleNext}
          disabled={startIndex + visibleCount >= images.length}
        >
          &raquo;
        </button>
      )}
    </div>
  );
};

export default ThumbnailCarousel;
