import { useState, useRef, useEffect } from "react";
import Swal from "sweetalert2";
import { useNavigate, Link } from "react-router-dom";

// Import API
import authApi from "../../api/auth.api";
import axiosClient from "../../api/axios"; // ✅ Cần import cái này để gọi chi tiết user
import { getRedirectPath } from "../../utils/redirect";

const UserDropdown = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLLIElement | null>(null);

  // --- CẤU HÌNH ---
  const BACKEND_URL = "http://127.0.0.1:8000";
  const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  // ✅ 1. KHỞI TẠO STATE TỪ LOCALSTORAGE (Load ảnh tức thì, không đợi API)
  const [user, setUser] = useState<any>(() => {
    try {
      const savedUser = localStorage.getItem("user_info");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  // ✅ 2. HÀM GỌI API LẤY CHI TIẾT USER (Giống SidebarProfile)
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      // B1: Lấy ID từ me()
      const meRes = await authApi.me();
      if (meRes.data && meRes.data.data) {
        const userId = meRes.data.data.id;

        // B2: Lấy chi tiết profile từ ID
        const res = await axiosClient.get(`/users/${userId}`);
        
        if (res.data && res.data.data) {
          const userData = res.data.data;
          // Lưu ngược vào cache và cập nhật state
          localStorage.setItem("user_info", JSON.stringify(userData));
          setUser(userData);
        }
      }
    } catch (error) {
      // Nếu lỗi token (hết hạn), có thể set user null
      // console.error("Lỗi cập nhật dropdown:", error);
    }
  };

  useEffect(() => {
    // Gọi API khi component mount
    fetchUserData();

    // Lắng nghe sự kiện update từ trang Profile (để đổi ảnh ngay lập tức)
    const handleUpdateSignal = () => {
      fetchUserData();
    };

    window.addEventListener("user-profile-updated", handleUpdateSignal);
    return () => {
      window.removeEventListener("user-profile-updated", handleUpdateSignal);
    };
  }, []);

  // ✅ 3. XỬ LÝ URL ẢNH (Logic chuẩn)
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

  /* ---------------- CLICK OUTSIDE ---------------- */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ---------------- LOGOUT ---------------- */
  const handleLogout = async () => {
    const result = await Swal.fire({
      icon: "question",
      title: "Đăng xuất?",
      text: "Bạn có chắc chắn muốn đăng xuất?",
      showCancelButton: true,
      confirmButtonText: "Đăng xuất",
      cancelButtonText: "Huỷ",
    });

    if (!result.isConfirmed) return;

    try {
      await authApi.logout();
    } catch (err) {
       // Lỗi cũng cứ cho đăng xuất local
    }

    // Xóa sạch token và thông tin user
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_info"); // Xóa cache user
    setUser(null);

    const redirectTo = getRedirectPath("afterRegister", user?.role?.id);
    navigate(redirectTo);

    Swal.fire({
      icon: "success",
      title: "Đã đăng xuất",
      timer: 1500,
      showConfirmButton: false,
    });
  };

  return (
    <ul className="navbar-nav ms-3">
      <li className="nav-item dropdown user-dropdown" ref={dropdownRef}>
        {/* TOGGLE BUTTON */}
        <button
          type="button"
          className="dropdown-toggle nav-link p-0 border-0 bg-transparent d-flex align-items-center gap-1"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
        >
          {user ? (
            <>
              <img
                src={getAvatarSrc()} // ✅ Dùng hàm mới
                alt="Avatar"
                className="user-avatar"
                style={{ width: "35px", height: "35px", objectFit: "cover", borderRadius: "50%" }}
                onError={(e) => {
                  e.currentTarget.src = DEFAULT_AVATAR;
                }}
              />
            </>
          ) : (
            <>
              <span
                style={{
                  fontSize: "0.95rem",
                  color: "#6c757d",
                  fontWeight: 500,
                }}
              >
                Người dùng
              </span>
              <i
                className="bi bi-caret-down-fill"
                style={{ fontSize: "0.8rem", color: "#6c757d" }}
              />
            </>
          )}
        </button>

        {/* MENU - ĐÃ LOGIN */}
        {open && user && (
          <div className="dropdown-menu user-dropdown-menu show" style={{ right: 0, left: "auto" }}>
            <div className="dropdown-header user-header d-flex align-items-center gap-2 p-3">
              <img
                src={getAvatarSrc()} // ✅ Dùng hàm mới
                alt="Avatar"
                className="user-avatar-sm"
                style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "50%" }}
                onError={(e) => {
                  e.currentTarget.src = DEFAULT_AVATAR;
                }}
              />
              <div style={{ overflow: "hidden" }}>
                <div className="fw-semibold text-truncate" style={{maxWidth: "150px"}}>
                  {user.profile?.full_name || user.username || "User"}
                </div>
                <small className="text-muted d-block text-truncate" style={{maxWidth: "150px"}}>
                  {user.email || "Chưa thêm email"}
                </small>
              </div>
            </div>

            <div className="dropdown-divider" />

            <Link to="/thong-tin-tai-khoan" className="dropdown-item">
              <i className="bi bi-person-vcard me-2" /> Tài khoản
            </Link>

            <div className="dropdown-divider" />

            <button className="dropdown-item text-danger" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right me-2" /> Đăng xuất
            </button>
          </div>
        )}

        {/* MENU - CHƯA LOGIN */}
        {open && !user && (
          <div className="dropdown-menu user-dropdown-menu no-login show" style={{ right: 0, left: "auto" }}>
            <Link to="/dang-nhap" className="dropdown-item">
              <i className="bi bi-box-arrow-in-right me-2" /> Đăng nhập
            </Link>

            <Link to="/dang-ky" className="dropdown-item">
              <i className="bi bi-person-plus me-2" /> Đăng ký
            </Link>
          </div>
        )}
      </li>
    </ul>
  );
};

export default UserDropdown;