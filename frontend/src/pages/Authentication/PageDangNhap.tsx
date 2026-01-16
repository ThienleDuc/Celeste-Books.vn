import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useNavigate, useLocation } from "react-router-dom";
import { AxiosError } from "axios";

import authApi from "../../api/auth.api";
import axiosClient from "../../api/axios"; // ✅ Import thêm axiosClient
import { getRedirectPath } from "../../utils/redirect";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- HÀM HỖ TRỢ: Lấy thông tin user và cache ---
  const fetchAndCacheUserInfo = async (userId: string) => {
    try {
      const res = await axiosClient.get(`/users/${userId}`);
      if (res.data && res.data.data) {
        localStorage.setItem("user_info", JSON.stringify(res.data.data));
      }
    } catch (e) {
      console.warn("Không cache kịp user info, sidebar sẽ tự load lại sau.");
    }
  };

  // --- XỬ LÝ LOGIN GOOGLE ---
  useEffect(() => {
    const checkGoogleToken = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get("token");

      if (token) {
        setLoading(true);
        try {
          // 1. Lưu token
          localStorage.setItem("access_token", token);

          // 2. Lấy role và ID
          const res = await authApi.me();
          
          if (res.data && res.data.data) {
            const { role, id } = res.data.data;
            const roleId = role?.id;

            // ✅ 3. Cache thông tin user ngay lập tức
            await fetchAndCacheUserInfo(id);

            // 4. Redirect
            const redirectTo = getRedirectPath("afterLogin", roleId);
            navigate(redirectTo);
          }
        } catch (err) {
          console.error("Lỗi login Google:", err);
          setError("Đăng nhập Google thất bại. Vui lòng thử lại.");
          setLoading(false);
        }
      }
    };

    checkGoogleToken();
  }, [location, navigate]);

  // --- XỬ LÝ LOGIN THƯỜNG ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = login.includes("@")
        ? { email: login, password }
        : { username: login, password };

      const res = await authApi.login(payload);

      if (res.data.success) {
        const { access_token, role_id } = res.data.data;

        // 1. Lưu token
        localStorage.setItem("access_token", access_token);

        // ✅ 2. Gọi thêm API lấy ID user để cache thông tin (Vì login response của bạn chưa có ID)
        try {
            const meRes = await authApi.me();
            if(meRes.data && meRes.data.data) {
                await fetchAndCacheUserInfo(meRes.data.data.id);
            }
        } catch (ignore) {
// Nếu lỗi đoạn này thì thôi, Sidebar tự lo
        }

        // 3. Redirect
        const redirectTo = getRedirectPath("afterLogin", role_id);
        navigate(redirectTo);
      } else {
        setError(res.data.message || "Đăng nhập thất bại");
      }
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      setError(
        error.response?.data?.message || "Không thể kết nối máy chủ"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Đăng nhập</title>
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
          Đăng nhập
        </h3>
      </div>

      <form onSubmit={handleLogin}>
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
        >
          {loading ? "Đang xử lý..." : "Đăng nhập"}
        </button>
        <button type="button" onClick={() => navigate('http://localhost:8000/auth/google')} className="btn btn-google w-100">
          <i className="bi bi-google google-icon"></i>
          <span className="google-text">Đăng nhập với Google</span>
        </button>
      </form>

      <div className="text-center mt-3">
        <small>
          Chưa có tài khoản? <a href="/dang-ky">Đăng ký</a>
        </small>git
      </div>
    </>
  );
};
export default Login;
