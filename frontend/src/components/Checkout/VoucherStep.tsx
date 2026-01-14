import React, { useState } from 'react';
import type { DiscountType, OrderProductDiscount, OrderShippingDiscount } from '../../models/Checkout/discount.model';

interface DiscountSelectorProps {
  productDiscounts: OrderProductDiscount[];
  shippingDiscounts: OrderShippingDiscount[];
  selectedProductDiscountId?: number;
  selectedShippingDiscountId?: number;
  onSelectProductDiscount: (discount: OrderProductDiscount | null) => void;
  onSelectShippingDiscount: (discount: OrderShippingDiscount | null) => void;
}

const DiscountSelector: React.FC<DiscountSelectorProps> = ({
  productDiscounts,
  shippingDiscounts,
  selectedProductDiscountId,
  selectedShippingDiscountId,
  onSelectProductDiscount,
  onSelectShippingDiscount
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempProductDiscountId, setTempProductDiscountId] = useState<number | undefined>(selectedProductDiscountId);
  const [tempShippingDiscountId, setTempShippingDiscountId] = useState<number | undefined>(selectedShippingDiscountId);


  const formatCurrency = (value: any) => {
    const amount = Math.round(Number(value || 0));
    return amount.toLocaleString('vi-VN');
  };

  const getDiscountTypeText = (type: DiscountType): string => {
    switch(type) {
      case 'promo_code': return 'Mã khuyến mãi';
      case 'member_discount': return 'Giảm giá thành viên';
      case 'voucher': return 'Voucher';
      default: return type;
    }
  };

  const getDiscountIcon = (type: DiscountType): string => {
    switch(type) {
      case 'promo_code': return 'bi-ticket-perforated';
      case 'member_discount': return 'bi-person-badge';
      case 'voucher': return 'bi-gift';
      default: return 'bi-percent';
    }
  };

  const handleOpenModal = () => {
    setTempProductDiscountId(selectedProductDiscountId);
    setTempShippingDiscountId(selectedShippingDiscountId);
    setIsModalOpen(true);
  };

  const handleConfirm = () => {
    const selectedProductDiscount = tempProductDiscountId 
      ? productDiscounts.find(d => d.id === tempProductDiscountId) || null
      : null;
    
    const selectedShippingDiscount = tempShippingDiscountId
      ? shippingDiscounts.find(d => d.id === tempShippingDiscountId) || null
      : null;

    onSelectProductDiscount(selectedProductDiscount);
    onSelectShippingDiscount(selectedShippingDiscount);
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setTempProductDiscountId(selectedProductDiscountId);
    setTempShippingDiscountId(selectedShippingDiscountId);
    setIsModalOpen(false);
  };

  const handleClearProductDiscount = () => {
    setTempProductDiscountId(undefined);
  };

  const handleClearShippingDiscount = () => {
    setTempShippingDiscountId(undefined);
  };

  const handleClearAll = () => {
    setTempProductDiscountId(undefined);
    setTempShippingDiscountId(undefined);
  };

  const getTotalDiscount = () => {
    let total = 0;
    if (tempProductDiscountId) {
      const discount = productDiscounts.find(d => d.id === tempProductDiscountId);
      total += discount?.amount || 0;
    }
    if (tempShippingDiscountId) {
      const discount = shippingDiscounts.find(d => d.id === tempShippingDiscountId);
      total += discount?.amount || 0;
    }
    return total;
  };

  const getCurrentTotalDiscount = () => {
    let total = 0;
    if (selectedProductDiscountId) {
      const discount = productDiscounts.find(d => d.id === selectedProductDiscountId);
      total += discount?.amount || 0;
    }
    if (selectedShippingDiscountId) {
      const discount = shippingDiscounts.find(d => d.id === selectedShippingDiscountId);
      total += discount?.amount || 0;
    }
    return total;
  };

  const hasSelectedDiscount = selectedProductDiscountId || selectedShippingDiscountId;
  const hasChanges = tempProductDiscountId !== selectedProductDiscountId || tempShippingDiscountId !== selectedShippingDiscountId;

  const selectedProductDiscount = selectedProductDiscountId 
    ? productDiscounts.find(d => d.id === selectedProductDiscountId)
    : null;
    
  const selectedShippingDiscount = selectedShippingDiscountId
    ? shippingDiscounts.find(d => d.id === selectedShippingDiscountId)
    : null;

  return (
    <div className="discount-selector-container">
      {/* Display Area */}
      <div className="discount-display-card">
        <div className="discount-display-header">
          <div className="discount-display-title">
            <i className="bi bi-tags discount-display-title-icon"></i>
            <span>Khuyến mãi & Voucher</span>
          </div>
          <button className="discount-select-btn" onClick={handleOpenModal}>
            <i className="bi bi-plus-circle"></i>
            Chọn voucher
          </button>
        </div>

        {hasSelectedDiscount ? (
          <div className="discount-selected-list">
            {selectedProductDiscount && (
              <div className="discount-selected-item">
                <div className="discount-selected-info">
                  <div className="discount-selected-type">
                    <i className={`bi ${getDiscountIcon(selectedProductDiscount.type)} discount-selected-icon`}></i>
                    {getDiscountTypeText(selectedProductDiscount.type)}
                  </div>
                  <div className="discount-selected-amount">
                  -{formatCurrency(selectedProductDiscount.amount)}₫
                  </div>
                </div>
                <button 
                  className="discount-remove-btn"
                  onClick={() => onSelectProductDiscount(null)}
                  aria-label="Xóa"
                >
                  <i className="bi bi-x"></i>
                </button>
              </div>
            )}
            
            {selectedShippingDiscount && (
              <div className="discount-selected-item">
                <div className="discount-selected-info">
                  <div className="discount-selected-type">
                    <i className={`bi ${getDiscountIcon(selectedShippingDiscount.type)} discount-selected-icon`}></i>
                    {getDiscountTypeText(selectedShippingDiscount.type)}
                  </div>
                  <div className="discount-selected-amount">
                  -{formatCurrency(selectedShippingDiscount.amount)}₫
                  </div>
                </div>
                <button 
                  className="discount-remove-btn"
                  onClick={() => onSelectShippingDiscount(null)}
                  aria-label="Xóa"
                >
                  <i className="bi bi-x"></i>
                </button>
              </div>
            )}

            <div className="discount-total-summary">
              <span>Tổng giảm giá:</span>
              <span className="discount-total-amount">
              -{formatCurrency(getCurrentTotalDiscount())}₫
              </span>
            </div>
          </div>
        ) : (
          <div className="discount-empty-state">
            <i className="bi bi-ticket discount-empty-icon"></i>
            <div className="discount-empty-text">Chưa áp dụng khuyến mãi nào</div>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="discount-modal-overlay" onClick={handleCancel}>
          <div className="discount-modal" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="discount-modal-header">
              <div className="discount-modal-title-wrapper">
                <i className="bi bi-gift discount-modal-title-icon"></i>
                <h3 className="discount-modal-title">Chọn voucher</h3>
              </div>
              <button 
                className="discount-modal-close-btn"
                onClick={handleCancel}
                aria-label="Đóng"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            {/* Modal Body */}
            <div className="discount-modal-body">
              {/* Product Discounts Section */}
              <div className="discount-section">
                <div className="discount-section-header">
                  <div className="discount-section-title">
                    <i className="bi bi-box-seam discount-section-icon"></i>
                    Voucher giảm giá sản phẩm
                  </div>
                  {tempProductDiscountId && (
                    <button 
                      className="discount-section-clear-btn"
                      onClick={handleClearProductDiscount}
                    >
                      <i className="bi bi-x-circle"></i>
                      Bỏ chọn
                    </button>
                  )}
                </div>
                <div className="discount-card-grid">
                  {productDiscounts.map(discount => {
                    const isSelected = discount.id === tempProductDiscountId;
                    
                    return (
                      <div
                        key={discount.id}
                        className={`discount-card ${isSelected ? 'discount-card-selected' : ''}`}
                        onClick={() => setTempProductDiscountId(isSelected ? undefined : discount.id)}
                      >
                        <div className="discount-card-content">
                          <div className="discount-card-header">
                            <i className={`bi ${getDiscountIcon(discount.type)} discount-card-icon`}></i>
                            <div className="discount-card-title">
                              {getDiscountTypeText(discount.type)}
                            </div>
                          </div>
                          <div className="discount-card-amount">
                          Giảm {formatCurrency(discount.amount)}₫
                          </div>
                          {isSelected && (
                            <div className="discount-card-selected-badge">
                              <i className="bi bi-check-circle-fill"></i>
                              Đã chọn
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Shipping Discounts Section */}
              <div className="discount-section">
                <div className="discount-section-header">
                  <div className="discount-section-title">
                    <i className="bi bi-truck discount-section-icon"></i>
                    Voucher giảm giá vận chuyển
                  </div>
                  {tempShippingDiscountId && (
                    <button 
                      className="discount-section-clear-btn"
                      onClick={handleClearShippingDiscount}
                    >
                      <i className="bi bi-x-circle"></i>
                      Bỏ chọn
                    </button>
                  )}
                </div>
                <div className="discount-card-grid">
                  {shippingDiscounts.map(discount => {
                    const isSelected = discount.id === tempShippingDiscountId;
                    
                    return (
                      <div
                        key={discount.id}
                        className={`discount-card ${isSelected ? 'discount-card-selected' : ''}`}
                        onClick={() => setTempShippingDiscountId(isSelected ? undefined : discount.id)}
                      >
                        <div className="discount-card-content">
                          <div className="discount-card-header">
                            <i className={`bi ${getDiscountIcon(discount.type)} discount-card-icon`}></i>
                            <div className="discount-card-title">
                              {getDiscountTypeText(discount.type)}
                            </div>
                          </div>
                          <div className="discount-card-amount">
                          Giảm {formatCurrency(discount.amount)}₫
                          </div>
                          {isSelected && (
                            <div className="discount-card-selected-badge">
                              <i className="bi bi-check-circle-fill"></i>
                              Đã chọn
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Total Discount Preview */}
              {(tempProductDiscountId || tempShippingDiscountId) && (
                <div className="discount-total-preview">
                  <div className="discount-total-preview-content">
                    <div className="discount-total-preview-label">
                      <i className="bi bi-tags"></i>
                      Tổng giảm giá:
                    </div>
                    <div className="discount-total-preview-value">
                      -{getTotalDiscount().toLocaleString('vi-VN')}₫
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="discount-modal-footer">
              <div className="discount-modal-footer-buttons">
                <div className="discount-modal-footer-left">
                  <button
                    className="discount-clear-all-btn"
                    onClick={handleClearAll}
                    disabled={!tempProductDiscountId && !tempShippingDiscountId}
                  >
                    <i className="bi bi-x-circle"></i>
                    Bỏ chọn tất cả
                  </button>
                </div>
                <div className="discount-modal-footer-right">
                  <button
                    className="discount-cancel-btn"
                    onClick={handleCancel}
                  >
                    Hủy
                  </button>
                  <button
                    className="discount-confirm-btn"
                    onClick={handleConfirm}
                    disabled={!hasChanges}
                  >
                    <i className="bi bi-check-lg"></i>
                    Áp dụng
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscountSelector;