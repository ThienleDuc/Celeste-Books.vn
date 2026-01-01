import { useState, useRef, useEffect } from "react";

interface NotificationItem {
  id: number;
  icon: string; // icon class
  content: string;
}

const NotificationDropdown = () => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLLIElement | null>(null);

  const notifications: NotificationItem[] = [
    { id: 1, icon: "bi-envelope", content: "Bạn có 1 tin nhắn mới từ admin" },
    { id: 2, icon: "bi-calendar-event", content: "Cuộc hẹn bắt đầu lúc 14:00" },
    { id: 3, icon: "bi-check-circle", content: "Hoàn thành nhiệm vụ trong dự án Frontend" },
  ];

  const total = notifications.length;

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
      <li className="nav-item dropdown notification-dropdown" ref={dropdownRef}>
        {/* Toggle */}
        <button
          className="dropdown-toggle nav-link p-0 border-0 bg-transparent position-relative"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
        >
          <i className="bi bi-bell fs-5 notification-icon"></i>
          {total > 0 && <span className="notification-badge">{total}</span>}
        </button>

        {/* Dropdown menu */}
        <div className={`dropdown-menu notification-dropdown-menu ${open ? "show" : ""}`}>
          <div className="dropdown-header notification-header fw-bold">Thông báo</div>

          {notifications.length === 0 ? (
            <div className="dropdown-item text-center">Không có thông báo</div>
          ) : (
            notifications.map(item => (
              <a key={item.id} href="#!" className="dropdown-item">
                <div className="d-flex justify-content-between align-items-start w-100">
                  {/* Cột icon + nội dung */}
                  <div className="notification-info d-flex gap-2 flex-grow-1 flex-shrink-1">
                    <i className={`bi ${item.icon}`}></i>
                    <span className="text-truncate">{item.content}</span>
                  </div>
                </div>
              </a>
            ))
          )}

          <div className="dropdown-divider"></div>

          <a href="#!" className="dropdown-item text-center text-primary">
            Xem tất cả
          </a>
        </div>
      </li>
    </ul>
  );
};

export default NotificationDropdown;
