import { useEffect, useRef, useState } from "react";
import { formatNumber } from "../../utils/formatNumber";
import type { TopRecommendedItem } from "../../models/Product/TopRecommendedItem.model";
import { productSoldMap } from "../../models/Order/order.model";

interface ProductCarouselProps {
  title?: string;
  products: TopRecommendedItem[];
  visibleItems?: number;
  intervalTime?: number;
  showRank?: boolean;
}

const ProductCarousel = ({
  title = "Sản phẩm nổi bật",
  products,
  visibleItems = 4,
  intervalTime = 3000,
  showRank = false,
}: ProductCarouselProps) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const scrollToIndex = (i: number) => {
    if (!carouselRef.current) return;

    const totalItems = products.length;
    const itemWidth = carouselRef.current.scrollWidth / totalItems;

    carouselRef.current.scrollTo({
      left: i * itemWidth,
      behavior: "smooth",
    });
  };

  const prev = () => {
    if (index <= 0) return;
    const newIndex = index - 1;
    setIndex(newIndex);
    scrollToIndex(newIndex);
  };

  const next = () => {
    const maxIndex = products.length - visibleItems;
    if (index >= maxIndex) return;
    const newIndex = index + 1;
    setIndex(newIndex);
    scrollToIndex(newIndex);
  };

  useEffect(() => {
    if (products.length <= visibleItems) return;

    const id = setInterval(() => {
      setIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % (products.length - visibleItems + 1);
        scrollToIndex(nextIndex);
        return nextIndex;
      });
    }, intervalTime);

    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products.length, visibleItems, intervalTime]);

  const maxIndex = products.length - visibleItems;

  return (
    <div className="product-carousel position-relative">
      {title && <h5 className="mb-3 title-section">{title}</h5>}

      {/* Prev */}
      <button
        className="carousel-btn carousel-btn-left"
        onClick={prev}
        style={{
          opacity: index <= 0 ? 0.5 : 1,
          pointerEvents: index <= 0 ? "none" : "auto",
        }}
      >
        &#8249;
      </button>

      {/* Next */}
      <button
        className="carousel-btn carousel-btn-right"
        onClick={next}
        style={{
          opacity: index >= maxIndex ? 0.5 : 1,
          pointerEvents: index >= maxIndex ? "none" : "auto",
        }}
      >
        &#8250;
      </button>

      <div className="carousel-wrapper d-flex overflow-auto" ref={carouselRef}>
        {products.map((product, i) => {
          const hasDiscount = product.originalPrice > product.salePrice;
          const discountPercent = hasDiscount
            ? Math.round(((product.originalPrice - product.salePrice) / product.originalPrice) * 100)
            : 0;

          return (
            <div
              key={product.id}
              className="card product-card col-10 col-sm-6 col-md-4 col-lg-3 flex-shrink-0 position-relative me-3"
            >
              <div className="card-img-wrapper position-relative">
                <img src={product.image} className="card-img-top" alt={product.name} />

                {hasDiscount && (
                  <span
                    className="discount-badge position-absolute"
                    style={{
                      top: "0.5rem",
                      left: "0.5rem",
                      backgroundColor: "#dc3545",
                      color: "#fff",
                      fontSize: ".7rem",
                      fontWeight: "bold",
                      padding: "0.25rem 0.5rem",
                      borderRadius: "4px",
                    }}
                  >
                    -{discountPercent}%
                  </span>
                )}

                <div
                  className="product-actions d-flex flex-column gap-2"
                  style={{
                    position: "absolute",
                    top: "50%",
                    right: "0.5rem",
                    transform: "translateY(-50%)",
                  }}
                >
                  <button className="action-btn" title="Thêm vào giỏ">
                    <i className="bi bi-cart-plus"></i>
                  </button>
                  <button className="action-btn" title="Chat">
                    <i className="bi bi-chat-dots"></i>
                  </button>
                </div>

                {showRank && (
                  <div
                    className="product-rank-badge position-absolute"
                    style={{
                      top: "0.5rem",
                      left: hasDiscount ? "3.5rem" : "0.5rem",
                      backgroundColor: "#0d6efd",
                      color: "#fff",
                      fontWeight: "bold",
                      fontSize: ".7rem",
                      padding: "0.25rem 0.5rem",
                      borderRadius: "4px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    #{i + 1}
                  </div>
                )}
              </div>

              <div className="card-body d-flex flex-column flex-grow-1">
                <h5 className="card-title product-card-title text-ellipsis-1">{product.name}</h5>

                <div className="mb-2 d-flex align-items-center gap-2">
                  {hasDiscount && (
                    <span className="text-muted text-decoration-line-through small mb-0">
                      {product.originalPrice.toLocaleString()}₫
                    </span>
                  )}
                  <span className="text-primary fw-bold">{product.salePrice.toLocaleString()}₫</span>
                </div>

                <div className="d-flex justify-content-between align-items-center mt-auto">
                  <span className="text-muted small product-sold">
                    Đã bán: {formatNumber(productSoldMap[product.id] ?? 0)}
                  </span>

                  <a
                    href={`/san-pham/${product.id}`}
                    className="view-product-link btn btn-sm btn-outline-primary"
                  >
                    Xem sản phẩm
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductCarousel;
