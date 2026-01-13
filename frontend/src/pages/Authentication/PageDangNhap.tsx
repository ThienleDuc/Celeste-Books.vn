import { useState } from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import authApi from "../../api/auth.api";
import { getRedirectPath } from "../../utils/redirect";

const Login = () => {
  const navigate = useNavigate();

  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Login bằng username hoặc email
      const payload =
        login.includes("@")
          ? { email: login, password }
          : { username: login, password };

      const res = await authApi.login(payload);

      if (res.data.success) {
        // Kiểm tra data có tồn tại không
        if (!res.data.data) {
          setError("Đăng nhập thất bại: không nhận được dữ liệu từ server");
          return;
        }

        const {
          access_token,
          role_id,
        } = res.data.data;

        // Kiểm tra role là Customer (C) - chỉ cho phép Customer đăng nhập ở trang này
        if (role_id !== 'C') {
          setError("Tài khoản này không phải là tài khoản khách hàng. Vui lòng sử dụng trang đăng nhập nhân viên.");
          // Xóa token nếu không phải Customer
          localStorage.removeItem("access_token");
          return;
        }

        // 1. Lưu token
        localStorage.setItem("access_token", access_token);

        // 2. Redirect theo role
        const redirectTo = getRedirectPath("afterLogin", role_id);
        navigate(redirectTo);
      } else {
        setError(res.data.message || "Đăng nhập thất bại");
      }
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;

      setError(
        error.response?.data?.message ||
        "Không thể kết nối máy chủ"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Đăng nhập khách hàng</title>
      </Helmet>

      <div className="auth-title-container position-relative text-center mb-4">
        <a
          href="/"
          className="home-btn position-absolute start-0 top-50 translate-middle-y"
          title="Trang chủ"
        >
          <i className="bi bi-house-door-fill"></i>
        </a>

        <h3 className="fw-bold auth-title d-inline-flex align-items-center gap-2 mb-0">
          <i className="bi bi-box-arrow-in-right"></i>
          Đăng nhập khách hàng
        </h3>
      </div>

      <form onSubmit={handleLogin}>
        {/* ERROR */}
        {error && (
          <div className="alert alert-danger text-center mb-3">
            {error}
          </div>
        )}
        
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Nhập username / email"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <input
            type="password"
            className="form-control"
            placeholder="Nhập mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="rememberMe"
            />
            <label className="form-check-label" htmlFor="rememberMe">
              Nhớ mật khẩu
            </label>
          </div>

          <a href="/quen-mat-khau" className="text-decoration-none">
            Quên mật khẩu?
          </a>
        </div>

        <button
          className="btn btn-success w-100 mb-3"
          disabled={loading}
          type="submit"
        >
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
        
        {/* Option: Google Login cho Customer (nếu có) */}
        <button type="button" className="btn btn-google w-100">
          <i className="bi bi-google google-icon"></i>
          <span className="google-text">Đăng nhập với Google</span>
        </button>
        
        <div className="text-center mt-3">
          <small className="text-muted">
            Chưa có tài khoản? <a href="/dang-ky" className="text-decoration-none">Đăng ký</a>
          </small>
        </div>

        {/* Option: Hiển thị nút chuyển sang đăng nhập nhân viên */}
        <div className="text-center mt-3">
          <small className="text-muted">
            Bạn là nhân viên? <a href="/nhan-vien/dang-nhap" className="text-decoration-none">Đăng nhập tại đây</a>
          </small>
        </div>
      </form>
    </>
  );
};

export default Login;