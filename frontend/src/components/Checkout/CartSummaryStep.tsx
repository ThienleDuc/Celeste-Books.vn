import React, { useRef, useEffect, useState } from 'react';
import type { CartItem } from '../../models/Cart/cart.model';
import type { ProductFull } from '../../models/Product/product.model';
import type { LocalStorageCartData } from '../../models/Checkout/checkout.model';

// Interface cho sản phẩm từ localStorage
interface StorageProduct {
  id: number;
  productId: number;
  quantity: number;
  priceAtTime: number;
  name: string;
  image: string;
  productType: string;
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
  const getDisplayItems = (): (StorageProduct | CartItem)[] => {
    if (cartDataFromStorage) {
      return cartDataFromStorage.products;
    }
    return cartItems;
  };

  // Hàm lấy thông tin sản phẩm với type cụ thể
  const getProductInfo = (
    item: StorageProduct | CartItem, 
    isFromStorage: boolean = false
  ): ProductInfo | null => {
    if (isFromStorage && cartDataFromStorage) {
      // Type guard để kiểm tra item là StorageProduct
      const storageItem = item as StorageProduct;
      const priceChange = priceChanges.find(pc => pc.productId === storageItem.productId);
      const currentPrice = priceChange?.hasChanged ? priceChange.newPrice : storageItem.priceAtTime;
      
      return {
        id: storageItem.id,
        name: storageItem.name,
        imageUrl: storageItem.image || '/img/no-image.png',
        price: currentPrice,
        originalPrice: priceChange?.hasChanged ? priceChange.oldPrice : storageItem.priceAtTime,
        productType: storageItem.productType || 'Sách giấy',
        quantity: storageItem.quantity,
        hasPriceChange: priceChange?.hasChanged || false,
        priceChangeInfo: priceChange,
        productId: storageItem.productId,
        total: currentPrice * storageItem.quantity
      };
    } else {
      // Type guard để kiểm tra item là CartItem
      const cartItem = item as CartItem;
      const productFull = products.find(p => p.product.id === cartItem.productId);
      
      if (!productFull) return null;
      
      const detail = productFull.details.find(d => d.id === cartItem.productDetailtId);
      const primaryImage = productFull.images.find(img => img.isPrimary);
      const currentPrice = detail?.salePrice || 0;
      
      return {
        id: cartItem.id,
        name: productFull.product.name,
        imageUrl: primaryImage?.imageUrl || '/img/no-image.png',
        price: currentPrice,
        originalPrice: detail?.salePrice || currentPrice,
        productType: detail?.productType || 'Sách giấy',
        quantity: cartItem.quantity,
        hasPriceChange: false,
        productId: cartItem.productId,
        total: currentPrice * cartItem.quantity
      };
    }
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
              {displayItems.map((item, index) => {
                const isFromStorage = cartDataFromStorage !== undefined;
                const productInfo = getProductInfo(item, isFromStorage);
                
                if (!productInfo) return null;
                
                return (
                  <div 
                    key={productInfo.id || index} 
                    className={`cart-summary-product-item ${
                      productInfo.hasPriceChange 
                        ? 'cart-summary-product-item-price-changed' 
                        : 'cart-summary-product-item-normal'
                    }`}
                  >
                    <div className="cart-summary-product-image">
                      <img 
                        src={productInfo.imageUrl} 
                        alt={productInfo.name}
                        className="cart-summary-product-img"
                        onError={(e) => {
                          e.currentTarget.src = '/img/no-image.png';
                        }}
                      />
                    </div>
                    
                    <div className="cart-summary-product-info">
                      <h4 className="cart-summary-product-name">
                        {productInfo.name}
                      </h4>
                      <div className="cart-summary-product-details">
                        <div className="cart-summary-product-tags">
                          <span className={`cart-summary-product-type ${
                            productInfo.hasPriceChange 
                              ? 'cart-summary-product-type-price-changed' 
                              : 'cart-summary-product-type-normal'
                          }`}>
                            {productInfo.productType}
                          </span>
                          <span className="cart-summary-product-quantity">
                            Số lượng: {productInfo.quantity}
                          </span>
                        </div>
                        <div className="cart-summary-product-prices">
                          {productInfo.hasPriceChange && (
                            <span className="cart-summary-product-old-price">
                              {productInfo.originalPrice.toLocaleString('vi-VN')}₫
                            </span>
                          )}
                          <span className={`cart-summary-product-current-price ${
                            productInfo.hasPriceChange ? 'cart-summary-product-current-price-changed' : ''
                          }`}>
                            {productInfo.price.toLocaleString('vi-VN')}₫/sản phẩm
                            {productInfo.hasPriceChange && (
                              <span className="cart-summary-price-change-indicator">
                                <i className="bi bi-arrow-up-right"></i>
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="cart-summary-product-total">
                      <div className={`cart-summary-product-total-price ${
                        productInfo.hasPriceChange ? 'cart-summary-product-total-price-changed' : ''
                      }`}>
                        {productInfo.total.toLocaleString('vi-VN')}₫
                      </div>
                      {productInfo.hasPriceChange && (
                        <div className="cart-summary-product-original-total">
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
      )}
    </div>
  );
};

export default CartSummaryStep;