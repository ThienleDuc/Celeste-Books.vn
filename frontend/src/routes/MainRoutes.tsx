import MainLayout from "../layouts/_MainLayout.tsx";
import PageThongKe from "../pages/Admin/PageThongKe.tsx";
import RolesPermissionsPage from "../pages/Admin/PageVaiTro_QuyenHan.tsx";
import ProductAddPage from "../pages/Admin/Product/ProductAddPage.tsx";
import ProductEditPage from "../pages/Admin/Product/ProductEditPage.tsx";
import ProductListPage from "../pages/Admin/Product/ProductListPage.tsx";


const MainRoutes = [
  { path: "/phan-quyen", element: <MainLayout><RolesPermissionsPage /></MainLayout> },
  { path: "/admin/statistics", element: <MainLayout><PageThongKe /></MainLayout> },
  { path: "/admin/products", element: <MainLayout><ProductListPage /></MainLayout> },
  { path: "/admin/products/add", element: <MainLayout><ProductAddPage /></MainLayout> },
  { path: "/admin/products/edit/:id", element: <MainLayout><ProductEditPage /></MainLayout> }
];

export default MainRoutes;
