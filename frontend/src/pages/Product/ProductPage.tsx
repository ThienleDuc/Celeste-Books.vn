import { useState } from "react";
import { Helmet } from "react-helmet";
import "../../utils/formatNumber"
import ProductGridSection from "../../components/Product/ProductGridSection";
import { sampleProducts } from "../../models/Product/product.model";
import { topSellingItemsDemo } from "../../models/Product/topSelling.model";
import { myPurchaseHistory } from "../../models/Product/purchaseHistory.model";
import ProductCarousel from "../../components/Product/ProductCarousel";
import { TopRecommendedItems } from "../../models/Product/TopRecommendedItem.model";

const ProductPage = () => {
  const [filter, setFilter] = useState<"day" | "week" | "month">("day");
  const topSellingItems = topSellingItemsDemo[filter];

  return (
    <>
      <Helmet>
        <title>Danh Sách Sản Phẩm - Celeste Books</title>
        <meta
          name="description"
          content="Khám phá danh sách sản phẩm sách đa dạng tại Celeste Books."
        />
      </Helmet>

      <div className="container my-4 ">
        <h1 className="h3 fw-bold mb-4 title-page">Danh sách sản phẩm</h1>

        <ProductCarousel products={TopRecommendedItems} showRank={true} />

        {/* Lưới sản phẩm và sidebar bán chạy */}
        <div className="row g-3">
          <h5 className="mb-3 title-section">Celeste Books - Tất cả</h5>

          {/* Cột 1: chiếm 9/12 */}
          <div className="col-12 col-lg-9">
            <ProductGridSection products={sampleProducts} />
          </div>

          {/* Cột 2: chiếm 3/12 */}
          <div className="col-12 col-lg-3">
            <div className="d-flex flex-column gap-3">

              {/* =========== */}
              {/* Lịch sử mua */}
              {/* =========== */}
              <div className="my-purchase-history sidebar-product p-3 border rounded shadow-sm">

                {/* Header */}
                <div className="d-flex justify-content-between gap-1 align-items-center mb-3">
                  <h6 className="fw-bold mb-0 text-ellipsis-1">
                    <i className="bi bi-bag-check me-1"></i>
                    Lịch sử mua
                  </h6>

                  <a
                    href="#"
                    className="btn btn-link btn-sm p-0 fs-20 text-secondary"
                    onClick={(e) => e.preventDefault()}
                  >
                    Xem tất cả
                  </a>
                </div>

                {/* Danh sách – 3 item */}
                <div className="d-flex flex-column gap-2">
                  {myPurchaseHistory.slice(0, 5).map((item) => (
                    <div
                      key={item.id}
                      className="sidebar-item d-flex gap-2 align-items-start border rounded p-2"
                    >
                      {/* Ảnh sách */}
                      <img
                        src={item.image}
                        alt={item.name}
                        className="sidebar-img rounded"
                      />

                      {/* Thông tin */}
                      <div className="flex-grow-1 overflow-hidden">
                        <div className="sidebar-name small text-ellipsis-1">
                          {item.name}
                        </div>

                        <div className="my-purchase-price small">
                          {item.price.toLocaleString()}₫
                        </div>

                        <div className="my-purchase-date">
                          Mua ngày {item.date}
                        </div>
                      </div>

                      <div className="d-flex align-items-center align-self-stretch">
                        <button
                          type="button"
                          className="btn btn-outline-primary btn-sm buy-again-btn"
                          onClick={() => console.log("Buy again", item.id)}
                        >
                          Mua lại
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ===================== */}
              {/* Sách bán chạy         */}
              {/* ===================== */}
              <div className="top-selling-sidebar sidebar-product p-3 border rounded shadow-sm">

                {/* Filter */}
                <div className="mb-3 d-flex gap-2">
                  {(["day", "week", "month"] as const).map((f) => (
                    <a
                      key={f}
                      href="#"
                      className={`flex-fill text-center py-1 text-decoration-none filter-btn ${
                        filter === f ? "active" : ""
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        setFilter(f);
                      }}
                    >
                      {f === "day" ? "Ngày" : f === "week" ? "Tuần" : "Tháng"}
                    </a>
                  ))}
                </div>

                {/* Danh sách */}
                <div className="d-flex flex-column gap-2 mb-3">
                  {topSellingItems.slice(0, 5).map((item) => (
                    <div
                      className="sidebar-item d-flex align-items-center gap-2 border rounded p-2 shadow-sm"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="sidebar-img rounded"
                      />

                      <div className="flex-grow-1 d-flex flex-column">
                        <div className="sidebar-name text-ellipsis-1">
                          {item.name}
                        </div>

                        <div className="d-flex gap-3 small text-muted mt-1 top-selling-stats">
                          <span><i className="bi bi-eye"></i> {item.views}</span>
                          <span><i className="bi bi-cart"></i> {item.bought}</span>
                          <span><i className="bi bi-star-fill"></i> {item.rating}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Xem thêm */}
                <div className="text-center">
                  <a
                    href="#"
                    className="btn btn-outline-primary btn-sm"
                    onClick={(e) => e.preventDefault()}
                  >
                    Xem thêm
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductPage;
