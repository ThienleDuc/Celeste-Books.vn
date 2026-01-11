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
    if (cartDataFromStorage) {
      return cartDataFromStorage.products.reduce((total, product) => {
        const priceChange = priceChanges.find(pc => pc.productId === product.productId);
        const currentPrice = priceChange?.hasChanged ? priceChange.newPrice : product.priceAtTime;
        return total + (currentPrice * product.quantity);
      }, 0);
    }
    
    return cartItems.reduce((total, cartItem) => {
      const productInfo = getProductInfo(cartItem, false);
      return total + (productInfo?.total || 0);
    }, 0);
  };

  // Tính tổng số lượng
  const calculateTotalQuantity = (): number => {
    if (cartDataFromStorage) {
      return cartDataFromStorage.totalQuantity;
    }
    
    return cartItems.reduce((total, item) => total + item.quantity, 0);
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
    if (!hasPriceChanges || priceChanges.length === 0) return null;

    const changedProducts = priceChanges.filter(pc => pc.hasChanged);
    const totalOldPrice = calculateOldTotal();
    const totalNewPrice = calculateTotal();
    const totalDifference = totalNewPrice - totalOldPrice;

    return (
      <div className="cart-summary-price-alert">
        <div className="cart-summary-price-alert-content">
          <i className="bi bi-exclamation-triangle cart-summary-price-alert-icon"></i>
          <div className="cart-summary-price-alert-details">
            <div className="cart-summary-price-alert-title">
              Giá sản phẩm đã thay đổi
            </div>
            <div className="cart-summary-price-alert-subtitle">
              Giá của {changedProducts.length} sản phẩm đã được cập nhật theo giá hiện tại:
            </div>
            
            <div className="cart-summary-price-change-list">
              {changedProducts.map((change, index) => (
                <div key={index} className="cart-summary-price-change-item">
                  <span className="cart-summary-price-change-product-name">
                    {change.productName}
                  </span>
                  <div className="cart-summary-price-change-prices">
                    <span className="cart-summary-price-change-old">
                      {change.oldPrice.toLocaleString('vi-VN')}₫
                    </span>
                    <i className="bi bi-arrow-right cart-summary-price-change-arrow"></i>
                    <span className={`cart-summary-price-change-new ${
                      change.newPrice > change.oldPrice ? 'cart-summary-price-increase' : 'cart-summary-price-decrease'
                    }`}>
                      {change.newPrice.toLocaleString('vi-VN')}₫
                    </span>
                    {change.percentageChange && (
                      <span className={`cart-summary-price-change-percentage ${
                        change.newPrice > change.oldPrice ? 'cart-summary-percentage-increase' : 'cart-summary-percentage-decrease'
                      }`}>
                        {change.percentageChange > 0 ? '+' : ''}{change.percentageChange.toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="cart-summary-price-change-total">
              <div className="cart-summary-price-change-total-row">
                <span className="cart-summary-price-change-total-label">Tổng thay đổi:</span>
                <div className="cart-summary-price-change-total-prices">
                  <span className="cart-summary-price-change-total-old">
                    {totalOldPrice.toLocaleString('vi-VN')}₫
                  </span>
                  <i className="bi bi-arrow-right cart-summary-price-change-arrow"></i>
                  <span className={`cart-summary-price-change-total-new ${
                    totalDifference > 0 ? 'cart-summary-price-increase' : 'cart-summary-price-decrease'
                  }`}>
                    {totalNewPrice.toLocaleString('vi-VN')}₫
                  </span>
                  {totalDifference !== 0 && (
                    <span className={`cart-summary-total-difference ${
                      totalDifference > 0 ? 'cart-summary-difference-increase' : 'cart-summary-difference-decrease'
                    }`}>
                      {totalDifference > 0 ? '+' : ''}{totalDifference.toLocaleString('vi-VN')}₫
                    </span>
                  )}
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
            <div className="cart-summary-totals">
              <div className="cart-summary-details">
                <div className="cart-summary-row">
                  <span className="cart-summary-label">Tổng tiền hàng:</span>
                  <span className="cart-summary-value">
                    {calculateTotal().toLocaleString('vi-VN')}₫
                  </span>
                </div>
                
                {hasPriceChanges && (
                  <div className="cart-summary-price-update">
                    <span className="cart-summary-price-update-text">
                      <i className="bi bi-exclamation-triangle"></i>
                      Đã cập nhật giá:
                    </span>
                    <div className="cart-summary-price-update-prices">
                      <span className="cart-summary-price-update-old">
                        {calculateOldTotal().toLocaleString('vi-VN')}₫
                      </span>
                      <i className="bi bi-arrow-right cart-summary-price-update-arrow"></i>
                      <span className="cart-summary-price-update-new">
                        {calculateTotal().toLocaleString('vi-VN')}₫
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="cart-summary-row cart-summary-product-count">
                  <span className="cart-summary-count-label">Số sản phẩm:</span>
                  <span className="cart-summary-count-value">{calculateTotalQuantity()}</span>
                </div>
              </div>
              
              <div className="cart-summary-payment">
                <div className="cart-summary-payment-row">
                  <span className="cart-summary-payment-label">Tổng thanh toán:</span>
                  <span className="cart-summary-payment-value">
                    {calculateTotal().toLocaleString('vi-VN')}₫
                  </span>
                </div>
                <div className="cart-summary-vat-notice">
                  <i className="bi bi-info-circle"></i>
                  Đã bao gồm thuế VAT (nếu có)
                </div>
              </div>
            </div>
          </div>
          
          {/* Cột bên phải - Danh sách sản phẩm với chiều cao bằng cột trái */}
          <div className="cart-summary-right-column" style={{ height: leftColumnHeight || 'auto' }}>
            <div className="cart-summary-product-list">
                {displayItems.map((item: any, index: number) => {
                // 1. Ép kiểu dữ liệu để tính toán chính xác
                const itemPrice = Number(item.price_at_time || 0);
                const itemQuantity = Number(item.quantity || 0);
                const itemTotal = itemPrice * itemQuantity;

                    return (
                      <div key={index} className="d-flex align-items-center mb-3 p-2 border-bottom">
                        {/* 2. Đổ ảnh - dùng đúng key primary_image */}
                        <div className="product-image" style={{ width: '70px', height: '90px' }}>
                          <img 
                            src={item.primary_image || 'https://via.placeholder.com/70x90'} 
                            alt={item.product_name}
                            className="img-fluid rounded shadow-sm"
                            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                          />
                        </div>

                        <div className="product-details ms-3 flex-grow-1">
                          {/* 3. Đổ tên sản phẩm và Tác giả */}
                          <h6 className="mb-0 fw-bold text-dark">{item.product_name}</h6>
                          <div className="text-muted small mb-1">Tác giả: {item.author}</div>
                          
                          <div className="d-flex justify-content-between align-items-end">
                            <div>
                              {/* 4. Đổ loại sản phẩm (Sách giấy/Ebook) */}
                              <span className="badge bg-info-subtle text-info small me-2">
                                {item.product_type}
                              </span>
                              <span className="small text-secondary">x{itemQuantity}</span>
                            </div>
                  
                        {/* 5. Đổ giá tiền */}
                        <div className="text-end">
                          <div className="fw-bold text-primary">
                            {itemTotal.toLocaleString('vi-VN')}₫
                          </div>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                            {itemPrice.toLocaleString('vi-VN')}₫/sp
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartSummaryStep;