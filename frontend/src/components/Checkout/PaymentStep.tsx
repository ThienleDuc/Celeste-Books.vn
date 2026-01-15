import React, { useState } from 'react';
import type { PaymentMethod as PaymentMethodType } from '../../models/Order/order.model';

interface PaymentMethod {
  id: PaymentMethodType;
  name: string;
  icon: string;
  description: string;
}

interface PaymentStepProps {
  paymentMethods: PaymentMethod[];
  selectedPaymentMethod: PaymentMethodType;
  onPaymentMethodSelect: (methodId: PaymentMethodType) => void;
}

const PaymentStep: React.FC<PaymentStepProps> = ({
  paymentMethods,
  selectedPaymentMethod = 'cod', // Mặc định là cod
  onPaymentMethodSelect
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempSelectedPaymentMethod, setTempSelectedPaymentMethod] = useState<PaymentMethodType>(selectedPaymentMethod);

  const handleOpenModal = () => {
    setTempSelectedPaymentMethod(selectedPaymentMethod);
    setIsModalOpen(true);
  };

  const handleConfirm = () => {
    if (tempSelectedPaymentMethod !== selectedPaymentMethod) {
      onPaymentMethodSelect(tempSelectedPaymentMethod);
    }
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setTempSelectedPaymentMethod(selectedPaymentMethod);
    setIsModalOpen(false);
  };

  const hasChanged = tempSelectedPaymentMethod !== selectedPaymentMethod;

  const getPaymentMethodInfo = (methodId: PaymentMethodType) => {
    return paymentMethods.find(m => m.id === methodId);
  };

  const selectedMethod = getPaymentMethodInfo(selectedPaymentMethod);

  return (
    <div className="payment-step-container">
      {/* Display Area */}
      <div className="payment-display-card">
        <div className="payment-display-header">
          <div className="payment-display-title">
            <i className="bi bi-credit-card payment-display-title-icon"></i>
            <span>Phương thức thanh toán</span>
          </div>
          <button className="payment-change-btn" onClick={handleOpenModal}>
            <i className="bi bi-pencil payment-change-icon"></i>
            Thay đổi
          </button>
        </div>

        <div className="payment-selected-info">
          {selectedMethod && (
            <div className="payment-selected-content">
              <div className="payment-selected-left">
                <div className="payment-selected-icon-wrapper">
                  <i className={`bi ${selectedMethod.icon} payment-selected-icon`}></i>
                </div>
                <div className="payment-selected-details">
                  <div className="payment-selected-name">
                    {selectedMethod.name}
                    <span className="payment-selected-badge">
                      <i className="bi bi-check-circle-fill"></i>
                      Đã chọn
                    </span>
                  </div>
                  <div className="payment-selected-description">
                    {selectedMethod.description}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Additional Info based on selected method */}
          {selectedPaymentMethod === 'cod' && (
            <div className="payment-additional-info cod-info">
              <i className="bi bi-info-circle"></i>
              <div className="payment-additional-text">
                <strong>Thanh toán khi nhận hàng (COD):</strong> Bạn sẽ thanh toán tiền mặt cho nhân viên giao hàng khi nhận được đơn hàng.
              </div>
            </div>
          )}

          {selectedPaymentMethod === 'momo' && (
            <div className="payment-additional-info momo-info">
              <i className="bi bi-info-circle"></i>
              <div className="payment-additional-text">
                <strong>Ví MoMo:</strong> Bạn sẽ được chuyển hướng đến trang thanh toán MoMo để hoàn tất giao dịch.
              </div>
            </div>
          )}

          {selectedPaymentMethod === 'bank_transfer' && (
            <div className="payment-additional-info bank-info">
              <i className="bi bi-info-circle"></i>
              <div className="payment-additional-text">
                <strong>Chuyển khoản ngân hàng:</strong> 
                <div className="payment-bank-details">
                  <div><strong>Ngân hàng:</strong> Techcombank</div>
                  <div><strong>Số tài khoản:</strong> 1903 6178 4701 29</div>
                  <div><strong>Chủ tài khoản:</strong> CELESTE BOOKS COMPANY</div>
                  <div><strong>Nội dung chuyển khoản:</strong> Tên + Số điện thoại</div>
                </div>
              </div>
            </div>
          )}

          {selectedPaymentMethod === 'credit_card' && (
            <div className="payment-additional-info card-info">
              <i className="bi bi-info-circle"></i>
              <div className="payment-additional-text">
                <strong>Thẻ tín dụng:</strong> Hỗ trợ thẻ Visa, Mastercard, JCB. Thanh toán được bảo mật qua cổng OnePay.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal for Payment Method Selection */}
      {isModalOpen && (
        <div className="payment-modal-overlay" onClick={handleCancel}>
          <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="payment-modal-header">
              <div className="payment-modal-title-wrapper">
                <i className="bi bi-credit-card payment-modal-title-icon"></i>
                <h3 className="payment-modal-title">Chọn phương thức thanh toán</h3>
              </div>
              <button 
                className="payment-modal-close-btn"
                onClick={handleCancel}
                aria-label="Đóng"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            {/* Modal Body */}
            <div className="payment-modal-body">
              <div className="payment-methods-list">
                {paymentMethods.map(method => {
                  const isSelected = tempSelectedPaymentMethod === method.id;
                  
                  return (
                    <div
                      key={method.id}
                      className={`payment-method-item ${isSelected ? 'payment-method-item-selected' : 'payment-method-item-normal'}`}
                      onClick={() => setTempSelectedPaymentMethod(method.id)}
                    >
                      <div className="payment-method-item-content">
                        <div className="payment-method-item-left">
                          <div className="payment-method-icon-wrapper">
                            <i className={`bi ${method.icon} payment-method-icon`}></i>
                          </div>
                          
                          <div className="payment-method-item-info">
                            <div className="payment-method-item-name">
                              {method.name}
                            </div>
                            <div className="payment-method-item-description">
                              {method.description}
                            </div>
                          </div>
                        </div>
                        
                        <div className="payment-method-item-right">
                          <div className={`payment-method-radio ${isSelected ? 'payment-method-radio-selected' : ''}`}>
                            {isSelected && <div className="payment-method-radio-dot"></div>}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="payment-modal-footer">
              <div className="payment-modal-footer-buttons">
                <button
                  className="payment-cancel-btn"
                  onClick={handleCancel}
                >
                  Hủy
                </button>
                <button
                  className="payment-confirm-btn"
                  onClick={handleConfirm}
                  disabled={!hasChanged}
                >
                  <i className="bi bi-check-lg payment-confirm-icon"></i>
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentStep;