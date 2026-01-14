// ./Checkout/ShippingStep.tsx
import React, { useState } from 'react';
import { 
  type ShippingType, 
  sampleShippingTypeFees,
  sampleWeightFees,
  sampleDistanceFees 
} from '../../models/Checkout/discount.model';

interface ShippingStepProps {
  selectedShippingType: ShippingType;
  onSelect: (type: ShippingType) => void;
  totalWeight: number; // kg
  distance: number; // km
  baseFee: number; // phí cơ sở
}

const ShippingStep: React.FC<ShippingStepProps> = ({
  selectedShippingType,
  onSelect,
  totalWeight,
  distance,
  baseFee = 20000
}) => {
  // State cho việc mở popup chọn phương thức vận chuyển
  const [showShippingPopup, setShowShippingPopup] = useState(false);
  const [tempSelectedShippingType, setTempSelectedShippingType] = useState<ShippingType>(selectedShippingType);

  // Tính phí dựa trên trọng lượng
  const calculateWeightFee = (weight: number): number => {
    const weightFee = sampleWeightFees.find(
      fee => weight >= fee.min_weight && weight < fee.max_weight
    );
    return weightFee ? weightFee.multiplier : 1;
  };

  // Tính phí dựa trên khoảng cách
  const calculateDistanceFee = (distance: number): number => {
    const distanceFee = sampleDistanceFees.find(
      fee => distance >= fee.min_distance && distance < fee.max_distance
    );
    return distanceFee ? distanceFee.multiplier : 1;
  };

  // Tính phí vận chuyển
  const calculateShippingFee = (type: ShippingType): number => {
    const typeFee = sampleShippingTypeFees.find(fee => fee.shipping_type === type);
    const weightMultiplier = calculateWeightFee(totalWeight);
    const distanceMultiplier = calculateDistanceFee(distance);
    const typeMultiplier = typeFee?.multiplier || 1;
    
    return Math.round(baseFee * weightMultiplier * distanceMultiplier * typeMultiplier);
};

  const getShippingTypeName = (type: ShippingType): string => {
    switch(type) {
      case 'standard': return 'Giao hàng tiêu chuẩn';
      case 'express': return 'Giao hàng nhanh';
      default: return type;
    }
  };

  const getShippingDescription = (type: ShippingType): string => {
    switch(type) {
      case 'standard': return 'Giao hàng trong 3-5 ngày';
      case 'express': return 'Giao hàng trong 1-2 ngày';
      default: return '';
    }
  };

  const getShippingIcon = (type: ShippingType): string => {
    switch(type) {
      case 'standard': return 'bi-truck';
      case 'express': return 'bi-lightning-charge';
      default: return 'bi-truck';
    }
  };

  // Kiểm tra xem đã thay đổi lựa chọn chưa
  const hasChangedSelection = tempSelectedShippingType !== selectedShippingType;

  // Xử lý mở popup chọn phương thức vận chuyển
  const handleOpenPopup = () => {
    setTempSelectedShippingType(selectedShippingType);
    setShowShippingPopup(true);
  };

  // Xử lý chọn phương thức vận chuyển tạm thời trong popup
  const handleTempSelectShipping = (type: ShippingType) => {
    setTempSelectedShippingType(type);
  };

  // Xử lý xác nhận chọn phương thức vận chuyển
  const handleConfirmSelection = () => {
    if (hasChangedSelection) {
      onSelect(tempSelectedShippingType);
    }
    setShowShippingPopup(false);
  };

  // Xử lý hủy chọn phương thức vận chuyển
  const handleCancelSelection = () => {
    setTempSelectedShippingType(selectedShippingType);
    setShowShippingPopup(false);
  };

  const currentShippingFee = calculateShippingFee(selectedShippingType);

  return (
    <div className="shipping-step-container">
      {/* Hiển thị phương thức vận chuyển đã chọn */}
      <div className="shipping-display">
        <div className="shipping-display-content">
          <div className="shipping-info-container">
            {/* Thông tin phương thức vận chuyển */}
            <div className="shipping-info">
              <div className="shipping-name-row">
                <span className="shipping-type-name">
                  <i className={`bi ${getShippingIcon(selectedShippingType)} shipping-type-icon`}></i>
                  {getShippingTypeName(selectedShippingType)}
                </span>
              </div>
              
              <div className="shipping-details-row">
                <span className="shipping-description">
                  {getShippingDescription(selectedShippingType)}
                </span>
                <span className="shipping-price-display">
                  {currentShippingFee.toLocaleString('vi-VN')}₫
                </span>
              </div>
            </div>
            
            {/* Nút thay đổi */}
            <button
              onClick={handleOpenPopup}
              className="shipping-change-btn"
            >
              <i className="bi bi-pencil shipping-change-icon"></i>
              Thay đổi
            </button>
          </div>
        </div>
      </div>

      {/* Popup chọn phương thức vận chuyển */}
      {showShippingPopup && (
        <>
          {/* Backdrop */}
          <div 
            className="shipping-popup-backdrop"
            onClick={handleCancelSelection}
          />
          
          {/* Popup container */}
          <div className="shipping-popup-container">
            <div className="shipping-popup">
              {/* Header popup */}
              <div className="shipping-popup-header">
                <div className="shipping-popup-title">
                  <i className="bi bi-truck shipping-popup-title-icon"></i>
                  <h3 className="shipping-popup-title-text">Chọn phương thức vận chuyển</h3>
                </div>
                <button
                  onClick={handleCancelSelection}
                  className="shipping-popup-close-btn"
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>
              
              {/* Body popup - Thông tin tính phí */}
              <div className="shipping-popup-body">
                {/* Card thông tin tính toán phí */}
                <div className="shipping-calc-card">
                  <div className="shipping-calc-header">
                    <i className="bi bi-calculator shipping-calc-icon"></i>
                    <h4 className="shipping-calc-title">Thông tin tính phí</h4>
                  </div>
                  
                  <div className="shipping-calc-grid">
                    <div className="shipping-calc-item">
                      <div className="shipping-calc-label">
                        <i className="bi bi-box-seam"></i>
                        Trọng lượng:
                      </div>
                      <div className="shipping-calc-value">
                        {totalWeight.toFixed(2)} kg
                      </div>
                    </div>
                    
                    <div className="shipping-calc-item">
                      <div className="shipping-calc-label">
                        <i className="bi bi-signpost-split"></i>
                        Khoảng cách:
                      </div>
                      <div className="shipping-calc-value">
                        {distance} km
                      </div>
                    </div>
                    
                    <div className="shipping-calc-item">
                      <div className="shipping-calc-label">
                        <i className="bi bi-currency-exchange"></i>
                        Phí cơ sở:
                      </div>
                      <div className="shipping-calc-value">
                        {baseFee.toLocaleString('vi-VN')}₫
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Danh sách phương thức vận chuyển */}
                <div className="shipping-options-popup-list">
                  {sampleShippingTypeFees.map((fee) => {
                    const shippingFee = calculateShippingFee(fee.shipping_type);
                    const isSelected = tempSelectedShippingType === fee.shipping_type;
                    
                    return (
                      <div
                        key={fee.id}
                        className={`shipping-option-popup-card ${isSelected ? 'shipping-option-popup-selected' : 'shipping-option-popup-normal'}`}
                        onClick={() => handleTempSelectShipping(fee.shipping_type)}
                      >
                        <div className="shipping-option-popup-content">
                          <div className="shipping-option-popup-left">
                            <div className="shipping-option-popup-icon-wrapper">
                              <i className={`bi ${getShippingIcon(fee.shipping_type)} shipping-option-popup-icon`}></i>
                            </div>
                            
                            <div className="shipping-option-popup-details">
                              <div className="shipping-option-popup-name">
                                {getShippingTypeName(fee.shipping_type)}
                              </div>
                              <div className="shipping-option-popup-description">
                                {getShippingDescription(fee.shipping_type)}
                              </div>
                            </div>
                          </div>
                          
                          <div className="shipping-option-popup-right">
                            <div className="shipping-option-popup-price">
                              {shippingFee.toLocaleString('vi-VN')}₫
                            </div>
                            <div className="shipping-option-popup-check">
                              {isSelected && (
                                <i className="bi bi-check-circle-fill shipping-option-popup-check-icon"></i>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Hiển thị tổng phí */}
                <div className="shipping-total-preview">
                  <div className="shipping-total-preview-label">
                    <i className="bi bi-cash-stack"></i>
                    Tổng phí vận chuyển:
                  </div>
                  <div className="shipping-total-preview-price">
                    {calculateShippingFee(tempSelectedShippingType).toLocaleString('vi-VN')}₫
                  </div>
                </div>
              </div>
              
              {/* Footer popup - Nút xác nhận/hủy */}
              {hasChangedSelection && (
                <div className="shipping-popup-footer">
                  <button
                    onClick={handleCancelSelection}
                    className="shipping-popup-cancel-btn"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleConfirmSelection}
                    className="shipping-popup-confirm-btn"
                  >
                    <i className="bi bi-check-lg shipping-popup-confirm-icon"></i>
                    Xác nhận
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ShippingStep;