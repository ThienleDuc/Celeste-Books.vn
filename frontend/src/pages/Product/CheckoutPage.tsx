// ./pages/CheckoutPage.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Import components - Đảm bảo đường dẫn đúng
import CheckoutSteps from '../../components/Checkout/CheckoutSteps';
import CheckoutNavigation from '../../components/Checkout/CheckoutNavigation';
import AddressSelector from '../../components/Checkout/AddressStep';
import CartSummaryStep from '../../components/Checkout/CartSummaryStep';
import ShippingStep from '../../components/Checkout/ShippingStep';
import DiscountSelector from '../../components/Checkout/VoucherStep';
import PaymentStep from '../../components/Checkout/PaymentStep';
import OrderConfirmation from '../../components/Checkout/ConfirmationStep';

// Import models
import type { AddressFull } from '../../models/User/address.model';
import type { ShippingType } from '../../models/Checkout/discount.model';
import type { OrderProductDiscount, OrderShippingDiscount } from '../../models/Checkout/discount.model';
import type { Order, OrderItem, OrderProductType, PaymentMethod, PaymentStatus, OrderStatus } from '../../models/Order/order.model';
import type { CartItem } from '../../models/Cart/cart.model';

// Import sample data
import { sampleProducts } from '../../models/Product/product.model';
import { orders as sampleOrders, orderItems as sampleOrderItems } from '../../models/Order/order.model';
import { 
  sampleOrderProductDiscounts, 
  sampleOrderShippingDiscounts,
  sampleShippingTypeFees,
  sampleWeightFees,
  sampleDistanceFees  
} from '../../models/Checkout/discount.model';
import type { LocalStorageCartData } from '../../models/Checkout/checkout.model';
import { sampleAddresses, getAddressFull } from '../../models/User/address.model';


const CheckoutPage: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    
    // State với proper types
    const [selectedAddress, setSelectedAddress] = useState<AddressFull | null>(null);
    const [selectedShippingType, setSelectedShippingType] = useState<ShippingType>('standard');
    const [selectedProductDiscountId, setSelectedProductDiscountId] = useState<number | undefined>();
    const [selectedShippingDiscountId, setSelectedShippingDiscountId] = useState<number | undefined>();
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('cod');
    const [order, setOrder] = useState<Order | null>(null);
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    
    // Cart data từ localStorage
    const [cartData, setCartData] = useState<LocalStorageCartData | null>(null);
    const [cartItems, setCartItems] = useState<CartItem[]>([]);

    // Hàm lấy dữ liệu từ localStorage
    const getCartDataFromLocalStorage = useCallback((): LocalStorageCartData | null => {
        try {
            const effectiveUserId = userId || 'U001';
            const storageKey = `checkout_${effectiveUserId}`;
            const expiryKey = `${storageKey}_expiry`;
            
            // Kiểm tra expiration
            const expiryStr = localStorage.getItem(expiryKey);
            if (expiryStr) {
                const expiryTime = parseInt(expiryStr, 10);
                const currentTime = new Date().getTime();
                
                if (currentTime > expiryTime) {
                    localStorage.removeItem(storageKey);
                    localStorage.removeItem(expiryKey);
                    return null;
                }
            }
            
            const dataStr = localStorage.getItem(storageKey);
            if (!dataStr) return null;
            
            const data = JSON.parse(dataStr) as LocalStorageCartData;
            
            if (!data.userId || !data.products || !Array.isArray(data.products)) {
                throw new Error('Dữ liệu không hợp lệ');
            }
            
            return data;
        } catch (error) {
            console.error('Lỗi khi đọc dữ liệu từ localStorage:', error);
            const effectiveUserId = userId || 'U001';
            localStorage.removeItem(`checkout_${effectiveUserId}`);
            localStorage.removeItem(`checkout_${effectiveUserId}_expiry`);
            return null;
        }
    }, [userId]);

    // Hàm xóa dữ liệu checkout khỏi localStorage
    const clearCheckoutDataFromStorage = useCallback(() => {
        const effectiveUserId = userId || 'U001';
        const storageKey = `checkout_${effectiveUserId}`;
        const expiryKey = `${storageKey}_expiry`;
        localStorage.removeItem(storageKey);
        localStorage.removeItem(expiryKey);
        console.log('Đã xóa checkout data từ localStorage');
    }, [userId]);

    // Hàm chuyển đổi CheckoutProduct thành CartItem với productDetailtId thực tế
    const convertToCartItems = useCallback((products: LocalStorageCartData['products']): CartItem[] => {
        return products.map(product => {
            const productDetail = sampleProducts
                .find(p => p.product.id === product.productId)
                ?.details.find(d => d.productType === product.productType) ||
                sampleProducts.find(p => p.product.id === product.productId)?.details[0];
            
            return {
                id: product.id,
                cartId: 1,
                productId: product.productId,
                productDetailtId: productDetail?.id || 0,
                quantity: product.quantity,
                priceAtTime: product.priceAtTime,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
        });
    }, []);

    // Hàm lấy order_id mới = max id của Order + 1
    const getNextOrderId = (): number => {
        if (sampleOrders.length === 0) return 1;
        const maxId = Math.max(...sampleOrders.map(order => order.id));
        return maxId + 1;
    };

    // Hàm lấy order item id mới = max id của OrderItem + 1
    const getNextOrderItemIds = (count: number): number[] => {
        if (sampleOrderItems.length === 0) {
            return Array.from({ length: count }, (_, i) => i + 1);
        }
        const maxId = Math.max(...sampleOrderItems.map(item => item.id));
        return Array.from({ length: count }, (_, i) => maxId + i + 1);
    };

    // Hàm chuyển đổi CheckoutProduct thành OrderItem
    const convertToOrderItems = (
        products: LocalStorageCartData['products'], 
        orderId: number
    ): OrderItem[] => {
        const orderItemIds = getNextOrderItemIds(products.length);
        
        return products.map((product, index) => {
            // Map productType từ CheckoutProduct sang OrderProductType
            const getOrderProductType = (productType: string): OrderProductType => {
                const lowerType = productType.toLowerCase();
                if (lowerType.includes("điện tử") || lowerType.includes("ebook")) {
                    return "Sách điện tử";
                }
                return "Sách giấy";
            };
            
            // Lấy product_details_id từ sampleProducts
            const getProductDetailsId = (productId: number, productType: string): number => {
                const product = sampleProducts.find(p => p.product.id === productId);
                if (!product || product.details.length === 0) return 0;
                
                const matchedDetail = product.details.find(detail => 
                    detail.productType.toLowerCase().includes(productType.toLowerCase()) ||
                    productType.toLowerCase().includes(detail.productType.toLowerCase())
                );
                
                return matchedDetail?.id || product.details[0].id;
            };
            
            const productType = getOrderProductType(product.productType);
            const productDetailsId = getProductDetailsId(product.productId, product.productType);
            
            return {
                id: orderItemIds[index],
                order_id: orderId,
                product_id: product.productId,
                product_details_id: productDetailsId,
                product_type: productType,
                quantity: product.quantity,
                price: product.priceAtTime,
                total_price: product.priceAtTime * product.quantity,
                created_at: new Date().toISOString()
            };
        });
    };

    // Tạo order code
    const generateOrderCode = useMemo(() => {
        return (orderId: number): string => {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            return `ORD-${year}${month}${day}-${String(orderId).padStart(4, '0')}`;
        };
    }, []);

    // Load dữ liệu từ localStorage khi component mount
    useEffect(() => {
        setIsLoading(true);
        setErrorMessage(null);
        
        const loadCartData = () => {
            const data = getCartDataFromLocalStorage();
            
            if (!data) {
                setErrorMessage('Không tìm thấy dữ liệu giỏ hàng...');
                setIsLoading(false);
                return;
            }
            
            if (data.products.length === 0) {
                setErrorMessage('Giỏ hàng của bạn đang trống.');
                setIsLoading(false);
                return;
            }
            
            setCartData(data);
            setCartItems(convertToCartItems(data.products));
            setIsLoading(false);
        };
        
        const timer = setTimeout(() => {
            loadCartData();
        }, 300);
        
        return () => clearTimeout(timer);
    }, [userId, getCartDataFromLocalStorage, convertToCartItems, setIsLoading, setErrorMessage]);

    useEffect(() => {
        return () => {
            if (currentStep === 5 && order) {
                clearCheckoutDataFromStorage();
            }
        };
    }, [currentStep, order, clearCheckoutDataFromStorage]);

    // Thêm useEffect để tự động chọn địa chỉ mặc định khi có cartData
    useEffect(() => {
        if (cartData && !selectedAddress) {
            // Lấy userId từ cartData
            const effectiveUserId = cartData.userId;
            
            // Lọc địa chỉ của user và tìm địa chỉ mặc định
            const userAddresses = sampleAddresses
                .filter(address => address.userId === effectiveUserId)
                .map(getAddressFull);
            
            const defaultAddress = userAddresses.find(address => address.isDefault);
            
            if (defaultAddress) {
                setSelectedAddress(defaultAddress);
                console.log('Đã tự động chọn địa chỉ mặc định:', defaultAddress);
            } else if (userAddresses.length > 0) {
                // Nếu không có địa chỉ mặc định, chọn địa chỉ đầu tiên
                setSelectedAddress(userAddresses[0]);
                console.log('Đã chọn địa chỉ đầu tiên:', userAddresses[0]);
            }
        }
    }, [cartData, selectedAddress]);

    // Debug shipping type changes
    useEffect(() => {
        console.log('Shipping type changed to:', selectedShippingType);
        console.log('Calculated shipping fee:', calculateShippingFee());
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedShippingType]);

    // Các hàm tính phí giống như trong ShippingStep
    const calculateWeightFee = (weight: number): number => {
        const weightFee = sampleWeightFees.find(
            fee => weight >= fee.min_weight && weight < fee.max_weight
        );
        return weightFee ? weightFee.multiplier : 1;
    };

    const calculateDistanceFee = (distance: number): number => {
        const distanceFee = sampleDistanceFees.find(
            fee => distance >= fee.min_distance && distance < fee.max_distance
        );
        return distanceFee ? distanceFee.multiplier : 1;
    };

    // Tính tổng trọng lượng từ cart data
    const calculateTotalWeight = (): number => {
        if (!cartData) return 1.5; // Default
        return cartData.products.length * 0.5; // Mỗi sản phẩm 0.5kg
    };

    // Tính phí vận chuyển dựa trên loại đã chọn
    const calculateShippingFee = (): number => {
        const baseFee = 20000; // Phí cơ sở
        const totalWeight = calculateTotalWeight();
        const distance = 15; // Khoảng cách mặc định 15km
        
        // Tìm hệ số cho loại vận chuyển đã chọn
        const typeFee = sampleShippingTypeFees.find(
            fee => fee.shipping_type === selectedShippingType
        );
        
        const weightMultiplier = calculateWeightFee(totalWeight);
        const distanceMultiplier = calculateDistanceFee(distance);
        const typeMultiplier = typeFee?.multiplier || 1;
        
        return Math.round(baseFee * weightMultiplier * distanceMultiplier * typeMultiplier);
    };

    // Payment methods với proper type
    const paymentMethods: Array<{
        id: PaymentMethod;
        name: string;
        icon: string;
        description: string;
    }> = [
        { 
            id: 'cod', 
            name: 'Thanh toán khi nhận hàng', 
            icon: 'bi-cash', 
            description: 'Trả tiền khi nhận được hàng' 
        },
        { 
            id: 'momo', 
            name: 'Ví MoMo', 
            icon: 'bi-wallet2', 
            description: 'Thanh toán qua ví điện tử MoMo' 
        },
        { 
            id: 'bank_transfer', 
            name: 'Chuyển khoản ngân hàng', 
            icon: 'bi-bank', 
            description: 'Chuyển khoản qua ngân hàng' 
        },
        { 
            id: 'credit_card', 
            name: 'Thẻ tín dụng', 
            icon: 'bi-credit-card-2-front', 
            description: 'Thanh toán bằng thẻ Visa/Mastercard' 
        }
    ];
    
    // Checkout steps
    const steps = [
        { id: 1, label: 'Địa chỉ', icon: 'bi-geo-alt' },
        { id: 2, label: 'Vận chuyển', icon: 'bi-truck' },
        { id: 3, label: 'Giảm giá', icon: 'bi-tag' },
        { id: 4, label: 'Thanh toán', icon: 'bi-credit-card' },
        { id: 5, label: 'Xác nhận', icon: 'bi-check-circle' }
    ];
    
    // Navigation handlers
    const handleNext = () => {
        if (currentStep < 5) {
            setCurrentStep(currentStep + 1);
        }
    };
    
    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };
    
    const handlePlaceOrder = () => {
        if (!cartData) {
            alert('Không có dữ liệu giỏ hàng. Vui lòng quay lại giỏ hàng.');
            return;
        }
        
        if (!selectedAddress) {
            alert('Vui lòng chọn địa chỉ giao hàng.');
            return;
        }
        
        // 1. Lấy order_id mới
        const nextOrderId = getNextOrderId();
        
        // 2. Chuyển đổi thành OrderItems
        const newOrderItems = convertToOrderItems(cartData.products, nextOrderId);
        
        // 3. Tính toán các giá trị
        const subtotal = cartData.totalPrice;
        const shippingFee = calculateShippingFee();
        const discount = calculateTotalDiscount();
        const totalAmount = subtotal + shippingFee - discount;
        
        // 4. Tạo order mới
        const newOrder: Order = {
            id: nextOrderId,
            user_id: cartData.userId,
            order_code: generateOrderCode(nextOrderId),
            status: 'pending' as OrderStatus,
            subtotal,
            shipping_fee: shippingFee,
            discount,
            total_amount: totalAmount,
            shipping_address_id: selectedAddress.id,
            payment_method: selectedPaymentMethod,
            payment_status: selectedPaymentMethod === 'cod' ? 'unpaid' : 'paid' as PaymentStatus,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        console.log('Order created:', newOrder);
        console.log('Order items:', newOrderItems);
        
        // 5. Lưu vào localStorage để phòng trường hợp refresh trang
        try {
            const orderData = {
                order: newOrder,
                orderItems: newOrderItems,
                address: selectedAddress,
                createdTime: new Date().getTime()
            };
            
            localStorage.setItem(`order_${newOrder.order_code}`, JSON.stringify(orderData));
            localStorage.setItem(`last_order_user_${cartData.userId}`, newOrder.order_code);
            
            console.log('Đã lưu order vào localStorage:', newOrder.order_code);
        } catch (error) {
            console.error('Lỗi khi lưu order vào localStorage:', error);
        }
        
        // 6. Cập nhật state
        setOrder(newOrder);
        setOrderItems(newOrderItems);
        
        // 7. Xóa dữ liệu checkout khỏi localStorage
        clearCheckoutDataFromStorage();
        
        // 8. Chuyển sang step xác nhận
        setCurrentStep(5);
    };

    // Hàm hủy thanh toán
    const handleCancelCheckout = () => {
        clearCheckoutDataFromStorage();
        navigate(`/gio-hang/${userId || 'U001'}`);
    };
    
    // Tính tổng discount
    const calculateTotalDiscount = (): number => {
        let total = 0;
        
        if (selectedProductDiscountId) {
            const discount = sampleOrderProductDiscounts.find(d => d.id === selectedProductDiscountId);
            if (discount) total += discount.amount;
        }
        
        if (selectedShippingDiscountId) {
            const discount = sampleOrderShippingDiscounts.find(d => d.id === selectedShippingDiscountId);
            if (discount) total += discount.amount;
        }
        
        return total;
    };
    
    // Discount handlers
    const handleSelectProductDiscount = (discount: OrderProductDiscount | null) => {
        setSelectedProductDiscountId(discount?.id);
    };
    
    const handleSelectShippingDiscount = (discount: OrderShippingDiscount | null) => {
        setSelectedShippingDiscountId(discount?.id);
    };
    
    // Check if can proceed to next step
    const isNextDisabled = (): boolean => {
        switch(currentStep) {
            case 1: return !selectedAddress;
            case 2: return !selectedShippingType;
            case 3: return false; // Discount là optional
            case 4: return !selectedPaymentMethod;
            default: return false;
        }
    };
    
    // Tính subtotal từ cart data
    const calculateSubtotal = (): number => {
        if (!cartData) return 0;
        return cartData.totalPrice;
    };
    
    // Tính total cho sidebar
    const calculateSidebarTotal = (): number => {
        return calculateSubtotal() + calculateShippingFee() - calculateTotalDiscount();
    };

    // Render current step
    const renderStep = () => {
        switch(currentStep) {
            case 1:
                return (
                    <AddressSelector
                        userId={cartData?.userId || userId || 'U001'}
                        selectedAddressId={selectedAddress?.id}
                        onSelectAddress={setSelectedAddress}
                    />
                );
                
            case 2:
                return (
                    <ShippingStep
                        selectedShippingType={selectedShippingType}
                        onSelect={setSelectedShippingType}
                        totalWeight={calculateTotalWeight()}
                        distance={15}
                        baseFee={20000}
                    />
                );
                
            case 3:
                return (
                    <DiscountSelector
                        productDiscounts={sampleOrderProductDiscounts}
                        shippingDiscounts={sampleOrderShippingDiscounts}
                        selectedProductDiscountId={selectedProductDiscountId}
                        selectedShippingDiscountId={selectedShippingDiscountId}
                        onSelectProductDiscount={handleSelectProductDiscount}
                        onSelectShippingDiscount={handleSelectShippingDiscount}
                    />
                );
                
            case 4:
                return (
                    <PaymentStep
                        paymentMethods={paymentMethods}
                        selectedPaymentMethod={selectedPaymentMethod}
                        onPaymentMethodSelect={setSelectedPaymentMethod}
                    />
                );
                
            case 5:
                return order && selectedAddress ? (
                    <OrderConfirmation
                        order={order}
                        address={selectedAddress}
                        orderItems={orderItems}
                    />
                ) : (
                    <div className="checkout-confirmation-empty">
                        <i className="bi bi-exclamation-circle checkout-confirmation-icon"></i>
                        <p>Không thể hiển thị xác nhận đơn hàng</p>
                    </div>
                );
                
            default:
                return <div className="text-center p-8">Step không hợp lệ</div>;
        }
    };
    
    // Hiển thị loading
    if (isLoading) {
        return (
            <div className="checkout-loading">
                <div className="text-center">
                    <div className="checkout-loading-spinner"></div>
                    <p className="checkout-loading-text">Đang tải dữ liệu giỏ hàng...</p>
                </div>
            </div>
        );
    }

    // Hiển thị error nếu có
    if (errorMessage || !cartData) {
        return (
            <div className="checkout-error-container">
                <div className="checkout-error-content">
                    <div className="checkout-error-card">
                        <i className="bi bi-exclamation-triangle checkout-error-icon"></i>
                        <h2 className="checkout-error-title">
                            {errorMessage || 'Không tìm thấy dữ liệu giỏ hàng'}
                        </h2>
                        <p className="checkout-error-message">
                            Phiên thanh toán của bạn đã hết hạn hoặc chưa được khởi tạo.
                        </p>
                        <div className="checkout-error-actions">
                            <button 
                                onClick={() => navigate(`/gio-hang/${userId || 'U001'}`)}
                                className="checkout-error-button-primary"
                            >
                                <i className="bi bi-cart"></i>
                                Quay lại giỏ hàng
                            </button>
                            <button 
                                onClick={() => navigate('/')}
                                className="checkout-error-button-secondary"
                            >
                                <i className="bi bi-house"></i>
                                Về trang chủ
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Hiển thị thông báo nếu giỏ hàng trống
    if (cartData.products.length === 0) {
        return (
            <div className="checkout-empty-container">
                <div className="checkout-empty-content">
                    <div className="checkout-empty-card">
                        <i className="bi bi-cart-x checkout-empty-icon"></i>
                        <h2 className="checkout-empty-title">Giỏ hàng trống</h2>
                        <p className="checkout-empty-message">Bạn chưa có sản phẩm nào để thanh toán.</p>
                        <button 
                            onClick={() => navigate(`/gio-hang/${cartData.userId}`)}
                            className="checkout-empty-button"
                        >
                            Quay lại giỏ hàng
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <div className="checkout-container">
            <div className="checkout-content">
                {/* Header */}
                <div className="checkout-header">
                    <div className="checkout-header-content">
                        <h1 className="checkout-title">Thanh toán</h1>
                        <p className="checkout-subtitle">Hoàn tất đơn hàng của bạn</p>
                        {cartData && (
                            <div className="checkout-cart-info">
                                <span className="checkout-cart-badge">
                                    {cartData.totalQuantity} sản phẩm • {cartData.totalPrice.toLocaleString('vi-VN')}₫
                                </span>
                                <span className="checkout-save-note">
                                    (Dữ liệu được lưu tự động)
                                </span>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Checkout Steps */}
                <div className="checkout-steps-container">
                    <CheckoutSteps 
                        currentStep={currentStep}
                        steps={steps}
                    />
                </div>

                {/* Navigation */}
                {currentStep < 5 && (
                    <div className="checkout-navigation-container">
                        <CheckoutNavigation
                            currentStep={currentStep}
                            onPrevious={handlePrevious}
                            onNext={handleNext}
                            onPlaceOrder={handlePlaceOrder}
                            isNextDisabled={isNextDisabled()}
                            onCancel={handleCancelCheckout}
                        />
                    </div>
                )}
                
                <div>
                    {/* Main Content */}
                    <div className="checkout-main-content">
                        {renderStep()}
                    </div>
                    
                    {/* Sidebar */}
                    <div className="checkout-sidebar">
                        {/* Cart Summary */}
                        <div className="checkout-sidebar-card">
                            <CartSummaryStep 
                                cartItems={cartItems}
                                products={sampleProducts}
                                cartDataFromStorage={cartData}
                            />
                        </div>
                        
                        <div className="d-flex gap-3">
                            {/* Order Summary - Chỉ hiển thị khi chưa đến step confirmation */}
                            {currentStep < 5 && (
                                <div className="checkout-sidebar-card flex-grow-1">
                                    <div className="checkout-order-summary">
                                        <h3 className="checkout-order-summary-title">Tóm tắt đơn hàng</h3>
                                    </div>
                                    <div className="checkout-order-details">
                                        <div className="checkout-order-row">
                                            <span className="checkout-order-label">Tạm tính:</span>
                                            <span className="checkout-order-value">{calculateSubtotal().toLocaleString('vi-VN')}₫</span>
                                        </div>
                                        
                                        <div className="checkout-order-row">
                                            <span className="checkout-order-label">Giảm giá:</span>
                                            <span className="checkout-discount-value">-{calculateTotalDiscount().toLocaleString('vi-VN')}₫</span>
                                        </div>

                                        <div className="checkout-order-row">
                                            <span className="checkout-order-label">
                                                Phí vận chuyển ({selectedShippingType === 'standard' ? 'Tiêu chuẩn' : 'Nhanh'}):
                                            </span>
                                            <span className="checkout-order-value">{calculateShippingFee().toLocaleString('vi-VN')}₫</span>
                                        </div>

                                        <div className="checkout-divider">
                                            <div className="checkout-total-row">
                                                <span className="checkout-total-label">Tổng cộng:</span>
                                                <span className="checkout-total-value">{calculateSidebarTotal().toLocaleString('vi-VN')}₫</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {/* Selected Address Preview */}
                            {selectedAddress && currentStep > 1 && currentStep < 5 && (
                                <div className="checkout-address-preview flex-grow-1">
                                    <h3 className="checkout-address-title">Địa chỉ giao hàng</h3>
                                    <div className="checkout-address-details">
                                        <div className="checkout-address-name">{selectedAddress.receiverName}</div>
                                        <div className="checkout-address-phone">{selectedAddress.phone}</div>
                                        <div className="checkout-address-street">{selectedAddress.streetAddress}</div>
                                        {selectedAddress.commune?.name && selectedAddress.province?.name && (
                                            <div className="checkout-address-location">
                                                {selectedAddress.commune.name}, {selectedAddress.province.name}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                
            </div>
        </div>
    );
};

export default CheckoutPage;