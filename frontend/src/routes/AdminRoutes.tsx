// src/routes/AdminRoutes.tsx
import PageThongKe from "../pages/Admin/PageThongKe"; // Đảm bảo đường dẫn đúng tới file bạn vừa tạo
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
  // Sau này có thể thêm các route admin khác ở đây:
  // { path: "/admin/products", element: <AdminProductList /> },
  // { path: "/admin/users", element: <AdminUserList /> },
];

export default AdminRoutes;