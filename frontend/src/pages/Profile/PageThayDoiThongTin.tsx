import { Breadcrumbs, Link, Typography } from "@mui/material";
import { Helmet } from "react-helmet";

const EditProfile = () => {
  return (
    <>
      <Helmet>
        <title>Thay Đổi Thông Tin Tài Khoản</title>
      </Helmet>
      <div className="container my-4">
        <div className="mb-4">
          <h5 className="title-page fs-1-25rem">
            Thay đổi thông tin tài khoản
          </h5>

          <Breadcrumbs aria-label="breadcrumb" className="mb-1">
            <Link underline="hover" color="inherit" href="/">
              Trang chủ
            </Link>
            <Link underline="hover" color="inherit" href="/thong-tin-tai-khoan">
              Thông tin tài khoản
            </Link>
            <Typography color="text.primary">
              Thay đổi thông tin
            </Typography>
          </Breadcrumbs>
        </div>

        <h5 className="fw-bold mb-3 title-section">
          Chỉnh sửa thông tin
        </h5>

        <div className="card shadow-sm">
          <div className="card-body">
            <div className="row">

              {/* Họ tên */}
              <div className="col-md-6 mb-3">
                <label className="fw-semibold">Họ tên</label>
                <input
                  type="text"
                  className="form-control"
                  defaultValue="Nguyễn Văn A"
                />
              </div>

              {/* Email */}
              <div className="col-md-6 mb-3">
                <label className="fw-semibold">Email</label>
                <input
                  type="email"
                  className="form-control"
                  defaultValue="nguyenvana@example.com"
                />
              </div>

              {/* Số điện thoại */}
              <div className="col-md-6 mb-3">
                <label className="fw-semibold">Số điện thoại</label>
                <input
                  type="text"
                  className="form-control"
                  defaultValue="0912345678"
                />
              </div>

              {/* Tỉnh / Thành phố */}
              <div className="col-md-6 mb-3">
                <label className="fw-semibold">Tỉnh / Thành phố</label>
                <select className="form-select">
                  <option>TP. Hồ Chí Minh</option>
                  <option>Hà Nội</option>
                  <option>Đà Nẵng</option>
                  <option>Cần Thơ</option>
                </select>
              </div>

              {/* Xã / Phường */}
              <div className="col-md-6 mb-3">
                <label className="fw-semibold">Xã / Phường</label>
                <select className="form-select">
                  <option>Phường 5</option>
                  <option>Phường 7</option>
                  <option>Phường Bình An</option>
                  <option>Phường Linh Trung</option>
                </select>
              </div>

              {/* Địa chỉ */}
              <div className="col-12 mb-3">
                <label className="fw-semibold">Địa chỉ chi tiết</label>
                <input
                  type="text"
                  className="form-control"
                  defaultValue="123 Đường ABC, Quận 1"
                />
              </div>

            </div>

            {/* Buttons */}
            <div className="mt-4 text-end">
              <button className="btn btn-secondary me-2 px-4">
                <i className="bi bi-x-circle me-2"></i>
                Hủy
              </button>

              <button className="btn btn-primary px-4">
                <i className="bi bi-check2-circle me-2"></i>
                Lưu thay đổi
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default EditProfile;
