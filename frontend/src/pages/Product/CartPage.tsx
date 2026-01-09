import {useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useParams, useNavigate } from "react-router-dom";
import { Breadcrumbs, Link, Typography, CircularProgress, Alert } from "@mui/material";
import QuantitySelector from "../../components/Utils/QuantitySelector";
import axios from "axios"; // Cần cài đặt axios

// --- 1. ĐỊNH NGHĨA INTERFACE DỰA TRÊN DỮ LIỆU BACKEND ---
interface ProductImage {
  id: number;
  image_url: string;
  is_primary: number;
}

interface Product {
  id: number;
  name: string;
  images: ProductImage[];
}

interface ProductDetail {
  id: number;
  stock: number;
  product_type: string;
}

interface CartItemData {
  id: number;
  cart_id: number;
  product_id: number;
  product_details_id: number;
  quantity: number;
  price_at_time: number; // Mapping từ decimal trong DB
  product?: Product; // Eager loaded từ Laravel
  product_detail?: ProductDetail; // Eager loaded từ Laravel
}

// interface CartResponse {
//   id: number;
//   user_id: string;
//   items: CartItemData[];
// }

const CartPage = () => {
  const { userId } = useParams<{ userId: string }>();
  // Mặc định user ID nếu chưa đăng nhập (nên lấy từ Context Auth thực tế)
  const effectiveUserId = userId || "C01"; 
  const navigate = useNavigate();

  // --- STATES ---
  const [cartItems, setCartItems] = useState<CartItemData[]>([]);
  const [checkedMap, setCheckedMap] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- 2. GỌI API LẤY GIỎ HÀNG ---
  const fetchCart = async () => {
    try {
      setLoading(true);
      // Giả sử API chạy ở localhost:8000
      const response = await axios.get(`http://localhost:8000/api/shopping-carts/${effectiveUserId}`);
      
      if (response.data.success && response.data.data) {
        const items: CartItemData[] = response.data.data.items || [];
        setCartItems(items);
        
        // Init checkbox state
        const initChecked: Record<number, boolean> = {};
        items.forEach(item => {
           // Giữ nguyên trạng thái check nếu đã có, nếu chưa thì mặc định true
           if (checkedMap[item.id] === undefined) {
             initChecked[item.id] = true;
           } else {
             initChecked[item.id] = checkedMap[item.id];
           }
        });
        setCheckedMap(prev => ({ ...prev, ...initChecked }));
      } else {
        setCartItems([]);
      }
    } catch (err) {
      console.error("Lỗi tải giỏ hàng:", err);
      // Nếu lỗi 404 hoặc giỏ hàng trống thì set rỗng
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [effectiveUserId]);

  // --- HELPERS HIỂN THỊ DỮ LIỆU ---
  const getProductImage = (item: CartItemData) => {
    if (!item.product?.images?.length) return "/img/no-image.png";
    // Tìm ảnh chính (is_primary = 1), nếu không có lấy ảnh đầu tiên
    const img = item.product.images.find(i => i.is_primary === 1) || item.product.images[0];
    return img.image_url;
  };

  // --- 3. GỌI API UPDATE SỐ LƯỢNG ---
  const updateQuantity = async (itemId: number, newQty: number) => {
    if (newQty < 1) return;
    try {
      await axios.put(`http://localhost:8000/api/shopping-carts/item/${itemId}`, {
        quantity: newQty
      });
      
      // Cập nhật state local ngay lập tức để UI mượt mà
      setCartItems(prev => prev.map(item => 
        item.id === itemId ? { ...item, quantity: newQty } : item
      ));
    } catch (err: any) {
      // Nếu lỗi (ví dụ vượt quá tồn kho), hiển thị thông báo
      const msg = err.response?.data?.message || "Lỗi cập nhật số lượng";
      alert(msg);
    }
  };

  // --- 4. GỌI API XÓA SẢN PHẨM ---
  const removeItem = async (itemId: number) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa sản phẩm này?")) return;
    try {
      await axios.delete(`http://localhost:8000/api/shopping-carts/item/${itemId}`);
      
      setCartItems(prev => prev.filter(item => item.id !== itemId));
      setCheckedMap(prev => {
        const next = { ...prev };
        delete next[itemId];
        return next;
      });
    } catch (err) {
      alert("Lỗi khi xóa sản phẩm");
    }
  };

  // --- LOGIC CHECKBOX & TÍNH TOÁN ---
  const toggleAll = (checked: boolean) => {
    const next: Record<number, boolean> = {};
    cartItems.forEach((item) => {
      next[item.id] = checked;
    });
    setCheckedMap(next);
  };

  const toggleItemChecked = (itemId: number) => {
    setCheckedMap((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const selectedItems = cartItems.filter((i) => checkedMap[i.id]);

  const totalQuantity = selectedItems.reduce(
    (sum, i) => sum + i.quantity,
    0
  );

  const totalPrice = selectedItems.reduce(
    (sum, i) => sum + Number(i.price_at_time) * i.quantity,
    0
  );

  // --- HANDLE CHECKOUT ---
  const handleCheckout = () => {
    if (selectedItems.length === 0) return;

    // Mapping dữ liệu sang format Checkout
    const checkoutProducts = selectedItems.map(item => ({
      id: item.id, // Cart Item ID
      productId: item.product_id,
      quantity: item.quantity,
      priceAtTime: Number(item.price_at_time),
      name: item.product?.name || "Sản phẩm",
      image: getProductImage(item),
      productType: item.product_detail?.product_type || "N/A",
    }));

    const checkoutData = {
      userId: effectiveUserId,
      products: checkoutProducts,
      totalQuantity,
      totalPrice,
      timestamp: new Date().toISOString()
    };

    // Lưu localStorage và Navigate (Giữ nguyên logic cũ của bạn)
    const storageKey = `checkout_${effectiveUserId}`;
    localStorage.setItem(storageKey, JSON.stringify(checkoutData));
    
    navigate(`/thanh-toan/${effectiveUserId}`, {
      state: checkoutData
    });
  };

  if (loading) return <div className="text-center mt-5"><CircularProgress /></div>;

  return (
    <div className="container mt-4">
      <Helmet>
        <title>Giỏ hàng - Celeste Books</title>
      </Helmet>
      
      <Breadcrumbs className="mb-2">
        <Link underline="hover" color="inherit" href="/">Trang chủ</Link>
        <Typography color="text.primary">Giỏ hàng</Typography>
      </Breadcrumbs>
      
      <h5 className="h3 fw-bold mb-4 title-section">Giỏ hàng ({cartItems.length})</h5>

      {cartItems.length === 0 ? (
        <Alert severity="info">Giỏ hàng của bạn đang trống. Hãy đi mua sắm nào!</Alert>
      ) : (
        <>
          {/* ... PHẦN HEADER BẢNG GIỮ NGUYÊN ... */}
          <div className="card mb-3">
             {/* Header UI Code giữ nguyên như cũ, chỉ thay đổi logic checkbox */}
             <div className="card-body p-3">
              <div className="d-flex gap-2 bg-light p-2 fw-bold">
                <div className="d-flex align-items-center" style={{ width: "5%" }}>
                  <input
                    type="checkbox"
                    checked={cartItems.length > 0 && cartItems.every((i) => checkedMap[i.id])}
                    onChange={(e) => toggleAll(e.target.checked)}
                  />
                </div>
                <div style={{ width: "40%" }}>Sản phẩm</div>
                <div className="text-end" style={{ width: "15%" }}>Đơn giá</div>
                <div className="text-center" style={{ width: "15%" }}>Số lượng</div>
                <div className="text-end" style={{ width: "15%" }}>Thành tiền</div>
                <div className="text-center" style={{ width: "10%" }}>Xóa</div>
              </div>
             </div>
          </div>
          
          <div className="card mb-3">
            <div className="card-body p-3">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="d-flex align-items-center border-top p-2 gap-2"
                  style={{ cursor: "pointer" }}
                  onClick={() => toggleItemChecked(item.id)}
                >
                  {/* Checkbox */}
                  <div className="d-flex align-items-center" style={{ width: "5%" }}>
                    <input
                      type="checkbox"
                      checked={!!checkedMap[item.id]}
                      onChange={() => {}} // Handled by parent div click
                      onClick={(e) => e.stopPropagation()} 
                    />
                  </div>

                  {/* Product Info */}
                  <div className="d-flex align-items-center gap-2" style={{ width: "40%" }}>
                    <img
                      src={getProductImage(item)}
                      alt={item.product?.name}
                      width={80}
                      height={80}
                      className="rounded object-fit-cover"
                    />
                    <div>
                      <div className="fw-bold text-truncate" style={{maxWidth: "200px"}}>
                        {item.product?.name}
                      </div>
                      <span className="badge bg-light text-dark border mt-1">
                        {item.product_detail?.product_type}
                      </span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="d-flex align-items-center justify-content-end" style={{ width: "15%" }}>
                    {Number(item.price_at_time).toLocaleString()}₫
                  </div>

                  {/* Quantity Selector */}
                  <div className="d-flex align-items-center justify-content-center" style={{ width: "15%" }}>
                    <div onClick={(e) => e.stopPropagation()}>
                        <QuantitySelector
                        id={`qty-${item.id}`}
                        value={item.quantity}
                        stock={item.product_detail?.stock ?? 1}
                        onChange={(val) => updateQuantity(item.id, val)}
                        />
                    </div>
                  </div>

                  {/* Total */}
                  <div className="d-flex align-items-center justify-content-end fw-bold text-primary" style={{ width: "15%" }}>
                    {(Number(item.price_at_time) * item.quantity).toLocaleString()}₫
                  </div>

                  {/* Delete Button */}
                  <div className="d-flex align-items-center justify-content-center" style={{ width: "10%" }}>
                    <button
                      className="btn btn-outline-danger btn-sm border-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeItem(item.id);
                      }}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FOOTER */}
          <div className="card p-3 sticky-bottom shadow-lg">
            <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-2">
                    <input 
                        type="checkbox" 
                        id="selectAllFooter"
                        checked={cartItems.length > 0 && cartItems.every((i) => checkedMap[i.id])}
                        onChange={(e) => toggleAll(e.target.checked)}
                    />
                    <label htmlFor="selectAllFooter">Chọn tất cả</label>
                </div>
                
                <div className="d-flex gap-3 align-items-center">
                    <div className="text-end">
                        <div>Tổng thanh toán ({totalQuantity} sản phẩm):</div>
                        <div className="h4 text-primary fw-bold m-0">{totalPrice.toLocaleString()}₫</div>
                    </div>
                    <button 
                        className="btn btn-primary px-4 py-2"
                        disabled={selectedItems.length === 0}
                        onClick={handleCheckout}
                    >
                        Mua hàng
                    </button>
                </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CartPage;