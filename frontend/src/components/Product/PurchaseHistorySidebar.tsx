// components/Product/PurchaseHistorySidebar.tsx
import React from 'react';
import { myPurchaseHistory } from '../../models/Product/purchaseHistory.model';

// Xóa interface props nếu không cần custom
const PurchaseHistorySidebar: React.FC = () => {
  const displayItems = myPurchaseHistory.slice(0, 5);

  const handleBuyAgain = (itemId: number) => {
    console.log("Buy again clicked:", itemId);
    // Thêm logic xử lý mua lại
  };

  const handleViewAll = () => {
    console.log("View all purchase history");
    // Navigate đến trang lịch sử mua
  };

  return (
    <div className="my-purchase-history sidebar-product p-3 border rounded shadow-sm">
      {/* Header */}
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

      {/* Danh sách */}
      <div className="d-flex flex-column gap-2">
        {displayItems.map((item) => (
          <div
            key={item.id}
            className="sidebar-item d-flex gap-2 align-items-start border rounded p-2"
          >
            <img
              src={item.image}
              alt={item.name}
              className="sidebar-img rounded"
            />
            <div className="flex-grow-1 overflow-hidden">
              <div className="sidebar-name small text-ellipsis-1">
                {item.name}
              </div>
              <div className="my-purchase-price small">
                {item.price.toLocaleString()}₫
              </div>
              <div className="my-purchase-date">
                Mua ngày {item.date}
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