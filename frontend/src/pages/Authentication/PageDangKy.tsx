import { Helmet } from "react-helmet";
const Register = () => {
  return (
    <>
      <Helmet>
        <title>Đăng ký tài khoản</title>
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

        {/* Register icon + title - căn giữa */}
        <h3 className="fw-bold auth-title d-inline-flex align-items-center gap-2 mb-0">
          <i className="bi bi-person-plus"></i>
          Đăng ký tài khoản
        </h3>
      </div>

      <form>
        <div className="row g-3">
          {/* Cột trái */}
          <div className="col-md-6">
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Nhập họ và tên"
              />
            </div>

            <div className="mb-3">
              <input
                type="email"
                className="form-control"
                placeholder="Nhập email"
              />
            </div>
          </div>

          {/* Cột phải */}
          <div className="col-md-6">
            <div className="mb-3">
              <input
                type="password"
                className="form-control"
                placeholder="Nhập mật khẩu"
              />
            </div>

            <div className="mb-3">
              <input
                type="password"
                className="form-control"
                placeholder="Nhập lại mật khẩu"
              />
            </div>
          </div>
        </div>

        <button className="btn btn-success w-50 mt-3 text-center d-block mx-auto">
          Đăng ký
        </button>
      </form>

      <div className="text-center mt-3">
        <small>
          Đã có tài khoản? <a href="/dang-nhap">Đăng nhập</a>
        </small>
      </div>
    </>
  );
};

export default Register;
