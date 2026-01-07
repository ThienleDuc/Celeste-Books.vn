import { Helmet } from "react-helmet";
import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Breadcrumbs, Typography, Link } from "@mui/material";

import {
  sampleProducts,
  type ProductFull,
} from "../../models/Product/product.model";

import {
  type UserReview,
  sampleUserReviews,
} from "../../models/Order/userReviews.model";

import ProductGridSection from "../../components/Product/ProductGridSection";
import ReviewProductSection from "../../components/Product/ReviewProductSection";

import ProductRightSection from "../../components/Product/ProductRightDetailSection";
import ThumbnailCarousel from "../../components/Utils/ThumbnailCarousel";

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);

  const productFull: ProductFull | undefined = sampleProducts.find(
    (p) => p.product.id === productId
  );

  if (!productFull) {
    return (
      <div className="container my-4">
        <div className="card shadow-sm">
          <div className="card-body">
            <h2 className="h5 fw-bold">Sản phẩm không tồn tại</h2>
          </div>
        </div>
      </div>
    );
  }

  const { product, images } = productFull;

  /* ================== IMAGE ================== */
  const mainImageDefault =
    images.find((img) => img.isPrimary)?.imageUrl ||
    images[0]?.imageUrl ||
    "/img/no-image.png";

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [mainImage, setMainImage] = useState(mainImageDefault);

  /* ================== REVIEWS ================== */
  const userReviews: UserReview[] = sampleUserReviews.filter(
    (r) => r.productId === product.id
  );

  const ratingData = [
    { stars: 5, percent: 60 },
    { stars: 4, percent: 20 },
    { stars: 3, percent: 10 },
    { stars: 2, percent: 5 },
    { stars: 1, percent: 5 },
  ];

  /* ================== PRODUCTS ================== */
  const recommendedProducts = sampleProducts
    .filter((p) => p.product.id !== product.id)
    .slice(0, 6);

  const suggestedProducts = sampleProducts
    .filter((p) => p.product.id !== product.id)
    .slice(0, 12);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const leftRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [leftHeight, setLeftHeight] = useState<number | undefined>();

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (leftRef.current) {
      setLeftHeight(leftRef.current.offsetHeight);
    }
  }, [mainImage, images]); 

  return (
    <div className="container my-4 product-detail-page">
      <Helmet>
        <title>{product.name} - Celeste Books</title>
        <meta
          name="description"
          content={`Chi tiết sản phẩm ${product.name}`}
        />
      </Helmet>

      {/* ================== BREADCRUMB ================== */}
      <Breadcrumbs className="mb-4">
        <Link underline="hover" color="inherit" href="/">
          Trang chủ
        </Link>
        <Link underline="hover" color="inherit" href="/tim-sach">
          Tìm kiếm
        </Link>
        <Typography color="text.primary">{product.name}</Typography>
      </Breadcrumbs>

      {/* ================== PRODUCT INFO ================== */}
      <div className="row g-4 align-items-start">
        {/* ================= LEFT ================= */}
        <div className="col-12 col-md-5">
          <div className="card product-details-card shadow-sm mb-4" ref={leftRef}>
            <div className="card-body">
              <img src={mainImage} alt={product.name} className="main-img mb-3" />
              <ThumbnailCarousel
                images={images}
                mainImage={mainImage}
                setMainImage={setMainImage}
                visibleCount={6}
              />
              <div className="d-flex gap-2 mt-3">
                <button className="btn-add-cart">
                  <i className="bi bi-cart-plus me-1" />
                  Thêm vào giỏ hàng
                </button>
                <button className="btn-buy-now">
                  <i className="bi bi-bag-check me-1" />
                  Mua ngay
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT ================= */}
        <div className="col-12 col-md-7">
          <div
            className="card shadow-sm overflow-auto overflow-scrollbar-webkit-none"
            style={{ height: leftHeight ? `${leftHeight}px` : "auto", cursor: "pointer" }}
          >
            <div className="card-body">
              <ProductRightSection productFull={productFull} />
            </div>
          </div>
        </div>
      </div>

      {/* ================== ĐÁNH GIÁ ================== */}
      <h5 className="title-section">Đánh giá sản phẩm</h5>
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-12 col-md-4 border-end">
              <div className="text-center mb-3">
                <h2 className="fw-bold mb-1">
                  4.5 <small className="text-muted">/5</small>
                </h2>
                <p className="text-muted mb-0">
                  {userReviews.length} đánh giá
                </p>
              </div>

              {ratingData.map((r) => (
                <div
                  key={r.stars}
                  className="d-flex align-items-center gap-2 mb-2"
                >
                  <span style={{ width: 60 }}>{r.stars} sao</span>
                  <div className="progress flex-grow-1" style={{ height: 8 }}>
                    <div
                      className="progress-bar bg-warning"
                      style={{ width: `${r.percent}%` }}
                    />
                  </div>
                  <span className="text-muted">{r.percent}%</span>
                </div>
              ))}
            </div>

            <div className="col-12 col-md-8 ps-md-4">
              <ReviewProductSection reviews={userReviews} />
            </div>
          </div>
        </div>
      </div>

      {/* ================== RECOMMENDED ================== */}
      <h5 className="title-section">Sản phẩm giới thiệu</h5>
      <ProductGridSection
        products={recommendedProducts}
        hiddenPagination
        itemsPerPage={6}
        colMd={2}
      />

      {/* ================== SUGGESTED ================== */}
      <h5 className="title-section">Sản phẩm gợi ý</h5>
      <ProductGridSection
        products={suggestedProducts}
        hiddenPagination
        itemsPerPage={12}
        colMd={2}
      />
    </div>
  );
};

export default ProductDetailPage;
