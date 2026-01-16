import { useState, useRef, useEffect } from "react";
import { AxiosError } from "axios";
import Swal from "sweetalert2";
import authApi from "../../api/auth.api";
import type { UserMe } from "../../api/auth.api";
import { useNavigate, Link } from "react-router-dom";
import { getRedirectPath } from "../../utils/redirect";
import { getAvatarUrl, handleImageError } from "../../utils/imageHelper";

/**
 * Helper để lấy src cho avatar từ URL
 * @param avatarUrl URL avatar từ profile
 * @returns URL avatar đã được xử lý
 */
const getAvatarSrc = (avatarUrl: string | null | undefined): string => {
  return getAvatarUrl(avatarUrl);
};

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
        setUser(res.data.data);
      } catch {
        setUser(null);
      }
    };

    if (localStorage.getItem("access_token")) fetchMe();
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

    localStorage.removeItem("access_token");
    setUser(null);

    const redirectTo = getRedirectPath("afterRegister", user?.role?.id);
    navigate(redirectTo);

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
          type="button"
          className="dropdown-toggle nav-link p-0 border-0 bg-transparent d-flex align-items-center gap-1"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
        >
          {user ? (
            <>
              <img
                src={getAvatarSrc(user.profile?.avatar_url)}
                alt="Avatar"
                className="user-avatar"
                onError={handleImageError}
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
          <div className="dropdown-menu user-dropdown-menu show">
            <div className="dropdown-header user-header">
              <img
                src={getAvatarSrc(user.profile?.avatar_url)}
                alt="Avatar"
                className="user-avatar-sm"
                onError={handleImageError}
              />
              <div>
                <div className="fw-semibold">
                  {user.profile?.full_name || user.username}
                </div>
                <small>{user.email || "Chưa thêm email"}</small>
              </div>
            </div>

            <Link to="/thong-tin-tai-khoan" className="dropdown-item">
              <i className="bi bi-person-vcard" /> Tài khoản
            </Link>

            <div className="dropdown-divider" />

            <button className="dropdown-item danger" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right" /> Đăng xuất
            </button>
          </div>
        )}

        {/* MENU - CHƯA LOGIN */}
        {open && !user && (
          <div className="dropdown-menu user-dropdown-menu no-login show">
            <Link to="/dang-nhap" className="dropdown-item">
              <i className="bi bi-box-arrow-in-right" /> Đăng nhập
            </Link>

            <Link to="/dang-ky" className="dropdown-item">
              <i className="bi bi-person-plus" /> Đăng ký
            </Link>
          </div>
        )}
      </li>
    </ul>
  );
};

export default UserDropdown;