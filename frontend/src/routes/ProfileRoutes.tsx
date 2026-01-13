import ProfileLayout from "../layouts/_ProfileLayout";
import PageThayDoiThongTin from "../pages/Profile/PageThayDoiThongTin";
import PageThongTinTaiKhoan from "../pages/Profile/PageThongTinTaiKhoan";
import ThongBaoNguoiDung from "../pages/Profile/PageThongBaoNguoiDung";
import PageDoiMatKhau from "../pages/Profile/PageDoiMatKhau";
import ThongBaoHeThong from "../pages/Profile/PageThongBaoHeThong";

const ProfileRoutes = [
  { path: "/thong-tin-tai-khoan", element: <ProfileLayout><PageThongTinTaiKhoan /></ProfileLayout> },
  { path: "/thay-doi-thong-tin", element: <ProfileLayout><PageThayDoiThongTin /></ProfileLayout> },
  { path: "/thong-bao/he-thong", element: <ProfileLayout><ThongBaoHeThong /></ProfileLayout> },
  { path: "/thong-bao/nguoi-dung", element: <ProfileLayout><ThongBaoNguoiDung /></ProfileLayout> },
  { path: "/doi-mat-khau", element: <ProfileLayout><PageDoiMatKhau /></ProfileLayout> },
];

export default ProfileRoutes;