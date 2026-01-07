/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Breadcrumbs, Link, Typography } from "@mui/material";

import ProductGridSection from "../../components/Product/ProductGridSection";
import { sampleProducts, categories } from "../../models/Product/product.model";
import { productSoldMap } from "../../models/Order/order.model";

/* ================= TYPES ================= */
type Filters = {
  keyword: string;
  category: string;
  productType: string;
  rank: string;
};

/* ================= UI CONFIG ================= */
const ranks = [
  { key: "all", label: "Tất cả", icon: "bi-list" },
  { key: "day", label: "Ngày", icon: "bi-calendar-day" },
  { key: "week", label: "Tuần", icon: "bi-calendar-week" },
  { key: "month", label: "Tháng", icon: "bi-calendar-month" },
  { key: "new", label: "Mới cập nhật", icon: "bi-star" },
];

const productTypes = [
  { key: "all", label: "Tất cả", icon: "bi-card-list" },
  { key: "paper", label: "Sách giấy", icon: "bi-book-half" },
  { key: "ebook", label: "Sách điện tử", icon: "bi-tablet-landscape" },
  { key: "both", label: "Cả hai", icon: "bi-stack" },
];

const DEFAULT_FILTERS: Filters = {
  keyword: "",
  category: "all",
  productType: "all",
  rank: "all",
};

const SearchBooksPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  /* ================= FILTER STATE ================= */
  const [filterState, setFilterState] = useState<Filters>(DEFAULT_FILTERS);

  /* ================= SYNC URL -> STATE ================= */
  useEffect(() => {
    setFilterState({
      keyword: searchParams.get("keyword") ?? "",
      category: searchParams.get("category") ?? "all",
      productType: searchParams.get("productType") ?? "all",
      rank: searchParams.get("rank") ?? "all",
    });
  }, [searchParams]);

  /* ================= UPDATE FILTER (STATE + URL) ================= */
  const updateFilter = (changes: Partial<Filters>) => {
    const next = { ...filterState, ...changes };
    setFilterState(next);

    const params = new URLSearchParams();

    Object.entries(next).forEach(([key, value]) => {
      if (value && value !== "all") {
        params.set(key, value);
      }
    });

    navigate(`/tim-sach${params.toString() ? `?${params}` : ""}`);
  };

  /* ================= FILTER LOGIC ================= */
  const filteredProducts = useMemo(() => {
    let result = sampleProducts.filter(p =>
      p.product.name
        .toLowerCase()
        .includes(filterState.keyword.toLowerCase())
    );

    if (filterState.category !== "all") {
      result = result.filter(p =>
        p.categories.some(c => c.slug === filterState.category)
      );
    }

    if (filterState.productType !== "all") {
      if (filterState.productType === "paper") {
        result = result.filter(p =>
          p.details.some(d => d.productType === "Sách giấy")
        );
      } else if (filterState.productType === "ebook") {
        result = result.filter(p =>
          p.details.some(d => d.productType === "Sách điện tử")
        );
      } else if (filterState.productType === "both") {
        result = result.filter(p =>
          p.details.some(d => d.productType === "Sách giấy") &&
          p.details.some(d => d.productType === "Sách điện tử")
        );
      }
    }

    if (filterState.rank === "new") {
      result = [...result].sort(
        (a, b) =>
          new Date(b.product.createdAt).getTime() -
          new Date(a.product.createdAt).getTime()
      );
    }

    if (["day", "week", "month"].includes(filterState.rank)) {
      result = [...result].sort(
        (a, b) =>
          (productSoldMap[b.product.id] || 0) -
          (productSoldMap[a.product.id] || 0)
      );
    }

    return result;
  }, [filterState]);

  /* ================= ACTIVE CHECK (DIRECTLY FROM SEARCH PARAMS) ================= */
  // Hoặc cách đơn giản hơn với default value
  const isActiveSimple = (paramName: string, value: string) => {
    const currentValue = searchParams.get(paramName) || "all";
    return currentValue === value;
  };

  /* ================= CATEGORY NAME ================= */
  const currentCategoryName = useMemo(() => {
    const category = searchParams.get("category") || "all";
    if (category === "all") return null;
    return categories.find(c => c.slug === category)?.name || null;
  }, [searchParams]);

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
          {/* Rank - so sánh trực tiếp với searchParams */}
          <div className="mb-2 d-flex flex-wrap gap-2">
            {ranks.map(r => (
              <button
                key={r.key}
                className={`btn btn-sm rank-btn rank-${r.key} ${
                  isActiveSimple("rank", r.key) ? "active" : ""
                }`}
                onClick={() => updateFilter({ rank: r.key })}
              >
                <i className={`bi ${r.icon} me-1`} />
                {r.label}
              </button>
            ))}
          </div>

          {/* Product Type - so sánh trực tiếp với searchParams */}
          <div className="mb-2 d-flex flex-wrap gap-2">
            {productTypes.map(p => (
              <button
                key={p.key}
                className={`btn btn-sm product-type-btn product-type-${p.key} ${
                  isActiveSimple("productType", p.key) ? "active" : ""
                }`}
                onClick={() => updateFilter({ productType: p.key })}
              >
                <i className={`bi ${p.icon} me-1`} />
                {p.label}
              </button>
            ))}
          </div>

          {/* Category - so sánh trực tiếp với searchParams */}
          <div className="d-flex flex-wrap gap-2">
            {/* Tất cả */}
            <button
              className={`btn btn-sm category-btn category-all ${
                isActiveSimple("category", "all") ? "active" : "btn-outline-dark"
              }`}
              onClick={() => updateFilter({ category: "all" })}
            >
              Tất cả
            </button>

            {/* Các category từ model */}
            {categories.map(c => (
              <button
                key={c.id}
                className={`btn btn-sm category-btn category-${c.slug} ${
                  isActiveSimple("category", c.slug)
                    ? "active"
                    : "btn-outline-dark"
                }`}
                onClick={() => updateFilter({ category: c.slug })}
              >
                {c.name}
              </button>
            ))}
          </div>

          <div className="small text-muted mt-2">
            Tìm thấy <b>{filteredProducts.length}</b> sách
            {currentCategoryName && ` trong thể loại "${currentCategoryName}"`}
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <ProductGridSection
            products={filteredProducts}
            itemsPerPage={24}
            colMd={2}
          />
        ) : (
          <div className="text-center text-muted py-5">
            <i className="bi bi-search fs-1" />
            <p className="mt-2">Không tìm thấy sách phù hợp</p>
            {searchParams.get("keyword") && (
              <p className="small">Với từ khóa: <b>"{searchParams.get("keyword")}"</b></p>
            )}
            {searchParams.get("category") && searchParams.get("category") !== "all" && (
              <p className="small">Trong thể loại: <b>"{currentCategoryName || searchParams.get("category")}"</b></p>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default SearchBooksPage;