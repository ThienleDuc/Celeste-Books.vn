import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosClient from "../../api/axios";

// --- TYPE DỮ LIỆU ---
interface NotificationData {
  id: number;
  title: string;
  content: string;
  is_read: boolean;
  created_at: string;
  source: "user" | "order";
  type: string;
  order_id?: number;
}

const NotificationDropdown = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLLIElement | null>(null);

  // --- HELPER: Lấy User ID (Chuyển lên trên để dùng khởi tạo state) ---
  const getUserId = () => {
    try {
      const savedUser = localStorage.getItem("user_info");
      return savedUser ? JSON.parse(savedUser).id : null;
    } catch {
      return null;
    }
  };

  const currentUserId = getUserId();

  // --- STATE VỚI CACHE (TỐI ƯU TẠI ĐÂY) ---
  // 1. Khởi tạo notifications từ localStorage nếu có
  const [notifications, setNotifications] = useState<NotificationData[]>(() => {
    if (!currentUserId) return [];
    try {
      const cached = localStorage.getItem(`notifications_cache_${currentUserId}`);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  // 2. Khởi tạo số lượng chưa đọc từ localStorage
  const [unreadCount, setUnreadCount] = useState<number>(() => {
    if (!currentUserId) return 0;
    try {
      const cached = localStorage.getItem(`unread_count_cache_${currentUserId}`);
      return cached ? JSON.parse(cached) : 0;
    } catch {
      return 0;
    }
  });

  // --- HELPER: Chọn Icon theo loại ---
  const getIcon = (item: NotificationData) => {
    if (item.source === "order") return "bi-box-seam";
    if (item.type === "promotion") return "bi-gift";
    if (item.type === "system") return "bi-gear";
    return "bi-envelope";
  };

  // --- API: Lấy thông báo ---
  const fetchNotifications = useCallback(async () => {
    if (!currentUserId) return;

    try {
      // 1. Lấy danh sách (5 tin mới nhất)
      const res = await axiosClient.get("/notifications/all", {
        params: {
          user_id: currentUserId,
          per_page: 3, // Tăng lên 5 cho đẹp
          page: 1,
          sort_field: "created_at",
          sort_order: "desc",
        },
      });

      if (res.data?.success && res.data?.data) {
        const newData = res.data.data.data || [];
        
        // Cập nhật State
        setNotifications(newData);
        
        // TỐI ƯU: Lưu ngay vào localStorage
        localStorage.setItem(`notifications_cache_${currentUserId}`, JSON.stringify(newData));

        // 2. Lấy số lượng chưa đọc
        const unreadRes = await axiosClient.get("/notifications/all", {
          params: { user_id: currentUserId, is_read: 0, per_page: 1 }
        });
        
        if(unreadRes.data?.data?.total !== undefined) {
             const newCount = unreadRes.data.data.total;
             setUnreadCount(newCount);
             // TỐI ƯU: Lưu số lượng vào localStorage
             localStorage.setItem(`unread_count_cache_${currentUserId}`, JSON.stringify(newCount));
        }
      }
    } catch (error) {
      console.error("Lỗi tải thông báo:", error);
    }
  }, [currentUserId]);

  // --- EFFECT: Chạy khi load và auto refresh mỗi 60s ---
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // --- EFFECT: Click outside để đóng menu ---
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- ACTION: Xử lý click vào thông báo ---
  const handleItemClick = async (n: NotificationData, e: React.MouseEvent) => {
    e.preventDefault();

    // Nếu chưa đọc -> Gọi API đánh dấu đã đọc
    if (!n.is_read) {
      try {
        await axiosClient.put(`/notifications/mark-read`, { id: n.id, source: n.source });
        
        // Cập nhật UI ngay lập tức (Optimistic Update)
        const newNotifications = notifications.map((item) => (item.id === n.id ? { ...item, is_read: true } : item));
        const newCount = Math.max(0, unreadCount - 1);

        setNotifications(newNotifications);
        setUnreadCount(newCount);

        // Cập nhật luôn vào Cache để đồng bộ nếu user reload trang ngay
        if (currentUserId) {
            localStorage.setItem(`notifications_cache_${currentUserId}`, JSON.stringify(newNotifications));
            localStorage.setItem(`unread_count_cache_${currentUserId}`, JSON.stringify(newCount));
        }

      } catch (error) {
        console.error(error);
      }
    }

    setOpen(false); 

    // Điều hướng
    if (n.source === "order" && n.order_id) {
      navigate(`/don-hang/${n.order_id}`);
    } else {
      navigate('/thong-bao/nguoi-dung');
    }
  };

  // Nếu chưa đăng nhập -> Không hiển thị gì
  if (!currentUserId) return null;

  return (
    <ul className="navbar-nav ms-3">
      <li className="nav-item dropdown notification-dropdown" ref={dropdownRef}>
        {/* Toggle Button */}
        <button
          className="dropdown-toggle nav-link p-0 border-0 bg-transparent position-relative"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
        >
          <i className="bi bi-bell fs-5 notification-icon"></i>
          {unreadCount > 0 && (
            <span className="notification-badge">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>

        {/* Dropdown Menu */}
        <div className={`dropdown-menu notification-dropdown-menu ${open ? "show" : ""}`} style={{ right: 0, left: "auto" }}>
          <div className="dropdown-header notification-header fw-bold">Thông báo</div>

          {notifications.length === 0 ? (
            <div className="dropdown-item text-center text-muted p-3">
               <small>Không có thông báo mới</small>
            </div>
          ) : (
            notifications.map((item) => (
              <a 
                key={item.id} 
                href="#!" 
                className={`dropdown-item ${!item.is_read ? "bg-light" : ""}`} 
                onClick={(e) => handleItemClick(item, e)}
              >
                <div className="d-flex justify-content-between align-items-start w-100">
                  <div className="notification-info d-flex gap-2 flex-grow-1 flex-shrink-1">
                    <i className={`bi ${getIcon(item)} fs-5 ${!item.is_read ? "text-primary" : "text-secondary"}`}></i>
                    
                    <div style={{ overflow: "hidden" }}>
                      <span className={`text-truncate d-block ${!item.is_read ? "fw-bold" : ""}`} style={{fontSize: "0.9rem"}}>
                          {item.title}
                      </span>
                      <small className="text-muted text-truncate d-block" style={{ fontSize: "0.8rem", maxWidth: "200px" }}>
                          {item.content}
                      </small>
                    </div>
                  </div>

                  {!item.is_read && (
                     <span className="badge bg-danger p-1 rounded-circle mt-2 ms-1" style={{width: "8px", height: "8px"}}> </span>
                  )}
                </div>
              </a>
            ))
          )}

          <div className="dropdown-divider"></div>

          <Link 
            to="/thong-bao/nguoi-dung" 
            className="dropdown-item text-center text-primary fw-semibold"
            onClick={() => setOpen(false)}
          >
            Xem tất cả
          </Link>
        </div>
      </li>
    </ul>
  );
};

export default NotificationDropdown;