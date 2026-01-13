// components/Product/TopSellingSidebar.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import productsApi, { type Product } from '../../api/produts.api';
import { formatNumber } from '../../utils/formatNumber';
import { formatDecimal } from '../../utils/formatDecimal';

type TimeFilter = "day" | "week" | "month";

const TopSellingSidebar: React.FC = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<TimeFilter>("day");
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [clickedProductIds, setClickedProductIds] = useState<Set<string | number>>(new Set());

  // Fetch data từ API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await productsApi.sort({
          page: 1,
          per_page: 5,
          ranking: filter,
          sort_by: 'purchase_count',
          sort_order: 'desc'
        });
        
        if (response.data.status && response.data.data) {
          setItems(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching top selling products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filter]);

  // Hàm xử lý click sản phẩm
  const handleProductClick = async (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const productId = product.id;
    
    // Nếu đang xử lý click này rồi thì bỏ qua
    if (clickedProductIds.has(productId)) {
      return;
    }
    
    // Đánh dấu đang xử lý
    setClickedProductIds(prev => new Set(prev).add(productId));
    
    // Optimistic update view count
    const currentViews = product.views || 0;
    const newViews = currentViews + 1;
    
    setItems(prevItems => 
      prevItems.map(p => 
        p.id === productId ? { ...p, views: newViews } : p
      )
    );
    
    // Chuyển hướng ngay lập tức
    navigate(`/san-pham/${product.slug || productId}`);
    
    // Gọi API tăng view trong background
    const incrementViewInBackground = async () => {
      try {
        await productsApi.incrementViews(productId);
        console.log(`Đã tăng view cho sản phẩm ${productId}`);
      } catch (error) {
        console.error(`Lỗi tăng view cho ${productId}:`, error);
      } finally {
        // Xóa khỏi danh sách đang xử lý sau 1s
        setTimeout(() => {
          setClickedProductIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(productId);
            return newSet;
          });
        }, 1000);
      }
    };
    
    // Gọi API khi browser rảnh
    if ('requestIdleCallback' in window) {
      const requestIdleCallback = window.requestIdleCallback;
      requestIdleCallback(incrementViewInBackground, { timeout: 5000 });
    } else {
      setTimeout(incrementViewInBackground, 100);
    }
  };

  const handleFilterChange = (newFilter: TimeFilter) => {
    setFilter(newFilter);
  };

  const handleViewMore = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(`/tim-sach?ranking=${filter}`);
  };

  const filterLabels: Record<TimeFilter, string> = {
    day: "Ngày",
    week: "Tuần", 
    month: "Tháng"
  };

  return (
    <div className="top-selling-sidebar sidebar-product p-3 border rounded shadow-sm">
      {/* Filter - CSS KHÔNG THAY ĐỔI */}
      <div className="mb-3 d-flex gap-2">
        {(["day", "week", "month"] as TimeFilter[]).map((f) => (
          <a
            key={f}
            href="#"
            className={`flex-fill text-center py-1 text-decoration-none filter-btn ${
              filter === f ? "active" : ""
            }`}
            onClick={(e) => {
              e.preventDefault();
              handleFilterChange(f);
            }}
          >
            {filterLabels[f]}
          </a>
        ))}
      </div>

      {/* Loading - CSS KHÔNG THAY ĐỔI */}
      {loading ? (
        <div className="text-center py-3">
          <div className="spinner-border spinner-border-sm text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Products list từ API - CSS KHÔNG THAY ĐỔI */}
          <div className="d-flex flex-column gap-2 mb-3">
            {items.map((item, index) => {
              const isProcessing = clickedProductIds.has(item.id);
              
              return (
                <div
                  key={index}
                  className="sidebar-item d-flex align-items-center gap-2 border rounded p-2 shadow-sm position-relative"
                >
                  <img
                    src={item.image || item.primary_image || '/img/book1.jpg'}
                    alt={item.name}
                    className="sidebar-img rounded"
                  />
                  <div className="flex-grow-1 d-flex flex-column">
                    <div className="sidebar-name text-ellipsis-1">
                      {item.name}
                      {isProcessing && (
                        <span className="ms-1">
                          <span className="spinner-border spinner-border-sm text-primary" role="status">
                            <span className="visually-hidden">Đang chuyển...</span>
                          </span>
                        </span>
                      )}
                    </div>
                    <div className="d-flex gap-3 small text-muted mt-1 top-selling-stats">
                      <span>
                        <i className="bi bi-eye"></i> 
                        {isProcessing ? (
                          <span className="text-primary">
                            <i className="bi bi-arrow-up-short ms-1"></i>
                          </span>
                        ) : (
                          ` ${formatNumber(item.views) || 0}`
                        )}
                      </span>
                      <span><i className="bi bi-cart"></i> {formatNumber(item.purchase_count) || 0}</span>
                      <span><i className="bi bi-star-fill"></i> {formatDecimal(item.rating) || 0}</span>
                    </div>
                  </div>

                  {/* Button bao trọn toàn bộ sidebar-item */}
                  <button 
                    onClick={(e) => handleProductClick(item, e)}
                    disabled={isProcessing}
                    className="p-0 border-0 position-absolute top-0 start-0 w-100 h-100 bg-transparent"
                    style={{
                      zIndex: '1',
                      cursor: isProcessing ? 'wait' : 'pointer'
                    }}
                    aria-label={`Xem chi tiết sản phẩm: ${item.name}`}
                  />
                </div>
              );
            })}
          </div>

          {/* Xem thêm - CSS KHÔNG THAY ĐỔI */}
          <div className="text-center">
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={handleViewMore}
            >
              Xem thêm
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default TopSellingSidebar;