import React, { useRef, useEffect, useState } from 'react';
import type { CartItem } from '../../models/Cart/cart.model';
import type { ProductFull } from '../../models/Product/product.model';
import type { LocalStorageCartData } from '../../models/Checkout/checkout.model';

// Interface cho sản phẩm từ localStorage
interface StorageProduct {
  cart_item_id: number;
  product_id: number;
  quantity: number;
  price_at_time: string | number;
  product_name: string;
  primary_image: string;
  product_type: string;
  author?: string;
}

// Interface cho thông tin sản phẩm trả về
interface ProductInfo {
  id: number;
  name: string;
  imageUrl: string;
  price: number;
  originalPrice: number;
  productType: string;
  quantity: number;
  hasPriceChange: boolean;
  priceChangeInfo?: PriceChangeInfo;
  productId: number;
  total: number;
}

interface PriceChangeInfo {
  productId: number;
  productName: string;
  oldPrice: number;
  newPrice: number;
  hasChanged: boolean;
  percentageChange?: number;
}

interface CartSummaryStepProps {
  cartItems: CartItem[];
  products: ProductFull[];
  cartDataFromStorage?: LocalStorageCartData;
}

const CartSummaryStep: React.FC<CartSummaryStepProps> = ({ 
  cartItems, 
  products,
  cartDataFromStorage 
}) => {
  // State lưu thông tin thay đổi giá
  const [priceChanges, setPriceChanges] = useState<PriceChangeInfo[]>([]);
  const [hasPriceChanges, setHasPriceChanges] = useState(false);
  const [isCheckingPrices, setIsCheckingPrices] = useState(true);
  
  // State để lưu chiều cao của cột trái
  const [leftColumnHeight, setLeftColumnHeight] = useState(0);
  const leftColumnRef = useRef<HTMLDivElement>(null);

  // Lấy danh sách sản phẩm để hiển thị - DI CHUYỂN LÊN TRÊN
  const getDisplayItems = (): any[] => {
    // Ưu tiên dùng cartItems vì nó chứa đầy đủ thông tin tên, ảnh từ API
    if (cartItems && cartItems.length > 0) {
      return cartItems;
    }
    // Nếu không có cartItems mới dùng tới storage
    if (cartDataFromStorage) {
      return cartDataFromStorage.products;
    }
    return [];
  };

// Trong CartSummaryStep.tsx
const getProductInfo = (item: any): ProductInfo | null => {
  if (!item) return null;

  // Lấy giá thực tế từ API (Postman trả về sale_price hoặc price_at_time)
  const currentPrice = parseFloat(item.price_at_time || item.sale_price || 0);
  const oldPrice = parseFloat(item.original_price || currentPrice);

  return {
    id: item.cart_item_id || item.id,
    name: item.product_name || "Sách không tên", // Đảm bảo đúng key product_name
    imageUrl: item.primary_image || '/img/no-image.png', // Đúng key primary_image
    price: currentPrice,
    originalPrice: oldPrice,
    productType: item.product_type || 'Sách giấy',
    quantity: item.quantity || 1,
    hasPriceChange: false, // Tắt cảnh báo màu vàng nếu bạn muốn giao diện sạch
    productId: item.product_id,
    total: currentPrice * (item.quantity || 1)
  };
};

  // Tính tổng tiền với giá hiện tại
  const calculateTotal = (): number => {
    return displayItems.reduce((total, item) => {
      return total + (parseFloat(item.sale_price || item.price_at_time || 0) * (item.quantity || 1));
    }, 0);
  };

  const calculateOriginalTotal = (): number => {
    return displayItems.reduce((total, item) => {
      return total + (parseFloat(item.original_price || item.sale_price || 0) * (item.quantity || 1));
    }, 0);
  };

  // Tính tổng số lượng
  const calculateTotalQuantity = (): number => {
    const items = getDisplayItems();
    return items.reduce((total, item) => total + (item.quantity || 0), 0);
  };

  // Tính tổng tiền theo giá cũ
  const calculateOldTotal = (): number => {
    if (!cartDataFromStorage) return 0;
    
    return cartDataFromStorage.products.reduce((total, product) => {
      return total + (product.priceAtTime * product.quantity);
    }, 0);
  };

  // Hàm kiểm tra thay đổi giá
  useEffect(() => {
    const checkPriceChanges = () => {
      if (!cartDataFromStorage || cartDataFromStorage.products.length === 0) {
        setIsCheckingPrices(false);
        return;
      }

      const changes: PriceChangeInfo[] = [];
      
      cartDataFromStorage.products.forEach(storedProduct => {
        // Tìm sản phẩm tương ứng trong database
        const currentProduct = products.find(p => p.product.id === storedProduct.productId);
        
        if (currentProduct) {
          // Lấy giá hiện tại từ database
          const productDetail = currentProduct.details.find(d => 
            d.productType === storedProduct.productType
          ) || currentProduct.details[0];
          
          const currentPrice = productDetail?.salePrice || 0;
          const storedPrice = storedProduct.priceAtTime;
          
          // Kiểm tra nếu giá khác nhau
          const priceHasChanged = currentPrice !== storedPrice;
          
          if (priceHasChanged) {
            const percentageChange = ((currentPrice - storedPrice) / storedPrice) * 100;
            
            changes.push({
              productId: storedProduct.productId,
              productName: storedProduct.name,
              oldPrice: storedPrice,
              newPrice: currentPrice,
              hasChanged: true,
              percentageChange
            });
          } else {
            changes.push({
              productId: storedProduct.productId,
              productName: storedProduct.name,
              oldPrice: storedPrice,
              newPrice: currentPrice,
              hasChanged: false
            });
          }
        }
      });

      setPriceChanges(changes);
      setHasPriceChanges(changes.some(change => change.hasChanged));
      setIsCheckingPrices(false);
    };

    const timer = setTimeout(() => {
      checkPriceChanges();
    }, 500);

    return () => clearTimeout(timer);
  }, [cartDataFromStorage, products]);

  // Tính toán chiều cao cột trái khi nội dung thay đổi
  useEffect(() => {
    if (leftColumnRef.current && getDisplayItems().length > 0) {
      const height = leftColumnRef.current.offsetHeight;
      setLeftColumnHeight(height);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priceChanges, hasPriceChanges, cartDataFromStorage, cartItems]);

  // Hiển thị thông báo thay đổi giá
  const renderPriceChangeAlert = () => {
    const changedProducts = displayItems.filter(item => 
      parseFloat(item.original_price) > parseFloat(item.sale_price)
    );
  
    if (changedProducts.length === 0) return null;
  
    const totalOldPrice = calculateOriginalTotal();
    const totalNewPrice = calculateTotal();
    const totalDifference = totalOldPrice - totalNewPrice;
  
    return (
      <div className="cart-summary-price-alert" style={{ backgroundColor: '#fff9e6', border: '1px solid #ffeeba', borderRadius: '8px' }}>
        <div className="cart-summary-price-alert-content">
          {/* Icon và tiêu đề màu cam/nâu vàng */}
          <i className="bi bi-exclamation-triangle cart-summary-price-alert-icon" style={{ color: '#856404' }}></i>
          <div className="cart-summary-price-alert-details">
            <div className="cart-summary-price-alert-title" style={{ color: '#856404', fontWeight: 'bold' }}>
              Ưu đãi giá tốt dành cho bạn
            </div>
            <div className="cart-summary-price-alert-subtitle" style={{ color: '#856404' }}>
              Có {changedProducts.length} sản phẩm đang được giảm giá so với giá niêm yết:
            </div>
            
            <div className="cart-summary-price-change-list">
              {changedProducts.map((item, index) => {
                const oldP = parseFloat(item.original_price);
                const newP = parseFloat(item.sale_price);
                const percent = Math.round(((oldP - newP) / oldP) * 100);
  
                return (
                  <div key={index} className="cart-summary-price-change-item" style={{ borderBottom: '1px solid #ffeeba' }}>
                    <span className="cart-summary-price-change-product-name" style={{ color: '#856404' }}>
                      {item.product_name}
                    </span>
                    <div className="cart-summary-price-change-prices">
                      <span className="cart-summary-price-change-old">
                        {oldP.toLocaleString('vi-VN')}₫
                      </span>
                      <i className="bi bi-arrow-right cart-summary-price-change-arrow" style={{ color: '#856404' }}></i>
                      <span className="cart-summary-price-change-new" style={{ color: '#28a745', fontWeight: 'bold' }}>
                        {newP.toLocaleString('vi-VN')}₫
                      </span>
                      <span className="cart-summary-price-change-percentage" style={{ backgroundColor: '#d4edda', color: '#155724', padding: '2px 5px', borderRadius: '4px' }}>
                        -{percent}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Phần tổng tiết kiệm màu vàng */}
            <div className="cart-summary-price-change-total" style={{ borderTop: '1px solid #ffeeba', marginTop: '10px' }}>
              <div className="cart-summary-price-change-total-row">
                <span className="cart-summary-price-change-total-label" style={{ color: '#856404', fontWeight: 'bold' }}>Tổng tiết kiệm:</span>
                <div className="cart-summary-price-change-total-prices">
                  <span className="cart-summary-price-change-total-old">
                    {totalOldPrice.toLocaleString('vi-VN')}₫
                  </span>
                  <i className="bi bi-arrow-right cart-summary-price-change-arrow" style={{ color: '#856404' }}></i>
                  <span className="cart-summary-price-change-total-new" style={{ color: '#28a745', fontWeight: 'bold' }}>
                    {totalNewPrice.toLocaleString('vi-VN')}₫
                  </span>
                  <span className="cart-summary-total-difference" style={{ backgroundColor: '#d4edda', color: '#155724', padding: '2px 5px', borderRadius: '4px', marginLeft: '5px' }}>
                    -{totalDifference.toLocaleString('vi-VN')}₫
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Hiển thị loading khi đang kiểm tra giá
  if (isCheckingPrices && cartDataFromStorage) {
    return (
      <div className="cart-summary-container">
        <div className="cart-summary-header">
          <h3 className="cart-summary-title">Sản phẩm đã chọn</h3>
        </div>
        <div className="cart-summary-loading">
          <div className="cart-summary-loading-spinner"></div>
          <p className="cart-summary-loading-text">Đang kiểm tra giá sản phẩm...</p>
          <p className="cart-summary-loading-subtext">So sánh với giá hiện tại</p>
        </div>
      </div>
    );
  }

  const displayItems = getDisplayItems(); // Định nghĩa ở đây

  return (
    <div className="cart-summary-container">
      <div className="cart-summary-header">
        <h3 className="cart-summary-title">Sản phẩm đã chọn</h3>
        <span className="cart-summary-count">
          {calculateTotalQuantity()} sản phẩm
        </span>
      </div>
      
      {displayItems.length === 0 ? (
        <div className="cart-summary-empty">
          <i className="bi bi-cart-x cart-summary-empty-icon"></i>
          <p>Không có sản phẩm nào trong giỏ hàng</p>
        </div>
      ) : (
        <div className="cart-summary-layout">
          {/* Cột bên trái - Thông tin giá và tổng */}
          <div className="cart-summary-left-column" ref={leftColumnRef}>
            {/* Hiển thị thông báo thay đổi giá */}
            {renderPriceChangeAlert()}
            
            {/* Phần tổng kết */}
            <div className="cart-summary-totals" style={{ backgroundColor: 'rgb(255, 249, 230)' }}>
            <div className="cart-summary-details">
              {/* 1. Tổng tiền hàng (Giá chưa giảm) */}
              <div className="cart-summary-row">
                <span className="cart-summary-label">Tổng tiền hàng:</span>
                <span className="cart-summary-value text-muted text-decoration-line-through">
                  {calculateOriginalTotal().toLocaleString('vi-VN')}₫
                </span>
              </div>

              {/* 2. Số tiền giảm giá (Phần chênh lệch giữa giá gốc và giá bán) */}
              {calculateOriginalTotal() > calculateTotal() && (
                <div className="cart-summary-row text-danger">
                  <span className="cart-summary-label">Giảm giá trực tiếp:</span>
                  <span className="cart-summary-value">
                    -{ (calculateOriginalTotal() - calculateTotal()).toLocaleString('vi-VN') }₫
                  </span>
                </div>
              )}
              
              <div className="cart-summary-row cart-summary-product-count">
                <span className="cart-summary-count-label">Số lượng sản phẩm:</span>
                <span className="cart-summary-count-value">{calculateTotalQuantity()}</span>
              </div>
            </div>
  
            <div className="cart-summary-payment">
              <div className="cart-summary-payment-row">
                <span className="cart-summary-payment-label">Tổng thanh toán:</span>
                <div className="text-end">
                  <span className="cart-summary-payment-value text-primary fs-4 fw-bold">
                    {calculateTotal().toLocaleString('vi-VN')}₫
                  </span>
                  {/* Tính % giảm giá tổng thể */}
                  {calculateOriginalTotal() > 0 && (
                    <div className="text-danger small fw-bold">
                      (Tiết kiệm {Math.round(((calculateOriginalTotal() - calculateTotal()) / calculateOriginalTotal()) * 100)}%)
                    </div>
                  )}
                </div>
              </div>
              <div className="cart-summary-vat-notice">
                <i className="bi bi-check-circle-fill text-success me-1"></i>
                Giá đã bao gồm VAT
              </div>
            </div>
          </div>
          </div>
          
          {/* Cột bên phải - Danh sách sản phẩm với chiều cao bằng cột trái */}
          <div className="cart-summary-right-column" style={{ height: leftColumnHeight || 'auto' }}>
            {/* Cột bên phải - Danh sách sản phẩm với chiều cao bằng cột trái */}
<div className="cart-summary-right-column" style={{ height: leftColumnHeight || 'auto', overflowY: 'auto' }}>
  <div className="cart-summary-product-list">
    {displayItems.map((item, index) => {
      const isFromStorage = cartDataFromStorage !== undefined;
      const productInfo = getProductInfo(item, isFromStorage);
      
      if (!productInfo) return null;

      // Tính toán phần trăm giảm giá dựa trên dữ liệu Postman
      const hasDiscount = productInfo.originalPrice > productInfo.price;
      const discountPercent = hasDiscount 
        ? Math.round(((productInfo.originalPrice - productInfo.price) / productInfo.originalPrice) * 100)
        : 0;

      return (
        <div 
          key={productInfo.id || index} 
          className="cart-summary-product-item"
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '15px',
            marginBottom: '10px',
            backgroundColor: hasDiscount ? '#fff9e6' : '#fff', // Màu vàng nhạt nếu có giảm giá
            border: hasDiscount ? '1px solid #ffeeba' : '1px solid #eee',
            borderRadius: '8px'
          }}
        >
          {/* Ảnh sản phẩm */}
          <div className="cart-summary-product-image" style={{ width: '70px', height: '90px', flexShrink: 0 }}>
            <img 
              src={productInfo.imageUrl} 
              alt={productInfo.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }}
              onError={(e) => {
                e.currentTarget.src = '/img/no-image.png';
              }}
            />
          </div>
          
          {/* Thông tin sản phẩm */}
          <div className="cart-summary-product-info" style={{ marginLeft: '15px', flexGrow: 1 }}>
            <h4 className="cart-summary-product-name" style={{ margin: '0 0 5px 0', fontSize: '1rem', fontWeight: 'bold' }}>
              {productInfo.name}
            </h4>
            
            <div className="cart-summary-product-details">
              <div className="cart-summary-product-tags" style={{ marginBottom: '5px' }}>
                <span className="badge bg-info-subtle text-info me-2" style={{ fontSize: '0.75rem' }}>
                  {productInfo.productType}
                </span>
                <span className="text-secondary small">x{productInfo.quantity}</span>
              </div>

              <div className="cart-summary-product-prices">
                {/* Giá gốc gạch ngang */}
                {hasDiscount && (
                  <span className="text-muted text-decoration-line-through small me-2">
                    {productInfo.originalPrice.toLocaleString('vi-VN')}₫
                  </span>
                )}
                {/* Giá bán hiện tại */}
                <span style={{ fontWeight: 'bold', color: hasDiscount ? '#28a745' : '#333' }}>
                  {productInfo.price.toLocaleString('vi-VN')}₫/sp
                </span>
              </div>
            </div>
          </div>
          
          {/* Tổng tiền của item đó */}
          <div className="cart-summary-product-total" style={{ textAlign: 'right', minWidth: '100px' }}>
            {hasDiscount && (
              <div style={{ marginBottom: '2px' }}>
                <span className="badge bg-danger" style={{ fontSize: '0.7rem' }}>
                  -{discountPercent}%
                </span>
              </div>
            )}
            <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#007bff' }}>
              {productInfo.total.toLocaleString('vi-VN')}₫
            </div>
            {hasDiscount && (
              <div className="text-muted small text-decoration-line-through">
                {(productInfo.originalPrice * productInfo.quantity).toLocaleString('vi-VN')}₫
              </div>
            )}
          </div>
        </div>
      );
    })}
  </div>
</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartSummaryStep;