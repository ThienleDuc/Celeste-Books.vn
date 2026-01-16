import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Breadcrumbs, Link, Typography } from "@mui/material";
import axiosClient from "../../api/axios";
import ReviewModal from "./ReviewProduct"; 

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

/* ================= CONSTANTS ================= */
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
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  
  // State cho Modal
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number>(0); 
  const [selectedOrderItemId, setSelectedOrderItemId] = useState<number>(0); 

  useEffect(() => {
    const fetchOrderDetail = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await axiosClient.get(`/oders/${id}`); // Lưu ý: check lại đường dẫn API 'oders' hay 'orders'
        if (res.data && res.data.data) {
          const orderData = res.data.data;

          const itemsWithReviewStatus = await Promise.all(
            orderData.items.map(async (item: any) => {
              try {
                const reviewRes = await axiosClient.get('/review/check-reviewed', {
                  params: { productId: item.product.id }
                });
                return {
                  ...item,
                  is_reviewed: reviewRes.data.reviewed
                };
              } catch (error) {
                console.error("Lỗi check review item:", item.product.id, error);
                return { ...item, is_reviewed: false };
              }
            })
          );

          setOrder({ ...orderData, items: itemsWithReviewStatus });
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

  const handleOpenReviewModal = (productId: number, itemId: number) => {
    setSelectedProductId(productId);
    setSelectedOrderItemId(itemId); 
    setIsReviewOpen(true);
  };

  const handleSubmitReviewSuccess = (data: any) => {
      setIsReviewOpen(false);
      if (order) {
          const updatedItems = order.items.map((item) => {
              if (item.id === selectedOrderItemId) {
                  return { ...item, is_reviewed: true };
              }
              return item;
          });
          setOrder({ ...order, items: updatedItems });
      }
  };

  if (loading) return (
      <div className="container py-4 text-center">
          <div className="spinner-border text-primary" role="status"></div>
      </div>
  );

  if (!order) return null;

  const statusInfo = ORDER_STATUS_MAP[order.status] || { text: order.status, class: "bg-secondary" };
  const orderDate = new Date(order.created_at);
  const formattedDate = `${orderDate.getDate().toString().padStart(2, '0')}/${(orderDate.getMonth() + 1).toString().padStart(2, '0')}/${orderDate.getFullYear()} ${orderDate.getHours()}:${orderDate.getMinutes()}`;

  const fullAddress = order.shipping_address
    ? [order.shipping_address.street_address, order.shipping_address.commune?.name, order.shipping_address.commune?.province?.name].filter(Boolean).join(", ")
    : "Tại cửa hàng/Không có địa chỉ";

  return (
    <div className="container my-3">
      {/* Breadcrumb & Header */}
      <div className="mb-3">
        <Breadcrumbs className="small">
          <Link underline="hover" color="inherit" href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>Trang chủ</Link>
          <Link underline="hover" color="inherit" href="/don-hang-cua-toi" onClick={(e) => { e.preventDefault(); navigate('/don-hang-cua-toi'); }}>Đơn hàng</Link>
          <Typography color="text.primary">#{order.order_code}</Typography>
        </Breadcrumbs>
        
        <div className="d-flex justify-content-between align-items-center mt-3">
          <div>
            <h5 className="mb-1 fw-bold">Đơn hàng #{order.order_code}</h5>
            <small className="text-muted">{formattedDate}</small>
          </div>
          <span className={`badge ${statusInfo.class} px-3 py-2 fs-6`}>{statusInfo.text}</span>
        </div>
      </div>

      <div className="row g-3">
        {/* CỘT TRÁI: DANH SÁCH SẢN PHẨM & TỔNG TIỀN */}
        <div className="col-lg-8">
          {/* Card Danh sách sản phẩm */}
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom py-3">
              <h6 className="mb-0 fw-bold">Danh sách sản phẩm</h6>
            </div>
            <div className="table-responsive">
              <table className="table table-hover mb-0 align-middle">
                <thead className="bg-light">
                  <tr>
                    <th className="ps-4" style={{ width: '45%' }}>Sản phẩm</th>
                    <th className="text-center">Số lượng</th>
                    <th className="text-end">Thành tiền</th>
                    <th className="text-center" style={{ width: '150px' }}>Đánh giá</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => {
                    const isEbook = (item.product_type === "Sách điện tử" || item.product_type === "Ebook") && item.product_detail.file_url;
                    
                    return (
                      <tr key={item.id}>
                        <td className="ps-4 py-3">
                          <div className="fw-medium">{item.product.name}</div>
                          <div className="text-muted small">
                            {item.product.author} • {item.product_type}
                            {isEbook && (
                                <a href={item.product_detail.file_url!} target="_blank" rel="noopener noreferrer" className="ms-2 text-decoration-none text-primary">
                                  <i className="bi bi-download me-1"></i>Tải về
                                </a>
                            )}
                          </div>
                          <div className="text-muted small">SKU: {item.product_detail.sku}</div>
                        </td>
                        <td className="text-center"><span className="badge bg-light text-dark border">{item.quantity}</span></td>
                        <td className="text-end fw-bold text-danger">{Number(item.total_price).toLocaleString()}₫</td>
                        <td className="text-center">
                          {order.status === "delivered" && (
                            <> 
                              {item.is_reviewed ? (
                                <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2">
                                  <i className="bi bi-check-circle-fill me-1"></i>Đã đánh giá
                                </span>
                              ) : (
                                <button 
                                  className="btn btn-outline-warning btn-sm"
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

          {/* Card Tổng tiền (ĐÃ SỬA LỖI TRÙNG LẶP) */}
          <div className="card border-0 shadow-sm mt-3">
            <div className="card-body">
               <div className="d-flex justify-content-between mb-2">
                 <span>Tạm tính:</span>
                 <span className="fw-medium">{Number(order.subtotal).toLocaleString()}₫</span>
               </div>
               
               <div className="d-flex justify-content-between mb-2">
                 <span>Phí vận chuyển:</span>
                 <span className="fw-medium">{Number(order.shipping_fee).toLocaleString()}₫</span>
               </div>
               
               {Number(order.discount) > 0 && (
                 <div className="d-flex justify-content-between mb-2">
                   <span className="text-muted">Giảm giá:</span>
                   <span className="fw-medium text-success">-{Number(order.discount).toLocaleString()}₫</span>
                 </div>
               )}

               <div className="row mt-3">
                   <div className="col-12 col-md-6 ms-auto">
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

        {/* CỘT PHẢI: THÔNG TIN GIAO HÀNG & THANH TOÁN */}
        <div className="col-lg-4">
          {/* Card Thông tin giao hàng */}
          <div className="card border-0 shadow-sm mb-3">
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

           {/* Card Thông tin thanh toán (ĐÃ SỬA LỖI TRÙNG CARD) */}
           <div className="card border-0 shadow-sm mb-3">
              <div className="card-body">
                  <h6 className="fw-bold mb-3 d-flex align-items-center">
                    <i className="bi bi-credit-card me-2 text-success"></i>Thanh toán
                  </h6>
                  
                  <div className="mb-3">
                    <p className="mb-1 small text-muted">Phương thức:</p>
                    <p className="fw-medium mb-0">{PAYMENT_METHOD_MAP[order.payment_method] || order.payment_method}</p>
                  </div>
                  
                  <div>
                    <p className="mb-1 small text-muted">Trạng thái:</p>
                    <span className={PAYMENT_STATUS_MAP[order.payment_status]?.class}>
                      {PAYMENT_STATUS_MAP[order.payment_status]?.text || order.payment_status}
                    </span>
                  </div>
              </div>
           </div>
           
           <button className="btn btn-secondary w-100" onClick={() => navigate("/don-hang-cua-toi")}>
              Quay lại danh sách
           </button>
        </div>
      </div>

      {/* MODAL ĐÁNH GIÁ */}
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