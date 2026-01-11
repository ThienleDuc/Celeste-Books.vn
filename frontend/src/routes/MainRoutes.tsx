import MainLayout from "../layouts/_MainLayout.tsx";
import RolesPermissionsPage from "../pages/Admin/PageVaiTro_QuyenHan.tsx";


const MainRoutes = [
  { path: "/phan-quyen", element: <MainLayout><RolesPermissionsPage /></MainLayout> },
];

export default MainRoutes;
