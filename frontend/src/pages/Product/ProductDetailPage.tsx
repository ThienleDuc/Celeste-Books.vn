import { Helmet } from "react-helmet";
import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Breadcrumbs, Typography, Link } from "@mui/material";

import {
  sampleProducts,
  type ProductFull,
} from "../../models/Product/product.model";

import ProductRightSection from "../../components/Product/ProductRightDetailSection";
import ThumbnailCarousel from "../../components/Utils/ThumbnailCarousel";

// Import 3 components mới
import ProductReviewsSection from "../../components/Product/ProductReviewsSection";
import ProductRecommendedSection from "../../components/Product/ProductRecommendedSection";
import ProductSuggestedSection from "../../components/Product/ProductSuggestedSection";

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
      <ProductReviewsSection />

      {/* ================== SUGGESTED ================== */}
      <ProductSuggestedSection
        title="Sản phẩm liên quan"
        productId={Number(id)} // Truyền productId từ URL
        itemsPerLoad={6}
        colMd={2}
      />

      {/* ================== RECOMMENDED ================== */}
      <ProductRecommendedSection
        title="Sản phẩm giới thiệu"
        itemsPerLoad={6}
        colMd={2}
      />
    </div>
  );
};

export default ProductDetailPage;