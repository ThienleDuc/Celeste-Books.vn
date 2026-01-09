import { Breadcrumbs, Link, Typography } from "@mui/material";
import { Helmet } from "react-helmet";
import { useState } from "react";
import axios from "axios";
import { Link as RouterLink } from "react-router-dom";

const ChangePassword = () => {
  // --- STATE ---
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // --- CONFIG ---
  // Lưu ý: ID phải khớp với Database (C01 viết hoa)
  const userId = "C01"; 
  const token = localStorage.getItem("token");

  // --- HANDLE SUBMIT ---
  const handleSubmit = async () => {
    // 1. Validate phía Client
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }

    if (newPassword.length < 6) {
      alert("Mật khẩu mới phải có ít nhất 6 ký tự!");
      return;
    }

    try {
      setLoading(true);

      // 2. Gọi API
      await axios.put(
        `http://localhost:8000/api/users/${userId}/password`,
        {
          current_password: currentPassword,
          new_password: newPassword,
          new_password_confirmation: confirmPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      // 3. Thành công
      alert("🎉 Đổi mật khẩu thành công!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // window.location.href = "/login"; // Bật dòng này nếu muốn logout sau khi đổi

    } catch (error: any) { // 👈 QUAN TRỌNG: Thêm ": any" để hết lỗi đỏ
      console.error("Chi tiết lỗi:", error);

      let thongBaoLoi = "Đổi mật khẩu thất bại. Vui lòng thử lại.";

      if (error.response) {
        const { status, data } = error.response;

        // Xử lý lỗi Validate (422)
        if (status === 422 && data.errors) {
          const firstKey = Object.keys(data.errors)[0];
          thongBaoLoi = data.errors[firstKey][0];
        } 
        // Xử lý lỗi Logic (400, 404...)
        else if (data.message) {
          thongBaoLoi = data.message;
        }
      } else if (error.request) {
        // Lỗi mạng hoặc server không phản hồi
        thongBaoLoi = "Không thể kết nối đến Server. Vui lòng kiểm tra mạng.";
      } else {
        thongBaoLoi = error.message;
      }

      alert(`⚠️ Lỗi: ${thongBaoLoi}`);
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER ---
  return (
    <>
      <Helmet>
        <title>Đổi Mật Khẩu</title>
      </Helmet>

      <div className="container my-4">
        {/* Header */}
        <div className="mb-4">
          <h5 className="title-page fs-4 fw-bold text-primary">Đổi mật khẩu</h5>

          <Breadcrumbs aria-label="breadcrumb" className="mb-1">
            <Link component={RouterLink} to="/" underline="hover" color="inherit">
              Trang chủ
            </Link>
            <Link
              component={RouterLink}
              to="/thong-tin-tai-khoan"
              underline="hover"
              color="inherit"
            >
              Thông tin tài khoản
            </Link>
            <Typography color="text.primary">Đổi mật khẩu</Typography>
          </Breadcrumbs>
        </div>

        {/* Form Card */}
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="card shadow border-0 rounded-3">
              <div className="card-body p-4">
                
                {/* Current Password */}
                <div className="mb-3">
                  <label className="fw-semibold form-label">
                    Mật khẩu hiện tại <span className="text-danger">*</span>
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    value={currentPassword}
                    placeholder="Nhập mật khẩu cũ..."
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>

                {/* New Password */}
                <div className="mb-3">
                  <label className="fw-semibold form-label">
                    Mật khẩu mới <span className="text-danger">*</span>
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    value={newPassword}
                    placeholder="Tối thiểu 6 ký tự..."
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>

                {/* Confirm Password */}
                <div className="mb-3">
                  <label className="fw-semibold form-label">
                    Xác nhận mật khẩu mới <span className="text-danger">*</span>
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    value={confirmPassword}
                    placeholder="Nhập lại mật khẩu mới..."
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                {/* Buttons */}
                <div className="d-flex justify-content-end gap-2 mt-4">
                  <button
                    className="btn btn-secondary px-4"
                    onClick={() => window.history.back()}
                    disabled={loading}
                  >
                    Quay lại
                  </button>

                  <button
                    className="btn btn-primary px-4 fw-bold"
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Đang lưu...
                      </>
                    ) : (
                      "Lưu thay đổi"
                    )}
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