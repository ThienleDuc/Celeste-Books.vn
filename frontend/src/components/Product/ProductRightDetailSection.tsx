import { useState } from "react";
import QuantitySelector from "../Utils/QuantitySelector";

interface Props {
  product: any;
}

const ProductRightSection = ({ product }: Props) => {
  const detail = product.detail;
  const [quantity, setQuantity] = useState(1);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  if (!detail) return null;

  const discountPercent =
    Number(detail.original_price) > Number(detail.sale_price)
      ? Math.round(
          ((Number(detail.original_price) - Number(detail.sale_price)) /
            Number(detail.original_price)) *
            100
        )
      : 0;

  return (
    <>
      {/* ===== PRICE + BASIC INFO ===== */}
      <div className="card shadow-sm mb-3">
        <div className="card-body">
          <div className="d-flex align-items-center gap-2 mb-3">
            <span className="bg-primary text-light p-1 rounded-2 border small fw-bold">
              {detail.product_type}
            </span>
            <h3>{product.name}</h3>
          </div>

          {/* Author / Publisher */}
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

          {/* PRICE + QUANTITY */}
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
                <th className="table-th-detail">Loại sách</th>
                <td className="table-td-detail">{detail.product_type}</td>
              </tr>
              <tr>
                <th className="table-th-detail">SKU</th>
                <td className="table-td-detail">{detail.sku}</td>
              </tr>
              <tr>
                <th className="table-th-detail">Tồn kho</th>
                <td className="table-td-detail">{detail.stock}</td>
              </tr>
              <tr>
                <th className="table-th-detail">Trọng lượng</th>
                <td className="table-td-detail">{detail.weight} g</td>
              </tr>
              <tr>
                <th className="table-th-detail">Kích thước</th>
                <td className="table-td-detail">
                  {detail.length} × {detail.width} × {detail.height} cm
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== DESCRIPTION ===== */}
      <div className="card shadow-sm mb-4">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h6 className="mb-0">Mô tả sản phẩm</h6>
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => setDescriptionExpanded((p) => !p)}
          >
            {descriptionExpanded ? "Rút gọn" : "Xem thêm"}
          </button>
        </div>
        <div
          className="card-body"
          style={{
            maxHeight: descriptionExpanded ? "none" : 120,
            overflow: "hidden",
            transition: "max-height 0.3s ease",
          }}
        >
          <p className="mb-0">
            {product.description || "Chưa có mô tả cho sản phẩm này."}
          </p>
        </div>
      </div>
    </>
  );
};

export default ProductRightSection;
