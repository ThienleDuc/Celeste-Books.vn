import React, { useEffect, useRef, useState, useCallback, memo, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { formatNumber } from "../../utils/formatNumber";
import productsApi, { type Product } from "../../api/produts.api";
import { formatDecimal } from "../../utils/formatDecimal";
import { getProductImageUrl, handleImageError } from '../../utils/imageHelper';

// --- INTERFACES ---
interface ProductCarouselProps {
  title?: string;
  visibleItems?: number;
  intervalTime?: number;
  showRank?: boolean;
  onViewUpdated?: (productId: number | string, newViews: number) => void;
}

interface CarouselItemProps {
  product: Product;
  rank?: number;
  isIncreasingView: boolean;
  onViewProduct: (product: Product, e: React.MouseEvent) => void;
}

// --- SUB-COMPONENT: CAROUSEL ITEM (Optimized) ---
const CarouselItem = memo(({ product, rank, isIncreasingView, onViewProduct }: CarouselItemProps) => {
  const originalPrice = product.original_price || 0;
  const salePrice = product.sale_price || 0;
  const hasDiscount = originalPrice > salePrice;
  
  const discountPercent = useMemo(() => {
    if (product.discount_percent) return product.discount_percent;
    if (hasDiscount && originalPrice > 0) {
      return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
    }
    return 0;
  }, [product.discount_percent, hasDiscount, originalPrice, salePrice]);

  // Lấy URL ảnh sản phẩm
  const productImage = useMemo(() => {
    return getProductImageUrl(product.image || product.primary_image || "");
  }, [product.image, product.primary_image]);

  return (
    <div
      className="card product-card col-10 col-sm-6 col-md-4 col-lg-3 flex-shrink-0 position-relative me-3"
    >
      <div className="card-img-wrapper position-relative">
        <img
          src={productImage}
          className="card-img-top"
          alt={product.name}
          loading="lazy"
          decoding="async"
          onError={handleImageError}
        />

        {hasDiscount && discountPercent > 0 && (
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
          <button className="action-btn" title="Thêm vào giỏ" aria-label="Thêm vào giỏ">
            <i className="bi bi-cart-plus"></i>
          </button>
          <button className="action-btn" title="Chat" aria-label="Chat">
            <i className="bi bi-chat-dots"></i>
          </button>
        </div>

        {rank !== undefined && (
          <div
            className="product-rank-badge position-absolute"
            style={{
              top: "0.5rem",
              left: (hasDiscount && discountPercent > 0) ? "3.5rem" : "0.5rem",
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
            #{rank}
          </div>
        )}
      </div>

      <div className="card-body d-flex flex-column flex-grow-1">
        <h5 className="card-title product-card-title text-ellipsis-1">{product.name}</h5>

        <div className="mb-2 d-flex align-items-center gap-2">
          {hasDiscount && originalPrice > 0 && (
            <span className="text-muted text-decoration-line-through small mb-0">
              {formatDecimal(originalPrice.toLocaleString())}₫
            </span>
          )}
          <span className="text-primary fw-bold">
            {formatDecimal(salePrice.toLocaleString())}₫
          </span>
        </div>

        <div className="d-flex justify-content-between align-items-center mt-auto">
          <div className="d-flex justify-content-between w-100">
            <span className="text-muted small product-sold">
              Đã bán: {formatNumber(product.purchase_count || 0)}
            </span>
            <div className="d-flex gap-3 justify-content-end">
              <span className="text-muted small">
                <i className="bi bi-star-fill text-warning me-1"></i>
                {formatDecimal(product.rating || 0)}
              </span>
              <span className="text-muted small">
                {isIncreasingView ? (
                  <span className="text-primary">
                    <i className="bi bi-arrow-up-short me-1"></i>
                    Wait...
                  </span>
                ) : (
                  <>
                    <i className="bi bi-eye me-1"></i>
                    {formatNumber(product.views || 0)}
                  </>
                )}
              </span>
            </div>
            <button
              onClick={(e) => onViewProduct(product, e)}
              className="view-product-link btn btn-sm btn-outline-primary flex-shrink-0"
              disabled={isIncreasingView}
            >
              {isIncreasingView ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                  Loading
                </>
              ) : (
                'Xem sản phẩm'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

// --- MAIN COMPONENT ---
const ProductCarousel = ({
  title = "Sản phẩm nổi bật",
  visibleItems = 4,
  intervalTime = 2500,
  showRank = false,
  onViewUpdated,
}: ProductCarouselProps) => {
  const navigate = useNavigate();
  const carouselRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [increasingViewIds, setIncreasingViewIds] = useState<Set<string | number>>(new Set());

  // Lấy dữ liệu từ API
  useEffect(() => {
    let isMounted = true;
    const fetchBestSellers = async () => {
      try {
        const res = await productsApi.getBestSellers(20);
        if (isMounted && res.data.status) {
          setProducts(res.data.data);
        }
      } catch (error) {
        console.error("Lỗi khi lấy sản phẩm bán chạy:", error);
      }
    };
    fetchBestSellers();
    return () => { isMounted = false; };
  }, []);

  // Hàm xử lý click xem sản phẩm
  const handleViewProduct = useCallback(async (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    
    const productId = product.id;
    const currentViews = product.views || 0;
    
    if (increasingViewIds.has(productId)) {
      navigate(`/san-pham/${product.slug || productId}`);
      return;
    }
    
    // Optimistic update
    setIncreasingViewIds(prev => new Set(prev).add(productId));
    const newViews = currentViews + 1;
    
    // Cập nhật state local ngay lập tức
    setProducts(prevProducts => 
      prevProducts.map(p => 
        p.id === productId ? { ...p, views: newViews } : p
      )
    );
    
    if (onViewUpdated) {
      onViewUpdated(productId, newViews);
    }
    
    // Chuyển hướng ngay
    navigate(`/san-pham/${product.slug || productId}`);
    
    // Gọi API background
    const sendViewRequest = async () => {
      try {
        await productsApi.incrementViews(productId);
      } catch (error) {
        console.error(`Lỗi khi tăng view: ${productId}`, error);
      } finally {
        // Cleanup state sau 1s
        setTimeout(() => {
          setIncreasingViewIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(productId);
            return newSet;
          });
        }, 1000);
      }
    };
    
    if ('requestIdleCallback' in window) {
      requestIdleCallback(sendViewRequest, { timeout: 5000 });
    } else {
      setTimeout(sendViewRequest, 100);
    }
  }, [increasingViewIds, navigate, onViewUpdated]);

  const scrollToIndex = useCallback((i: number) => {
    if (!carouselRef.current || products.length === 0) return;

    const totalScrollWidth = carouselRef.current.scrollWidth;
    const itemWidth = totalScrollWidth / products.length;

    carouselRef.current.scrollTo({
      left: i * itemWidth,
      behavior: "smooth",
    });
  }, [products.length]);

  const prev = useCallback(() => {
    setIndex((prevIndex) => {
      if (prevIndex <= 0) return prevIndex;
      const newIndex = prevIndex - 1;
      scrollToIndex(newIndex);
      return newIndex;
    });
  }, [scrollToIndex]);

  const next = useCallback(() => {
    const maxIndex = products.length - visibleItems;
    setIndex((prevIndex) => {
      if (prevIndex >= maxIndex) return prevIndex;
      const newIndex = prevIndex + 1;
      scrollToIndex(newIndex);
      return newIndex;
    });
  }, [products.length, visibleItems, scrollToIndex]);

  // Auto-play effect
  useEffect(() => {
    if (products.length <= visibleItems) return;

    const id = setInterval(() => {
      setIndex((prevIndex) => {
        const maxIndex = products.length - visibleItems;
        const nextIndex = (prevIndex + 1) > maxIndex ? 0 : prevIndex + 1;
        scrollToIndex(nextIndex);
        return nextIndex;
      });
    }, intervalTime);

    return () => clearInterval(id);
  }, [products.length, visibleItems, intervalTime, scrollToIndex]);

  const maxIndex = Math.max(0, products.length - visibleItems);

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
        aria-label="Previous slide"
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
        aria-label="Next slide"
      >
        &#8250;
      </button>

      <div className="carousel-wrapper d-flex overflow-auto" ref={carouselRef}>
        {products.map((product, i) => (
          <CarouselItem 
            key={product.id}
            product={product}
            rank={showRank ? i + 1 : undefined}
            isIncreasingView={increasingViewIds.has(product.id)}
            onViewProduct={handleViewProduct}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductCarousel;