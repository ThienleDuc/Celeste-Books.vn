import { useState, useRef, useEffect } from "react";
import { AxiosError } from "axios";
import Swal from "sweetalert2";
import authApi from "../../api/auth.api";
import type { UserMe } from "../../api/auth.api";
import { useNavigate } from "react-router-dom";
import { getRedirectPath } from "../../utils/redirect";

const UserDropdown = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<UserMe | null>(null);
  const dropdownRef = useRef<HTMLLIElement | null>(null);

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

  /* ---------------- FETCH CURRENT USER ---------------- */
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await authApi.me();
        console.log("User data from API:", res.data.data);
        setUser(res.data.data);
      } catch (err) {
        console.error("Failed to fetch user info:", err);
        setUser(null);
      }
    };

    const token = localStorage.getItem("access_token");
    console.log("Access token:", token);

    if (token) fetchMe();
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

    let logoutError: string | null = null;

    try {
      await authApi.logout();
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      logoutError =
        axiosError.response?.data?.message ||
        "Không thể đăng xuất khỏi máy chủ, bạn đã được đăng xuất cục bộ.";
    }

    const redirectTo = getRedirectPath("afterRegister", user?.role?.id);
    navigate(redirectTo);

    localStorage.removeItem("access_token");
    setUser(null);

    Swal.fire({
      icon: logoutError ? "warning" : "success",
      title: logoutError ? "Đăng xuất chưa hoàn tất" : "Đã đăng xuất",
      text: logoutError ?? "Bạn đã đăng xuất thành công",
      timer: 1500,
      showConfirmButton: false,
    });
  };

  return (
    <ul className="navbar-nav ms-3">
      <li className="nav-item dropdown user-dropdown" ref={dropdownRef}>
        {/* TOGGLE */}
        <button
          className="dropdown-toggle nav-link p-0 border-0 bg-transparent d-flex align-items-center gap-1"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
        >
          {user?.profile?.avatar_url ? (
            <>
              {/* Avatar người dùng */}
              <img
                src={user.profile.avatar_url}
                alt="Avatar"
                className="user-avatar"
              />
              {/* Tên người dùng */}
              <span style={{
                fontWeight: '600',
                color: '#343a40',
                fontSize: '0.95rem'
              }}>
                {user.profile.full_name || user.username}
              </span>
            </>
          ) : (
            <>
              {/* Chữ Người dùng */}
              <span style={{ 
                fontSize: '0.95rem', 
                color: '#6c757d',
                fontWeight: '500'
              }}>
                Người dùng
              </span>
              {/* Icon dropdown nhỏ */}
              <i 
                className="bi bi-caret-down-fill"
                style={{
                  fontSize: '0.8rem',                                                                                                                   
                  color: '#6c757d'
                }}
              ></i>
            </>
          )}
        </button>

        {/* MENU */}
        {open && user && (
          <div className="dropdown-menu user-dropdown-menu show">
            {/* HEADER */}
            <div className="dropdown-header user-header">
              <img
                src={user?.profile?.avatar_url || "/img/69ac12ab-e056-47b3-b0f1-e27966d80ce0.jpg"}
                alt="Avatar"
                className="user-avatar-sm"
              />
              <div>
                <div className="fw-semibold">
                  {user?.profile?.full_name || user?.username || "Người dùng"}
                </div>
                <small>{user?.email || "Chưa thêm email"}</small>
              </div>
            </div>

            <a href="/thong-tin-tai-khoan" className="dropdown-item">
              <i className="bi bi-person-vcard"></i>
              Tài khoản
            </a>

            <div className="dropdown-divider"></div>

            <button className="dropdown-item danger" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right"></i>
              Đăng xuất
            </button>
          </div>
        )}

        {open && !user && (
          <div className="dropdown-menu user-dropdown-menu no-login show">
            <a href="/dang-nhap" className="dropdown-item">
              <i className="bi bi-box-arrow-in-right"></i>
              Đăng nhập
            </a>

            <a href="/dang-ky" className="dropdown-item">
              <i className="bi bi-person-plus"></i>
              Đăng ký
            </a>
          </div>
        )}
      </li>
    </ul>
  );
};

export default UserDropdown;
