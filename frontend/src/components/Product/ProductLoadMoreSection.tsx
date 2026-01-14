import React, { useState, useEffect, useCallback, useRef, memo, useMemo } from "react";
import { formatNumber } from "../../utils/formatNumber";
import productsApi, { type Product } from "../../api/produts.api";
import { formatDecimal } from "../../utils/formatDecimal";
import { useNavigate } from "react-router-dom";

/* Interface cho ProductLoadMoreSection */
export interface ProductLoadMoreProps {
  title?: string;
  fetchFunction: (params: { limit: number; offset: number }) => Promise<Product[]>;
  totalProducts?: number;
  itemsPerLoad?: number;
  showHeader?: boolean;
  showLoadMoreButton?: boolean;
  showEmptyMessage?: boolean;
  autoInitLoad?: boolean;
  colMd?: number;
  colLg?: number;
  onLoadStart?: () => void;
  onLoadComplete?: (products: Product[], hasMore: boolean) => void;
  onLoadError?: (error: Error) => void;
}

/* Helper function */
const DEFAULT_IMG = "book1.jpg";

const getProductImg = (productImg?: string | null) => {
  if (!productImg) return `/img/${DEFAULT_IMG}`;
  if (productImg.startsWith("http")) return productImg;
  return `/img/${productImg}`;
};

/* SUB-COMPONENT: ProductItem
  Tách ra để sử dụng React.memo -> Tránh re-render toàn bộ list khi state cha thay đổi 
*/
interface ProductItemProps {
  product: Product;
  colClass: string;
  isIncreasingView: boolean;
  onViewProduct: (product: Product, e: React.MouseEvent) => void;
}

const ProductItem = memo(({ product, colClass, isIncreasingView, onViewProduct }: ProductItemProps) => {
  const originalPrice = product.original_price || 0;
  const salePrice = product.sale_price || 0;
  const hasDiscount = originalPrice > salePrice;
  
  // Tính toán discount (Derived state)
  const discountPercent = useMemo(() => {
    if (product.discount_percent) return product.discount_percent;
    if (hasDiscount && originalPrice > 0) {
      return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
    }
    return 0;
  }, [product.discount_percent, hasDiscount, originalPrice, salePrice]);

  const mainImage = product.image || product.primary_image || "";

  return (
    <div className={colClass}>
      <div className="card product-card h-100 shadow-sm d-flex flex-column">
        <div className="card-img-wrapper position-relative">
          <img
            src={getProductImg(mainImage)}
            className="card-img-top"
            alt={product.name}
            loading="lazy" // Tối ưu: Lazy load
            decoding="async" // Tối ưu: Giải mã bất đồng bộ
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `/img/${DEFAULT_IMG}`;
            }}
          />

          {hasDiscount && discountPercent > 0 && (
            <span className="discount-badge position-absolute top-0 start-0 m-2 bg-danger text-white px-2 py-1 rounded small">
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
        </div>

        <div className="card-body d-flex flex-column flex-grow-1">
          <h5 className="card-title text-ellipsis-1">{product.name}</h5>

          <div className="mb-2 d-flex align-items-center gap-2">
            {hasDiscount && originalPrice > 0 && (
              <span className="text-muted text-decoration-line-through small">
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
                'Xem'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

/* MAIN COMPONENT */
const ProductLoadMoreSection = ({
  title = "Sản phẩm",
  fetchFunction,
  totalProducts,
  itemsPerLoad = 1,
  showHeader = true,
  showLoadMoreButton = true,
  showEmptyMessage = false,
  autoInitLoad = true,
  colMd = 2,
  colLg = 2,
  onLoadStart,
  onLoadComplete,
  onLoadError,
}: ProductLoadMoreProps) => {
  const navigate = useNavigate();
  
  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(autoInitLoad);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [increasingViewIds, setIncreasingViewIds] = useState<Set<string | number>>(new Set());
  
  // Refs
  const offsetRef = useRef(0);
  const isMounted = useRef(true);
  const hasInitialLoad = useRef(false);

  // Load products
  const loadProducts = useCallback(async (isLoadMore = false) => {
    if (!isMounted.current) return;
    
    const currentOffset = isLoadMore ? offsetRef.current : 0;
    
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      if (!isLoadMore) setProducts([]);
    }
    
    if (onLoadStart) onLoadStart();
    
    try {
      const result = await fetchFunction({
        limit: itemsPerLoad,
        offset: currentOffset,
      });
      
      if (isMounted.current) {
        if (result.length > 0) {
          if (isLoadMore) {
            // Tối ưu: Sử dụng functional update để tránh phụ thuộc state cũ
            setProducts(prev => [...prev, ...result]);
          } else {
            setProducts(result);
          }
          
          offsetRef.current = currentOffset + result.length;
          const stillHasMore = result.length === itemsPerLoad;
          setHasMore(stillHasMore);
          
          if (onLoadComplete) onLoadComplete(result, stillHasMore);
        } else {
          setHasMore(false);
          if (!isLoadMore) setProducts([]);
        }
        setError(null);
      }
    } catch (err) {
      if (isMounted.current) {
        console.error("Lỗi khi load sản phẩm:", err);
        const errorMsg = err instanceof Error ? err.message : "Đã xảy ra lỗi khi tải sản phẩm";
        setError(errorMsg);
        if (onLoadError && err instanceof Error) onLoadError(err);
        setHasMore(false);
      }
    } finally {
      if (isMounted.current) {
        if (isLoadMore) setLoadingMore(false);
        else setLoading(false);
      }
    }
  }, [fetchFunction, itemsPerLoad, onLoadStart, onLoadComplete, onLoadError]);

  // Handle load more
  const handleLoadMore = useCallback(() => {
    if (hasMore && !loadingMore && !loading) {
      loadProducts(true);
    }
  }, [hasMore, loadingMore, loading, loadProducts]);

  // Handle view product (Tối ưu với useCallback để pass xuống con)
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
    
    setProducts(prevProducts => 
      prevProducts.map(p => 
        p.id === productId ? { ...p, views: newViews } : p
      )
    );
    
    navigate(`/san-pham/${product.slug || productId}`);
    
    const incrementViewInBackground = async () => {
      try {
        const response = await productsApi.incrementViews(productId);
        if (isMounted.current && response.data.status && response.data.data?.views !== undefined) {
          const serverViews = response.data.data.views;
          setProducts(prevProducts => 
            prevProducts.map(p => 
              p.id === productId ? { ...p, views: serverViews } : p
            )
          );
        }
      } catch (error) {
        console.error(`Lỗi view id ${productId}`, error);
      } finally {
        if (isMounted.current) {
            // Delay clear set để tránh leak nếu unmount nhanh
            setTimeout(() => {
                setIncreasingViewIds(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(productId);
                    return newSet;
                });
            }, 1000);
        }
      }
    };
    
    if ('requestIdleCallback' in window) {
      requestIdleCallback(incrementViewInBackground, { timeout: 5000 });
    } else {
      setTimeout(incrementViewInBackground, 100);
    }
  }, [increasingViewIds, navigate]);

  // Lifecycle
  useEffect(() => {
    isMounted.current = true;
    if (autoInitLoad && !hasInitialLoad.current) {
      hasInitialLoad.current = true;
      loadProducts();
    }
    return () => { isMounted.current = false; };
  }, [autoInitLoad, loadProducts]);

  useEffect(() => {
    if (!isMounted.current) return;
    offsetRef.current = 0;
    hasInitialLoad.current = false;
    setProducts([]);
    setHasMore(true);
    setError(null);
    
    if (autoInitLoad) {
      hasInitialLoad.current = true;
      loadProducts();
    }
  }, [autoInitLoad, fetchFunction, loadProducts]);

  // Render Logic
  const colClass = `col-12 col-sm-6 col-md-${colMd} ${colLg ? `col-lg-${colLg}` : ''}`;

  if (loading && products.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
        <p className="mt-2 text-muted">Đang tải sản phẩm...</p>
      </div>
    );
  }

  if (error && !loading) {
    return (
      <div className="product-load-more-section">
        {showHeader && title && <h5 className="title-section mb-3">{title}</h5>}
        <div className="alert alert-danger text-center">
          {error}
          <button onClick={() => {
            offsetRef.current = 0;
            setProducts([]);
            setHasMore(true);
            setError(null);
            loadProducts();
          }} className="btn btn-link p-0 ms-2">
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!loading && products.length === 0) {
    if (!showEmptyMessage) return null;
    return (
      <div className="product-load-more-section">
        {showHeader && title && <h5 className="title-section mb-3">{title}</h5>}
        <div className="text-center py-5">
          <i className="bi bi-box-seam display-4 text-muted"></i>
          <h5 className="mt-3">Không tìm thấy sản phẩm</h5>
        </div>
      </div>
    );
  }

  return (
    <div className="product-load-more-section">
      {showHeader && (
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="title-section mb-0">{title}</h5>
          {totalProducts !== undefined && (
            <span className="text-muted small">
              {products.length}/{totalProducts} sản phẩm
            </span>
          )}
        </div>
      )}

      <div className="row g-3 mb-4">
        {products.map((product) => (
          <ProductItem
            key={product.id} // Tối ưu: Dùng ID làm key
            product={product}
            colClass={colClass}
            isIncreasingView={increasingViewIds.has(product.id)}
            onViewProduct={handleViewProduct}
          />
        ))}
      </div>

      {showLoadMoreButton && hasMore && (
        <div className="text-center mt-4">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="btn btn-outline-primary px-5"
          >
            {loadingMore ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Đang tải...
              </>
            ) : (
              'Xem thêm'
            )}
          </button>
          
          {products.length > 0 && (
            <p className="text-muted small mt-2">
              Đã hiển thị {products.length} sản phẩm
              {totalProducts !== undefined && ` / ${totalProducts} sản phẩm`}
            </p>
          )}
        </div>
      )}

      {!hasMore && products.length > 0 && showLoadMoreButton && (
        <div className="text-center mt-3">
          <p className="text-muted small">
            <i className="bi bi-check-circle me-1"></i>
            Đã hiển thị tất cả {products.length} sản phẩm
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductLoadMoreSection;