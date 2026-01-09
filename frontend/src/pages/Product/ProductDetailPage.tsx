import { Helmet } from "react-helmet";
import { useEffect, useRef, useState } from "react";
import axios from "axios";

import ProductRightSection from "../../components/Product/ProductRightDetailSection";
import ThumbnailCarousel from "../../components/Utils/ThumbnailCarousel";
import ReviewProductSection from "../../components/Product/ReviewProductSection";
import ProductGridSection from "../../components/Product/ProductGridSection";

import type { ProductFull } from "../../models/Product/product.model";

const ProductDetailPage = () => {
  const id = 1; // test cứng – sau này lấy từ useParams

  /* ================= STATE ================= */
  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [mainImage, setMainImage] = useState<string>("");
  const [featuredProducts, setFeaturedProducts] = useState<ProductFull[]>([]);

  const leftRef = useRef<HTMLDivElement>(null);
  const [leftHeight, setLeftHeight] = useState<number>();

  /* ================= FETCH PRODUCT ================= */
  useEffect(() => {
    axios
      .get(`http://127.0.0.1:8000/api/products/${id}`)
      .then((res) => {
        const data = res.data.data;
        setProduct(data);

        const primaryImage =
          data.images?.find((i: any) => i.is_primary)?.image_url ||
          data.images?.[0]?.image_url ||
          "/img/no-image.png";

        setMainImage(primaryImage);
      });
  }, [id]);

  /* ================= FETCH REVIEWS ================= */
  useEffect(() => {
  axios
    .get(`http://127.0.0.1:8000/api/review/${id}`)
    .then((res) => {
      const data = res.data.data;

      // ⭐ QUAN TRỌNG
      setReviews(Array.isArray(data) ? data : [data]);
    })
    .catch(() => setReviews([]));
}, [id]);


  /* ================= FETCH FEATURED (BEST SELLERS) ================= */
  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/product-details/best-sellers")
      .then((res) => {
        const mapped: ProductFull[] = res.data.data.map((item: any) => ({
          product: {
            id: item.id,
            name: item.name,
            slug: item.slug,
            rating: item.rating,
            views: item.views,
            status: item.status,
          },
          details: [
            {
              productType: item.detail.product_type,
              originalPrice: Number(item.detail.original_price),
              salePrice: Number(item.detail.sale_price),
              stock: item.detail.stock,
            },
          ],
          images: item.images.map((img: any) => ({
            imageUrl: img.image_url,
            isPrimary: img.is_primary === 1,
          })),
        }));

        setFeaturedProducts(mapped);
      })
      .catch(() => setFeaturedProducts([]));
  }, []);

  /* ================= HEIGHT SYNC ================= */
  useEffect(() => {
    if (leftRef.current) {
      setLeftHeight(leftRef.current.offsetHeight);
    }
  }, [mainImage]);

  if (!product) {
    return <p className="text-center my-5">Đang tải sản phẩm...</p>;
  }

  /* ================= REVIEW STATS ================= */
  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + Number(r.rating), 0) / reviews.length
        ).toFixed(1)
      : "0.0";

  const ratingData = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.rating === star).length;
    const percent = reviews.length ? (count / reviews.length) * 100 : 0;
    return { stars: star, percent };
  });

  /* ================= RENDER ================= */
  return (
    <div className="container my-4 product-detail-page">
      <Helmet>
        <title>{product.name}</title>
      </Helmet>

      {/* ================= PRODUCT INFO ================= */}
      <div className="row g-4 align-items-start">
        {/* LEFT */}
        <div className="col-12 col-md-5">
          <div className="card shadow-sm" ref={leftRef}>
            <div className="card-body">
              <img
                src={mainImage}
                alt={product.name}
                className="product-main-image mb-3"
              />

              <ThumbnailCarousel
                images={product.images}
                mainImage={mainImage}
                setMainImage={setMainImage}
                visibleCount={6}
              />

              <div className="d-flex gap-2 mt-3">
                <button className="btn btn-outline-primary w-50">
                  <i className="bi bi-cart-plus me-1" />
                  Thêm vào giỏ
                </button>
                <button className="btn btn-danger w-50">
                  <i className="bi bi-bag-check me-1" />
                  Mua ngay
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="col-12 col-md-7">
          <div
            className="card shadow-sm overflow-auto"
            style={{ height: leftHeight ? `${leftHeight}px` : "auto" }}
          >
            <div className="card-body">
              <ProductRightSection product={product} />
            </div>
          </div>
        </div>
      </div>

      {/* ================= REVIEWS ================= */}
      <h5 className="title-section mt-5">Đánh giá sản phẩm</h5>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row">
            {/* SUMMARY */}
            <div className="col-12 col-md-4 border-end">
              <div className="text-center mb-3">
                <h2 className="fw-bold mb-1">
                  {avgRating} <small className="text-muted">/5</small>
                </h2>
                <p className="text-muted mb-0">{reviews.length} đánh giá</p>
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
                  <span className="text-muted">
                    {Math.round(r.percent)}%
                  </span>
                </div>
              ))}
            </div>

            {/* LIST */}
            <div className="col-12 col-md-8 ps-md-4">
              <ReviewProductSection reviews={reviews} />
            </div>
          </div>
        </div>
      </div>

      {/* ================= FEATURED PRODUCTS ================= */}
     <h5 className="title-section mt-5 mb-3">Sản phẩm nổi bật</h5>

      <ProductGridSection
        products={featuredProducts}
        hiddenPagination
        itemsPerPage={8}
        colMd={3}
      />
    </div>
  );
};

export default ProductDetailPage;
