import { Helmet } from "react-helmet";

const ForgotPassword = () => {
  return (
    <>
      <Helmet>
        <title>Quên mật khẩu</title>
      </Helmet>
      
      <div className="auth-title-container position-relative text-center mb-4">
        {/* Home button - nằm ngoài lề bên trái */}
        <a
          href="/"
          className="home-btn position-absolute start-0 top-50 translate-middle-y"
          title="Trang chủ"
        >
          <i className="bi bi-house-door-fill"></i>
        </a>

        {/* Forgot Password icon + title - căn giữa */}
        <h3 className="fw-bold auth-title d-inline-flex align-items-center gap-2 mb-0">
          <i className="bi bi-person-lock"></i>
          Quên mật khẩu
        </h3>
      </div>

      <p className="text-muted text-center mb-4">
        Nhập email đã đăng ký. Chúng tôi sẽ gửi liên kết đặt lại mật khẩu.
      </p>

      <form>
        <div className="mb-3">
          <input
            type="email"
            className="form-control"
            placeholder="Nhập email của bạn"
            required
          />
        </div>

        <button type="submit" className="btn btn-success w-100">
          Gửi yêu cầu
        </button>
      </form>

      <div className="text-center mt-3">
        <small>
          Nhớ mật khẩu rồi? <a href="/dang-nhap">Đăng nhập</a>
        </small>
      </div>
    </>
  );
};

export default ForgotPassword;
