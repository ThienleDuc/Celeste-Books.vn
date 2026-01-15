// components/Product/PurchaseHistorySidebar.tsx
import React, { useState, useEffect } from 'react';
import { historyApi, type PurchasedProduct } from '../../api/listHistory.api';
import authApi from '../../api/auth.api';

const PurchaseHistorySidebar: React.FC = () => {
  const [purchasedProducts, setPurchasedProducts] = useState<PurchasedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPurchasedProducts = async () => {
      try {
        setLoading(true);
        
        // Lấy user ID từ nhiều nguồn
        let userId = 
          localStorage.getItem('user_id') || // Từ login đã lưu
          (() => {
            try {
              const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
              return userInfo.id || null;
            } catch {
              return null;
            }
          })();
        
        // Nếu vẫn không có, gọi API me()
        if (!userId) {
          try {
            const meRes = await authApi.me();
            if (meRes.data.success && meRes.data.data) {
              userId = meRes.data.data.id;
              localStorage.setItem('user_id', userId); // Lưu cho lần sau
            }
          } catch (err) {
            console.error('Không thể lấy user ID:', err);
          }
        }
        
        if (!userId) {
          setError('Vui lòng đăng nhập để xem lịch sử mua');
          setLoading(false);
          return;
        }
        
        const response = await historyApi.getPurchasedProducts(userId);
        
        if (response.data.success) {
          setPurchasedProducts(response.data.data || []);
        } else {
          setError(response.data.message || 'Có lỗi xảy ra');
        }
      } catch (err: any) {
        setError(err.message || 'Lỗi khi tải lịch sử mua hàng');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchPurchasedProducts();
  }, []);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    } catch {
      return dateString;
    }
  };

  const displayItems = purchasedProducts.slice(0, 5);

  const handleBuyAgain = (itemId: number) => {
    console.log("Buy again clicked:", itemId);
  };

  const handleViewAll = () => {
    console.log("View all purchase history");
  };

  if (loading) {
    return (
      <div className="my-purchase-history sidebar-product p-3 border rounded shadow-sm">
        <h6 className="fw-bold mb-0">
          <i className="bi bi-bag-check me-1"></i>
          Lịch sử mua
        </h6>
        <div className="d-flex justify-content-center mt-3">
          <div className="spinner-border spinner-border-sm" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-purchase-history sidebar-product p-3 border rounded shadow-sm">
        <h6 className="fw-bold mb-0">
          <i className="bi bi-bag-check me-1"></i>
          Lịch sử mua
        </h6>
        <div className="text-danger small mt-2">{error}</div>
      </div>
    );
  }

  if (purchasedProducts.length === 0) {
    return (
      <div className="my-purchase-history sidebar-product p-3 border rounded shadow-sm">
        <h6 className="fw-bold mb-0">
          <i className="bi bi-bag-check me-1"></i>
          Lịch sử mua
        </h6>
        <div className="text-muted small mt-2">Chưa có sản phẩm nào được mua</div>
      </div>
    );
  }

  return (
    <div className="my-purchase-history sidebar-product p-3 border rounded shadow-sm">
      <div className="d-flex justify-content-between gap-1 align-items-center mb-3">
        <h6 className="fw-bold mb-0 text-ellipsis-1">
          <i className="bi bi-bag-check me-1"></i>
          Lịch sử mua
        </h6>
        <a
          href="#"
          className="btn btn-link btn-sm p-0 fs-20 text-secondary"
          onClick={(e) => {
            e.preventDefault();
            handleViewAll();
          }}
        >
          Xem tất cả
        </a>
      </div>

      <div className="d-flex flex-column gap-2">
        {displayItems.map((item) => (
          <div
            key={item.id}
            className="sidebar-item d-flex gap-2 align-items-start border rounded p-2"
          >
            <img
              src={item.image || '/placeholder-image.jpg'}
              alt={item.name}
              className="sidebar-img rounded"
              style={{ width: '60px', height: '60px', objectFit: 'cover' }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
              }}
            />
            <div className="flex-grow-1 overflow-hidden">
              <div className="sidebar-name small text-ellipsis-1">
                {item.name}
              </div>
              <div className="my-purchase-price small fw-bold">
                {item.price.toLocaleString()}₫
              </div>
              <div className="my-purchase-date small text-muted">
                Mua {formatDate(item.last_purchased)}
              </div>
            </div>
            <div className="d-flex align-items-center align-self-stretch">
              <button
                type="button"
                className="btn btn-outline-primary btn-sm buy-again-btn"
                onClick={() => handleBuyAgain(item.id)}
              >
                Mua lại
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PurchaseHistorySidebar;