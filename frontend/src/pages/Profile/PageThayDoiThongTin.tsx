import { Breadcrumbs, Link, Typography } from "@mui/material";
import { Helmet } from "react-helmet";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../api/axios"; 
import authApi from "../../api/auth.api"; 

const EditProfile = () => {
  const navigate = useNavigate();
  
  // 1. Lấy ID từ cache
  const [userId, setUserId] = useState<string | null>(() => {
      try {
        const saved = localStorage.getItem("user_info");
        return saved ? JSON.parse(saved).id : null;
      } catch { return null; }
  });

  // 2. Fill form từ Cache
  const [form, setForm] = useState(() => {
    try {
        const saved = localStorage.getItem("user_info");
        if(saved) {
            const d = JSON.parse(saved);
            const p = d.profile || {};
            return {
                full_name: p.full_name || "",
                email: d.email || "",
                phone: p.phone || "",
                birthday: p.birthday || "",
                gender: p.gender === "Nam" ? "male" : p.gender === "Nữ" ? "female" : p.gender === "Khác" ? "other" : ""
            };
        }
    } catch {}
    return { full_name: "", email: "", phone: "", birthday: "", gender: "" };
  });

  // ✅ 3. THÊM: State lưu thông báo lỗi
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [loading, setLoading] = useState(false);

  /* ================= FETCH USER ================= */
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) { navigate("/dang-nhap"); return; }

        let currentId = userId;
        if (!currentId) {
             const meRes = await authApi.me();
             if (meRes.data?.data) currentId = meRes.data.data.id;
        }
        
        if (currentId) {
            setUserId(currentId);
            const res = await axiosClient.get(`/users/${currentId}`);
            const data = res.data.data;

            setForm({
              full_name: data.profile?.full_name || "",
              email: data.email || "",
              phone: data.profile?.phone || "",
              birthday: data.profile?.birthday || "",
              gender: data.profile?.gender === "Nam" ? "male" 
                    : data.profile?.gender === "Nữ" ? "female" 
                    : "other",
            });
            
            localStorage.setItem("user_info", JSON.stringify(data));
        }
      } catch (error) {
        console.error("Lỗi load user:", error);
      }
    };
    fetchUserData();
  }, [navigate]);

  /* ================= HANDLE CHANGE ================= */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // ✅ Khi người dùng nhập lại, xóa lỗi của ô đó đi cho đỡ ngứa mắt
    if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // ✅ 4. THÊM: Hàm kiểm tra lỗi logic
  const validateForm = () => {
      const newErrors: { [key: string]: string } = {};

      // Kiểm tra Họ tên
      if (!form.full_name.trim()) {
          newErrors.full_name = "Họ tên không được để trống.";
      }

      // Kiểm tra Số điện thoại
      if (form.phone) {
          // Regex chỉ cho phép số
          const isNumeric = /^\d+$/.test(form.phone);
          if (!isNumeric) {
              newErrors.phone = "Số điện thoại chỉ được chứa số.";
          } else if (form.phone.length !== 10) {
              newErrors.phone = "Số điện thoại phải có đúng 10 chữ số.";
          } else if (!form.phone.startsWith("0")) {
             newErrors.phone = "Số điện thoại phải bắt đầu bằng số 0.";
          }
      } else {
          // Nếu bạn muốn bắt buộc nhập SĐT thì mở dòng dưới ra
          // newErrors.phone = "Vui lòng nhập số điện thoại.";
      }

      setErrors(newErrors);

      // Nếu không có lỗi nào (Object rỗng) thì trả về true
      return Object.keys(newErrors).length === 0;
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    if (!userId) return;

    // ✅ Chạy kiểm tra trước khi gửi
    if (!validateForm()) {
        // Có thể alert thêm để người dùng chú ý
        alert("Thông tin không hợp lệ. Vui lòng kiểm tra lại!");
        return; 
    }

    try {
      const genderText = form.gender === "male" ? "Nam" : form.gender === "female" ? "Nữ" : "Khác";
      
      const payload: any = {
        full_name: form.full_name || undefined,
        phone: form.phone || undefined,
        birthday: form.birthday || undefined,
        gender: form.gender ? genderText : undefined,
      };

      await axiosClient.put(`/users/${userId}`, payload);
      
      const saved = localStorage.getItem("user_info");
      if(saved) {
          const oldData = JSON.parse(saved);
          const newData = {
              ...oldData,
              profile: {
                  ...oldData.profile,
                  full_name: form.full_name,
                  phone: form.phone,
                  birthday: form.birthday,
                  gender: genderText
              }
          };
          localStorage.setItem("user_info", JSON.stringify(newData));
          window.dispatchEvent(new Event("user-profile-updated"));
      }

      alert("Cập nhật thông tin thành công");
      navigate("/thong-tin-tai-khoan"); 

    } catch (error: any) {
      alert(error.response?.data?.message || "Cập nhật thông tin thất bại");
    }
  };

  if (loading) return <p className="text-center mt-5">Đang tải...</p>;

  return (
    <>
      <Helmet><title>Thay Đổi Thông Tin Tài Khoản</title></Helmet>
      <div className="container my-4">
        <div className="mb-4">
            <h5 className="title-page">Thay đổi thông tin tài khoản</h5>
            <Breadcrumbs aria-label="breadcrumb">
                <Link underline="hover" color="inherit" href="/">Trang chủ</Link>
                <Link underline="hover" color="inherit" href="/thong-tin-tai-khoan">Thông tin tài khoản</Link>
                <Typography color="text.primary">Thay đổi thông tin</Typography>
            </Breadcrumbs>
        </div>

        <div className="card shadow-sm">
          <div className="card-body">
             <div className="row">
                {/* Họ tên */}
                <div className="col-md-6 mb-3">
                   <label className="fw-semibold">Họ tên <span className="text-danger">*</span></label>
                   <input 
                        type="text" 
                        name="full_name" 
                        className={`form-control ${errors.full_name ? "is-invalid" : ""}`} 
                        value={form.full_name} 
                        onChange={handleChange} 
                   />
                   {/* 👇 Hiển thị lỗi ngay dưới input */}
                   {errors.full_name && <small className="text-danger">{errors.full_name}</small>}
                </div>

                {/* Email */}
                <div className="col-md-6 mb-3">
                   <label className="fw-semibold">Email</label>
                   <input type="email" name="email" className="form-control bg-light" value={form.email} disabled />
                </div>

                {/* Số điện thoại */}
                <div className="col-md-6 mb-3">
                   <label className="fw-semibold">Số điện thoại</label>
                   <input 
                        type="text" 
                        name="phone" 
                        className={`form-control ${errors.phone ? "is-invalid" : ""}`} 
                        value={form.phone} 
                        onChange={handleChange} 
                        maxLength={10} // Giới hạn nhập tối đa 10 ký tự trên giao diện luôn
                   />
                   {/* 👇 Hiển thị lỗi ngay dưới input */}
                   {errors.phone && <small className="text-danger">{errors.phone}</small>}
                </div>

                {/* Ngày sinh */}
                <div className="col-md-6 mb-3">
                   <label className="fw-semibold">Ngày sinh</label>
                   <input type="date" name="birthday" className="form-control" value={form.birthday} onChange={handleChange} />
                </div>

                {/* Giới tính */}
                <div className="col-md-6 mb-3">
                   <label className="fw-semibold">Giới tính</label>
                   <select name="gender" className="form-select" value={form.gender} onChange={handleChange}>
                      <option value="">-- Chọn --</option>
                      <option value="male">Nam</option>
                      <option value="female">Nữ</option>
                      <option value="other">Khác</option>
                   </select>
                </div>
             </div>
             
             <div className="mt-4 text-end">
                <button className="btn btn-secondary me-2 px-4" onClick={() => navigate("/thong-tin-tai-khoan")}>Hủy</button>
                <button className="btn btn-primary px-4" onClick={handleSubmit}>Lưu thay đổi</button>
             </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default EditProfile;