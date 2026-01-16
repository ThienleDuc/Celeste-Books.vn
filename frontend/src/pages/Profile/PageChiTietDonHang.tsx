import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Breadcrumbs, Link, Typography } from "@mui/material";
import axiosClient from "../../api/axios";
import ReviewModal from "./ReviewProduct"; // Import component ReviewModal đã tạo

/* ================= INTERFACES ================= */
interface Product {
  id: number;
  name: string;
  slug: string;
  author: string;
  publisher: string;
  image?: string; 
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
  // --- THÊM DÒNG NÀY: Để theo dõi trạng thái đánh giá của từng món ---
  is_reviewed?: boolean; 
}

interface ShippingAddress {
  id: number;
  label: string;
  receiver_name: string;
  phone: string;
  street_address: string;
  commune?: {
    name: string;
    province?: { name: string; code: string };
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

/* ================= CONSTANTS (Giữ nguyên) ================= */
const ORDER_STATUS_MAP: Record<string, { text: string; class: string }> = {
  pending: { text: "Chờ xử lý", class: "bg-warning text-dark" },
  processing: { text: "Đang xử lý", class: "bg-info text-white" },
  shipped: { text: "Đang giao", class: "bg-primary text-white" },
  delivered: { text: "Đã giao", class: "bg-success text-white" },
  cancelled: { text: "Đã hủy", class: "bg-danger text-white" },
};

const PAYMENT_METHOD_MAP: Record<string, string> = {
  momo: "Ví MoMo",
  cod: "Thanh toán khi nhận hàng",
  bank_transfer: "Chuyển khoản ngân hàng",
  vnpay: "VNPAY",
};

const PAYMENT_STATUS_MAP: Record<string, { text: string; class: string }> = {
  paid: { text: "Đã thanh toán", class: "text-success fw-bold" },
  unpaid: { text: "Chưa thanh toán", class: "text-warning fw-bold" },
  failed: { text: "Thất bại", class: "text-danger fw-bold" },
};

/* ================= MAIN COMPONENT ================= */
const PageChiTietDonHang = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // --- STATE ---
  const [selectedProductId, setSelectedProductId] = useState<number>(0); 
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrderItemId, setSelectedOrderItemId] = useState<number>(0); 
  
  // XÓA: const [reviewed, setReviewed] = useState<boolean>(false); // <-- Đã xóa dòng này vì gây lỗi logic chung
  
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await axiosClient.get(`/oders/${id}`); 
        if (res.data && res.data.data) {
           setOrder(res.data.data); 
        }
      } catch (err: any) {
        console.error("Lỗi tải chi tiết đơn hàng", err);
        if(err.response && err.response.status === 404) {
            alert("Đơn hàng không tồn tại hoặc đã bị xóa.");
        } else {
alert("Có lỗi xảy ra khi tải thông tin đơn hàng.");
        }
        navigate("/don-hang-cua-toi");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [id, navigate]); 

  // --- HÀM MỞ MODAL ---
  const handleOpenReviewModal = (productId: number, itemId: number) => {
    console.log("Review Product:", productId, "Order Item:", itemId);
    setSelectedProductId(productId);
    setSelectedOrderItemId(itemId); 
    setIsReviewOpen(true);
  };

  // --- HÀM XỬ LÝ KHI SUBMIT XONG (ĐÃ SỬA) ---
  const handleSubmitReviewSuccess = (data: any) => {
      console.log("Đã đánh giá xong:", data);
      
      setIsReviewOpen(false);

      // --- LOGIC MỚI: Cập nhật trạng thái 'is_reviewed' cho đúng item vừa đánh giá ---
      if (order) {
          const updatedItems = order.items.map((item) => {
              // Tìm item trùng ID với item vừa được chọn đánh giá
              if (item.id === selectedOrderItemId) {
                  return { ...item, is_reviewed: true }; // Đánh dấu là đã đánh giá
              }
              return item;
          });

          // Cập nhật lại state Order để giao diện tự render lại
          setOrder({ ...order, items: updatedItems });
      }
  };

  if (loading) return (
      <div className="container py-4 text-center">
          <div className="spinner-border spinner-border-sm text-primary mx-auto" role="status"></div>
          <p className="mt-2 text-muted small">Đang tải thông tin đơn hàng...</p>
      </div>
  );

  if (!order) return null;

  const statusInfo = ORDER_STATUS_MAP[order.status] || { text: order.status, class: "bg-secondary" };
  const orderDate = new Date(order.created_at);
  const formattedDate = `${orderDate.getDate().toString().padStart(2, '0')}/${(orderDate.getMonth() + 1).toString().padStart(2, '0')}/${orderDate.getFullYear()}`;
  const formattedTime = `${orderDate.getHours().toString().padStart(2, '0')}:${orderDate.getMinutes().toString().padStart(2, '0')}`;

  const fullAddress = order.shipping_address
    ? [
        order.shipping_address.street_address, 
        order.shipping_address.commune?.name, 
        order.shipping_address.commune?.province?.name
      ].filter(Boolean).join(", ")
    : "";
    

  return (
    <div className="container my-3">
      {/* Breadcrumb */}
      <div className="mb-3">
        <Breadcrumbs className="small">
          <Link 
              underline="hover" 
              color="inherit" 
              href="/" 
              onClick={(e) => { e.preventDefault(); navigate('/'); }}
              className="text-decoration-none"
          >
            Trang chủ
          </Link>
          <Link 
              underline="hover" 
              color="inherit" 
              href="/don-hang-cua-toi" 
              onClick={(e) => { e.preventDefault(); navigate('/don-hang-cua-toi'); }}
              className="text-decoration-none"
          >
            Đơn hàng
          </Link>
          <Typography color="text.primary" className="fw-medium">#{order.order_code}</Typography>
        </Breadcrumbs>
        
        <div className="d-flex justify-content-between align-items-start mt-2">
          <div>
            <h5 className="mb-1 fw-bold">Đơn hàng #{order.order_code}</h5>
            <div className="text-muted small">
              <i className="bi bi-calendar me-1"></i>
              {formattedDate} lúc {formattedTime}
            </div>
          </div>
          <span className={`badge ${statusInfo.class} px-3 py-2 fs-6`}>
            {statusInfo.text}
          </span>
        </div>
      </div>

      <div className="row g-3">
        {/* THÔNG TIN SẢN PHẨM */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom py-2">
              <h6 className="mb-0 fw-bold">Danh sách sản phẩm</h6>
            </div>
            <div className="card-body p-0">
<div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="py-2 ps-3" style={{ width: '50%' }}>Sản phẩm</th>
                      <th className="py-2 text-center">Số lượng</th>
                      <th className="py-2 text-end">Thành tiền</th>
                      <th className="py-2 text-center">Đánh giá</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item) => {
                      const isEbook = (item.product_type === "Sách điện tử" || item.product_type === "Ebook") && item.product_detail.file_url;
                      return (
                        <tr key={item.id} className="border-bottom">
                          <td className="py-2 ps-3">
                            <div className="fw-medium">{item.product.name}</div>
                            <div className="text-muted small">
                              {item.product.author} • {item.product_type}
                              {isEbook && (
                                <a href={item.product_detail.file_url!} target="_blank" rel="noopener noreferrer" 
                                   className="ms-2 btn btn-outline-primary btn-xs py-0 px-2">
                                  <i className="bi bi-download me-1"></i>Tải sách
                                </a>
                              )}
                            </div>
                            <div className="text-muted small">{item.product_detail.sku}</div>
                          </td>
                          <td className="py-2 text-center align-middle">
                            <span className="badge bg-light text-dark">{item.quantity}</span>
                          </td>
                          <td className="py-2 text-end align-middle">
                            <div className="fw-bold text-danger">{Number(item.total_price).toLocaleString()}₫</div>
                            <div className="text-muted small">{Number(item.price).toLocaleString()}₫/sp</div>
                          </td>
                          
                          {/* --- CỘT ĐÁNH GIÁ ĐÃ SỬA --- */}
                          <td className="py-2 text-center align-middle">
                            {order.status === "delivered" && (
                              <>
                                {/* Kiểm tra trạng thái của CHÍNH ITEM ĐÓ */}
                                {item.is_reviewed ? (
                                  <span className="text-success fw-medium small">
                                      <i className="bi bi-check-circle-fill me-1"></i>Đã đánh giá
                                  </span>
                                ) : (
                                  <button 
                                    className="btn btn-outline-success btn-sm py-1 px-2"
                                    onClick={() => handleOpenReviewModal(item.product.id, item.id)}
                                  >
                                    <i className="bi bi-star me-1"></i>Đánh giá
                                  </button>
                                )}
                              </>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
</div>

          {/* TỔNG TIỀN */}
          <div className="card border-0 shadow-sm mt-3">
            <div className="card-body">
              <h6 className="fw-bold mb-3">Chi tiết thanh toán</h6>
              <div className="row">
                <div className="col-6">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Tạm tính:</span>
                    <span className="fw-medium">{Number(order.subtotal).toLocaleString()}₫</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Phí vận chuyển:</span>
                    <span className="fw-medium">{Number(order.shipping_fee).toLocaleString()}₫</span>
                  </div>
                  {/* Sửa ở đây - luôn hiển thị dòng giảm giá */}
        <div className="d-flex justify-content-between mb-2">
          <span className="text-muted">Giảm giá:</span>
          <span className="fw-medium text-success">-{Number(order.discount).toLocaleString()}₫</span>
          </div>
                </div>
                <div className="col-6">
                  <div className="bg-light rounded p-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="fw-bold">Tổng thanh toán:</span>
                      <span className="fw-bold fs-5 text-danger">{Number(order.total_amount).toLocaleString()}₫</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* THÔNG TIN ĐƠN HÀNG */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h6 className="fw-bold mb-3 d-flex align-items-center">
                <i className="bi bi-truck me-2 text-primary"></i>Thông tin giao hàng
              </h6>
              {order.shipping_address ? (
                <div>
                  <div className="mb-2">
                    <div className="text-muted small">Người nhận</div>
                    <div className="fw-medium">{order.shipping_address.receiver_name}</div>
                  </div>
                  <div className="mb-2">
                    <div className="text-muted small">Số điện thoại</div>
                    <div className="fw-medium">{order.shipping_address.phone}</div>
                  </div>
                  <div className="mb-0">
                    <div className="text-muted small">Địa chỉ nhận hàng</div>
                    <div className="fw-medium small">{fullAddress}</div>
                  </div>
                </div>
              ) : (
                <div className="text-muted small">Không có thông tin địa chỉ</div>
              )}
            </div>
</div>

          <div className="card border-0 shadow-sm mt-3">
            <div className="card-body">
              <h6 className="fw-bold mb-3 d-flex align-items-center">
                <i className="bi bi-credit-card me-2 text-success"></i>Thông tin thanh toán
              </h6>
              <div className="mb-2">
                <div className="text-muted small">Phương thức</div>
                <div className="fw-medium">{PAYMENT_METHOD_MAP[order.payment_method] || order.payment_method}</div>
              </div>
              <div className="mb-0">
                <div className="text-muted small">Trạng thái thanh toán</div>
                <div className={PAYMENT_STATUS_MAP[order.payment_status]?.class}>
                  {PAYMENT_STATUS_MAP[order.payment_status]?.text || order.payment_status}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3">
            <button className="btn btn-outline-secondary w-100 py-2" onClick={() => navigate("/don-hang-cua-toi")}>
              <i className="bi bi-arrow-left me-2"></i>Quay lại danh sách
            </button>
          </div>
        </div>
      </div>

      {/* RENDER COMPONENT REVIEW MODAL TẠI ĐÂY */}
      <ReviewModal 
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        productId={selectedProductId}
        orderItemId={selectedOrderItemId}
        onSubmit={handleSubmitReviewSuccess}
      />
    </div>
  );
};

export default PageChiTietDonHang;
