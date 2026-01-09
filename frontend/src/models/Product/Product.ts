// src/models/Product.ts

export interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  is_primary: number; // 1 hoặc 0
  sort_order: number;
}

export interface ProductDetail {
  id: number;
  product_id: number;
  product_type: string; // 'Sách giấy' | 'Sách điện tử'
  sku: string;
  original_price: number;
  sale_price: number;
  stock: number;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  file_url?: string;
}

export interface Category {
  id: number;
  name: string;
}

// Model chính khớp với bảng 'products' và quan hệ
export interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string;
  author?: string;
  publisher?: string;
  publication_year?: number;
  language?: string;
  status: number; // 1: Active, 0: Inactive
  views: number;
  purchase_count: number;
  rating: number;
  created_at: string;
  
  // Quan hệ (Có thể null tùy API trả về)
  detail?: ProductDetail; 
  images?: ProductImage[];
  categories?: Category[];
}

// Interface cho Form Data gửi lên Backend
export interface ProductFormData {
  name: string;
  author: string;
  publisher: string;
  publication_year: number;
  language: string;
  description: string;
  status: number;
  
  // Product Detail fields (Backend nhận phẳng)
  product_type: string;
  original_price: number;
  sale_price: number;
  stock: number;
  
  // Arrays
  category_ids: number[];
  images: string[]; // Backend ProductController nhận mảng strings URL
}

// Interface cho mục danh sách sản phẩm (Product List Item)
export interface ProductListItem {
  id: number;
  name: string;
  slug: string;
  image: string;         
  original_price: string;
  sale_price: string;    
  rating: string;
  views: number;
  purchase_count: number;
  created_at: string;
}
