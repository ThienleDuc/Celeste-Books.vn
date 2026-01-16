import MainLayout from "../layouts/_MainLayout.tsx";
import UserEditPage from "../pages/Admin/PageChinhSuaNguoiDung.tsx";
import UserDetailModal from "../pages/Admin/PageChiTietNguoiDung.tsx";
import PageQuanLyNguoiDung from "../pages/Admin/PageQuanLyNguoiDung.tsx";
import CreateUserPage from "../pages/Admin/PageTaoNguoiDung.tsx";
import RolesPermissionsPage from "../pages/Admin/PageVaiTro_QuyenHan.tsx";

const MainRoutes = [
  { path: "/phan-quyen", element: <MainLayout><RolesPermissionsPage /></MainLayout> },
  { path: "/nguoi-dung", element: <MainLayout><PageQuanLyNguoiDung /></MainLayout> },
  { path: "/nguoi-dung/chi-tiet/:id", element: <MainLayout><UserDetailModal /></MainLayout> },
  { path: "/nguoi-dung/tao-moi", element: <MainLayout><CreateUserPage /></MainLayout> },
  { path: "/nguoi-dung/chinh-sua/:id", element: <MainLayout><UserEditPage /></MainLayout> },

];

export default MainRoutes;
