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

  // Lấy User ID từ localStorage
  const userInfoStr = localStorage.getItem("user_info");
  const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;
  const userId = userInfo?.id;

  // --- 2. HÀM FETCH GIỎ HÀNG TỪ BE ---
  const fetchCart = async () => {
    if (!userId) return;
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/shopping-carts/${userId}`);
      if (response.data.success && response.data.data) {
        setCartItems(response.data.data.items || []);
      }
    } catch (error) {
      console.error("Lỗi tải dropdown giỏ hàng:", error);
    }
  };

  // Gọi API khi component mount
  useEffect(() => {
    fetchCart();
    
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

  // Hàm lấy icon dựa trên dữ liệu BE trả về
  const getProductIcon = (type: string | undefined) => {
    if (type === "Sách giấy") return "bi bi-book";
    if (type === "Sách điện tử") return "bi bi-tablet-landscape";
    return "bi bi-box";
  };

  // Nếu chưa đăng nhập -> Không hiển thị gì
  if (!userId) return null;

  return (
    <ul className="navbar-nav ms-3">
      <li className="nav-item dropdown cart-dropdown" ref={dropdownRef}>
        {/* Toggle Button */}
        <button
          className="dropdown-toggle nav-link p-0 border-0 bg-transparent position-relative"
          onClick={() => {
            setOpen(!open);
            if (!open) fetchCart(); // Fetch lại khi mở dropdown
          }}
          aria-expanded={open}
        >
          <i className="bi bi-cart fs-5 cart-icon"></i>
          {/* Badge Số lượng */}
          {totalQuantity > 0 && (
            <span className="notification-badge">
              {totalQuantity > 99 ? "99+" : totalQuantity}
            </span>
          )}
        </button>

        {/* Dropdown Menu */}
        <div className={`dropdown-menu cart-dropdown-menu ${open ? "show" : ""}`} style={{ right: 0, left: "auto" }}>
          <div className="dropdown-header cart-header fw-bold">
            Giỏ hàng
          </div>

          {cartItems.length === 0 ? (
            <div className="dropdown-item text-center text-muted p-3">
              <small>Không có sản phẩm nào</small>
            </div>
          ) : (
            cartItems.map((item) => (
              <a 
                key={item.id} 
                href="#!" 
                className="dropdown-item"
                onClick={(e) => {
                  e.preventDefault();
                  setOpen(false);
                  navigate(`/gio-hang/${userId}`);
                }}
              >
                <div className="d-flex justify-content-between align-items-start w-100">
                  {/* Cột icon + tên */}
                  <div className="item-info d-flex align-items-center gap-2" style={{ overflow: "hidden" }}>
                    <i className={`${getProductIcon(item.product_detail?.product_type)} fs-5`}></i>
                    <div>
                      <span className="text-truncate d-block" style={{ fontSize: "0.9rem", maxWidth: "180px" }}>
                        {item.product?.name}
                      </span>
                      <small className="text-muted text-truncate d-block" style={{ fontSize: "0.8rem" }}>
                        {item.product_detail?.product_type} x {item.quantity}
                      </small>
                    </div>
                  </div>

                  {/* Cột giá tiền */}
                  <div className="ms-2 flex-shrink-0 text-end fw-bold text-primary">
                    {Number(item.price_at_time).toLocaleString()}₫
                  </div>
                </div>
              </a>
            ))
          )}

          <div className="dropdown-divider"></div>

          <a 
            href={`/gio-hang/${userId}`} 
            className="dropdown-item text-center text-primary fw-semibold"
            onClick={(e) => {
              e.preventDefault();
              setOpen(false);
              navigate(`/gio-hang/${userId}`);
            }}
          >
            Xem giỏ hàng
          </a>
        </div>
      </li>
    </ul>
  );
};

export default CartDropdown;