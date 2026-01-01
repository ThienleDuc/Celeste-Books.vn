import React from 'react';
import type { Order } from '../../models/Order/order.model';

interface OrderSummaryProps {
  order: Order;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ order }) => {
  // Hàm chuyển đổi status sang tiếng Việt
  const getStatusText = (status: Order['status']): string => {
    switch(status) {
      case 'pending': return 'Chờ xác nhận';
      case 'processing': return 'Đang xử lý';
      case 'shipped': return 'Đang giao';
      case 'delivered': return 'Đã giao';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  // Hàm chuyển đổi payment method sang tiếng Việt
  const getPaymentMethodText = (method: Order['payment_method']): string => {
    switch(method) {
      case 'cod': return 'Thanh toán khi nhận hàng';
      case 'momo': return 'Ví MoMo';
      case 'bank_transfer': return 'Chuyển khoản ngân hàng';
      case 'credit_card': return 'Thẻ tín dụng';
      default: return method;
    }
  };

  // Hàm chuyển đổi payment status sang tiếng Việt
  const getPaymentStatusText = (status: Order['payment_status']): string => {
    switch(status) {
      case 'unpaid': return 'Chưa thanh toán';
      case 'paid': return 'Đã thanh toán';
      case 'refunded': return 'Đã hoàn tiền';
      default: return status;
    }
  };

  // Hàm lấy màu cho status
  const getStatusColor = (status: Order['status']): string => {
    switch(status) {
      case 'delivered': return 'text-green-600 bg-green-50 border-green-200';
      case 'processing': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'shipped': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'cancelled': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Hàm lấy màu cho payment status
  const getPaymentStatusColor = (status: Order['payment_status']): string => {
    switch(status) {
      case 'paid': return 'text-green-600';
      case 'refunded': return 'text-blue-600';
      case 'unpaid': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium text-lg">Đơn hàng #{order.order_code}</h3>
          <div className={`px-3 py-1 rounded-full text-sm border ${getStatusColor(order.status)}`}>
            {getStatusText(order.status)}
          </div>
        </div>
        <div className="text-sm text-gray-500">
          Ngày đặt: {new Date(order.created_at).toLocaleDateString('vi-VN')}
        </div>
      </div>

      {/* Thông tin thanh toán */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <div className="text-gray-500">Hình thức thanh toán:</div>
            <div className="font-medium">{getPaymentMethodText(order.payment_method)}</div>
          </div>
          <div>
            <div className="text-gray-500">Trạng thái thanh toán:</div>
            <div className={`font-medium ${getPaymentStatusColor(order.payment_status)}`}>
              {getPaymentStatusText(order.payment_status)}
            </div>
          </div>
        </div>
      </div>

      {/* Tóm tắt giá */}
      <div className="mb-4">
        <h4 className="font-medium mb-2">Tóm tắt giá</h4>
        <div className="space-y-2">
          <div className="flex justify-between d-flex gap-2">
            <span className="text-gray-600">Tạm tính:</span>
            <span>{order.subtotal.toLocaleString('vi-VN')}₫</span>
          </div>
          
          {order.discount > 0 && (
            <div className="flex justify-between d-flex gap-2">
              <span className="text-gray-600">Giảm giá:</span>
              <span className="text-green-600">-{order.discount.toLocaleString('vi-VN')}₫</span>
            </div>
          )}

          <div className="flex justify-between d-flex gap-2">
            <span className="text-gray-600">Phí vận chuyển:</span>
            <span>{order.shipping_fee.toLocaleString('vi-VN')}₫</span>
          </div>

          <div className="pt-2 border-t">
            <div className="flex justify-between font-bold text-lg">
              <span>Tổng cộng:</span>
              <span className="text-blue-600">{order.total_amount.toLocaleString('vi-VN')}₫</span>
            </div>
          </div>
        </div>
      </div>

      {/* Thời gian */}
      <div className="text-sm text-gray-500 space-y-1">
        <div className="flex justify-between d-flex gap-2">
          <span>Ngày tạo:</span>
          <span>{new Date(order.created_at).toLocaleString('vi-VN')}</span>
        </div>
        <div className="flex justify-between d-flex gap-2">
          <span>Cập nhật lần cuối:</span>
          <span>{new Date(order.updated_at).toLocaleString('vi-VN')}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;