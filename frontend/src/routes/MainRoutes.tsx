import MainLayout from "../layouts/_MainLayout.tsx";
import PageThongKeBanRa from "../pages/Admin/PageThongKeBanRa.tsx";
import PageThongKeNhapVao from "../pages/Admin/PageThongKeNhapVao.tsx";
import RolesPermissionsPage from "../pages/Admin/PageVaiTro_QuyenHan.tsx";
import ProductAddPage from "../pages/Admin/Product/ProductAddPage.tsx";
import ProductEditPage from "../pages/Admin/Product/ProductEditPage.tsx";
import ProductListPage from "../pages/Admin/Product/ProductListPage.tsx";


const MainRoutes = [
  { path: "/phan-quyen", element: <MainLayout><RolesPermissionsPage /></MainLayout> },
  { path: "/admin/products", element: <MainLayout><ProductListPage /></MainLayout> },
  { path: "/admin/products/add", element: <MainLayout><ProductAddPage /></MainLayout> },
  { path: "/admin/products/edit/:id", element: <MainLayout><ProductEditPage /></MainLayout> },
    { path: "/admin/statistics/sales", element: <MainLayout><PageThongKeBanRa /></MainLayout> },
      { path: "/admin/statistics/inventory", element: <MainLayout><PageThongKeNhapVao /></MainLayout> }
  
];

export default MainRoutes;
