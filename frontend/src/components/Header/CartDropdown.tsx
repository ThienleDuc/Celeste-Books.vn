import { useState, useRef, useEffect } from "react";

interface CartItem {
  id: number;
  name: string;
  type: "physical" | "ebook"; // loại sản phẩm
  quantity: number;
  price: number;
}

const CartDropdown = () => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLLIElement | null>(null);

  // Dữ liệu mẫu giỏ hàng
  const cartItems: CartItem[] = [
    { id: 1, name: "Sách Lập Trình Cơ Bản", type: "physical", quantity: 2, price: 120000 },
    { id: 2, name: "Sách Học ReactJS", type: "ebook", quantity: 1, price: 80000 },
    { id: 3, name: "Sách Thuật Toán Nâng Cao", type: "physical", quantity: 3, price: 45000 },
  ];

  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Hàm lấy icon theo loại sản phẩm
  const getProductIcon = (type: "physical" | "ebook") => {
    if (type === "physical") return <i className="bi bi-book"></i>; // sách bản cứng
    if (type === "ebook") return <i className="bi bi-tablet-landscape"></i>; // sách điện tử
  };

  return (
    <ul className="navbar-nav ms-3">
      <li className="nav-item dropdown cart-dropdown" ref={dropdownRef}>
        {/* Toggle */}
        <button
          className="dropdown-toggle nav-link p-0 border-0 bg-transparent position-relative"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
        >
          <i className="bi bi-cart fs-5 cart-icon"></i>
          {/* Badge */}
          {totalQuantity > 0 && <span className="notification-badge">{totalQuantity}</span>}
        </button>

        {/* Dropdown menu */}
        <div className={`dropdown-menu cart-dropdown-menu ${open ? "show" : ""}`}>
          <div className="dropdown-header cart-header fw-bold">
            Giỏ hàng
          </div>

          {cartItems.length === 0 ? (
            <div className="dropdown-item text-center">Không có sản phẩm nào</div>
          ) : (
            cartItems.map(item => (
              <a key={item.id} href="#!" className="dropdown-item">
                <div className="d-flex justify-content-between align-items-start w-100">
                  {/* Cột icon + tên */}
                  <div className="item-info d-flex align-items-center gap-2">
                    {getProductIcon(item.type)}
                    <span className="text-break">{item.name} x{item.quantity}</span>
                  </div>

                  {/* Cột giá tiền */}
                  <div className="ms-2 flex-shrink-0 text-end">
                    {item.price.toLocaleString()}₫
                  </div>
                </div>
              </a>
            ))
          )}

          <div className="dropdown-divider"></div>

          <a href="/gio-hang" className="dropdown-item text-center text-primary">
            Xem giỏ hàng
          </a>
        </div>
      </li>
    </ul>
  );
};

export default CartDropdown;
