import axiosClient from "./axios";

/* ===================== TYPES ===================== */

export interface Product {
  id: number;
  name: string;
  slug: string;
  image: string;
  original_price?: number | null;
  sale_price?: number | null;
  rating: number;
  views: number;
  purchase_count: number;
  created_at: string;

  // optional
  product_types?: string[];
  total_sold?: number;
  avg_rating?: number;
}

/* ---------- Image & Category ---------- */

export interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  is_primary: 0 | 1;
  sort_order: number;
  created_at: string;
}

export interface ProductCategory {
  product_id: number;
  category_id: number;
}

/* ---------- Detail ---------- */

export interface ProductDetail {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  author?: string | null;
  publisher?: string | null;
  publication_year?: number | null;
  language?: string | null;
  status: boolean;
  categories?: ProductCategory[];
  images?: ProductImage[];
}

/* ===================== PAGINATION ===================== */

export interface PaginationResponse<T> {
  status: boolean;
  message: string;
  data: T[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  filters?: Record<string, string | number | boolean> | null;
}

export interface ProductListPaginate {
  status: boolean;
  message: string;
  data: {
    data: Product[];
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

/* ===================== PARAM TYPES ===================== */

// index()
export interface ProductListParams {
  page?: number;
  per_page?: number;
  sort_by?: "id" | "name" | "rating" | "views" | "purchase_count" | "sale_price" | "created_at";
  sort_order?: "asc" | "desc";
}

// searchByName()
export interface ProductSearchParams {
  name: string;
  page?: number;
  per_page?: number;
}

// sort()
export interface ProductSortParams {
  page?: number;
  per_page?: number;
  sort_by?: "id" | "name" | "rating" | "views" | "purchase_count" | "sale_price" | "created_at";
  sort_order?: "asc" | "desc";
  product_type?: "all" | "paper" | "e-book" | "both";
  category_slug?: string;
  ranking?: "all" | "day" | "week" | "month" | "year";
}

// create / update
export interface ProductPayload {
  name?: string;
  description_file?: File;
  author?: string;
  publisher?: string;
  publication_year?: number;
  language?: string;
  status?: boolean;
  images?: string[];      // URL list
  categories?: number[];  // category_id list
}

/* ===================== API ===================== */

const productsApi = {
  // 1. Lấy danh sách sản phẩm
  getList(params?: ProductListParams) {
    return axiosClient.get<ProductListPaginate>("/products", { params });
  },

  // 2. Tìm kiếm theo tên
  searchByName(params: ProductSearchParams) {
    return axiosClient.get<PaginationResponse<Product>>(
      "/products/search",
      { params }
    );
  },

  // 3. Sort + filter nâng cao
  sort(params: ProductSortParams) {
    return axiosClient.get<PaginationResponse<Product>>(
      "/products/sort",
      { params }
    );
  },

  // 4. Gợi ý sản phẩm liên quan
  suggest(productId: number) {
    return axiosClient.get<{
      status: boolean;
      message: string;
      data: Pick<Product, "id" | "name" | "slug">[];
    }>(`/products/${productId}/suggest`);
  },

  // 5. Tạo sản phẩm
  create(data: ProductPayload) {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value === undefined || value === null) return;

      if (Array.isArray(value)) {
        value.forEach((v) => formData.append(`${key}[]`, String(v)));
      } else {
        formData.append(key, value);
      }
    });

    return axiosClient.post("/products", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // 6. Cập nhật sản phẩm
  update(id: number, data: ProductPayload) {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value === undefined || value === null) return;

      if (Array.isArray(value)) {
        value.forEach((v) => formData.append(`${key}[]`, String(v)));
      } else {
        formData.append(key, value);
      }
    });

    return axiosClient.post(`/products/${id}?_method=PUT`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // 7. Xóa sản phẩm
  delete(id: number) {
    return axiosClient.delete<{ status: boolean; message: string }>(
      `/products/${id}`
    );
  },
};

export default productsApi;
