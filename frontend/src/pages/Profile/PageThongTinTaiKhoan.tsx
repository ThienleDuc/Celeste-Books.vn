import { Breadcrumbs, Link, Typography } from "@mui/material";
import { Helmet } from "react-helmet";
import { useEffect, useState } from "react";
import axios from "axios";

const BACKEND_URL = "http://127.0.0.1:8000";
const USER_ID = "C01";

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
  email?: string;
  created_at?: string;
  is_active?: boolean;
  profile?: UserProfile;
  role?: UserRole;
}

/* ================= COMPONENT ================= */

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);

  /* ================= FETCH USER ================= */

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`/api/users/${USER_ID}`);
        if (res.data?.data) {
          setUser(res.data.data);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Lỗi load profile:", error);
        setUser(null);
      }
    };

    fetchUser();
  }, []);

  if (!user) return <p>Đang tải...</p>;

  const profile = user.profile || {};
  const role = user.role || {};

  /* ================= AVATAR UPLOAD ================= */

  const handleAvatarChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Ảnh phải nhỏ hơn 2MB");
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const res = await axios.post(
        `/api/users/${USER_ID}/avatar`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      // 🔥 update avatar ngay, không reload
      setUser({
        ...user,
        profile: {
          ...profile,
          avatar_url: res.data.avatar_url.replace(
            `${BACKEND_URL}/storage/`,
            ""
          ),
        },
      });

      alert("Upload avatar thành công");
    } catch (err) {
      console.error(err);
      alert("Upload avatar thất bại");
    }
  };

  /* ================= RENDER ================= */

  return (
    <>
      <Helmet>
        <title>Thông Tin Tài Khoản</title>
      </Helmet>

      <div className="container my-4">
        <div className="mb-4">
          <h5 className="title-page">Thông tin tài khoản</h5>
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
          {/* ================= CỘT TRÁI ================= */}
          <div className="col-12 col-md-8">
            <h5 className="title-section mb-3">Thông tin chi tiết</h5>
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="fw-semibold">Họ tên</label>
                    <div className="form-control">
                      {profile.full_name || "-"}
                    </div>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="fw-semibold">Email</label>
                    <div className="form-control">
                      {user.email || "-"}
                    </div>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="fw-semibold">Số điện thoại</label>
                    <div className="form-control">
                      {profile.phone || "-"}
                    </div>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="fw-semibold">Ngày sinh</label>
                    <div className="form-control">
                      {profile.birthday
                        ? new Date(profile.birthday).toLocaleDateString("vi-VN")
                        : "-"}
                    </div>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="fw-semibold">Giới tính</label>
                    <div className="form-control">
                      {profile.gender || "-"}
                    </div>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="fw-semibold">Ngày tạo tài khoản</label>
                    <div className="form-control">
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString("vi-VN")
                        : "-"}
                    </div>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="fw-semibold">Trạng thái</label>
                    <div
                      className={`form-control fw-bold ${
                        user.is_active ? "text-success" : "text-danger"
                      }`}
                    >
                      {user.is_active ? "Hoạt động" : "Vô hiệu hóa"}
                    </div>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="fw-semibold">Vai trò</label>
                    <div className="form-control fw-bold">
                      {role.name || "-"}
                    </div>
                  </div>
                </div>

                <div className="text-end mt-3">
                  <button
                    className="btn btn-primary px-4"
                    onClick={() =>
                      (window.location.href = "/thay-doi-thong-tin")
                    }
                  >
                    <i className="bi bi-pencil-square me-2"></i>
                    Chỉnh sửa thông tin
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ================= CỘT PHẢI ================= */}
          <div className="col-12 col-md-4">
            <h5 className="title-section mb-3">Ảnh đại diện</h5>
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="text-center mb-3">
                  <img
                    src={
                      profile.avatar_url
                        ? `${BACKEND_URL}/storage/${profile.avatar_url}`
                        : "/img/default-avatar.png"
                    }
                    alt="avatar"
                    className="rounded-circle"
                    style={{
                      width: 150,
                      height: 150,
                      objectFit: "cover",
                    }}
                  />
                </div>

                <div className="text-center">
                  <label className="btn btn-danger px-4">
                    <i className="bi bi-upload me-1"></i>Chọn ảnh
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.gif"
                      className="d-none"
                      onChange={handleAvatarChange}
                    />
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
