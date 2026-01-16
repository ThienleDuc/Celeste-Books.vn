// ./pages/CheckoutPage.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { checkoutApi } from '../../api/checkout.api';
import type { CreateOrderRequest, CreateOrderItem, CheckoutProduct } from '../../api/checkout.api';



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

interface AddressSelectorProps {
    userId: string;
    selectedAddressId: number | undefined;
    onSelectAddress: (address: AddressFull | null) => void;
    addresses: AddressFull[];
    onAddressAdded: () => void; // Thêm prop này để trigger reload dữ liệu
  }

interface LocalStorageCartData {
    userId: string;
    products: any[];
    totalPrice: number;
    totalQuantity: number;
    timestamp: string;
    checkoutType: 'cart' | 'buy_now';
}
// import type { LocalStorageCartData } from '../../models/Checkout/checkout.model';
import { sampleAddresses, getAddressFull } from '../../models/User/address.model';


const CheckoutPage: React.FC = () => {
    const [addresses, setAddresses] = useState<AddressFull[]>([]);
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [productDiscounts, setProductDiscounts] = useState<OrderProductDiscount[]>([]);
    const [shippingDiscounts, setShippingDiscounts] = useState<OrderShippingDiscount[]>([]);
    const [shippingFeeConfig, setShippingFeeConfig] = useState<any>(null);
    const [showAddAddressForm, setShowAddAddressForm] = useState(false);
    const [isSubmittingAddress, setIsSubmittingAddress] = useState(false);
    const [newAddressData, setNewAddressData] = useState({
        receiver_name: '',
        phone: '',
        street_address: '',
        commune_id: null as number | null, // Nếu bạn có chọn xã phường
        is_default: false
    });
    
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

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const checkoutTypeFromUrl = queryParams.get('checkoutType');
    const urlAmount = parseFloat(queryParams.get('amount') || '0');

    // Hàm lấy dữ liệu từ localStorage
    const getCartDataFromLocalStorage = useCallback((): LocalStorageCartData | null => {
        try {
            const effectiveUserId = String(userId || 'A01');
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


    const handleAddAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId) return;
    
        setIsSubmittingAddress(true);
        try {
            const payload = {
                ...newAddressData,
                // Đảm bảo phone là string 10 số theo validate của Laravel
                phone: newAddressData.phone.replace(/\D/g, '') 
            };
    
            const response = await checkoutApi.addAddress(userId, payload);
    
            if (response.data.success) {
                // 1. Cập nhật lại danh sách địa chỉ từ server (để lấy đầy đủ full_address)
                const addressRes = await checkoutApi.getUserAddresses(userId);
                const updatedAddresses = addressRes.data?.data || [];
                setAddresses(updatedAddresses);
    
                // 2. Tự động chọn địa chỉ vừa mới thêm
                const newlyCreated = response.data.data;
                setSelectedAddress(newlyCreated);
    
                // 3. Đóng form và reset data
                setShowAddAddressForm(false);
                setNewAddressData({
                    receiver_name: '',
                    phone: '',
                    street_address: '',
                    commune_id: null,
                    is_default: false
                });
                
                alert("Thêm địa chỉ thành công!");
            }
        } catch (error: any) {
            console.error("Lỗi thêm địa chỉ:", error);
            alert(error.response?.data?.message || "Không thể thêm địa chỉ. Vui lòng kiểm tra lại.");
        } finally {
            setIsSubmittingAddress(false);
        }
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
    const loadCartData = async () => {
        const data = getCartDataFromLocalStorage();
        if (!data) return;
    
        setCartData(data);
    
        try {
            const productIds = data.products.map(p => p.productId);
            const response = await checkoutApi.getProductsDetails(productIds);
            
            if (response.data && response.data.success) {
                const serverItems = response.data.data; // Giả sử API trả về mảng chi tiết sản phẩm
    
                // 1. Lọc trùng nếu server trả về nhiều danh mục cho 1 sản phẩm
                const uniqueItems = serverItems.reduce((acc: any[], current: any) => {
                    const isExist = acc.find((item: any) => item.product_id === current.product_id);
                    if (!isExist) return acc.concat([current]);
                    return acc;
                }, []);
    
                // 2. Cập nhật state để hiển thị lên giao diện
                setCartItems(uniqueItems);
                
                // 3. Cập nhật lại tổng tiền dựa trên giá thực tế từ server
                const newTotal = uniqueItems.reduce((sum: number, item: any) => sum + (parseFloat(item.sale_price) * item.quantity), 0);
                
                setCartData(prev => prev ? {
                    ...prev,
                    totalPrice: newTotal,
                    timestamp: Date.now().toString()
                } : null);
            }
        } catch (error) {
            console.error("Không thể load thông tin sản phẩm từ server", error);
        }
    };
    useEffect(() => {
        return () => {
            if (currentStep === 5 && order) {
                clearCheckoutDataFromStorage();
            }
        };
    }, [currentStep, order, clearCheckoutDataFromStorage]);


// 1. Sửa đoạn load địa chỉ và phân luồng checkout type (dòng 263-316)
useEffect(() => {
    const loadInitialData = async () => {
        setIsLoading(true);
        // Reset state cũ để tránh lặp dữ liệu khi chuyển mode
        setCartItems([]); 
        
        try {
            const effectiveUserId = String(userId || 'C01');
            const queryParams = new URLSearchParams(location.search);
            
            const currentCheckoutType = queryParams.get('checkoutType') || 'cart';

            // 1. Lấy địa chỉ
            const addressRes = await checkoutApi.getUserAddresses(effectiveUserId);
            const addrList = addressRes.data?.data || [];
            
            // Chuyển đổi API response sang AddressFull format
            const convertedAddresses: AddressFull[] = addrList.map((addr: any) => ({
                id: addr.id,
                userId: addr.user_id,
                receiverName: addr.receiver_name,
                phone: addr.phone,
                streetAddress: addr.street_address,
                communeId: addr.commune_id,
                districtId: addr.district_id,
                provinceId: addr.province_id,
                isDefault: addr.is_default === 1,
                fullAddress: addr.full_address || '',
                createdAt: addr.created_at,
                updatedAt: addr.updated_at
            }));
            
            setAddresses(convertedAddresses);
            
            // Tự động chọn địa chỉ mặc định hoặc đầu tiên
            const defaultAddress = convertedAddresses.find(a => a.isDefault) || convertedAddresses[0];
            setSelectedAddress(defaultAddress);

            // 2. Xử lý phân luồng
            if (currentCheckoutType === 'buy_now') {
                const latestRes = await checkoutApi.getLatestCartItem(effectiveUserId);
                
                if (latestRes.data?.success && latestRes.data.data) {
                    const item = latestRes.data.data;
                    const mappedItem: any = {
                        id: item.cart_item_id,
                        cartId: 0,
                        productId: item.product_id,
                        productDetailtId: item.product_detail_id,
                        quantity: item.quantity,
                        priceAtTime: Number(item.price_at_time),
                        product_name: item.product_name,
                        primary_image: item.primary_image,
                        product_type: item.product_type,
                        item_total: Number(item.item_total),
                        sale_price: Number(item.price_at_time)
                    };
            
                    setCartItems([mappedItem]); 
                    setCartData({
                        userId: effectiveUserId,
                        checkoutType: 'buy_now',
                        products: [{
                            id: item.cart_item_id,
                            productId: item.product_id,
                            product_detail_id: item.product_detail_id,
                            productType: item.product_type,
                            quantity: item.quantity,
                            priceAtTime: Number(item.price_at_time)
                        }],
                        totalPrice: Number(item.item_total),
                        totalQuantity: item.quantity,
                        timestamp: Date.now().toString()
                    });
                }
            } else {
                // ============ PHẦN SỬA LỖI CHO CHECKOUT TYPE = cart ============
                const cartRes = await checkoutApi.getUserCart(effectiveUserId);

                if (cartRes.data?.success && cartRes.data.data) {
                    const rawItems = cartRes.data.data.items || [];
                    
                    console.log('Cart raw items count:', rawItems.length);
                    
                    // Lọc trùng dựa trên cart_item_id
                    const uniqueItemsMap = new Map();
                    rawItems.forEach((item: any) => {
                        if (item.cart_item_id && !uniqueItemsMap.has(item.cart_item_id)) {
                            uniqueItemsMap.set(item.cart_item_id, {
                                cart_item_id: item.cart_item_id,
                                product_id: item.product_id,
                                product_detail_id: item.product_detail_id,
                                product_type: item.product_type,
                                quantity: Number(item.quantity) || 0,
                                price_at_time: parseFloat(item.price_at_time) || 0,
                                product_name: item.product_name || 'Sản phẩm',
                                primary_image: item.primary_image || '/img/no-image.png',
                                sale_price: parseFloat(item.sale_price) || 0
                            });
                        }
                    });

                    const finalItems = Array.from(uniqueItemsMap.values());
                    
                    console.log('Unique cart items:', finalItems);

                    // Tính toán tổng
                    const totalQty = finalItems.reduce((sum, item) => sum + item.quantity, 0);
                    const totalPrice = finalItems.reduce((sum, item) => {
                        const price = item.price_at_time || item.sale_price || 0;
                        return sum + (price * item.quantity);
                    }, 0);

                    setCartItems(finalItems);
                    setCartData({
                        userId: effectiveUserId,
                        checkoutType: 'cart',
                        products: finalItems.map((item: any) => ({
                            id: item.cart_item_id,
                            productId: item.product_id,
                            product_detail_id: item.product_detail_id,
                            productType: item.product_type,
                            quantity: item.quantity,
                            priceAtTime: item.price_at_time
                        })),
                        totalPrice: totalPrice,
                        totalQuantity: totalQty,
                        timestamp: Date.now().toString()
                    });
                } else {
                    setErrorMessage("Giỏ hàng trống");
                }
            }
        } catch (error) {
            console.error("Lỗi checkout:", error);
            setErrorMessage("Không thể tải dữ liệu.");
        } finally {
            setIsLoading(false);
        }
    };

    loadInitialData();
}, [userId, location.search]); // Thêm checkoutTypeFromUrl vào dependency nếu cần

useEffect(() => {
    const fetchDiscountAndShippingData = async () => {
        try {
            const [prodRes, shipRes, feeRes] = await Promise.all([
                checkoutApi.getProductDiscounts(),
                checkoutApi.getShippingDiscounts(),
                checkoutApi.getShippingFeeDetails()
            ]);

            if (prodRes.data.success) setProductDiscounts(prodRes.data.data);
            if (shipRes.data.success) setShippingDiscounts(shipRes.data.data);
            if (feeRes.data.success) setShippingFeeConfig(feeRes.data.data);
        } catch (error) {
            console.error("Lỗi khi tải cấu hình giảm giá và phí ship:", error);
        }
    };
    fetchDiscountAndShippingData();
}, []);

    // Debug shipping type changes
    useEffect(() => {
        console.log('Shipping type changed to:', selectedShippingType);
        console.log('Calculated shipping fee:', calculateShippingFee());
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedShippingType]);

// Thêm logic này vào bên trong component CheckoutPage

useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const paymentStatus = queryParams.get('payment_status');
    const vnpResponseCode = queryParams.get('vnp_ResponseCode'); // VNPAY trả về mã này
    const orderIdFromUrl = queryParams.get('order_id');

    if ((paymentStatus === 'success' || vnpResponseCode === '00') && orderIdFromUrl) {
        const fetchOrderAfterVnPay = async () => {
            try {
                setIsLoading(true);
                const response = await checkoutApi.getOrderById(Number(orderIdFromUrl));
                if (response.data?.success) {
                    setOrder(response.data.order);
                    setOrderItems(response.data.items);
                    clearCheckoutDataFromStorage();
                    setCurrentStep(5); 
                    window.history.replaceState({}, '', `/thanh-toan/${userId}`);
                }
            } catch (error) {
                console.error("Lỗi đồng bộ đơn hàng VNPAY:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrderAfterVnPay();
    }
}, [location.search, userId]);

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
        const baseFee = 20000;
        
        const totalWeight = calculateTotalWeight();
        const distance = 15; 
        const weightMultiplier = calculateWeightFee(totalWeight); 
        const distanceMultiplier = calculateDistanceFee(distance);
        
        const typeFee = sampleShippingTypeFees.find(f => f.shipping_type === selectedShippingType);
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
            id: 'VnPay', // THÊM MỚI
            name: 'Cổng thanh toán VNPAY', 
            icon: 'bi-qr-code-scan', 
            description: 'Thanh toán qua ứng dụng ngân hàng hoặc thẻ ATM/Quốc tế' 
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
    
    const calculateSidebarTotal = (): number => {
        const subtotal = calculateSubtotal();
        const shipping = calculateShippingFee();
        const discount = calculateTotalDiscount();
        const total = subtotal + shipping - discount;
        
        return Math.max(0, total);
    };

    const handlePlaceOrder = async () => {

        const subtotal = calculateSubtotal();
        const shipping = calculateShippingFee();
        const discount = calculateTotalDiscount();

        const finalTotal = Math.round(subtotal + shipping - discount);

        if (!cartData || !selectedAddress) {
            alert("Vui lòng chọn địa chỉ giao hàng!");
            return;
        }
    
        const exactTotalAmount = calculateSidebarTotal();
    
        console.log("Giá hiển thị tổng cộng:", exactTotalAmount);
    
        const payload: any = {
            user_id: String(userId || 'A01'),
            shipping_address_id: selectedAddress.id,
            payment_method: selectedPaymentMethod.toLowerCase(),
            shipping_type: selectedShippingType,
            product_discount_id: selectedProductDiscountId || null,
            shipping_discount_id: selectedShippingDiscountId || null,
            shipping_fee: shipping,
            discount: discount,
            total_amount: finalTotal, 
            items: cartData.products.map((p: any) => ({
                cart_item_id: p.id,
                product_id: p.productId,
                product_details_id: p.product_detail_id,
                quantity: p.quantity,
                product_type: p.productType,
                price: p.priceAtTime
            }))
        };
    
        try {
            setIsLoading(true);
            const response = await checkoutApi.createOrder(payload);
            
            if (response.data?.success) {
                if (selectedPaymentMethod.toLowerCase() === 'vnpay') {
                    // 3. GỬI ĐÚNG CON SỐ finalTotal SANG VNPAY
                    const vnpayRes = await checkoutApi.createVnpayUrl({
                        order_id: response.data.order.id,
                        amount: finalTotal // Chắc chắn sẽ là 120.800
                    });
                    
                    if (vnpayRes.data?.payment_url) {
                        window.location.href = vnpayRes.data.payment_url;
                        return;
                    }
                }

                // Trường hợp COD (Thanh toán khi nhận hàng)
                clearCheckoutDataFromStorage();
                setOrder(response.data.order);
                setOrderItems(response.data.items);
                setCurrentStep(5);
            }
        } catch (error: any) {
            console.error("Lỗi đặt hàng:", error);
            alert(error.response?.data?.message || "Đặt hàng thất bại!");
        } finally {
            setIsLoading(false);
        }
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
            const discount = productDiscounts.find(d => d.id === selectedProductDiscountId);
            if (discount) total += Number(discount.amount || 0);
        }
        
        if (selectedShippingDiscountId) {
            const discount = shippingDiscounts.find(d => d.id === selectedShippingDiscountId);
            if (discount) total += Number(discount.amount || 0);
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
    
    

    const calculateSubtotal = (): number => {
        // Ưu tiên cartItems từ API
        if (cartItems && cartItems.length > 0) {
            return cartItems.reduce((sum: number, item: any) => {
                const price = parseFloat(item.price_at_time || item.sale_price || 0);
                const quantity = Number(item.quantity || 0);
                return sum + (price * quantity);
            }, 0);
        }

    // Nếu không có, lấy từ cartData storage
    if (cartData && cartData.products) {
        return cartData.products.reduce((sum: number, item: any) => {
            const price = parseFloat(item.priceAtTime || item.price_at_time || 0);
            const quantity = Number(item.quantity || 0);
            return sum + (price * quantity);
        }, 0);
    }

    return 0;
};


    // Render current step
    const renderStep = () => {
        switch(currentStep) {
            case 1:
                return (
                    <div className="checkout-address-step">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="fw-bold m-0">Địa chỉ nhận hàng</h5>
                            <button 
                                className="btn btn-outline-primary btn-sm"
                                onClick={() => setShowAddAddressForm(true)}
                            >
                                <i className="bi bi-plus-lg"></i> Thêm địa chỉ mới
                            </button>
                        </div>
            
                        <AddressSelector
                            userId={String(userId || 'A01')}
                            selectedAddressId={Number(selectedAddress?.id)}
                            onSelectAddress={setSelectedAddress}
                            addresses={addresses}
                        />
            
                        {/* Modal Form Thêm Địa Chỉ Mới */}
                        {showAddAddressForm && (
                            <div className="address-modal-overlay">
                                <div className="address-modal-content">
                                    <div className="modal-header border-bottom pb-3 d-flex justify-content-between">
                                        <h5 className="modal-title fw-bold">Thêm địa chỉ mới</h5>
                                        <button type="button" className="btn-close" onClick={() => setShowAddAddressForm(false)}></button>
                                    </div>
                                    
                                    <form onSubmit={handleAddAddress} className="pt-4">
                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <label className="form-label small fw-bold">Tên người nhận</label>
                                                <input 
                                                    type="text" className="form-control" required placeholder="VD: Nguyễn Văn A"
                                                    value={newAddressData.receiver_name}
                                                    onChange={e => setNewAddressData({...newAddressData, receiver_name: e.target.value})}
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label small fw-bold">Số điện thoại</label>
                                                <input 
                                                    type="tel" className="form-control" required placeholder="10 chữ số"
                                                    value={newAddressData.phone}
                                                    onChange={e => setNewAddressData({...newAddressData, phone: e.target.value})}
                                                />
                                            </div>
                                            <div className="col-12">
                                                <label className="form-label small fw-bold">Địa chỉ chi tiết (Số nhà, tên đường)</label>
                                                <textarea 
                                                    className="form-control" rows={3} required
                                                    value={newAddressData.street_address}
                                                    onChange={e => setNewAddressData({...newAddressData, street_address: e.target.value})}
                                                ></textarea>
                                            </div>
                                            <div className="col-12">
                                                <div className="form-check">
                                                    <input 
                                                        className="form-check-input" type="checkbox" id="defaultAddr"
                                                        checked={newAddressData.is_default}
                                                        onChange={e => setNewAddressData({...newAddressData, is_default: e.target.checked})}
                                                    />
                                                    <label className="form-check-label small" htmlFor="defaultAddr">
                                                        Đặt làm địa chỉ mặc định
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
            
                                        <div className="modal-footer border-top mt-4 pt-3 d-flex gap-2 justify-content-end">
                                            <button type="button" className="btn btn-light" onClick={() => setShowAddAddressForm(false)}>Hủy</button>
                                            <button type="submit" className="btn btn-primary" disabled={isSubmittingAddress}>
                                                {isSubmittingAddress ? 'Đang lưu...' : 'Lưu địa chỉ'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                );
                return (
                    <AddressSelector
                    userId={String(userId || 'A01')} // Đảm bảo truyền string
                    selectedAddressId={Number(selectedAddress?.id)} // Đảm bảo truyền number cho ID địa chỉ
                    onSelectAddress={setSelectedAddress}
                    addresses={addresses}
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
                            productDiscounts={productDiscounts} // Dữ liệu thật từ state
                            shippingDiscounts={shippingDiscounts} // Dữ liệu thật từ state
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
                                        {/* Dùng toán tử OR để handle cả 2 trường hợp tên trường */}
                                        <div className="checkout-address-name">
                                            {(selectedAddress as any).receiver_name || selectedAddress.receiverName}
                                        </div>
                                        <div className="checkout-address-phone">
                                            {selectedAddress.phone}
                                        </div>
                                        <div className="checkout-address-street">
                                            {(selectedAddress as any).street_address || selectedAddress.streetAddress}
                                        </div>
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