import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// --- 1. ĐỊNH NGHĨA INTERFACE (Khớp với cấu trúc Backend trả về) ---
interface ProductImage {
  image_url: string;
  is_primary: number;
}

interface Product {
  id: number;
  name: string;
  images: ProductImage[];
}

interface ProductDetail {
  product_type: string; // "Sách giấy" | "Sách điện tử"
}

interface CartItemBackend {
  id: number;
  product_id: number;
  quantity: number;
  price_at_time: number;
  product: Product;
  product_detail: ProductDetail;
}

const CartDropdown = () => {
  const [open, setOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItemBackend[]>([]);
  const dropdownRef = useRef<HTMLLIElement | null>(null);
  const navigate = useNavigate();

  // Lấy User ID từ localStorage (hoặc dùng Context nếu có)
  const userInfoStr = localStorage.getItem("user_info");
  const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;
  const userId = userInfo?.id || "C01"; // Fallback C01 để test nếu chưa login

  // --- 2. HÀM FETCH GIỎ HÀNG TỪ BE ---
  const fetchCart = async () => {
    if (!userId) return;
    try {
      // Gọi API lấy giỏ hàng
      const response = await axios.get(`http://127.0.0.1:8000/api/shopping-carts/${userId}`);
      if (response.data.success && response.data.data) {
        setCartItems(response.data.data.items || []);
      }
    } catch (error) {
      console.error("Lỗi tải dropdown giỏ hàng:", error);
    }
  };

  // Gọi API khi component mount và khi mở dropdown
  useEffect(() => {
    fetchCart();
    
    // (Tùy chọn) Lắng nghe sự kiện custom nếu bạn muốn cập nhật ngay khi bấm "Thêm vào giỏ"
    // Bạn cần dispatch event này ở ProductDetailPage: window.dispatchEvent(new Event('cartUpdated'));
    const handleCartUpdate = () => fetchCart();
    window.addEventListener('cartUpdated', handleCartUpdate);

    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, [userId]);

  // Xử lý click outside để đóng dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- 3. TÍNH TỔNG SỐ LƯỢNG ---
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // --- 4. HÀM CHUYỂN TRANG ---
  const handleViewCart = () => {
    setOpen(false); // Đóng dropdown
    navigate(`/gio-hang/${userId}`); // Chuyển sang CartPage với userId
  };

  // Hàm lấy icon dựa trên dữ liệu BE trả về
  const getProductIcon = (type: string | undefined) => {
    // Logic map từ string BE ("Sách giấy") sang icon
    if (type === "Sách giấy") return <i className="bi bi-book text-primary"></i>;
    if (type === "Sách điện tử") return <i className="bi bi-tablet-landscape text-success"></i>;
    return <i className="bi bi-box"></i>;
  };

  return (
    <ul className="navbar-nav ms-3">
      <li className="nav-item dropdown cart-dropdown" ref={dropdownRef}>
        {/* Toggle Button */}
        <button
          className="dropdown-toggle nav-link p-0 border-0 bg-transparent position-relative"
          onClick={() => {
            setOpen(!open);
            if (!open) fetchCart(); // Fetch lại khi mở để đảm bảo dữ liệu mới nhất
          }}
          aria-expanded={open}
        >
          <i className="bi bi-cart fs-5 cart-icon"></i>
          {/* Badge Số lượng */}
          {totalQuantity > 0 && (
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem' }}>
              {totalQuantity > 99 ? '99+' : totalQuantity}
            </span>
          )}
        </button>

        {/* Dropdown Menu */}
        <div className={`dropdown-menu cart-dropdown-menu end-0 ${open ? "show" : ""}`} style={{ width: "300px", right: 0, left: "auto" }}>
          <div className="dropdown-header cart-header fw-bold border-bottom mb-2">
            Giỏ hàng ({totalQuantity})
          </div>

          <div style={{ maxHeight: "300px", overflowY: "auto" }}>
            {cartItems.length === 0 ? (
              <div className="dropdown-item text-center text-muted py-3">Giỏ hàng trống</div>
            ) : (
              cartItems.map((item) => (
                <div key={item.id} className="dropdown-item px-3 py-2 border-bottom">
                  <div className="d-flex justify-content-between align-items-start w-100">
                    
                    {/* Cột Tên & Loại */}
                    <div className="d-flex flex-column" style={{ width: "70%" }}>
                        <div className="d-flex align-items-center gap-2 mb-1">
                            {getProductIcon(item.product_detail?.product_type)}
                            <span className="fw-bold text-truncate" style={{ maxWidth: "180px" }} title={item.product?.name}>
                                {item.product?.name}
                            </span>
                        </div>
                        <small className="text-muted">
                            {item.product_detail?.product_type} x {item.quantity}
                        </small>
                    </div>

                    {/* Cột Giá */}
                    <div className="text-end fw-bold text-primary" style={{ width: "30%" }}>
                      {Number(item.price_at_time).toLocaleString()}₫
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-2">
            <button 
                onClick={handleViewCart} 
                className="btn btn-primary w-100 btn-sm"
            >
              Xem giỏ hàng 
            </button>
          </div>
        </div>
      </li>
    </ul>
  );
};

export default CartDropdown;