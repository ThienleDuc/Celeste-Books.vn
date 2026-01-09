import { Breadcrumbs, Link, Typography } from "@mui/material";
import { Helmet } from "react-helmet";

const Profile = () => {
  return (
    <>
      <Helmet>
        <title>Thông Tin Tài Khoản</title>
      </Helmet>
      <div className="container my-4">
        <div className="mb-4">
          <h5 className="title-page">
            Thông tin tài khoản
          </h5>

          <Breadcrumbs aria-label="breadcrumb" className="mb-1">
            <Link underline="hover" color="inherit" href="/">
              Trang chủ
            </Link>
            <Typography color="text.primary">
              Thông tin tài khoản
            </Typography>
          </Breadcrumbs>
        </div>

        <div className="row">
          {/* ------------------ CỘT TRÁI: THÔNG TIN TÀI KHOẢN ------------------ */}
          <div className="col-12 col-md-8">
            <h5 className="title-section mb-3">
              Thông tin chi tiết
            </h5>
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="fw-semibold">Họ tên</label>
                    <div className="form-control">Nguyễn Văn A</div>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="fw-semibold">Email</label>
                    <div className="form-control">nguyenvana@example.com</div>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="fw-semibold">Số điện thoại</label>
                    <div className="form-control">0912345678</div>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="fw-semibold">Ngày tạo tài khoản</label>
                    <div className="form-control">15/02/2024</div>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="fw-semibold">Tỉnh / Thành phố</label>
                    <div className="form-control">TP. Hồ Chí Minh</div>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="fw-semibold">Xã / Phường</label>
                    <div className="form-control">Phường 5</div>
                  </div>

                  <div className="col-12 mb-3">
                    <label className="fw-semibold">Địa chỉ</label>
                    <div className="form-control">
                      123 Đường ABC, Phường 5, Quận 1
                    </div>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="fw-semibold">Trạng thái</label>
                    <div className="form-control text-success fw-bold">
                      <i className="bi bi-check-circle-fill me-1"></i>
                      Hoạt động
                    </div>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="fw-semibold">Vai trò</label>
                    <div className="form-control fw-bold">
                      <i className="bi bi-person-badge me-1"></i>
                      Nhân viên điều hành ga
                    </div>
                  </div>

                </div>

                <div className="text-end mt-3">
                  <button className="btn btn-primary px-4"
                  onClick={() => (window.location.href = "/thay-doi-thong-tin")}>
                    <i className="bi bi-pencil-square me-2"></i>
                    Chỉnh sửa thông tin
                  </button>
                </div>

              </div>
            </div>
          </div>

          {/* ------------------ CỘT PHẢI: AVATAR ------------------ */}
          <div className="col-12 col-md-4">
            <h5 className="title-section mb-3">
              Ảnh đại diện
            </h5>
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="text-center mb-3">
                  <img
                    src="../../public/img/69ac12ab-e056-47b3-b0f1-e27966d80ce0.jpg"
                    alt="avatar"
                    className="rounded-circle shadow"
                    style={{
                      width: "160px",
                      height: "160px",
                      objectFit: "cover",
                      border: "4px solid #e9ecef",
                    }}
                  />
                </div>

                <div className="text-center">
                  <label className="btn btn-danger px-4">
                    <i className="bi bi-upload me-1"></i>
                    Chọn ảnh
                    <input type="file" accept=".jpg,.jpeg,.png,.gif" className="d-none" />
                  </label>

                  <p className="text-muted small mt-2">
                    JPG, PNG, GIF — dưới 2MB
                  </p>

                  <p className="text-danger small">
                    Ảnh không phù hợp sẽ bị khóa tài khoản.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default Profile;
