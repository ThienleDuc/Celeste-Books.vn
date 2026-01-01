import { useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
// Import categories từ product.model.ts
import { categories } from "../../models/Product/product.model";

const ProductNav = () => {
  const [openRank, setOpenRank] = useState(false);
  const [openCategory, setOpenCategory] = useState(false);
  const [openProductType, setOpenProductType] = useState(false);

  const rankRef = useRef<HTMLLIElement | null>(null);
  const categoryRef = useRef<HTMLLIElement | null>(null);
  const productTypeRef = useRef<HTMLLIElement | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const currentRank = searchParams.get("rank");
  const currentCategory = searchParams.get("category");
  const currentProductType = searchParams.get("productType");

  // Sửa: Sử dụng default value "all" cho tất cả params
  const currentRankValue = currentRank || "all";
  const currentCategoryValue = currentCategory || "all";
  const currentProductTypeValue = currentProductType || "all";

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (rankRef.current && !rankRef.current.contains(e.target as Node)) {
        setOpenRank(false);
      }
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) {
        setOpenCategory(false);
      }
      if (productTypeRef.current && !productTypeRef.current.contains(e.target as Node)) {
        setOpenProductType(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Hàm xử lý click vào filter trong dropdown - GIỮ NGUYÊN CÁC PARAMS KHÁC
  const handleFilterClick = (newParams: Record<string, string>) => {
    // Tạo URLSearchParams từ URL hiện tại
    const params = new URLSearchParams(location.search);
    
    // Cập nhật từng param mới
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === "all") {
        params.delete(key); // Xóa param nếu là "all"
      } else {
        params.set(key, value); // Set giá trị mới
      }
    });
    
    // Navigate với params mới, giữ nguyên các params khác
    navigate(`/tim-sach${params.toString() ? `?${params.toString()}` : ''}`);
    
    // Đóng dropdown sau khi click
    setOpenRank(false);
    setOpenCategory(false);
    setOpenProductType(false);
  };

  // Hàm navigate đến trang khác (không phải tim-sach) - giữ nguyên
  const handleNavClick = (path: string) => {
    navigate(path);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Lọc bỏ category "Tất cả" từ model (vì đã có item "Tất cả" riêng)
  const filteredCategories = categories.filter(cat => cat.slug !== "all");

  return (
    <div className="product-nav-wrapper">
      <nav className="product-nav">
        <ul className="product-nav-list">

          {/* Trang chủ */}
          <li className="product-nav-item">
            <a
              onClick={() => handleNavClick("/")}
              className={`product-nav-link ${isActive("/") ? "active" : ""}`}
              style={{ cursor: "pointer" }}
            >
              Trang chủ
            </a>
          </li>

          {/* Tìm sách */}
          <li className="product-nav-item">
            <a
              onClick={() => handleNavClick("/tim-sach")}
              className={`product-nav-link ${isActive("/tim-sach") ? "active" : ""}`}
              style={{ cursor: "pointer" }}
            >
              Tìm sách
            </a>
          </li>

          {/* Lịch sử */}
          <li className="product-nav-item">
            <a
              onClick={() => handleNavClick("/lich-su")}
              className={`product-nav-link ${isActive("/lich-su") ? "active" : ""}`}
              style={{ cursor: "pointer" }}
            >
              Lịch sử
            </a>
          </li>

          {/* XẾP HẠNG */}
          <li className="product-nav-item dropdown" ref={rankRef}>
            <a
              className="product-nav-link dropdown-toggle"
              onClick={() => {
                setOpenRank(!openRank);
                setOpenCategory(false);
                setOpenProductType(false);
              }}
              aria-expanded={openRank}
              style={{ cursor: "pointer" }}
            >
              Xếp hạng
            </a>

            <ul className={`dropdown-menu rank two-col ${openRank ? "show" : ""}`}>
              <li>
                <a
                  onClick={() => handleFilterClick({ rank: "all" })}
                  className={`dropdown-item ${currentRankValue === "all" ? "active" : ""}`}
                  style={{ cursor: "pointer" }}
                >
                  <i className="bi bi-trophy icon-all"></i>
                  Top tất cả
                </a>
              </li>
              <li>
                <a
                  onClick={() => handleFilterClick({ rank: "day" })}
                  className={`dropdown-item ${currentRankValue === "day" ? "active" : ""}`}
                  style={{ cursor: "pointer" }}
                >
                  <i className="bi bi-calendar-day icon-day"></i>
                  Top ngày
                </a>
              </li>
              <li>
                <a
                  onClick={() => handleFilterClick({ rank: "week" })}
                  className={`dropdown-item ${currentRankValue === "week" ? "active" : ""}`}
                  style={{ cursor: "pointer" }}
                >
                  <i className="bi bi-calendar-week icon-week"></i>
                  Top tuần
                </a>
              </li>
              <li>
                <a
                  onClick={() => handleFilterClick({ rank: "month" })}
                  className={`dropdown-item ${currentRankValue === "month" ? "active" : ""}`}
                  style={{ cursor: "pointer" }}
                >
                  <i className="bi bi-calendar-month icon-month"></i>
                  Top tháng
                </a>
              </li>
              <li>
                <a
                  onClick={() => handleFilterClick({ rank: "new" })}
                  className={`dropdown-item ${currentRankValue === "new" ? "active" : ""}`}
                  style={{ cursor: "pointer" }}
                >
                  <i className="bi bi-arrow-repeat icon-new"></i>
                  Mới cập nhật
                </a>
              </li>
            </ul>
          </li>

          {/* THỂ LOẠI - SỬ DỤNG TỪ MODEL */}
          <li className="product-nav-item dropdown" ref={categoryRef}>
            <a
              className="product-nav-link dropdown-toggle"
              onClick={() => {
                setOpenCategory(!openCategory);
                setOpenRank(false);
                setOpenProductType(false);
              }}
              aria-expanded={openCategory}
              style={{ cursor: "pointer" }}
            >
              Thể loại
            </a>

            <ul className={`dropdown-menu category two-col ${openCategory ? "show" : ""}`}>
              {/* Thêm "Tất cả" vào đầu dropdown - QUAN TRỌNG: so sánh với currentCategoryValue */}
              <li>
                <a
                  onClick={() => handleFilterClick({ category: "all" })}
                  className={`dropdown-item ${currentCategoryValue === "all" ? "active" : ""}`}
                  style={{ cursor: "pointer" }}
                >
                  Tất cả
                </a>
              </li>
              
              {/* Render các thể loại từ model (đã lọc bỏ "Tất cả") */}
              {filteredCategories.map((category) => (
                <li key={category.id}>
                  <a
                    onClick={() => handleFilterClick({ category: category.slug })}
                    className={`dropdown-item ${currentCategoryValue === category.slug ? "active" : ""}`}
                    style={{ cursor: "pointer" }}
                  >
                    {category.name}
                  </a>
                </li>
              ))}
            </ul>
          </li>

          {/* LOẠI SÁCH */}
          <li className="product-nav-item dropdown" ref={productTypeRef}>
            <a
              className="product-nav-link dropdown-toggle"
              onClick={() => {
                setOpenProductType(!openProductType);
                setOpenRank(false);
                setOpenCategory(false);
              }}
              aria-expanded={openProductType}
              style={{ cursor: "pointer" }}
            >
              Loại sách
            </a>

            <ul className={`dropdown-menu productType two-col ${openProductType ? "show" : ""}`}>
              <li>
                <a
                  onClick={() => handleFilterClick({ productType: "all" })}
                  className={`dropdown-item ${currentProductTypeValue === "all" ? "active" : ""}`}
                  style={{ cursor: "pointer" }}
                >
                  <i className="bi bi-card-list icon-all"></i>
                  Tất cả
                </a>
              </li>
              <li>
                <a
                  onClick={() => handleFilterClick({ productType: "paper" })}
                  className={`dropdown-item ${currentProductTypeValue === "paper" ? "active" : ""}`}
                  style={{ cursor: "pointer" }}
                >
                  <i className="bi bi-book-half icon-paper"></i>
                  Sách giấy
                </a>
              </li>
              <li>
                <a
                  onClick={() => handleFilterClick({ productType: "ebook" })}
                  className={`dropdown-item ${currentProductTypeValue === "ebook" ? "active" : ""}`}
                  style={{ cursor: "pointer" }}
                >
                  <i className="bi bi-tablet-landscape icon-ebook"></i>
                  Sách điện tử
                </a>
              </li>
              <li>
                <a
                  onClick={() => handleFilterClick({ productType: "both" })}
                  className={`dropdown-item ${currentProductTypeValue === "both" ? "active" : ""}`}
                  style={{ cursor: "pointer" }}
                >
                  <i className="bi bi-stack icon-both"></i>
                  Cả hai
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default ProductNav;