import { useState } from "react";

interface Props {
  images: any[];
  mainImage: string;
  setMainImage: (url: string) => void;
  visibleCount?: number;
}

const ThumbnailCarousel = ({
  images,
  mainImage,
  setMainImage,
  visibleCount = 4,
}: Props) => {
  const [start, setStart] = useState(0);

  const visibleImages = images.slice(start, start + visibleCount);

  return (
    <div className="d-flex align-items-center gap-2">
      <button
        className="btn btn-sm btn-light"
        disabled={start === 0}
        onClick={() => setStart((s) => Math.max(0, s - 1))}
      >
        ‹
      </button>

      {visibleImages.map((img: any) => (
        <img
          key={img.id}
          src={img.image_url}
          alt="thumb"
          onClick={() => setMainImage(img.image_url)}
          style={{
            width: 60,
            height: 60,
            objectFit: "cover",
            cursor: "pointer",
            border:
              mainImage === img.image_url
                ? "2px solid #0d6efd"
                : "1px solid #ddd",
            borderRadius: 4,
          }}
        />
      ))}

      <button
        className="btn btn-sm btn-light"
        disabled={start + visibleCount >= images.length}
        onClick={() =>
          setStart((s) => Math.min(images.length - visibleCount, s + 1))
        }
      >
        ›
      </button>
    </div>
  );
};

export default ThumbnailCarousel;
