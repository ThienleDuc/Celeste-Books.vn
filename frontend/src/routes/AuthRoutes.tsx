import AuthenticationLayout from "../layouts/_AuthenticationLayout";
import Login from "../pages/Authentication/PageDangNhap";
import Register from "../pages/Authentication/PageDangKy";
import ForgotPassword from "../pages/Authentication/PageQuenMatKhau";

const AuthRoutes = [
  { path: "/dang-nhap", element: <AuthenticationLayout className="auth-card--login"><Login /></AuthenticationLayout> },
  { path: "/dang-ky", element: <AuthenticationLayout className="auth-card--register"><Register /></AuthenticationLayout> },
  { path: "/quen-mat-khau", element: <AuthenticationLayout className="auth-card--forgot"><ForgotPassword /></AuthenticationLayout> },
];

export default AuthRoutes;