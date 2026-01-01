import { useState } from "react";
import type { ProductFull } from "../../models/Product/product.model";
import QuantitySelector from "../Utils/QuantitySelector";

interface Props {
  productFull: ProductFull;
}

const ProductRightSection = ({ productFull }: Props) => {
  const { product, details } = productFull;

  // Mặc định chọn loại đầu tiên
  const [selectedTypeId, setSelectedTypeId] = useState<number>(
    details[0]?.id || 0
  );

  // State lưu số lượng từng loại
  const [quantities, setQuantities] = useState<Record<number, number>>(
    () =>
      details.reduce((acc, item) => {
        acc[item.id] = 1;
        return acc;
      }, {} as Record<number, number>)
  );

  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  const selectedDetail = details.find((d) => d.id === selectedTypeId);
  if (!selectedDetail) return null;

  const discountPercent =
    selectedDetail.originalPrice > selectedDetail.salePrice
      ? Math.round(
          ((selectedDetail.originalPrice - selectedDetail.salePrice) /
            selectedDetail.originalPrice) *
            100
        )
      : 0;

  return (
    <>
      {/* ===== PRICE + SOLD ===== */}
        <div className="card shadow-sm mb-3">
            <div className="card-body">
                <div className="d-flex align-items-center gap-2 mb-3">
                    <span className="bg-primary text-light p-1 rounded-2 border small fw-bold">Sách</span>
                    <h3 style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
                    {product.name}
                    </h3>
                </div>

                {/* Thông tin tác giả, NXB, năm, ngôn ngữ */}
                <div className="row mb-3">
                    <div className="col-6">
                    <div className="d-flex gap-2 mb-2">
                        <p>Tác giả:</p>
                        <h5 className="text-primary">{product.author || "-"}</h5>
                    </div>
                    <div className="d-flex gap-2">
                        <p>Nhà xuất bản:</p>
                        <h5 className="text-success">{product.publisher || "-"}</h5>
                    </div>
                    </div>
                    <div className="col-6">
                    <div className="d-flex gap-2 mb-2">
                        <p>Năm xuất bản:</p>
                        <h5 className="text-warning">{product.publicationYear || "-"}</h5>
                    </div>
                    <div className="d-flex gap-2">
                        <p>Ngôn ngữ:</p>
                        <h5 className="text-danger">{product.language || "-"}</h5>
                    </div>
                    </div>
                </div>

                {/* Chọn loại sản phẩm */}
                <div className="d-flex gap-2 mb-3">
                    {details.map((d) => (
                    <button
                        key={d.id}
                        className={`btn btn-sm ${
                        selectedTypeId === d.id ? "btn-primary" : "btn-outline-primary"
                        }`}
                        onClick={() => setSelectedTypeId(d.id)}
                    >
                        {d.productType === "Sách giấy" ? (
                        <i className="bi bi-book-half me-1"></i>
                        ) : (
                        <i className="bi bi-tablet-landscape me-1"></i>
                        )}
                        {d.productType}
                    </button>
                    ))}
                </div>

                {/* Giá bán + giảm + số lượng */}
                <div className="price-quantity-container">
                    <div className="price-section">
                        <span className="sale-price">{selectedDetail.salePrice.toLocaleString()}₫</span>
                        {discountPercent > 0 && (
                        <>
                            <span className="original-price">{selectedDetail.originalPrice.toLocaleString()}₫</span>
                            <span className="discount-badge">-{discountPercent}%</span>
                        </>
                        )}
                    </div>

                    <QuantitySelector
                        id={`quantity-${selectedDetail.id}`}   // id riêng cho từng sản phẩm
                        value={quantities[selectedDetail.id]}
                        stock={selectedDetail.stock}
                        onChange={(newValue) =>
                            setQuantities((prev) => ({
                            ...prev,
                            [selectedDetail.id]: newValue,
                            }))
                        }
                        />
                </div>
            </div>
        </div>

        {/* ===== PRODUCT INFO ===== */}
        <div className="card shadow-sm mb-3">
            <div className="card-header card-head-detail">Thông tin chi tiết</div>
            <div className="card-body p-0">
            <table className="table table-borderless mb-0 mx-2">
                <tbody>
                <tr>
                    <th className="table-th-detail">Loại sách</th>
                    <td className="table-td-detail">{selectedDetail.productType}</td>
                </tr>
                <tr>
                    <th className="table-th-detail">Mã sách</th>
                    <td className="table-td-detail">{selectedDetail.sku}</td>
                </tr>
                <tr>
                    <th className="table-th-detail">Số lượng còn</th>
                    <td className="table-td-detail">{selectedDetail.stock}</td>
                </tr>
                <tr>
                    <th className="table-th-detail">Trọng lượng</th>
                    <td className="table-td-detail">{selectedDetail.weight ?? "—"} kg</td>
                </tr>
                <tr>
                    <th className="table-th-detail">Số trang</th>
                    <td className="table-td-detail">{selectedDetail.length ?? "—"}</td>
                </tr>
                <tr>
                    <th className="table-th-detail">Kích thước</th>
                    <td className="table-td-detail">{selectedDetail.width ?? "—"} x {selectedDetail.height ?? "—"} cm</td>
                </tr>
                </tbody>
            </table>
            </div>
        </div>

        {/* ===== DESCRIPTION ===== */}
        <div className="card shadow-sm mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
            <h6 className="mb-0">Mô tả sản phẩm</h6>
            <button className="btn btn-sm btn-outline-primary" onClick={() => setDescriptionExpanded((prev) => !prev)}>
                {descriptionExpanded ? "Rút gọn" : "Xem thêm"}
            </button>
            </div>
            <div
            className="card-body"
            style={{
                maxHeight: descriptionExpanded ? "none" : 120,
                overflow: descriptionExpanded ? "visible" : "hidden",
                transition: "max-height 0.3s ease",
            }}
            >
            <p className="mb-0">{product.description ?? "Chưa có mô tả cho sản phẩm này."}</p>
            </div>
        </div>
    </>
  );
};

export default ProductRightSection;
