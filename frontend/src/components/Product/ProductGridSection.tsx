import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import Pagination from "../Utils/Pagination";
import { formatNumber } from "../../utils/formatNumber";
import productsApi, { type ProductListParams, type Product } from "../../api/produts.api";
import { formatDecimal } from "../../utils/formatDecimal";
import { useNavigate } from "react-router-dom";

// --- INTERFACES ---
interface ProductGridSectionProps {
  itemsPerPage?: number;
  colMd?: number;
  hiddenPagination?: boolean;
  showRank?: boolean;
  sortParams?: ProductListParams;
  autoFetch?: boolean;
  externalProducts?: Product[];
  externalTotalItems?: number;
  externalCurrentPage?: number;
  onPageChangeExternal?: (page: number) => void;
  onViewUpdated?: (productId: number | string, newViews: number) => void;
}

// --- CONSTANTS & HELPERS ---
const DEFAULT_IMG = "book1.jpg";

const getProductImg = (productImg?: string | null) => {
  if (!productImg) return `/img/${DEFAULT_IMG}`;
  if (productImg.startsWith("http")) return productImg;
  return `/img/${productImg}`;
};

// --- SUB-COMPONENT: PRODUCT CARD (Optimized with memo) ---
interface ProductCardProps {
  product: Product;
  colMd: number;
  rank?: number;
  isIncreasingView: boolean;
  onViewProduct: (product: Product, e: React.MouseEvent) => void;
}

const ProductCard = memo(({ product, colMd, rank, isIncreasingView, onViewProduct }: ProductCardProps) => {
  const originalPrice = product.original_price || 0;
  const salePrice = product.sale_price || 0;
  const hasDiscount = originalPrice > salePrice;
  
  // Tính toán discount chỉ khi cần thiết
  const discountPercent = useMemo(() => {
    if (product.discount_percent) return product.discount_percent;
    if (hasDiscount && originalPrice > 0) {
      return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
    }
    return 0;
  }, [product.discount_percent, hasDiscount, originalPrice, salePrice]);

  const mainImage = product.image || product.primary_image || "";

  return (
    <div className={`col-12 col-sm-6 col-md-${colMd}`}>
      <div className="card product-card h-100 shadow-sm d-flex flex-column">
        <div className="card-img-wrapper position-relative">
          <img
            src={getProductImg(mainImage)}
            className="card-img-top"
            alt={product.name}
            loading="lazy" // Tối ưu: Lazy load
            decoding="async" // Tối ưu: Giải mã ảnh không chặn main thread
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

// --- MAIN COMPONENT ---
const ProductGridSection = ({
  itemsPerPage = 1,
  colMd = 3,
  hiddenPagination = false,
  showRank = false,
  sortParams,
  autoFetch = true,
  externalProducts,
  externalTotalItems,
  externalCurrentPage,
  onPageChangeExternal,
  onViewUpdated,
}: ProductGridSectionProps) => {
  const navigate = useNavigate();

  // Xác định mode hoạt động
  const isExternalMode = externalProducts !== undefined;

  // State quản lý nội bộ
  const [internalCurrentPage, setInternalCurrentPage] = useState(1);
  const [internalProducts, setInternalProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(!isExternalMode && autoFetch);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPerPage, setCurrentPerPage] = useState(itemsPerPage);
  const [increasingViewIds, setIncreasingViewIds] = useState<Set<string | number>>(new Set());

  // Xác định trang hiện tại và danh sách sản phẩm
  const currentPage = isExternalMode && externalCurrentPage ? externalCurrentPage : internalCurrentPage;
  const products = isExternalMode ? externalProducts : internalProducts;

  // -- HANDLERS (Sử dụng useCallback để tránh tạo lại function dư thừa) --

  const handlePageChange = useCallback((page: number) => {
    if (isExternalMode && onPageChangeExternal) {
      onPageChangeExternal(page);
    } else {
      setInternalCurrentPage(page);
      // Scroll to top nhẹ nhàng khi chuyển trang
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isExternalMode, onPageChangeExternal]);

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

    // Cập nhật state nội bộ hoặc gọi callback ngay lập tức
    if (isExternalMode && onViewUpdated) {
      onViewUpdated(productId, newViews);
    } else if (!isExternalMode) {
      setInternalProducts(prevProducts =>
        prevProducts.map(p =>
          p.id === productId ? { ...p, views: newViews } : p
        )
      );
    }

    // Navigate ngay lập tức
    navigate(`/san-pham/${product.slug || productId}`);

    // Background logic
    const incrementViewInBackground = async () => {
      try {
        const response = await productsApi.incrementViews(productId);
        if (response.data.status && response.data.data?.views !== undefined) {
          const serverViews = response.data.data.views;
          // Sync lại view chính xác từ server (nếu người dùng quay lại trang)
          if (isExternalMode && onViewUpdated) {
            onViewUpdated(productId, serverViews);
          } else if (!isExternalMode) {
            setInternalProducts(prev =>
              prev.map(p => p.id === productId ? { ...p, views: serverViews } : p)
            );
          }
        }
      } catch (error) {
        console.error(`Lỗi view id ${productId}`, error);
      } finally {
        // Cleanup set sau 1s để tránh leak memory nếu component unmount
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
      requestIdleCallback(incrementViewInBackground, { timeout: 5000 });
    } else {
      setTimeout(incrementViewInBackground, 100);
    }
  }, [increasingViewIds, isExternalMode, navigate, onViewUpdated]);

  // -- EFFECTS --

  // Fetch logic
  useEffect(() => {
    if (isExternalMode || !autoFetch) return;

    let isMounted = true;
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params: ProductListParams = {
          page: currentPage,
          per_page: itemsPerPage
        };
        const response = await productsApi.getList(params);
        
        if (isMounted && response.data.status) {
            const apiData = response.data.data;
            if (apiData && Array.isArray(apiData.data)) {
                setInternalProducts(apiData.data);
                setTotalItems(apiData.total || 0);
                setCurrentPerPage(apiData.per_page || itemsPerPage);
            } else if (Array.isArray(apiData)) {
                setInternalProducts(apiData);
                setTotalItems(apiData.length || 0);
                setCurrentPerPage(itemsPerPage);
            } else {
                setInternalProducts([]);
                setTotalItems(0);
            }
        }
      } catch (err) {
        if(isMounted) {
            console.error("Fetch error:", err);
            setInternalProducts([]);
            setTotalItems(0);
        }
      } finally {
        if(isMounted) setLoading(false);
      }
    };

    fetchProducts();

    return () => { isMounted = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, JSON.stringify(sortParams), autoFetch, isExternalMode, itemsPerPage]);

  // Reset page effect
  useEffect(() => {
    if (!isExternalMode) setInternalCurrentPage(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(sortParams), isExternalMode]);

  // Sync external props
  useEffect(() => {
    if (isExternalMode && externalTotalItems !== undefined) {
      setTotalItems(externalTotalItems);
    }
    if (isExternalMode) setLoading(false);
  }, [externalTotalItems, isExternalMode]);

  // -- RENDER --

  const startIndex = (currentPage - 1) * currentPerPage;

  if (loading && (!products || products.length === 0)) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2 text-muted">Đang tải sản phẩm...</p>
      </div>
    );
  }

  if (!loading && (!products || products.length === 0)) {
    return (
      <div className="text-center py-5">
        <i className="bi bi-box-seam display-4 text-muted"></i>
        <h5 className="mt-3">Không tìm thấy sản phẩm</h5>
        <p className="text-muted">Hãy thử tìm kiếm với bộ lọc khác</p>
      </div>
    );
  }

  return (
    <>
      <div className="row g-3 mb-4">
        {products?.map((product, index) => (
          <ProductCard
            key={`product-${product.id}`}
            product={product}
            colMd={colMd}
            rank={showRank ? startIndex + index + 1 : undefined}
            isIncreasingView={increasingViewIds.has(product.id)}
            onViewProduct={handleViewProduct}
          />
        ))}
      </div>

      {!hiddenPagination && totalItems > currentPerPage && (
        <Pagination
          currentPage={currentPage}
          totalItems={isExternalMode ? (externalTotalItems || totalItems) : totalItems}
          itemsPerPage={currentPerPage}
          onPageChange={handlePageChange}
        />
      )}
    </>
  );
};

// Sử dụng memo cho component chính để tránh re-render nếu props cha không đổi
export default memo(ProductGridSection);