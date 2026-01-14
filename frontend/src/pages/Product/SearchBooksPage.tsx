import { useEffect, useMemo, useState, useCallback } from "react";
import { Helmet } from "react-helmet";
import { useSearchParams } from "react-router-dom";
import { Breadcrumbs, Link, Typography } from "@mui/material";
import { AxiosError } from "axios";

import ProductGridSection from "../../components/Product/ProductGridSection";
import productsApi, { 
  type Product, 
  type ProductSortParams
} from "../../api/produts.api";
import categoriesApi, { type Category } from "../../api/categories.api";

/* ================= TYPES ================= */
// Định nghĩa các Union Type cụ thể thay vì string
// Lưu ý: Các type này cần tương thích với type trong ProductSortParams của file API
type ProductTypeFilter = 'all' | 'paper' | 'e-book' | 'both';
type RankingFilter = 'all' | 'day' | 'week' | 'month' | 'new';

type Filters = {
  keyword: string;
  category_slug: string;
  product_type: ProductTypeFilter;
  ranking: RankingFilter;
};

/* ================= UI CONFIG ================= */
// Định nghĩa Array với Type cụ thể để TypeScript có thể infer types chính xác
const ranks: Array<{ key: RankingFilter; label: string; icon: string }> = [
  { key: "all", label: "Tất cả", icon: "bi-list" },
  { key: "day", label: "Ngày", icon: "bi-calendar-day" },
  { key: "week", label: "Tuần", icon: "bi-calendar-week" },
  { key: "month", label: "Tháng", icon: "bi-calendar-month" },
  { key: "new", label: "Mới cập nhật", icon: "bi-star" },
];

const productTypes: Array<{ key: ProductTypeFilter; label: string; icon: string }> = [
  { key: "all", label: "Tất cả", icon: "bi-card-list" },
  { key: "paper", label: "Sách giấy", icon: "bi-book-half" },
  { key: "e-book", label: "Sách điện tử", icon: "bi-tablet-landscape" },
  { key: "both", label: "Cả hai", icon: "bi-stack" },
];

const SearchBooksPage = () => {
  // Sử dụng setSearchParams thay vì navigate để update URL query params tối ưu hơn
  const [searchParams, setSearchParams] = useSearchParams();
  // const navigate = useNavigate(); // Giữ lại nếu cần chuyển trang khác

  /* ================= STATE ================= */
  // CHỈ lưu trữ dữ liệu server trả về.
  const [products, setProducts] = useState<Product[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  /* ================= DERIVED STATE (Từ URL) ================= */
  // Tính toán filters trực tiếp từ URL, sử dụng useMemo để object ổn định
  // Validate dữ liệu URL để đảm bảo Type Safety tuyệt đối
  const filters = useMemo((): Filters => {
    const rawProductType = searchParams.get("product_type");
    const rawRanking = searchParams.get("ranking");

    // Validate params: Nếu URL chứa giá trị rác, fallback về 'all'
    const product_type: ProductTypeFilter = 
      (rawProductType && productTypes.some(p => p.key === rawProductType)) 
        ? (rawProductType as ProductTypeFilter) 
        : "all";

    const ranking: RankingFilter = 
      (rawRanking && ranks.some(r => r.key === rawRanking)) 
        ? (rawRanking as RankingFilter) 
        : "all";

    return {
      keyword: searchParams.get("keyword") || "",
      category_slug: searchParams.get("category_slug") || "all",
      product_type,
      ranking,
    };
  }, [searchParams]);

  const currentPage = useMemo(() => {
    const page = searchParams.get("page");
    return page ? parseInt(page) : 1;
  }, [searchParams]);

  /* ================= FETCH CATEGORIES ================= */
  useEffect(() => {
    let isMounted = true;
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const response = await categoriesApi.getAll();
        if (isMounted && response.data && response.data.success && Array.isArray(response.data.data)) {
          setCategories(response.data.data);
        }
      } catch {
        // Xử lý lỗi category (optional)
      } finally {
        if (isMounted) setLoadingCategories(false);
      }
    };

    fetchCategories();
    return () => { isMounted = false; };
  }, []);

  /* ================= FETCH PRODUCTS ================= */
  useEffect(() => {
    // Flag xử lý Race Condition và Unmount cleanup
    let isMounted = true;
    
    const fetchProducts = async () => {
      setLoading(true);
      
      try {
        const sortParams: ProductSortParams = {
          page: currentPage,
          per_page: 24,
        };

        // Logic mapping filters vào API params
        if (filters.keyword.trim()) {
          sortParams.keyword = filters.keyword;
        } else {
          // Type Narrowing: TypeScript sẽ tự hiểu nếu !== 'all' thì nó là các giá trị còn lại
          // Điều này giúp loại bỏ 'as any'
          if (filters.product_type !== "all") {
             sortParams.product_type = filters.product_type; 
          }
          if (filters.ranking !== "all") {
             sortParams.ranking = filters.ranking;
          }
          if (filters.category_slug !== "all") {
             sortParams.category_slug = filters.category_slug;
          }
        }

        const response = await productsApi.sort(sortParams);
        
        // Chỉ update state nếu component còn mounted (request mới nhất)
        if (isMounted) {
          if (response.data.status) {
            setProducts(response.data.data || []);
            setTotalItems(response.data.total || 0);
          } else {
            setProducts([]);
            setTotalItems(0);
          }
        }
      } catch (error) {
        if (isMounted) {
          if (error instanceof AxiosError) {
             // Có thể log lỗi chi tiết từ server nếu cần: error.response?.data
          }
          setProducts([]);
          setTotalItems(0);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, [currentPage, filters]); 

  /* ================= HANDLERS ================= */
  // Cập nhật URL -> Trigger useMemo filters -> Trigger useEffect fetchProducts
  const updateFilter = useCallback((changes: Partial<Filters>) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      
      Object.entries(changes).forEach(([key, value]) => {
        if (value && value !== "all") {
          newParams.set(key, value);
        } else {
          newParams.delete(key);
        }
      });

      // Reset về page 1 khi filter thay đổi
      newParams.delete("page");
      return newParams;
    });
  }, [setSearchParams]);

  const handlePageChange = useCallback((page: number) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      if (page > 1) {
        newParams.set("page", page.toString());
      } else {
        newParams.delete("page");
      }
      return newParams;
    });
    
    // Scroll top nhẹ nhàng
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [setSearchParams]);

  /* ================= HELPERS ================= */
  // Generic helper để check active state một cách an toàn về Type
  const isActive = useCallback(<K extends keyof Filters>(paramName: K, value: Filters[K]) => {
    return filters[paramName] === value;
  }, [filters]);

  const currentCategoryName = useMemo(() => {
    if (filters.category_slug === "all") return null;
    const category = categories.find(c => c.slug === filters.category_slug);
    return category?.name || null;
  }, [filters.category_slug, categories]);

  /* ================= RENDER ================= */
  return (
    <>
      <Helmet>
        <title>Tìm sách | Celeste Books</title>
      </Helmet>

      <div className="container my-4">
        <Breadcrumbs className="mb-2">
          <Link underline="hover" color="inherit" href="/">
            Trang chủ
          </Link>
          <Typography color="text.primary">
            {currentCategoryName || "Tìm kiếm"}
          </Typography>
        </Breadcrumbs>

        <h5 className="mb-3 title-section">Celeste Books - Sắp xếp</h5>

        <div className="search-bar p-3 border rounded shadow-sm mb-4">
          {/* Rank buttons */}
          <div className="mb-2 d-flex flex-wrap gap-2">
            {ranks.map(r => (
              <button
                key={r.key}
                className={`btn btn-sm rank-btn rank-${r.key} ${
                  isActive("ranking", r.key) ? "active" : ""
                }`}
                onClick={() => updateFilter({ ranking: r.key })}
              >
                <i className={`bi ${r.icon} me-1`} />
                {r.label}
              </button>
            ))}
          </div>

          {/* Product Type buttons */}
          <div className="mb-2 d-flex flex-wrap gap-2">
            {productTypes.map(p => (
              <button
                key={p.key}
                className={`btn btn-sm product-type-btn product-type-${p.key} ${
                  isActive("product_type", p.key) ? "active" : ""
                }`}
                onClick={() => updateFilter({ product_type: p.key })}
              >
                <i className={`bi ${p.icon} me-1`} />
                {p.label}
              </button>
            ))}
          </div>

          {/* Category buttons */}
          <div className="d-flex flex-wrap gap-2">
            <button
              className={`btn btn-sm category-btn category-all ${
                isActive("category_slug", "all") ? "active" : "btn-outline-dark"
              }`}
              onClick={() => updateFilter({ category_slug: "all" })}
            >
              Tất cả
            </button>

            {loadingCategories ? (
              <div className="d-flex align-items-center">
                <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                <span className="small text-muted">Đang tải thể loại...</span>
              </div>
            ) : (
              categories.map(c => (
                <button
                  key={c.id}
                  className={`btn btn-sm category-btn category-${c.slug} ${
                    isActive("category_slug", c.slug)
                      ? "active"
                      : "btn-outline-dark"
                  }`}
                  onClick={() => updateFilter({ category_slug: c.slug })}
                >
                  {c.name || c.slug}
                </button>
              ))
            )}
          </div>

          <div className="small text-muted mt-2">
            {loading ? (
              <div className="d-flex align-items-center">
                <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                Đang tải...
              </div>
            ) : (
              <>
                Tìm thấy <b>{totalItems}</b> sách
                {currentCategoryName && ` trong thể loại "${currentCategoryName}"`}
              </>
            )}
          </div>
        </div>

        {/* Loading state */}
        {loading && products.length === 0 ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
            <p className="mt-2 text-muted">Đang tải sản phẩm...</p>
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="mb-3">
              <small className="text-muted">
                Hiển thị {products.length} sản phẩm (trang {currentPage} / {Math.max(1, Math.ceil(totalItems / 24))})
              </small>
            </div>
            <ProductGridSection
              externalProducts={products}
              externalTotalItems={totalItems}
              externalCurrentPage={currentPage}
              onPageChangeExternal={handlePageChange}
              itemsPerPage={24}
              colMd={2}
              hiddenPagination={false}
              showRank={false}
              autoFetch={false} // QUAN TRỌNG: Tắt fetch nội bộ của component con
            />
          </>
        ) : (
          <div className="text-center text-muted py-5">
            <i className="bi bi-search fs-1" />
            <p className="mt-2">Không tìm thấy sách phù hợp</p>
            <div className="small">
              <p>Filters:</p>
              <ul className="list-unstyled">
                <li>Keyword: <b>"{filters.keyword || "(none)"}"</b></li>
                <li>Category: <b>"{currentCategoryName || filters.category_slug}"</b></li>
                <li>Product Type: <b>"{productTypes.find(p => p.key === filters.product_type)?.label}"</b></li>
                <li>Rank: <b>"{ranks.find(r => r.key === filters.ranking)?.label}"</b></li>
                <li>Page: <b>{currentPage}</b></li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SearchBooksPage;