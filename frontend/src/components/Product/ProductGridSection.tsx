import { useState } from "react";
import Pagination from "../Utils/Pagination";
import { formatNumber } from "../../utils/formatNumber";

interface ProductGridSectionProps {
  products: any[];
  itemsPerPage?: number;
  colMd?: number;
  hiddenPagination?: boolean;
  showRank?: boolean;
}

const ProductGridSection = ({
  products,
  itemsPerPage = 16,
  colMd = 3,
  hiddenPagination = false,
  showRank = false,
}: ProductGridSectionProps) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalItems = products.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = products.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <>
      <div className="row g-3 mb-4">
        {currentProducts.map((item, index) => {
          const product = item.product ?? {
            id: item.id,
            name: item.name,
          };

          const details = item.details
            ? item.details
            : item.detail
            ? [
                {
                  productType: item.detail.product_type,
                  originalPrice: item.detail.original_price,
                  salePrice: item.detail.sale_price,
                },
              ]
            : [];

          const detail =
            details.find((d: any) => d.productType === "Sách giấy") ||
            details[0] ||
            {};

          const price = Number(detail.salePrice ?? 0);
          const originalPrice = Number(detail.originalPrice ?? price);

          const hasDiscount = originalPrice > price;
          const discountPercent = hasDiscount
            ? Math.round(((originalPrice - price) / originalPrice) * 100)
            : 0;

          const images = item.images ?? [];
          const mainImage =
            images.find((i: any) => i.isPrimary || i.is_primary)?.imageUrl ||
            images.find((i: any) => i.isPrimary || i.is_primary)?.image_url ||
            images[0]?.imageUrl ||
            images[0]?.image_url ||
            "/img/no-image.png";

          const sold = item.sold ?? item.total_sold ?? 0;
          const rank = startIndex + index + 1;

          return (
            <div key={product.id} className={`col-12 col-sm-6 col-md-${colMd}`}>
              <div className="card product-card h-100 shadow-sm d-flex flex-column">
                <div className="card-img-wrapper position-relative">
                  <img
                    src={mainImage}
                    className="card-img-top"
                    alt={product.name}
                  />

                  {hasDiscount && (
                    <span className="discount-badge position-absolute top-0 start-0 m-2 bg-danger text-white px-2 py-1 rounded small">
                      -{discountPercent}%
                    </span>
                  )}

                  <div
                    className="product-actions d-flex flex-column gap-2"
                    style={{
                      position: "absolute",
                      top: "50%",
                      right: "0.5rem",
                      transform: "translateY(-50%)",
                    }}
                  >
                    <button className="action-btn" title="Thêm vào giỏ">
                      <i className="bi bi-cart-plus"></i>
                    </button>
                    <button className="action-btn" title="Chat">
                      <i className="bi bi-chat-dots"></i>
                    </button>
                  </div>

                  {showRank && (
                    <div
                      className="product-rank-badge position-absolute"
                      style={{
                        top: "0.5rem",
                        left: hasDiscount ? "3.5rem" : "0.5rem",
                        backgroundColor: "#0d6efd",
                        color: "#fff",
                        fontWeight: "bold",
                        fontSize: ".7rem",
                        padding: "0.25rem 0.5rem",
                        borderRadius: "4px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      #{rank}
                    </div>
                  )}
                </div>

                <div className="card-body d-flex flex-column flex-grow-1">
                  <h5 className="card-title text-ellipsis-1">
                    {product.name}
                  </h5>

                  <div className="mb-2 d-flex align-items-center gap-2">
                    {hasDiscount && (
                      <span className="text-muted text-decoration-line-through small">
                        {originalPrice.toLocaleString()}₫
                      </span>
                    )}
                    <span className="text-primary fw-bold">
                      {price.toLocaleString()}₫
                    </span>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mt-auto">
                    <span className="text-muted small">
                      Đã bán: {formatNumber(sold)}
                    </span>
                    <a
                      href={`/san-pham/${product.id}`}
                      className="view-product-link"
                    >
                      Xem sản phẩm
                    </a>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {!hiddenPagination && (
        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      )}
    </>
  );
};

export default ProductGridSection;