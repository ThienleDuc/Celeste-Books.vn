import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import authApi from "../../api/auth.api";
import axiosClient from "../../api/axios";

const SidebarProfile = () => {
  const BACKEND_URL = "http://127.0.0.1:8000";
  // Link ảnh mặc định (dùng chung cho cả app)
  const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  // ✅ 1. KHỞI TẠO STATE TỪ LOCALSTORAGE (Load tức thì)
  const [user, setUser] = useState<any>(() => {
    try {
      const savedUser = localStorage.getItem("user_info");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      return null;
    }
  });

  // ✅ 2. HÀM GỌI API (Chạy ngầm)
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      const meRes = await authApi.me();
      
      if (meRes.data && meRes.data.data) {
        const userId = meRes.data.data.id;
        const res = await axiosClient.get(`/users/${userId}`);
        
        if (res.data && res.data.data) {
          const userData = res.data.data;
          // Lưu ngược vào cache và cập nhật state
          localStorage.setItem("user_info", JSON.stringify(userData));
          setUser(userData);
        }
      }
    } catch (error) {
      console.error("Lỗi cập nhật thông tin sidebar:", error);
    }
  };

  useEffect(() => {
    fetchUserData();

    // Lắng nghe sự kiện update từ trang khác
    const handleUpdateSignal = () => {
      fetchUserData();
    };

    window.addEventListener("user-profile-updated", handleUpdateSignal);
    return () => {
      window.removeEventListener("user-profile-updated", handleUpdateSignal);
    };
  }, []);

  // ✅ 3. XỬ LÝ URL ẢNH (Logic mới)
  const getAvatarSrc = () => {
    const url = user?.profile?.avatar_url;
    
    // Nếu không có url -> Trả về ảnh mặc định
    if (!url) return DEFAULT_AVATAR;

    // Nếu là ảnh Google (bắt đầu bằng http) -> Dùng nguyên link
    if (url.startsWith("http")) return url;

    // Nếu là ảnh server local -> Nối domain
    const cleanPath = url.replace(/^\//, "");
    return `${BACKEND_URL}/storage/${cleanPath}`;
  };

  // Xử lý hiển thị Tên
  const getDisplayName = () => {
    if (!user) return "Đang tải...";
    return user.profile?.full_name || user.username || "Người dùng";
  };

  // Xử lý hiển thị Role
  const getRoleName = () => {
     return user?.role?.name || "Thành viên";
  }

  return (
    <nav
      className="sb-sidenav accordion sb-sidenav-light"
      style={{ width: "250px", minHeight: "100vh" }}
    >
      <div className="sb-sidenav-menu">
        <div className="nav">
          
          {/* --- HEADER: AVATAR + TEXT --- */}
          <div className="p-3 d-flex align-items-center border-bottom">
            <img
              src={getAvatarSrc()}
              alt="avatar"
              className="rounded-circle me-3"
              style={{ objectFit: "cover" }}
              width={50}
              height={50}
              // ✅ 4. XỬ LÝ KHI ẢNH LỖI (onError)
              onError={(e) => {
                e.currentTarget.src = DEFAULT_AVATAR;
              }}
            />
            <div className="text-start">
              <p className="mb-0 text-muted" style={{ fontSize: "0.75rem" }}>
                Tài khoản của
              </p>
              <strong className="text-truncate d-block" style={{ maxWidth: "140px" }}>
                {getDisplayName()}
              </strong>
            </div>
          </div>

          {/* --- MENU TÀI KHOẢN --- */}
          <div className="sb-sidenav-menu-heading mt-3">Tài khoản</div>
          <NavLink
            to="/thong-tin-tai-khoan"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            <i className="bi bi-person me-2"></i> Thông tin tài khoản
          </NavLink>
          <NavLink
            to="/thay-doi-thong-tin"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            <i className="bi bi-pencil-square me-2"></i> Thay đổi thông tin
          </NavLink>
          <NavLink
            to="/doi-mat-khau"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            <i className="bi bi-lock me-2"></i> Đổi mật khẩu
          </NavLink>

          {/* ===== THÔNG BÁO ===== */}
          <div className="sb-sidenav-menu-heading">Thông báo</div>

          <NavLink to="/thong-bao/nguoi-dung" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            <i className="bi bi-bell me-2"></i>
            Thông báo người dùng
          </NavLink>

          {/* ===== ĐƠN HÀNG ===== */}
          <div className="sb-sidenav-menu-heading">Đơn hàng</div>

          <NavLink to="/don-hang-cua-toi" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            <i className="bi bi-receipt me-2"></i>
            Đơn hàng
          </NavLink>

       
        </div>
      </div>

      {/* --- FOOTER --- */}
      <div className="sb-sidenav-footer mt-auto p-2 border-top">
        <div className="small">Logged in as:</div>
        {getRoleName()}
      </div>
    </nav>
  );
};

export default SidebarProfile;