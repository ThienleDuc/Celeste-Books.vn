import { useState } from "react";

/* =======================
   TYPE & INTERFACE
======================= */

type NotificationSource = "USER" | "PRODUCT";

type UserNotificationType = "system" | "promotion" | "account";
type ProductNotificationType =
  | "restock"
  | "price_drop"
  | "promotion"
  | "create"
  | "update"
  | "delete";

type NotificationType = UserNotificationType | ProductNotificationType;

interface ThongBaoHeThong {
  id: number;
  source: NotificationSource;
  type: NotificationType;
  title: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

/* =======================
   MOCK DATA (STATIC)
======================= */

const MOCK_NOTIFICATIONS: ThongBaoHeThong[] = [
  {
    id: 1,
    source: "USER",
    type: "system",
    title: "Bảo trì hệ thống",
    content: "Hệ thống sẽ bảo trì từ 01:00 đến 03:00 ngày 20/01/2026.",
    is_read: false,
    created_at: "10 phút trước",
  },
  {
    id: 2,
    source: "USER",
    type: "account",
    title: "Thay đổi mật khẩu",
    content: "Mật khẩu tài khoản của bạn vừa được thay đổi thành công.",
    is_read: true,
    created_at: "Hôm qua",
  },
  {
    id: 3,
    source: "USER",
    type: "promotion",
    title: "Voucher toàn hệ thống",
    content: "Nhận ngay voucher giảm 15% cho mọi đơn hàng trong tuần này.",
    is_read: false,
    created_at: "2 giờ trước",
  },
  {
    id: 4,
    source: "PRODUCT",
    type: "price_drop",
    title: "Sản phẩm giảm giá",
    content: "Sản phẩm iPhone 15 đã giảm giá 10%.",
    is_read: false,
    created_at: "30 phút trước",
  },
  {
    id: 5,
    source: "PRODUCT",
    type: "restock",
    title: "Sản phẩm có hàng lại",
    content: "Sản phẩm MacBook Pro M3 đã được nhập kho.",
    is_read: true,
    created_at: "3 ngày trước",
  },
  {
    id: 6,
    source: "PRODUCT",
    type: "update",
    title: "Cập nhật thông tin sản phẩm",
    content: "Sản phẩm Chuột Logitech MX Master đã được cập nhật thông số.",
    is_read: false,
    created_at: "1 ngày trước",
  },
];

/* =======================
   HELPER
======================= */

const getTypeLabel = (type: NotificationType) => {
  const map: Record<string, string> = {
    system: "Hệ thống",
    promotion: "Khuyến mãi",
    account: "Tài khoản",
    restock: "Nhập kho",
    price_drop: "Giảm giá",
    create: "Tạo mới",
    update: "Cập nhật",
    delete: "Xóa",
  };
  return map[type] || type;
};

/* =======================
   PAGE
======================= */

const ThongBaoHeThong = () => {
  const [notifications, setNotifications] =
    useState<ThongBaoHeThong[]>(MOCK_NOTIFICATIONS);

  const [filterType, setFilterType] = useState<NotificationType | "ALL">("ALL");
  const [onlyUnread, setOnlyUnread] = useState(false);

  const filteredNotifications = notifications.filter((n) => {
    if (onlyUnread && n.is_read) return false;
    if (filterType !== "ALL" && n.type !== filterType) return false;
    return true;
  });

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, is_read: true } : n
      )
    );
  };

  return (
    <div className="container py-4">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold">🔔 Thông báo hệ thống</h4>
        <div className="d-flex gap-3">
          <select
            className="form-select"
            style={{ width: 220 }}
            value={filterType}
            onChange={(e) =>
              setFilterType(e.target.value as NotificationType | "ALL")
            }
          >
            <option value="ALL">Tất cả loại</option>
            <option value="system">Hệ thống</option>
            <option value="promotion">Khuyến mãi</option>
            <option value="account">Tài khoản</option>
            <option value="price_drop">Giảm giá sản phẩm</option>
            <option value="restock">Nhập kho</option>
            <option value="update">Cập nhật sản phẩm</option>
          </select>

          <div className="form-check mt-2">
            <input
              className="form-check-input"
              type="checkbox"
              checked={onlyUnread}
              onChange={() => setOnlyUnread(!onlyUnread)}
              id="onlyUnread"
            />
            <label className="form-check-label" htmlFor="onlyUnread">
              Chưa đọc
            </label>
          </div>
        </div>
      </div>

      {/* LIST */}
      {filteredNotifications.length === 0 ? (
        <div className="text-center text-muted py-5">
          Không có thông báo phù hợp
        </div>
      ) : (
        <div className="list-group">
          {filteredNotifications.map((n) => (
            <div
              key={n.id}
              className={`list-group-item list-group-item-action ${
                !n.is_read ? "bg-light" : ""
              }`}
            >
              <div className="d-flex justify-content-between mb-1">
                <div>
                  <span className="badge bg-secondary me-2">
                    {getTypeLabel(n.type)}
                  </span>
                  {!n.is_read && (
                    <span className="badge bg-danger">Mới</span>
                  )}
                </div>
                <small className="text-muted">{n.created_at}</small>
              </div>

              <h6 className="fw-bold mb-1">{n.title}</h6>
              <p className="text-muted mb-2">{n.content}</p>

              {!n.is_read && (
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => markAsRead(n.id)}
                >
                  Đánh dấu đã đọc
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThongBaoHeThong;
