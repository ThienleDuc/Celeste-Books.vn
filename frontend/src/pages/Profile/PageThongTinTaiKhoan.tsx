import { Breadcrumbs, Link, Typography } from "@mui/material";
import { Helmet } from "react-helmet";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../api/axios";
import authApi from "../../api/auth.api";

const BACKEND_URL = "http://127.0.0.1:8000";

/* ================= INTERFACES ================= */
interface UserProfile {
  full_name?: string;
  phone?: string;
  birthday?: string;
  gender?: string;
  avatar_url?: string;
}

interface UserRole {
  name?: string;
}

interface User {
  id?: string;
  email?: string;
  created_at?: string;
  is_active?: boolean;
  profile?: UserProfile;
  role?: UserRole;
}

/* ================= COMPONENT ================= */

const Profile = () => {
  const navigate = useNavigate();

  // ✅ 1. KHỞI TẠO STATE TỪ CACHE
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem("user_info");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(!user);

  /* ================= FETCH USER ================= */
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          navigate("/dang-nhap");
          return;
        }

        let currentUserId = user?.id;

        if (!currentUserId) {
           const meRes = await authApi.me();
           if (meRes.data && meRes.data.data) {
             currentUserId = meRes.data.data.id;
           }
        }

        if (currentUserId) {
          const res = await axiosClient.get(`/users/${currentUserId}`);
          if (res.data?.data) {
             const newData = res.data.data;
             setUser(newData);
             localStorage.setItem("user_info", JSON.stringify(newData));
          }
        }
      } catch (error) {
        console.error("Lỗi load profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  /* ================= AVATAR UPLOAD ================= */
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Ảnh phải nhỏ hơn 2MB");
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const res = await axiosClient.post(
        `/users/${user.id}/avatar`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const newAvatarUrl = res.data.avatar_url.replace(/^https?:\/\/[^/]+\/storage\//, "");
      
      const updatedUser = {
          ...user,
          profile: {
              ...user.profile,
              avatar_url: newAvatarUrl
          }
      };

      setUser(updatedUser);
      localStorage.setItem("user_info", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("user-profile-updated"));

      alert("Upload avatar thành công");
    } catch (err) {
      console.error(err);
      alert("Upload avatar thất bại");
    }
  };

  /* ================= HELPER: XỬ LÝ URL ẢNH ================= */
  const getAvatarUrl = () => {
    const url = user?.profile?.avatar_url;
    
    // 1. Nếu không có url -> Trả về ảnh mặc định
    if (!url) {
        // 👇 Link ảnh mặc định (bạn có thể thay bằng đường dẫn file nội bộ: "/img/default-avatar.png")
        return "https://cdn-icons-png.flaticon.com/512/149/149071.png";
    }

    // 2. Nếu là ảnh Google/Facebook (bắt đầu bằng http) -> Dùng nguyên link
    if (url.startsWith("http")) {
        return url;
    }

    // 3. Nếu là ảnh upload lên server -> Nối thêm domain backend
    return `${BACKEND_URL}/storage/${url}`;
  };

  /* ================= RENDER ================= */
  if (loading) return <p className="text-center mt-5">Đang tải...</p>;
  if (!user) return <p className="text-center mt-5">Không tìm thấy thông tin người dùng</p>;

  const profile = user.profile || {};
  const role = user.role || {};

  return (
    <>
      <Helmet><title>Thông Tin Tài Khoản</title></Helmet>

      <div className="container my-4">
        <div className="mb-4">
          <h5 className="title-page">Thông tin tài khoản</h5>
          <Breadcrumbs aria-label="breadcrumb" className="mb-1">
            <Link underline="hover" color="inherit" href="/">Trang chủ</Link>
            <Typography color="text.primary">Thông tin tài khoản</Typography>
          </Breadcrumbs>
        </div>

        <div className="row">
          {/* CỘT TRÁI - INFO */}
          <div className="col-12 col-md-8">
            <h5 className="title-section mb-3">Thông tin chi tiết</h5>
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="fw-semibold">Họ tên</label>
                    <div className="form-control">{profile.full_name || "-"}</div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="fw-semibold">Email</label>
                    <div className="form-control">{user.email || "-"}</div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="fw-semibold">Số điện thoại</label>
                    <div className="form-control">{profile.phone || "-"}</div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="fw-semibold">Ngày sinh</label>
                    <div className="form-control">
                      {profile.birthday ? new Date(profile.birthday).toLocaleDateString("vi-VN") : "-"}
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="fw-semibold">Giới tính</label>
                    <div className="form-control">{profile.gender || "-"}</div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="fw-semibold">Ngày tạo</label>
                    <div className="form-control">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString("vi-VN") : "-"}
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="fw-semibold">Trạng thái</label>
                    <div className={`form-control fw-bold ${user.is_active ? "text-success" : "text-danger"}`}>
                      {user.is_active ? "Hoạt động" : "Vô hiệu hóa"}
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="fw-semibold">Vai trò</label>
                    <div className="form-control fw-bold">{role.name || "-"}</div>
                  </div>
                </div>

                <div className="text-end mt-3">
                  <button
                    className="btn btn-primary px-4"
                    onClick={() => navigate("/thay-doi-thong-tin")}
                  >
                    <i className="bi bi-pencil-square me-2"></i>Chỉnh sửa thông tin
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI - AVATAR */}
          <div className="col-12 col-md-4">
            <h5 className="title-section mb-3">Ảnh đại diện</h5>
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="text-center mb-3">
                  {/* ✅ SỬA: Dùng hàm getAvatarUrl để hiển thị */}
                  <img
                    src={getAvatarUrl()}
                    alt="avatar"
                    className="rounded-circle"
                    style={{ width: 150, height: 150, objectFit: "cover" }}
                    // Nếu link ảnh bị lỗi (404), tự động chuyển về ảnh mặc định
                    onError={(e) => { 
                        e.currentTarget.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png"; 
                    }}
                  />
                </div>
                <div className="text-center">
                  <label className="btn btn-danger px-4">
                    <i className="bi bi-upload me-1"></i>Chọn ảnh
                    <input type="file" accept=".jpg,.jpeg,.png,.gif" className="d-none" onChange={handleAvatarChange} />
                  </label>
                  <p className="text-muted small mt-2">JPG, PNG, GIF — dưới 2MB</p>
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