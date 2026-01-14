import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Breadcrumbs, Link, Typography } from "@mui/material";
import axiosClient from "../../api/axios";
import authApi from "../../api/auth.api";
import Pagination from "../../components/Utils/Pagination";

/* ================= INTERFACES ================= */
interface Product {
  id: number;
  name: string;
  slug: string;
  author: string;
  publisher: string;
}

interface ProductDetail {
  id: number;
  sku: string;
  original_price: string;
  sale_price: string;
  stock: number;
  product_type: string;
  file_url?: string | null;
}

interface OrderItem {
  id: number;
  product_type: string;
  quantity: number;
  price: string;
  total_price: string;
  product: Product;
  product_detail: ProductDetail;
}

interface ShippingAddress {
  id: number;
  label: string;
  receiver_name: string;
  phone: string;
  street_address: string;
  commune?: {
    name: string;
    province?: {
      name: string;
      code: string;
    };
  };
}

interface Order {
  id: number;
  order_code: string;
  status: string;
  payment_method: string;
  payment_status: string;
  subtotal: string;
  shipping_fee: string;
  discount: string;
  total_amount: string;
  created_at: string;
  items: OrderItem[];
  shipping_address?: ShippingAddress;
}

/* ================= CONSTANTS ================= */
const ORDER_STATUS_MAP: Record<string, { text: string; class: string }> = {
  pending: { text: "Chờ xử lý", class: "bg-warning" },
  processing: { text: "Đang xử lý", class: "bg-info" },
  shipped: { text: "Đang giao", class: "bg-primary" },
  delivered: { text: "Đã giao", class: "bg-success" },
  cancelled: { text: "Đã hủy", class: "bg-danger" },
};

const PAYMENT_STATUS_MAP: Record<string, { text: string; class: string }> = {
  paid: { text: "Đã thanh toán", class: "text-success" },
  unpaid: { text: "Chưa thanh toán", class: "text-warning" },
  failed: { text: "Thất bại", class: "text-danger" },
};

/* ================= SUB-COMPONENTS ================= */
const OrderCard = ({ order }: { order: Order }) => {
  const navigate = useNavigate();
  const statusInfo = ORDER_STATUS_MAP[order.status] || {
    text: order.status,
    class: "bg-secondary",
  };

  const formattedDate = new Date(order.created_at).toLocaleDateString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
  });

  const handleViewDetail = () => {
    navigate(`/don-hang/${order.id}`, { state: { orderData: order } });
  };

  return (
    <div className="card border shadow-sm mb-2">
      <div className="card-body p-2">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center">
          <div className="flex-grow-1">
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="text-sm fw-semibold text-primary">{order.order_code}</span>
              <span className={`badge ${statusInfo.class} py-1 px-2`}>{statusInfo.text}</span>
            </div>
            <small className="text-xs text-muted">{formattedDate}</small>
          </div>
          <div className="text-end ms-2">
            <div className="fw-bold text-danger">
              {Number(order.total_amount).toLocaleString()}₫
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="d-flex justify-content-between align-items-center border-top pt-1 mt-1">
          <div>
            <small className={`fw-semibold text-xs ${PAYMENT_STATUS_MAP[order.payment_status]?.class || "text-muted"}`}>
              {PAYMENT_STATUS_MAP[order.payment_status]?.text || order.payment_status}
            </small>
          </div>
          <button className="btn btn-primary btn-xs py-1 px-2" onClick={handleViewDetail}>
            Chi tiết <i className="bi bi-arrow-right ms-1"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

/* ================= MAIN PAGE COMPONENT ================= */
const PageDonHangCuaToi = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const cached = localStorage.getItem("orders_list_cache");
      return cached ? JSON.parse(cached) : [];
    } catch { return []; }
  });

  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(orders.length === 0);

  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    const initUser = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) { navigate("/dang-nhap"); return; }

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
        } catch { navigate("/dang-nhap"); }
      }
    };
    initUser();
  }, [navigate]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!userId) return;

      if (orders.length === 0) setLoading(true);

      try {
        const res = await axiosClient.get(`/oders/user/${userId}`, {
          params: { status: status || undefined, page: currentPage, per_page: perPage },
        });

        const apiData = res.data?.data;
        const orderList = apiData?.data || [];

        setOrders(orderList);
        setTotalItems(apiData?.total || 0);
        setCurrentPage(apiData?.current_page || 1);

        if (currentPage === 1 && !status) {
           localStorage.setItem("orders_list_cache", JSON.stringify(orderList));
        }

      } catch (err) {
        console.error("Lỗi lấy đơn hàng", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, status, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="container my-3">
      <div className="mb-2">
        <h5 className="title-page mb-1">Đơn hàng của tôi</h5>
        
        <Breadcrumbs className="text-sm">
          <Link underline="hover" href="/" className="text-decoration-none">Trang chủ</Link>
          <Typography color="text.primary" className="fw-medium">Đơn hàng</Typography>
        </Breadcrumbs>
      </div>

      <div className="mb-2">
        <label className="form-label fw-semibold text-sm mb-1">Lọc theo trạng thái:</label>
        <select
          className="form-select form-select-sm w-auto"
          value={status}
          onChange={(e) => { setStatus(e.target.value); setCurrentPage(1); }}
        >
          <option value="">Tất cả đơn hàng</option>
          <option value="pending">Chờ xử lý</option>
          <option value="processing">Đang xử lý</option>
          <option value="shipped">Đang giao</option>
          <option value="delivered">Đã giao</option>
          <option value="cancelled">Đã hủy</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-3">
          <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
          <p className="mt-1 text-sm">Đang tải danh sách đơn hàng...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-3 border rounded bg-light">
          <i className="bi bi-receipt text-muted"></i>
          <p className="mt-1 text-sm">Chưa có đơn hàng nào</p>
        </div>
      ) : (
        <div>
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}

          {totalItems > perPage && (
            <div className="mt-2">
              <Pagination
                currentPage={currentPage}
                totalItems={totalItems}
                itemsPerPage={perPage}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PageDonHangCuaToi;