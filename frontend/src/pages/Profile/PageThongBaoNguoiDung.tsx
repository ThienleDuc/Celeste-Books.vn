import { useState } from "react";
import { NavLink } from "react-router-dom";

/* =======================
   ENUM + INTERFACE
======================= */

// user_notifications.type
type UserNotificationType = "system" | "promotion" | "account";

// order_notifications.type
type OrderNotificationType = "status_change" | "payment" | "other";

// Thông báo USER
interface UserNotification {
  id: number;
  user_id: string;
  type: UserNotificationType;
  title: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

// Thông báo ORDER
interface OrderNotification {
  id: number;
  user_id: string;
  order_id: number;
  type: OrderNotificationType;
  title: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

// Kiểu gộp để render
type Notification =
  | ({ category: "USER" } & UserNotification)
  | ({ category: "ORDER" } & OrderNotification);

/* =======================
   MOCK DATA
======================= */

const MOCK_USER_NOTIFICATIONS: UserNotification[] = [
  {
    id: 1,
    user_id: "U001",
    type: "system",
    title: "Bảo trì hệ thống",
    content: "Hệ thống sẽ bảo trì từ 01:00 - 03:00 ngày 20/01/2026.",
    is_read: false,
    created_at: "2026-01-15 09:10",
  },
  {
    id: 2,
    user_id: "U001",
    type: "promotion",
    title: "Voucher 50K",
    content: "Bạn nhận được voucher 50.000đ cho đơn tiếp theo.",
    is_read: true,
    created_at: "2026-01-14 20:30",
  },
];

const MOCK_ORDER_NOTIFICATIONS: OrderNotification[] = [
  {
    id: 101,
    user_id: "U001",
    order_id: 9001,
    type: "status_change",
    title: "Đơn hàng #9001 đã xác nhận",
    content: "Đơn hàng của bạn đã được xác nhận và đang xử lý.",
    is_read: false,
    created_at: "2026-01-15 10:00",
  },
  {
    id: 102,
    user_id: "U001",
    order_id: 8990,
    type: "payment",
    title: "Thanh toán thành công",
    content: "Thanh toán cho đơn hàng #8990 đã hoàn tất.",
    is_read: true,
    created_at: "2026-01-13 14:22",
  },
];

/* =======================
   HELPER
======================= */

const getBadge = (n: Notification) => {
  if (n.category === "USER") {
    switch (n.type) {
      case "system":
        return "Hệ thống";
      case "promotion":
        return "Khuyến mãi";
      case "account":
        return "Tài khoản";
    }
  }

  if (n.category === "ORDER") {
    switch (n.type) {
      case "status_change":
        return "Đơn hàng";
      case "payment":
        return "Thanh toán";
      case "other":
        return "Khác";
    }
  }
};

const getLink = (n: Notification) => {
  if (n.category === "ORDER") {
    return `/don-hang/${n.order_id}`;
  }
  return undefined;
};

/* =======================
   COMPONENT
======================= */

const ThongBaoNguoiDung = () => {
  // Gộp 2 bảng
  const [notifications, setNotifications] = useState<Notification[]>([
    ...MOCK_USER_NOTIFICATIONS.map((n) => ({
      ...n,
      category: "USER" as const,
    })),
    ...MOCK_ORDER_NOTIFICATIONS.map((n) => ({
      ...n,
      category: "ORDER" as const,
    })),
  ]);

  const [onlyUnread, setOnlyUnread] = useState(false);

  const displayedList = onlyUnread
    ? notifications.filter((n) => !n.is_read)
    : notifications;

  const markAsRead = (id: number, category: "USER" | "ORDER") => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id && n.category === category
          ? { ...n, is_read: true }
          : n
      )
    );
  };

  return (
    <div className="container py-4">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold">🔔 Thông báo của bạn</h4>

        <div className="form-check">
          <input
            type="checkbox"
            className="form-check-input"
            checked={onlyUnread}
            onChange={() => setOnlyUnread(!onlyUnread)}
            id="onlyUnread"
          />
          <label className="form-check-label" htmlFor="onlyUnread">
            Chỉ hiển thị chưa đọc
          </label>
        </div>
      </div>

      {/* LIST */}
      {displayedList.length === 0 ? (
        <div className="text-center text-muted py-5">
          Không có thông báo
        </div>
      ) : (
        <div className="list-group">
          {displayedList
            .sort(
              (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
            )
            .map((n) => (
              <div
                key={`${n.category}-${n.id}`}
                className={`list-group-item ${
                  !n.is_read ? "bg-light" : ""
                }`}
              >
                <div className="d-flex justify-content-between">
                  <div>
                    <span className="badge bg-secondary me-2">
                      {getBadge(n)}
                    </span>
                    {!n.is_read && (
                      <span className="badge bg-danger">Mới</span>
                    )}
                  </div>
                  <small className="text-muted">{n.created_at}</small>
                </div>

                <h6 className="fw-bold mt-2">{n.title}</h6>
                <p className="text-muted mb-2">{n.content}</p>

                <div className="d-flex justify-content-between align-items-center">
                  {getLink(n) ? (
                    <NavLink
                      to={getLink(n)!}
                      onClick={() => markAsRead(n.id, n.category)}
                    >
                      Xem chi tiết →
                    </NavLink>
                  ) : (
                    <span />
                  )}

                  {!n.is_read && (
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => markAsRead(n.id, n.category)}
                    >
                      Đánh dấu đã đọc
                    </button>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default ThongBaoNguoiDung;
