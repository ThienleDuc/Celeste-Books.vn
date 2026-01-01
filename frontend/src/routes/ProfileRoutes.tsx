import ProfileLayout from "../layouts/_ProfileLayout";
import PageThayDoiThongTin from "../pages/Profile/PageThayDoiThongTin";
import PageThongTinTaiKhoan from "../pages/Profile/PageThongTinTaiKhoan";
import ThongBaoLichTrinh from "../pages/Profile/PageThongBaoLichTrinh";
import ThongBaoPhanCong from "../pages/Profile/PageThongBaoPhanCong";
import PageDoiMatKhau from "../pages/Profile/PageDoiMatKhau";

const ProfileRoutes = [
  { path: "/thong-tin-tai-khoan", element: <ProfileLayout><PageThongTinTaiKhoan /></ProfileLayout> },
  { path: "/thay-doi-thong-tin", element: <ProfileLayout><PageThayDoiThongTin /></ProfileLayout> },
  { path: "/thong-bao/phan-cong-lai-tau", element: <ProfileLayout><ThongBaoPhanCong /></ProfileLayout> },
  { path: "/thong-bao/lich-trinh", element: <ProfileLayout><ThongBaoLichTrinh /></ProfileLayout> },
  { path: "/doi-mat-khau", element: <ProfileLayout><PageDoiMatKhau /></ProfileLayout> },
];

export default ProfileRoutes;