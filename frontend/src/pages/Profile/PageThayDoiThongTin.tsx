import { Breadcrumbs, Link, Typography } from "@mui/material";
import { Helmet } from "react-helmet";
import { useEffect, useState } from "react";
import axios from "axios";

const USER_ID = "C01";

/* ================= INTERFACES ================= */

interface UserProfile {
  full_name?: string;
  phone?: string;
  birthday?: string;
  gender?: string;
}

interface User {
  email?: string;
  username?: string;
  profile?: UserProfile;
}

/* ================= COMPONENT ================= */

const EditProfile = () => {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    birthday: "",
    gender: "",
  });

  const [loading, setLoading] = useState(true);

  /* ================= FETCH USER ================= */

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`/api/users/${USER_ID}`);
        const data = res.data.data;

        setForm({
          full_name: data.profile?.full_name || "",
          email: data.email || "",
          phone: data.profile?.phone || "",
          birthday: data.profile?.birthday || "",
          gender: data.profile?.gender
            ? // map backend gender ("Nam"/"Nữ"/"Khác") → frontend ("male"/"female"/"other")
              data.profile.gender === "Nam"
                ? "male"
                : data.profile.gender === "Nữ"
                ? "female"
                : "other"
            : "",
        });
      } catch (error) {
        console.error("Lỗi load user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  /* ================= HANDLE CHANGE ================= */

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /* ================= SUBMIT ================= */
const handleSubmit = async () => {
  try {
    // Chuẩn bị payload
    const payload: any = {
      full_name: form.full_name || undefined,
      email: form.email || undefined,
      phone: form.phone || undefined,
      birthday: form.birthday || undefined,
    };

    // Chỉ thêm gender nếu người dùng đã chọn
    if (form.gender) {
      payload.gender =
        form.gender === "male" ? "Nam" :
        form.gender === "female" ? "Nữ" :
        "Khác";
    }

    console.log("Sending payload:", payload); // DEBUG

    await axios.put(`/api/users/${USER_ID}`, payload);

    alert("Cập nhật thông tin thành công");
    window.location.href = "/thong-tin-tai-khoan";
  } catch (error: any) {
    console.error(error.response?.data || error);
    alert(
      error.response?.data?.message || "Cập nhật thông tin thất bại"
    );
  }
};




  if (loading) return <p>Đang tải...</p>;

  /* ================= RENDER ================= */

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
            <Link
              underline="hover"
              color="inherit"
              href="/thong-tin-tai-khoan"
            >
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
                  name="full_name"
                  className="form-control"
                  value={form.full_name}
                  onChange={handleChange}
                />
              </div>

              {/* Email */}
              <div className="col-md-6 mb-3">
                <label className="fw-semibold">Email</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>

              {/* Số điện thoại */}
              <div className="col-md-6 mb-3">
                <label className="fw-semibold">Số điện thoại</label>
                <input
                  type="text"
                  name="phone"
                  className="form-control"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>

              {/* Ngày sinh */}
              <div className="col-md-6 mb-3">
                <label className="fw-semibold">Ngày sinh</label>
                <input
                  type="date"
                  name="birthday"
                  className="form-control"
                  value={form.birthday}
                  onChange={handleChange}
                />
              </div>

              {/* Giới tính */}
              <div className="col-md-6 mb-3">
                <label className="fw-semibold">Giới tính</label>
                <select
                  name="gender"
                  className="form-select"
                  value={form.gender}
                  onChange={handleChange}
                >
                  <option value="">-- Chọn --</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-4 text-end">
              <button
                className="btn btn-secondary me-2 px-4"
                onClick={() =>
                  (window.location.href = "/thong-tin-tai-khoan")
                }
              >
                <i className="bi bi-x-circle me-2"></i>
                Hủy
              </button>

              <button
                className="btn btn-primary px-4"
                onClick={handleSubmit}
              >
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
