// src/routes/AdminRoutes.tsx
import PageThongKe from "../pages/Admin/PageThongKe"; // Đảm bảo đường dẫn đúng tới file bạn vừa tạo
import ProductAddPage from "../pages/Admin/Product/ProductAddPage";
import ProductEditPage from "../pages/Admin/Product/ProductEditPage";
import ProductListPage from "../pages/Admin/Product/ProductListPage";
import type { ReactNode } from "react";

// Định nghĩa kiểu dữ liệu cho Route (nếu project có dùng TypeScript chặt chẽ)
interface RouteConfig {
  path: string;
  element: ReactNode;
}

const AdminRoutes: RouteConfig[] = [
  {
    path: "/admin/statistics",
    element: <PageThongKe />,
  },
  {
    path: "/admin/products",
    element: <ProductListPage />,
  },
  {
    path: "/admin/products/add",
    element: <ProductAddPage />,
  },
  {
    path: "/admin/products/edit/:id",
    element: <ProductEditPage />,
  }
];

export default AdminRoutes;