import MainLayout from "../layouts/_MainLayout.tsx";
import RolesPermissionsPage from "../pages/Admin/PageVaiTro_QuyenHan.tsx";
import AdminOrderPage from "../components/AdminOrder.tsx";

const MainRoutes = [
  { path: "/phan-quyen", element: <MainLayout><RolesPermissionsPage /></MainLayout> },
  { path: "/xac-nhan-don-hang", element: <MainLayout><AdminOrderPage/></MainLayout> },

];

export default MainRoutes;
