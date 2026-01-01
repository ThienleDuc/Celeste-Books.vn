import React from 'react';
import type { AddressFull } from '../../models/User/address.model';
import type { Order, OrderItem } from '../../models/Order/order.model';
import type { LocalStorageCartData } from '../../models/Checkout/checkout.model';

interface OrderConfirmationProps {
  order: Order;
  address: AddressFull | null;
  cartData?: LocalStorageCartData;
  orderItems?: OrderItem[];
}

const OrderConfirmation: React.FC<OrderConfirmationProps> = ({ 
  order, 
  address, 
  cartData,
  orderItems 
}) => {
  const getPaymentMethodName = (method: Order['payment_method']): string => {
    switch(method) {
      case 'cod': return 'Thanh toán khi nhận hàng';
      case 'momo': return 'Ví MoMo';
      case 'bank_transfer': return 'Chuyển khoản ngân hàng';
      case 'credit_card': return 'Thẻ tín dụng';
      default: return method;
    }
  };

  const getStatusText = (status: Order['status']): string => {
    switch(status) {
      case 'pending': return 'Chờ xác nhận';
      case 'processing': return 'Đang xử lý';
      case 'shipped': return 'Đang giao hàng';
      case 'delivered': return 'Đã giao hàng';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const getPaymentMethodIcon = (method: Order['payment_method']): string => {
    switch(method) {
      case 'cod': return 'bi-cash';
      case 'momo': return 'bi-phone';
      case 'bank_transfer': return 'bi-bank';
      case 'credit_card': return 'bi-credit-card';
      default: return 'bi-wallet';
    }
  };

  const getTotalItems = (): number => {
    if (orderItems && orderItems.length > 0) {
      return orderItems.reduce((total, item) => total + item.quantity, 0);
    }
    if (cartData?.products) {
      return cartData.products.reduce((total, product) => total + product.quantity, 0);
    }
    return 0;
  };

  const calculateProductsTotal = (): number => {
    if (orderItems && orderItems.length > 0) {
      return orderItems.reduce((total, item) => total + item.total_price, 0);
    }
    if (cartData?.totalPrice) {
      return cartData.totalPrice;
    }
    return order.subtotal || 0;
  };

  const getProductsToDisplay = () => {
    // Ưu tiên hiển thị từ cartData nếu có (có thông tin chi tiết hơn)
    if (cartData?.products && cartData.products.length > 0) {
        return cartData.products.map(product => ({
            id: product.id,
            name: product.name,
            quantity: product.quantity,
            price: product.priceAtTime,
            total: product.priceAtTime * product.quantity,
            image: product.image || '/img/no-image.png',
            productType: product.productType
        }));
    }
    
    // Fallback: hiển thị từ orderItems
    if (orderItems && orderItems.length > 0) {
        return orderItems.map(item => ({
            id: item.id,
            name: `Sản phẩm #${item.product_id}`,
            quantity: item.quantity,
            price: item.price,
            total: item.total_price,
            image: '../../../public/img/book1.jpg',
            productType: item.product_type
        }));
    }
    
    return [];
  };

  const calculateOrderDetails = () => {
    const subtotal = calculateProductsTotal();
    const shippingFee = order.shipping_fee || 0;
    const discount = order.discount || 0;
    const total = order.total_amount || subtotal + shippingFee - discount;

    return {
      subtotal,
      shippingFee,
      discount,
      total,
      items: getProductsToDisplay()
    };
  };

  const orderDetails = calculateOrderDetails();

  return (
    <div className="order-confirmation-container">
      {/* Header */}
      <div className="order-confirmation-header">
        <div className="order-confirmation-success-icon">
          <i className="bi bi-check-circle-fill"></i>
        </div>
        <h3 className="order-confirmation-title">Đơn hàng đã được đặt thành công!</h3>
        <div className="order-confirmation-subtitle">
          Cảm ơn bạn đã mua sắm tại Celeste Books
        </div>
        <div className="order-code-badge">
          <i className="bi bi-receipt order-code-icon"></i>
          Mã đơn hàng: <span className="order-code-value">#{order.order_code}</span>
        </div>
      </div>

      {/* Order summary - Sử dụng flex wrap */}
      <div className="order-info-section">
        <h4 className="order-section-title">Thông tin đơn hàng</h4>
        <div className="order-info-flex-container">
          <div className="order-info-flex-item">
            <div className="order-info-flex-label">
              <i className="bi bi-receipt order-info-flex-icon"></i>
              Mã đơn hàng
            </div>
            <div className="order-info-flex-value">{order.order_code}</div>
          </div>
          
          <div className="order-info-flex-item">
            <div className="order-info-flex-label">
              <i className="bi bi-calendar-event order-info-flex-icon"></i>
              Ngày đặt
            </div>
            <div className="order-info-flex-value">
              {new Date(order.created_at).toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
          
          <div className="order-info-flex-item">
            <div className="order-info-flex-label">
              <i className="bi bi-info-circle order-info-flex-icon"></i>
              Trạng thái
            </div>
            <div className={`order-status-badge order-status-${order.status}`}>
              {getStatusText(order.status)}
            </div>
          </div>
          
          <div className="order-info-flex-item">
            <div className="order-info-flex-label">
              <i className={`bi ${getPaymentMethodIcon(order.payment_method)} order-info-flex-icon`}></i>
              Thanh toán
            </div>
            <div className="order-info-flex-value">{getPaymentMethodName(order.payment_method)}</div>
          </div>
          
          <div className="order-info-flex-item">
            <div className="order-info-flex-label">
              <i className="bi bi-cash-stack order-info-flex-icon"></i>
              Trạng thái thanh toán
            </div>
            <div className={`order-payment-status order-payment-${order.payment_status}`}>
              {order.payment_status === 'paid' ? 'Đã thanh toán' : 'Chờ thanh toán'}
            </div>
          </div>

          <div className="order-info-flex-item">
            <div className="order-info-flex-label">
              <i className="bi bi-truck order-info-flex-icon"></i>
              Phương thức vận chuyển
            </div>
            <div className="order-info-flex-value">
              {order.shipping_fee && order.shipping_fee > 25000 ? 'Giao hàng nhanh' : 'Giao hàng tiêu chuẩn'}
            </div>
          </div>

          <div className="order-info-flex-item">
            <div className="order-info-flex-label">
              <i className="bi bi-cash-coin order-info-flex-icon"></i>
              Tổng tiền
            </div>
            <div className="order-info-flex-value order-total-value">
              {order.total_amount.toLocaleString('vi-VN')}₫
            </div>
          </div>

          <div className="order-info-flex-item">
            <div className="order-info-flex-label">
              <i className="bi bi-box-seam order-info-flex-icon"></i>
              Số sản phẩm
            </div>
            <div className="order-info-flex-value">
              {getTotalItems()} sản phẩm
            </div>
          </div>
        </div>
      </div>

      {/* Products list */}
      {orderDetails.items.length > 0 && (
        <div className="order-products-section">
          <h4 className="order-section-title">
            Sản phẩm đã đặt <span className="order-items-count">({getTotalItems()} sản phẩm)</span>
          </h4>
          <div className="order-products-list">
            {orderDetails.items.map((product, index) => (
              <div key={product.id || index} className="order-product-item">
                <div className="order-product-left">
                  <div className="order-product-image-wrapper">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="order-product-image"
                      onError={(e) => {
                        e.currentTarget.src = '/img/no-image.png';
                      }}
                    />
                  </div>
                  <div className="order-product-info">
                    <div className="order-product-name">{product.name}</div>
                    <div className="order-product-type">
                      Phân loại: {product.productType || 'Không xác định'}
                    </div>
                    <div className="order-product-quantity">
                      {product.quantity} × {product.price.toLocaleString('vi-VN')}₫
                    </div>
                  </div>
                </div>
                <div className="order-product-right">
                  <div className="order-product-total">
                    {product.total.toLocaleString('vi-VN')}₫
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Address */}
      {address && (
        <div className="order-address-section">
          <div className="order-section-header">
            <i className="bi bi-geo-alt order-section-icon"></i>
            <h4 className="order-section-title">Địa chỉ giao hàng</h4>
          </div>
          <div className="order-address-card">
            <div className="order-address-content">
              <div className="order-address-name">{address.receiverName}</div>
              <div className="order-address-phone">
                <i className="bi bi-telephone"></i>
                {address.phone}
              </div>
              <div className="order-address-street">{address.streetAddress}</div>
              {address.commune?.name && address.province?.name && (
                <div className="order-address-location">
                  {address.commune.name}, {address.province.name}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Order summary breakdown */}
      <div className="order-summary-section">
        <h4 className="order-section-title">Chi tiết thanh toán</h4>
        <div className="order-summary-details">
          <div className="order-summary-item">
            <span className="order-summary-label">Tạm tính:</span>
            <span className="order-summary-value">{orderDetails.subtotal.toLocaleString('vi-VN')}₫</span>
          </div>
          <div className="order-summary-item">
            <span className="order-summary-label">Phí vận chuyển:</span>
            <span className="order-summary-value">{orderDetails.shippingFee.toLocaleString('vi-VN')}₫</span>
          </div>
          {orderDetails.discount > 0 && (
            <div className="order-summary-item order-summary-discount">
              <span className="order-summary-label">Giảm giá:</span>
              <span className="order-summary-value">-{orderDetails.discount.toLocaleString('vi-VN')}₫</span>
            </div>
          )}
          <div className="order-summary-total">
            <span className="order-total-label">Tổng cộng:</span>
            <span className="order-total-amount">
              {orderDetails.total.toLocaleString('vi-VN')}₫
            </span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="order-actions-section">
        <div className="order-actions-notice">
          <i className="bi bi-info-circle"></i>
          Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất
        </div>
        
        <div className="order-actions-buttons">
          <button
            onClick={() => window.location.href = '/'}
            className="order-action-btn order-action-primary"
          >
            <i className="bi bi-cart-plus"></i>
            Tiếp tục mua sắm
          </button>
          <button
            onClick={() => window.print()}
            className="order-action-btn order-action-secondary"
          >
            <i className="bi bi-printer"></i>
            In hóa đơn
          </button>
        </div>
        
        <div className="order-track-link">
          <button
            onClick={() => window.location.href = `/don-hang/${order.user_id}`}
            className="order-track-btn"
          >
            <i className="bi bi-clock-history"></i>
            Theo dõi đơn hàng
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;