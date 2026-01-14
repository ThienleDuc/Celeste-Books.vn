import { useState, useEffect, useCallback } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Breadcrumbs, Typography, Link } from "@mui/material";
import { Helmet } from "react-helmet";
import axiosClient from "../../api/axios";
import authApi from "../../api/auth.api";
import Pagination from "../../components/Utils/Pagination";

interface BaseNotification {
  id: number;
  user_id: string;
  title: string;
  content: string;
  is_read: boolean;
  created_at: string;
  source: "user" | "order";
}

interface UserNotification extends BaseNotification {
  source: "user";
  type: "system" | "promotion" | "account";
}

interface OrderNotification extends BaseNotification {
  source: "order";
  order_id: number;
  type: "status_change" | "payment" | "other";
}

type Notification = UserNotification | OrderNotification;

const PageThongBaoNguoiDung = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    try {
      const cached = localStorage.getItem("notifications_cache");
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(notifications.length === 0);
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(6);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    const getUserId = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        navigate("/dang-nhap");
        return;
      }

      const cachedUser = localStorage.getItem("user_info");
      if (cachedUser) {
        setUserId(JSON.parse(cachedUser).id);
      } else {
        try {
          const meRes = await authApi.me();
          if (meRes.data?.data) {
            setUserId(meRes.data.data.id);
            localStorage.setItem("user_info", JSON.stringify(meRes.data.data));
          }
        } catch {
          navigate("/dang-nhap");
        }
      }
    };
    getUserId();
  }, [navigate]);

  const fetchNotifications = useCallback(async (page = currentPage) => {
    if (!userId) return;
    if (notifications.length === 0) setLoading(true);

    try {
      const params: any = {
        user_id: userId,
        per_page: perPage,
        page: page,
        sort_field: "created_at",
        sort_order: "desc",
      };
      if (onlyUnread) params.is_read = 0;

      const res = await axiosClient.get("/notifications/all", { params });

      if (res.data?.success && res.data?.data) {
        const apiData = res.data.data;
        const noteList = apiData.data || [];

        setNotifications(noteList);
        setTotalItems(apiData.total || 0);
        setCurrentPage(apiData.current_page || 1);

        if (apiData.current_page === 1 && !onlyUnread) {
          localStorage.setItem("notifications_cache", JSON.stringify(noteList));
        }
      }
    } catch (error) {
      console.error("Load Error:", error);
    } finally {
      setLoading(false);
    }
  }, [userId, perPage, onlyUnread, currentPage, notifications.length]);

  useEffect(() => {
    fetchNotifications(currentPage);
  }, [fetchNotifications, currentPage]);

  const markAsRead = async (id: number, source: "user" | "order") => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id && n.source === source ? { ...n, is_read: true } : n
      )
    );
    try {
      await axiosClient.put(`/notifications/mark-read`, { id, source });
    } catch (error) {
      console.error(error);
    }
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter((n) => !n.is_read);
    if (unread.length === 0) return;

    // Cập nhật UI ngay lập tức
    const updatedNotifications = notifications.map(n => ({ 
      ...n, 
      is_read: true 
    }));
    
    setNotifications(updatedNotifications);
    
    // TẮT NGAY filter "Chưa đọc" sau khi nhấn "Đọc tất cả"
    setOnlyUnread(false);

    // Nếu đang xem trang 1 và không lọc chưa đọc, cập nhật cache
    if (currentPage === 1) {
      localStorage.setItem("notifications_cache", JSON.stringify(updatedNotifications));
    }

    // Gọi API trong background, không cần await
    unread.forEach(async (n) => {
      try {
        await axiosClient.put(`/notifications/mark-read`, {
          id: n.id,
          source: n.source,
        });
      } catch (error) {
        console.error(`Lỗi khi đánh dấu thông báo ${n.id}:`, error);
      }
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const totalPages = Math.ceil(totalItems / perPage);

  return (
    <>
      <Helmet>
        <title>Thông báo của tôi</title>
      </Helmet>

      <div className="container my-2">
        <div className="mb-2">
          <h5 className="title-page mb-1">Thông báo của tôi</h5>
          
          <Breadcrumbs className="text-sm">
            <Link underline="hover" href="/" className="text-decoration-none">
              Trang chủ
            </Link>
            <Typography color="text.primary" className="fw-medium">
              Thông báo
            </Typography>
          </Breadcrumbs>
        </div>

        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5 className="fw-bold m-0">🔔 Thông báo</h5>
          <div className="d-flex align-items-center gap-1">
            <div className="form-check m-0">
              <input
                type="checkbox"
                className="form-check-input"
                checked={onlyUnread}
                onChange={() => {
                  setOnlyUnread(!onlyUnread);
                  setCurrentPage(1);
                }}
                id="onlyUnread"
              />
              <label className="form-check-label" style={{ fontSize: "13px" }} htmlFor="onlyUnread">
                Chưa đọc
              </label>
            </div>
            <button
              className="btn btn-outline-primary btn-sm ms-1"
              onClick={markAllAsRead}
              disabled={notifications.every((n) => n.is_read)}
            >
              Đọc tất cả
            </button>
          </div>
        </div>

        <div className="card border-0 shadow-sm">
          {loading ? (
            <div className="text-center text-muted p-3">
              <div className="spinner-border spinner-border-sm me-2"></div>
              Đang tải...
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center text-muted p-3">
              <i className="bi bi-bell-slash fs-4 d-block mb-1"></i>
              {onlyUnread
                ? "Không có thông báo chưa đọc"
                : "Bạn chưa có thông báo nào"}
            </div>
          ) : (
            <>
              <div className="list-group list-group-flush">
                {notifications.map((n) => {
                  const detailLink = n.source === "order" && n.order_id 
                    ? `/don-hang/${n.order_id}` 
                    : null;

                  return (
                    <div
                      key={`${n.source}-${n.id}`}
                      className={`list-group-item p-2 border-bottom ${!n.is_read ? "bg-light" : ""}`}
                    >
                      {/* Dòng 1: Badge + Thời gian */}
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <div className="d-flex gap-1">
                          <span className={`badge ${n.source === "order" ? "bg-info" : "bg-secondary"}`}>
                            {n.source === "order" ? "Đơn hàng" : "Hệ thống"}
                          </span>
                          {!n.is_read && <span className="badge bg-danger">Mới</span>}
                        </div>
                        <small className="text-muted text-nowrap" style={{ fontSize: "12px" }}>
                          {new Date(n.created_at).toLocaleTimeString("vi-VN", { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                          {' '}
                          {new Date(n.created_at).toLocaleDateString("vi-VN")}
                        </small>
                      </div>

                      {/* Dòng 2: Tiêu đề */}
                      <h6 className="fw-bold mb-1" style={{ fontSize: "14px" }}>{n.title}</h6>

                      {/* Dòng 3: Nội dung + Nút "Đã đọc" */}
                      <div className="d-flex justify-content-between align-items-start gap-2">
                        <p 
                          className="text-muted mb-0 flex-grow-1" 
                          style={{ 
                            whiteSpace: "pre-line", 
                            fontSize: "13px",
                            lineHeight: "1.4"
                          }}
                        >
                          {n.content}
                        </p>
                        {!n.is_read && (
                          <button
                            className="btn btn-success btn-sm flex-shrink-0 px-2 py-1"
                            onClick={() => markAsRead(n.id, n.source)}
                            style={{ 
                              minWidth: "75px",
                              background: "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
                              border: "none",
                              boxShadow: "0 1px 3px rgba(40, 167, 69, 0.3)",
                              fontWeight: "500",
                              color: "white",
                              fontSize: "12px"
                            }}
                          >
                            ✓ Đã đọc
                          </button>
                        )}
                      </div>

                      {/* Link chi tiết (nếu có) */}
                      {detailLink && (
                        <div className="mt-1">
                          <NavLink
                            to={detailLink}
                            className="btn btn-link text-decoration-none p-0 text-primary"
                            onClick={() => !n.is_read && markAsRead(n.id, n.source)}
                            style={{ fontSize: "13px" }}
                          >
                            Xem chi tiết đơn hàng →
                          </NavLink>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="card-footer bg-white p-2">
                  <Pagination
                    currentPage={currentPage}
                    totalItems={totalItems}
                    itemsPerPage={perPage}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default PageThongBaoNguoiDung;