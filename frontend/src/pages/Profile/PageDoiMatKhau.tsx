import { Breadcrumbs, Link, Typography } from "@mui/material";
import { Helmet } from "react-helmet";

const ChangePassword = () => {
  return (
    <>
      <Helmet>
        <title>Đổi Mật Khẩu</title>
      </Helmet>
      <div className="container my-4">
        <div className="mb-4">
          <h5 className="title-page">
            Đổi mật khẩu
          </h5>

          <Breadcrumbs aria-label="breadcrumb" className="mb-1">
            <Link underline="hover" color="inherit" href="/">
              Trang chủ
            </Link>
            <Link underline="hover" color="inherit" href="/thong-tin-tai-khoan">
              Thông tin tài khoản
            </Link>
            <Typography color="text.primary">
              Đổi mật khẩu
            </Typography>
          </Breadcrumbs>
        </div>

        <h5 className="fw-bold mb-3 title-section">
          Nhập mật khẩu của bạn
        </h5>

        <div className="row">
          <div className="col-12 col-md-6">
            <div className="card shadow-sm">
              <div className="card-body">
                {/* ----------------- FORM ----------------- */}
                <div className="mb-3">
                  <label className="fw-semibold">Mật khẩu hiện tại</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Nhập mật khẩu hiện tại"
                  />
                </div>

                <div className="mb-3">
                  <label className="fw-semibold">Mật khẩu mới</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Nhập mật khẩu mới"
                  />
                </div>

                <div className="mb-3">
                  <label className="fw-semibold">Xác nhận mật khẩu mới</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Nhập lại mật khẩu mới"
                  />
                </div>

                {/* ----------------- BUTTONS ----------------- */}
                <div className="d-flex justify-content-end gap-2 mt-4">

                  <button className="btn btn-secondary px-4" onClick={() => window.history.back()}>
                    <i className="bi bi-arrow-left me-1"></i>
                    Quay lại
                  </button>

                  <button className="btn btn-primary px-4">
                    <i className="bi bi-check2-square me-1"></i>
                    Lưu thay đổi
                  </button>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChangePassword;
