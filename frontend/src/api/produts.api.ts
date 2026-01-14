import axiosClient from "./axios";

/* ===================== TYPES ===================== */

/** Product chung cho frontend */
export interface Product {
  id: number;
  name: string;
  slug: string;
  image?: string;
  original_price?: number | null;
  sale_price?: number | null;
  rating: number;
  views: number;
  purchase_count: number;
  created_at: string;

  // Optional từ các API khác
  primary_image?: string;
  discount_percent?: number;
  total_sold?: number;
  total_sold_formatted?: string;
  product_types?: string[];
  category_slug?: string[];
  avg_rating?: number;
}

/* ===================== PAGINATION ===================== */

export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  per_page: number;
  total: number;
  last_page: number;
}

export interface ApiResponse<T> {
  status: boolean;
  message: string;
  data: T;
}

// Response cho API /products (có phân trang)
export interface ProductListResponse {
  status: boolean;
  message: string;
  data: PaginatedResponse<Product>;
}

// Response cho API /product-details/best-sellers (không phân trang)
export interface BestSellersResponse {
  status: boolean;
  message: string;
  data: Product[];
}

// Response cho API /products/sort
export interface ProductSortResponse {
  status: boolean;
  message: string;
  data: Product[]; // Mảng sản phẩm trực tiếp
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

// Response cho API tăng lượt views
export interface IncrementViewsResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    name: string;
    views: number;
    updated_at: string;
  };
}

// Response cho các API với limit/offset (suggest, featured, etc.)
export interface ProductLimitOffsetResponse {
  status: boolean;
  message: string;
  data: {
    products: Product[];
    has_more: boolean;
    total: number;
    limit?: number;
    offset?: number;
  };
}
/* ===================== PARAM TYPES ===================== */

export interface ProductListParams {
  page?: number;
  per_page?: number;
  sort_by?: "id" | "name" | "rating" | "views" | "purchase_count" | "sale_price" | "created_at";
  sort_order?: "asc" | "desc";
}

export interface ProductSearchParams {
  name: string;
  page?: number;
  per_page?: number;
}

export interface ProductSortParams {
  page?: number;
  per_page?: number;
  keyword?: string;
  product_type?: "all" | "paper" | "e-book" | "both";
  ranking?: "all" | "day" | "week" | "month" | "new";
  category_slug?: string;
  sort_by?: "id" | "name" | "rating" | "views" | "purchase_count" | "sale_price" | "created_at";
  sort_order?: "asc" | "desc";
}

// Params cho API suggest
export interface ProductLimitOffsetParams {
  limit?: number;
  offset?: number;
}

/* ===================== API ===================== */

const productsApi = {
  /** 1. Lấy danh sách sản phẩm (CÓ CACHE) */
  getList(params?: ProductListParams) {
    return axiosClient.get<ProductListResponse>("/products", { 
        params,
        cache: true // Cache danh sách để chuyển trang nhanh
    });
  },

  /** 2. Tìm kiếm sản phẩm theo tên (CÓ CACHE) */
  searchByName(params: ProductSearchParams) {
    return axiosClient.get<ProductListResponse>("/products/search/name", { 
        params,
        cache: true // Cache kết quả tìm kiếm giống nhau
    });
  },

  /** 3. Sort + filter nâng cao (CÓ CACHE) */
  sort(params: ProductSortParams) {
    return axiosClient.get<ProductSortResponse>("/products/sort", { 
        params,
        cache: true // Cache kết quả lọc (quan trọng cho trang Search)
    });
  },

  /** 4. Lấy sản phẩm bán chạy (CÓ CACHE) */
  getBestSellers(limit?: number) {
    return axiosClient.get<BestSellersResponse>("/product-details/best-sellers", {
      params: { limit },
      cache: true // Best seller ít thay đổi trong ngày -> Cache tốt
    });
  },

  /** 5. Lấy sản phẩm gợi ý (CÓ CACHE) */
  suggest(productId: number, params?: ProductLimitOffsetParams) {
    return axiosClient.get<ProductLimitOffsetResponse>(`/products/${productId}/suggest`, {
      params,
      cache: true
    });
  },

  /** 6. Tăng lượt views sản phẩm (KHÔNG CACHE, POST) */
  incrementViews(productId: number) {
    // Không dùng cache vì đây là hành động ghi (Mutation)
    return axiosClient.post<IncrementViewsResponse>(`/products/${productId}/views`);
  },

  /** 7. Lấy sản phẩm giới thiệu (CÓ CACHE) */
  featured(params?: ProductLimitOffsetParams) {
    return axiosClient.get<ProductLimitOffsetResponse>("/products/featured", {
      params,
      cache: true // Featured thường là config cố định -> Cache tốt
    });
  },
};

export default productsApi;