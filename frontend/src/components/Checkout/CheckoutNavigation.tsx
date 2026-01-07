// components/Checkout/CheckoutNavigation.tsx
import React from 'react';

interface CheckoutNavigationProps {
  currentStep: number;
  onPrevious: () => void;
  onNext: () => void;
  onPlaceOrder: () => void;
  isNextDisabled: boolean;
  onCancel?: () => void; // Thêm prop optional onCancel
}

const CheckoutNavigation: React.FC<CheckoutNavigationProps> = ({
  currentStep,
  onPrevious,
  onNext,
  onPlaceOrder,
  isNextDisabled,
  onCancel
}) => {
  const totalSteps = 5; // Tổng số step

  return (
    <div className="d-flex gap-2 align-items-center justify-content-center">
      {/* Nút hủy và quay lại */}
        <div className="d-flex align-items-center gap-2">
            {onCancel && (
            <button
                onClick={onCancel}
                className="d-flex align-items-center gap-2 btn btn-danger fs-1-rem"
                title="Hủy thanh toán"
                >
                <i className="bi bi-x-circle mr-1"></i>
                Hủy
            </button>
            )}
            
            {currentStep > 1 && (
            <button
                onClick={onPrevious}
                className="btn btn-outline-primary"
                type="button"
            >
                <i className="bi bi-arrow-left me-1"></i>
                Quay lại
            </button>
            )}
        </div>

        {/* Nút tiếp tục/đặt hàng */}
        <div>
            {currentStep < 4 ? (
                <button
                    onClick={onNext}
                    disabled={isNextDisabled}
                    className={`btn btn-primary ${isNextDisabled ? 'disabled' : ''}`}
                    type="button"
                >
                    Tiếp tục
                    <i className="bi bi-arrow-right ms-1"></i>
                </button>
            ) : (
            <button
                onClick={onPlaceOrder}
                disabled={isNextDisabled}
                className={`btn btn-success ${isNextDisabled ? 'disabled' : ''}`}
                type="button"
            >
                <i className="bi bi-check-lg me-1"></i>
                Đặt hàng
            </button>
            )}
        </div>

        {/* Progress indicator */}
        <div className="text-muted small">
            Bước {currentStep} / {totalSteps}
        </div>
    </div>
  );
};

export default CheckoutNavigation;