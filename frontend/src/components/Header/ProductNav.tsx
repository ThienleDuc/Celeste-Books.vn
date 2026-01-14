import { NavLink, Link, useLocation } from "react-router-dom";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import categoriesApi, { type Category } from "../../api/categories.api";

// --- CONSTANTS ---
const RANK_LABELS: Record<string, string> = {
  all: "Top tất cả",
  day: "Top ngày",
  week: "Top tuần",
  month: "Top tháng",
  new: "Mới cập nhật",
};

const TYPE_LABELS: Record<string, string> = {
  all: "Tất cả",
  paper: "Sách giấy",
  "e-book": "Sách điện tử",
  both: "Cả hai",
};

const ProductNav = () => {
  const [openRank, setOpenRank] = useState(false);
  const [openCategory, setOpenCategory] = useState(false);
  const [openProductType, setOpenProductType] = useState(false);
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  const rankRef = useRef<HTMLLIElement | null>(null);
  const categoryRef = useRef<HTMLLIElement | null>(null);
  const productTypeRef = useRef<HTMLLIElement | null>(null);

  const location = useLocation();

  // useMemo: Parse params 1 lần khi location đổi
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const currentRanking = searchParams.get("ranking") || "all";
  const currentCategorySlug = searchParams.get("category_slug") || "all";
  const currentProductType = searchParams.get("product_type") || "all";

  // --- CLICK OUTSIDE HANDLER ---
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (rankRef.current && !rankRef.current.contains(target)) setOpenRank(false);
      if (categoryRef.current && !categoryRef.current.contains(target)) setOpenCategory(false);
      if (productTypeRef.current && !productTypeRef.current.contains(target)) setOpenProductType(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- FETCH DATA ---
  useEffect(() => {
    let isMounted = true;
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const response = await categoriesApi.getAll();
        
        if (isMounted) {
          // Type Guard logic để tránh dùng 'any'
          const resData = response.data;
          
          if (resData && typeof resData === 'object') {
            if ('success' in resData && (resData as { success: boolean }).success && Array.isArray((resData as { data: Category[] }).data)) {
               // Trường hợp chuẩn: { success: true, data: [...] }
               setCategories((resData as { data: Category[] }).data);
            } 
            else if ('data' in resData && typeof (resData as { data: unknown }).data === 'object') {
               // Trường hợp phân trang: { data: { data: [...] } }
               const nestedData = (resData as { data: { data: Category[] } }).data;
               if (nestedData && Array.isArray(nestedData.data)) {
                 setCategories(nestedData.data);
               } else {
                 setCategories([]);
               }
            } else {
               setCategories([]);
            }
          }
        }
      } catch {
        if (isMounted) setCategories([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCategories();
    return () => { isMounted = false; };
  }, []);

  // --- MEMOIZED DATA ---
  const filteredCategories = useMemo(() => {
    return categories.filter(cat => cat.slug && cat.slug !== "all" && cat.name);
  }, [categories]);

  const currentRankLabel = useMemo(() => RANK_LABELS[currentRanking] || "Xếp hạng", [currentRanking]);
  
  const currentCategoryLabel = useMemo(() => {
    if (currentCategorySlug === "all") return "Thể loại";
    const category = categories.find(c => c.slug === currentCategorySlug);
    return category?.name || "Thể loại";
  }, [currentCategorySlug, categories]);

  const currentProductTypeLabel = useMemo(() => TYPE_LABELS[currentProductType] || "Loại sách", [currentProductType]);

  // --- HELPER: GENERATE URL STRING ---
  // Tạo URL string để đưa vào thẻ Link/NavLink
  const getFilterUrl = useCallback((newParams: Record<string, string>) => {
    const params = new URLSearchParams(location.search);
    
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === "all") params.delete(key);
      else params.set(key, value);
    });
    
    params.delete("page"); // Reset page về 1
    return `/tim-sach?${params.toString()}`;
  }, [location.search]);

  // Đóng dropdown khi click vào Link con
  const closeDropdowns = useCallback(() => {
    setOpenRank(false);
    setOpenCategory(false);
    setOpenProductType(false);
  }, []);

  return (
    <div className="product-nav-wrapper">
      <nav className="product-nav">
        <ul className="product-nav-list">

          {/* === DÙNG NAVLINK CHO MENU CHÍNH === */}
          {/* NavLink tự động thêm class 'active' khi URL khớp */}
          
          <li className="product-nav-item">
            <NavLink
              to="/"
              className={({ isActive }) => `product-nav-link ${isActive ? "active" : ""}`}
              title="Về trang chủ"
            >
              Trang chủ
            </NavLink>
          </li>

          <li className="product-nav-item">
            <NavLink
              to="/tim-sach"
              className={({ isActive }) => `product-nav-link ${isActive ? "active" : ""}`}
              title="Tìm kiếm sách"
            >
              Tìm kiếm
            </NavLink>
          </li>

          <li className="product-nav-item">
            <NavLink
              to="/lich-su"
              className={({ isActive }) => `product-nav-link ${isActive ? "active" : ""}`}
              title="Lịch sử xem"
            >
              Lịch sử
            </NavLink>
          </li>

          {/* === XẾP HẠNG === */}
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
              title="Lọc theo xếp hạng"
            >
              {currentRankLabel}
            </a>

            <ul className={`dropdown-menu rank two-col ${openRank ? "show" : ""}`}>
              <li>
                <Link
                  to={getFilterUrl({ ranking: "all" })}
                  className={`dropdown-item ${currentRanking === "all" ? "active" : ""}`}
                  onClick={closeDropdowns}
                  title="Hiển thị tất cả xếp hạng"
                >
                  <i className="bi bi-trophy icon-all"></i>
                  Top tất cả
                </Link>
              </li>
              <li>
                <Link
                  to={getFilterUrl({ ranking: "day" })}
                  className={`dropdown-item ${currentRanking === "day" ? "active" : ""}`}
                  onClick={closeDropdowns}
                  title="Sách hot trong ngày"
                >
                  <i className="bi bi-calendar-day icon-day"></i>
                  Top ngày
                </Link>
              </li>
              <li>
                <Link
                  to={getFilterUrl({ ranking: "week" })}
                  className={`dropdown-item ${currentRanking === "week" ? "active" : ""}`}
                  onClick={closeDropdowns}
                  title="Sách hot trong tuần"
                >
                  <i className="bi bi-calendar-week icon-week"></i>
                  Top tuần
                </Link>
              </li>
              <li>
                <Link
                  to={getFilterUrl({ ranking: "month" })}
                  className={`dropdown-item ${currentRanking === "month" ? "active" : ""}`}
                  onClick={closeDropdowns}
                  title="Sách hot trong tháng"
                >
                  <i className="bi bi-calendar-month icon-month"></i>
                  Top tháng
                </Link>
              </li>
              <li>
                <Link
                  to={getFilterUrl({ ranking: "new" })}
                  className={`dropdown-item ${currentRanking === "new" ? "active" : ""}`}
                  onClick={closeDropdowns}
                  title="Sách mới cập nhật"
                >
                  <i className="bi bi-arrow-repeat icon-new"></i>
                  Mới cập nhật
                </Link>
              </li>
            </ul>
          </li>

          {/* === THỂ LOẠI === */}
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
              title="Lọc theo thể loại"
            >
              {currentCategoryLabel}
            </a>

            <ul className={`dropdown-menu category two-col ${openCategory ? "show" : ""}`}>
              <li>
                <Link
                  to={getFilterUrl({ category_slug: "all" })}
                  className={`dropdown-item ${currentCategorySlug === "all" ? "active" : ""}`}
                  onClick={closeDropdowns}
                  title="Tất cả thể loại"
                >
                  Tất cả
                </Link>
              </li>

              {loading ? (
                <li className="px-3 py-2 text-muted">
                  <div className="d-flex align-items-center">
                    <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                    <span className="small">Đang tải...</span>
                  </div>
                </li>
              ) : (
                filteredCategories.map(category => (
                  <li key={category.id}>
                    <Link
                      to={getFilterUrl({ category_slug: category.slug })}
                      className={`dropdown-item ${
                        currentCategorySlug === category.slug ? "active" : ""
                      }`}
                      onClick={closeDropdowns}
                      title={`Thể loại: ${category.name}`}
                    >
                      {category.name}
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </li>

          {/* === LOẠI SÁCH === */}
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
              title="Lọc theo loại sách"
            >
              {currentProductTypeLabel}
            </a>

            <ul className={`dropdown-menu productType two-col ${openProductType ? "show" : ""}`}>
              <li>
                <Link
                  to={getFilterUrl({ product_type: "all" })}
                  className={`dropdown-item ${currentProductType === "all" ? "active" : ""}`}
                  onClick={closeDropdowns}
                  title="Tất cả loại sách"
                >
                  <i className="bi bi-card-list icon-all"></i>
                  Tất cả
                </Link>
              </li>
              <li>
                <Link
                  to={getFilterUrl({ product_type: "paper" })}
                  className={`dropdown-item ${currentProductType === "paper" ? "active" : ""}`}
                  onClick={closeDropdowns}
                  title="Chỉ hiển thị sách giấy"
                >
                  <i className="bi bi-book-half icon-paper"></i>
                  Sách giấy
                </Link>
              </li>
              <li>
                <Link
                  to={getFilterUrl({ product_type: "e-book" })}
                  className={`dropdown-item ${currentProductType === "e-book" ? "active" : ""}`}
                  onClick={closeDropdowns}
                  title="Chỉ hiển thị sách điện tử"
                >
                  <i className="bi bi-tablet-landscape icon-ebook"></i>
                  Sách điện tử
                </Link>
              </li>
              <li>
                <Link
                  to={getFilterUrl({ product_type: "both" })}
                  className={`dropdown-item ${currentProductType === "both" ? "active" : ""}`}
                  onClick={closeDropdowns}
                  title="Hiển thị combo cả hai"
                >
                  <i className="bi bi-stack icon-both"></i>
                  Cả hai
                </Link>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default ProductNav;