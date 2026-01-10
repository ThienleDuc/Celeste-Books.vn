import { Helmet } from "react-helmet";

const Login = () => {
  return (
    <>
      <Helmet>
        <title>Đăng nhập</title>
      </Helmet>

      <div className="auth-title-container position-relative text-center mb-4">
        {/* Home button */}
        <a
          href="/"
          className="home-btn position-absolute start-0 top-50 translate-middle-y"
          title="Trang chủ"
        >
          <i className="bi bi-house-door-fill"></i>
        </a>

        {/* Login icon + title */}
        <h3 className="fw-bold auth-title d-inline-flex align-items-center gap-2 mb-0">
          <i className="bi bi-box-arrow-in-right"></i>
          Đăng nhập
        </h3>
      </div>

      <form>
        <div className="mb-3">
          <input
            type="email"
            className="form-control"
            placeholder="Nhập email"
          />
        </div>

        <div className="mb-3">
          <input
            type="password"
            className="form-control"
            placeholder="Nhập mật khẩu"
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

        <button className="btn btn-success w-100 mb-3" type="submit">
          Đăng nhập
        </button>

        {/* 🔹 Google Login Button */}
      <a
        href="http://127.0.0.1:8000/auth/google"
        className="btn btn-google w-100 d-flex align-items-center justify-content-center gap-2"
      >
        <i className="bi bi-google google-icon"></i>
        <span className="google-text">Đăng nhập với Google</span>//sử dụng usenavigate lưu userid vào
      </a>

      </form>

      <div className="text-center mt-3">
        <small>
          Chưa có tài khoản? <a href="/dang-ky">Đăng ký</a>
        </small>
      </div>
    </>
  );
};

export default Login;
