import ProfileLayout from "../layouts/_ProfileLayout";
import PageThayDoiThongTin from "../pages/Profile/PageThayDoiThongTin";
import PageThongTinTaiKhoan from "../pages/Profile/PageThongTinTaiKhoan";
import ThongBaoLichTrinh from "../pages/Profile/PageThongBaoLichTrinh";
import ThongBaoPhanCong from "../pages/Profile/PageThongBaoPhanCong";
import PageDoiMatKhau from "../pages/Profile/PageDoiMatKhau";
import PageDonHangCuaToi from "../pages/Profile/PageDonHangCuaToi";
import PageThongBaoNguoiDung from "../pages/Profile/PageThongBaoNguoiDung";
// 👇 Đã sửa dòng import này
import PageChiTietDonHang from "../pages/Profile/PageChiTietDonHang"; 

const ProfileRoutes = [
  { 
    path: "/thong-tin-tai-khoan", 
    element: <ProfileLayout><PageThongTinTaiKhoan /></ProfileLayout> 
  },
  { 
    path: "/thay-doi-thong-tin", 
    element: <ProfileLayout><PageThayDoiThongTin /></ProfileLayout> 
  },
  { 
    path: "/thong-bao/phan-cong-lai-tau", 
    element: <ProfileLayout><ThongBaoPhanCong /></ProfileLayout> 
  },
  { 
    path: "/thong-bao/lich-trinh", 
    element: <ProfileLayout><ThongBaoLichTrinh /></ProfileLayout> 
  },
  { 
    path: "/doi-mat-khau", 
    element: <ProfileLayout><PageDoiMatKhau /></ProfileLayout> 
  },
  {
    path: "/don-hang-cua-toi",
    element: (
      <ProfileLayout>
        <PageDonHangCuaToi />
      </ProfileLayout>
    ),
  },
  // 👇 Đã thêm route chi tiết đơn hàng
  {
    path: "/don-hang/:id",
    element: (
      <ProfileLayout>
        <PageChiTietDonHang />
      </ProfileLayout>
    ),
  },
  {
    path: "/thong-bao/nguoi-dung",
    element: (
      <ProfileLayout>
        <PageThongBaoNguoiDung />
      </ProfileLayout>
    ),
  },
];

export default ProfileRoutes;