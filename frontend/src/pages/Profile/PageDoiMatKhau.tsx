import { Breadcrumbs, Link, Typography } from "@mui/material";
import { Helmet } from "react-helmet";
import { useState, useEffect } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import axiosClient from "../../api/axios";
import authApi from "../../api/auth.api";

const ChangePassword = () => {
  const navigate = useNavigate();

  // 1. Lấy ID từ Cache
  const [userId, setUserId] = useState<string | null>(() => {
      try {
          const saved = localStorage.getItem("user_info");
          return saved ? JSON.parse(saved).id : null;
      } catch { return null; }
  });
  
  // 2. Lấy trạng thái từ Cache (Mặc định là true để ưu tiên hiển thị đổi pass)
  const [hasPassword, setHasPassword] = useState(() => {
    try {
        const saved = localStorage.getItem("user_info");
        if (saved) {
            const u = JSON.parse(saved);
            return u.has_password !== undefined ? u.has_password : true; 
        }
        return true; 
    } catch { return true; }
  });

  // State cho password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // State cho hiển thị/ẩn password
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(!userId); 

  // --- 1. FETCH USER INFO ---
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) { navigate("/dang-nhap"); return; }

        const res = await authApi.me();
        
        if (res.data && res.data.data) {
          const userData = res.data.data;
          setUserId(userData.id);

          let finalHasPass = hasPassword;

          if (typeof userData.has_password !== 'undefined') {
              finalHasPass = userData.has_password;
          } 
          else if (typeof userData.password !== 'undefined') {
              finalHasPass = userData.password && userData.password.length > 0;
          }

          setHasPassword(finalHasPass);

          const saved = localStorage.getItem("user_info");
          if(saved) {
              const cached = JSON.parse(saved);
              if (cached.has_password !== finalHasPass) {
                  cached.has_password = finalHasPass;
                  localStorage.setItem("user_info", JSON.stringify(cached));
              }
          }
        }
      } catch (error) {
        console.error("Lỗi xác thực:", error);
        navigate("/dang-nhap");
      } finally {
        setPageLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  // --- 2. XỬ LÝ SUBMIT ---
  const handleSubmit = async () => {
    if (!userId) return;

    if (hasPassword && !currentPassword) { alert("Vui lòng nhập mật khẩu hiện tại!"); return; }
    if (!newPassword || !confirmPassword) { alert("Vui lòng nhập mật khẩu mới!"); return; }
    if (newPassword !== confirmPassword) { alert("Mật khẩu xác nhận không khớp!"); return; }
    if (newPassword.length < 6) { alert("Mật khẩu mới phải có ít nhất 6 ký tự!"); return; }

    try {
      setLoading(true);
      const payload: any = {
        new_password: newPassword,
        new_password_confirmation: confirmPassword,
      };
      
      if (hasPassword) {
          payload.current_password = currentPassword;
      }

      await axiosClient.put(`/users/${userId}/password`, payload);

      if (!hasPassword) {
          alert("🎉 Tạo mật khẩu thành công! Bây giờ bạn có thể đăng nhập bằng mật khẩu này.");
          
          const saved = localStorage.getItem("user_info");
          if(saved) {
              const cached = JSON.parse(saved);
              cached.has_password = true; 
              localStorage.setItem("user_info", JSON.stringify(cached));
          }
          
          navigate("/thong-tin-tai-khoan");
      } else {
          alert("🎉 Đổi mật khẩu thành công!");
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
      }

    } catch (error: any) {
      let thongBaoLoi = "Thất bại. Vui lòng thử lại.";
      if (error.response?.data?.message) thongBaoLoi = error.response.data.message;
      else if (error.response?.data?.errors) {
         const firstKey = Object.keys(error.response.data.errors)[0];
         thongBaoLoi = error.response.data.errors[firstKey][0];
      }
      alert(`⚠️ Lỗi: ${thongBaoLoi}`);
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) return <p className="text-center mt-5">Đang tải...</p>;

  return (
    <>
      <Helmet><title>{hasPassword ? "Đổi Mật Khẩu" : "Thiết Lập Mật Khẩu"}</title></Helmet>
      <div className="container my-4">
        <div className="mb-4">
          <h5 className="title-page fs-4 fw-bold text-primary">
             {hasPassword ? "Đổi mật khẩu" : "Thiết lập mật khẩu"}
          </h5>
          <Breadcrumbs aria-label="breadcrumb">
            <Link component={RouterLink} to="/" underline="hover" color="inherit">Trang chủ</Link>
            <Link component={RouterLink} to="/thong-tin-tai-khoan" underline="hover" color="inherit">Thông tin tài khoản</Link>
            <Typography color="text.primary">
                {hasPassword ? "Đổi mật khẩu" : "Tạo mật khẩu"}
            </Typography>
          </Breadcrumbs>
        </div>

        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="card shadow border-0 rounded-3">
              <div className="card-body p-4">
                
                {hasPassword ? (
                  <div className="mb-3">
                    <label className="fw-semibold form-label">
                      Mật khẩu hiện tại <span className="text-danger">*</span>
                    </label>
                    <div className="position-relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        className="form-control pe-4"
                        value={currentPassword}
                        placeholder="Nhập mật khẩu cũ..."
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="btn btn-link position-absolute end-0 top-50 translate-middle-y me-2 p-0 border-0"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        style={{ background: 'none' }}
                      >
                        <i className={`bi ${showCurrentPassword ? "bi-eye-slash text-muted" : "bi-eye text-muted"}`}></i>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="alert alert-info mb-3 small d-flex align-items-center">
                      <i className="bi bi-info-circle-fill me-2 fs-5"></i>
                      <div>
                        Bạn đang sử dụng tài khoản Google chưa có mật khẩu.<br/>
                        Hãy tạo mật khẩu mới để có thể đăng nhập bằng Email sau này.
                      </div>
                  </div>
                )}

                <div className="mb-3">
                  <label className="fw-semibold form-label">
                    Mật khẩu mới <span className="text-danger">*</span>
                  </label>
                  <div className="position-relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      className="form-control pe-4"
                      value={newPassword}
                      placeholder="Tối thiểu 6 ký tự..."
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn btn-link position-absolute end-0 top-50 translate-middle-y me-2 p-0 border-0"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      style={{ background: 'none' }}
                    >
                      <i className={`bi ${showNewPassword ? "bi-eye-slash text-muted" : "bi-eye text-muted"}`}></i>
                    </button>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="fw-semibold form-label">
                    Xác nhận mật khẩu mới <span className="text-danger">*</span>
                  </label>
                  <div className="position-relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className="form-control pe-4"
                      value={confirmPassword}
                      placeholder="Nhập lại mật khẩu mới..."
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn btn-link position-absolute end-0 top-50 translate-middle-y me-2 p-0 border-0"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{ background: 'none' }}
                    >
                      <i className={`bi ${showConfirmPassword ? "bi-eye-slash text-muted" : "bi-eye text-muted"}`}></i>
                    </button>
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-2 mt-4">
                  <button className="btn btn-secondary px-4" onClick={() => navigate("/thong-tin-tai-khoan")} disabled={loading}>Quay lại</button>
                  <button className="btn btn-primary px-4 fw-bold" onClick={handleSubmit} disabled={loading}>
                    {loading ? "Đang xử lý..." : (hasPassword ? "Lưu thay đổi" : "Tạo mật khẩu")}
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