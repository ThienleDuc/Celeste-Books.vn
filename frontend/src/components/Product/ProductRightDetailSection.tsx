import { useState } from "react";
import QuantitySelector from "../Utils/QuantitySelector";

interface Props {
  product: any;
  quantity: number;
  setQuantity: (val: number) => void;
  selectedDetail: any;
  setSelectedDetail: (detail: any) => void;
}

const ProductRightSection = ({ 
    product, 
    quantity, 
    setQuantity, 
    selectedDetail, 
    setSelectedDetail 
}: Props) => {
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  // 1. Tìm các biến thể
  const variants = product.product_details || [];
  const paperVariant = variants.find((v: any) => v.product_type === "Sách giấy");
  const ebookVariant = variants.find((v: any) => v.product_type === "Sách điện tử");

  // Nếu chưa chọn thì lấy mặc định
  const detail = selectedDetail || product.detail;

  if (!detail) return null;

  const discountPercent =
    Number(detail.original_price) > Number(detail.sale_price)
      ? Math.round(
          ((Number(detail.original_price) - Number(detail.sale_price)) /
            Number(detail.original_price)) * 100
        )
      : 0;

  // Hàm chuyển loại
  const handleSelectType = (type: "paper" | "ebook") => {
      if (type === "paper" && paperVariant) {
          setSelectedDetail(paperVariant);
          setQuantity(1); 
      }
      if (type === "ebook" && ebookVariant) {
          setSelectedDetail(ebookVariant);
          setQuantity(1); 
      }
  };

  const isPaper = detail.product_type === "Sách giấy";
  const displayWeight = isPaper && detail.weight ? `${detail.weight} g` : "-";
  const displayDimensions = isPaper && detail.length 
        ? `${detail.length} x ${detail.width} x ${detail.height} cm` 
        : "-";

  // =================================================================
  // 👇 LOGIC KIỂM TRA MÔ TẢ ĐỂ HIỂN THỊ (MỚI)
  // =================================================================
  const description = product.description || "";
  
  // Kiểm tra: Nếu bắt đầu bằng http -> Nó là Link file -> Cần ẩn đi và hiện Loading
  const isUrl = description.trim().startsWith("http");
  
  // Trạng thái đang tải: Khi nó là URL hoặc đang rỗng
  const isLoadingDescription = isUrl;

  return (
    <>
      {/* ===== HEADER & INFO ===== */}
      <div className="card shadow-sm mb-3">
        <div className="card-body">
          <div className="d-flex align-items-center gap-2 mb-3">
            <span className={`badge ${detail.product_type === 'Sách điện tử' ? 'bg-info' : 'bg-primary'} p-2 border`}>
               {detail.product_type}
            </span>
            <h3>{product.name}</h3>
          </div>

          <div className="row mb-3">
            <div className="col-6">
              <div className="d-flex gap-2 mb-2">
                <p>Tác giả:</p>
                <h5 className="text-primary">{product.author || "-"}</h5>
              </div>
              <div className="d-flex gap-2">
                <p>NXB:</p>
                <h5 className="text-success">{product.publisher || "-"}</h5>
              </div>
            </div>
            <div className="col-6">
              <div className="d-flex gap-2 mb-2">
                <p>Năm XB:</p>
                <h5 className="text-warning">{product.publication_year}</h5>
              </div>
              <div className="d-flex gap-2">
                <p>Ngôn ngữ:</p>
                <h5 className="text-danger">{product.language}</h5>
              </div>
            </div>
          </div>

          {/* ===== BUTTONS CHỌN LOẠI SÁCH ===== */}
          <div className="mb-4">
             <p className="fw-bold mb-2 small text-muted text-uppercase">Chọn phiên bản:</p>
             <div className="d-flex gap-2">
                <button 
                    className={`btn ${detail.product_type === 'Sách giấy' ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => handleSelectType("paper")}
                    disabled={!paperVariant}
                    style={{ minWidth: 120 }}
                >
                    <i className="bi bi-book me-1"></i> Sách giấy
                </button>
                <button 
                    className={`btn ${detail.product_type === 'Sách điện tử' ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => handleSelectType("ebook")}
                    disabled={!ebookVariant}
                    style={{ minWidth: 120 }}
                >
                    <i className="bi bi-tablet me-1"></i> E-book
                </button>
             </div>
          </div>

          {/* ===== PRICE + QUANTITY ===== */}
          <div className="price-quantity-container">
            <div className="price-section">
              <span className="sale-price">
                {Number(detail.sale_price).toLocaleString()}₫
              </span>

              {discountPercent > 0 && (
                <>
                  <span className="original-price">
                    {Number(detail.original_price).toLocaleString()}₫
                  </span>
                  <span className="discount-badge">-{discountPercent}%</span>
                </>
              )}
            </div>

            <QuantitySelector
              id={`quantity-${detail.id}`}
              value={quantity}
              stock={detail.stock} 
              onChange={setQuantity}
            />
          </div>
        </div>
      </div>

      {/* ===== PRODUCT DETAIL TABLE ===== */}
      <div className="card shadow-sm mb-3">
        <div className="card-header card-head-detail">
          Thông tin chi tiết
        </div>
        <div className="card-body p-0">
          <table className="table table-borderless mb-0 mx-2">
            <tbody>
              <tr>
                <th className="table-th-detail" style={{ width: "40%" }}>Loại sản phẩm</th>
                <td className="table-td-detail fw-bold">{detail.product_type}</td>
              </tr>
              <tr><th className="table-th-detail">Tồn kho</th><td className="table-td-detail">{detail.stock}</td></tr>
              <tr><th className="table-th-detail">Trọng lượng</th><td className="table-td-detail">{displayWeight}</td></tr>
              <tr><th className="table-th-detail">Kích thước</th><td className="table-td-detail">{displayDimensions}</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== DESCRIPTION (TỰ ĐỘNG HIỂN THỊ) ===== */}
      <div className="card shadow-sm mb-4">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h6 className="mb-0">Mô tả sản phẩm</h6>
          {/* Chỉ hiện nút Rút gọn/Xem thêm khi đã load xong văn bản */}
          {!isLoadingDescription && description && (
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={() => setDescriptionExpanded((p) => !p)}
              >
                {descriptionExpanded ? "Rút gọn" : "Xem thêm"}
              </button>
          )}
        </div>
        <div
          className="card-body"
          style={{
            maxHeight: descriptionExpanded ? "none" : 120,
            overflow: "hidden",
            transition: "max-height 0.3s ease",
            whiteSpace: "pre-line" // Giữ xuống dòng
          }}
        >
          {isLoadingDescription ? (
             /* TRƯỜNG HỢP 1: Đang là Link -> Hiện Loading */
             <div className="text-center py-3 text-muted">
                <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                <span>Đang cập nhật nội dung từ sách...</span>
             </div>
          ) : (
             /* TRƯỜNG HỢP 2: Đã là Văn bản -> Hiện nội dung */
             <p className="mb-0">
                {description || "Chưa có mô tả cho sản phẩm này."}
             </p>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductRightSection;