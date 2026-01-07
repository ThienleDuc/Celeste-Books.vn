import { useState, useRef, useEffect } from "react";

const UserDropdown = () => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLLIElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <ul className="navbar-nav ms-3">
      <li className="nav-item dropdown user-dropdown" ref={dropdownRef}>
        {/* Toggle */}
        <button
          className="dropdown-toggle nav-link p-0 border-0 bg-transparent"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
        >
          <img
            src="../../public/img/69ac12ab-e056-47b3-b0f1-e27966d80ce0.jpg"
            alt="Avatar"
            className="user-avatar"
          />
        </button>

        {/* Dropdown menu */}
        <div className={`dropdown-menu user-dropdown-menu ${open ? "show" : ""}`}>
          <div className="dropdown-header user-header">
            <img
              src="../../public/img/69ac12ab-e056-47b3-b0f1-e27966d80ce0.jpg"
              alt="Avatar"
              className="user-avatar-sm"
            />
            <div>
              <div className="fw-semibold">Lê Đức Thiện</div>
              <small>leducthien@example.com</small>
            </div>
          </div>

          <a href="/dang-nhap" className="dropdown-item">
            <i className="bi bi-box-arrow-in-right"></i>
            Đăng nhập
          </a>

          <a href="/dang-ky" className="dropdown-item">
            <i className="bi bi-person-plus"></i>
            Đăng ký
          </a>

          <a href="/thong-tin-tai-khoan" className="dropdown-item">
            <i className="bi bi-person-vcard"></i>
            Tài khoản
          </a>

          <div className="dropdown-divider"></div>

          <a href="#!" className="dropdown-item danger">
            <i className="bi bi-box-arrow-right"></i>
            Đăng xuất
          </a>
        </div>
      </li>
    </ul>
  );
};

export default UserDropdown;
