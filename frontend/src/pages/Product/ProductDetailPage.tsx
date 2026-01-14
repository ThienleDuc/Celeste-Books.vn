import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useEffect, useRef, useState } from "react";
import axios from "axios";

/* ===== COMPONENTS ===== */
import ProductRightSection from "../../components/Product/ProductRightDetailSection";
import ThumbnailCarousel from "../../components/Utils/ThumbnailCarousel"; 
import ReviewProductSection from "../../components/Product/ReviewProductSection";
import ProductGridSection from "../../components/Product/ProductGridSection";

/* ===== MODELS ===== */
import type { ProductFull } from "../../models/Product/product.model";

const ProductDetailPage = () => {
  /* ================= ROUTER ================= */
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const effectiveUserId = localStorage.getItem("userId") || "guest";

  /* ================= STATE ================= */
  const [product, setProduct] = useState<any>(null);
  const [productImages, setProductImages] = useState<any[]>([]);
  
  const [mainImage, setMainImage] = useState<string>("");
  const [activeImageId, setActiveImageId] = useState<number | null>(null);

  const [selectedDetail, setSelectedDetail] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<ProductFull[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [quantity, setQuantity] = useState<number>(1);
  const leftRef = useRef<HTMLDivElement>(null);
  const [leftHeight, setLeftHeight] = useState<number>();

  /* ================= 1. FETCH PRODUCT INFO ================= */
  useEffect(() => {
    if (!slug) {
      setError("Không tìm thấy mã sản phẩm (slug)");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setQuantity(1);

    axios
      .get(`http://127.0.0.1:8000/api/product-details?slug=${slug}`)
      .then((res) => {
        if (res.data.status) {
          const data = res.data.data;
          setProduct(data);

          // Chọn biến thể mặc định
          const defaultVariant = data.detail || (data.product_details && data.product_details[0]);
          setSelectedDetail(defaultVariant);
          setReviews(data.reviews || []);
          
          if (data.images && data.images.length > 0) {
              const firstImg = data.images[0];
              setMainImage(firstImg.image_url);
              setActiveImageId(firstImg.id);
          } else {
              setMainImage("/img/no-image.png");
          }
        } else {
          setError(res.data.message || "Lỗi khi tải sản phẩm");
        }
        setLoading(false);
      })
      .catch((err) => {
        const msg = err.response?.data?.message || "Không thể tải thông tin sản phẩm";
        setError(msg);
        setLoading(false);
      });
  }, [slug]);

  /* ================= 2. AUTO EXTRACT DESCRIPTION ================= */
  useEffect(() => {
    if (!product || !product.id) return;

    const desc = product.description || "";
    if (desc.trim().startsWith("http")) {
        axios.get(`http://127.0.0.1:8000/api/product-details/${product.id}/description-content`)
            .then(res => {
                if (res.data.status) {
                    const newText = res.data.data.content;
                    setProduct((prev: any) => ({
                        ...prev,
                        description: newText
                    }));
                }
            })
            .catch(err => {
                console.error("Lỗi auto load mô tả:", err);
            });
    }
  }, [product?.id, product?.description]); 

  /* ================= FETCH IMAGES ================= */
  useEffect(() => {
    if (product && product.id) {
      axios
        .get(`http://127.0.0.1:8000/api/product-details/${product.id}/images`)
        .then((res) => {
          if (res.data.status && res.data.data.length > 0) {
            const images = res.data.data;
            setProductImages(images);
            const primary = images.find((img: any) => img.is_primary === 1) || images[0];
            setMainImage(primary.image_url);
            setActiveImageId(primary.id);
          }
        })
        .catch((err) => console.error("Lỗi tải danh sách ảnh:", err));
    }
  }, [product]);

  /* ================= FETCH FEATURED ================= */
  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/product-details/best-sellers")
      .then((res) => {
        const mapped: ProductFull[] = res.data.data.map((item: any) => ({
             product: { id: item.id, name: item.name, slug: item.slug, rating: item.rating, views: item.views, status: item.status },
             details: [{ productType: item.detail.product_type, originalPrice: Number(item.detail.original_price), salePrice: Number(item.detail.sale_price), stock: item.detail.stock }],
             images: item.images.map((img: any) => ({ imageUrl: img.image_url, isPrimary: img.is_primary === 1 })),
        }));
        setFeaturedProducts(mapped);
      }).catch(() => setFeaturedProducts([]));
  }, []);

  /* ================= HEIGHT SYNC ================= */
  useEffect(() => {
    if (leftRef.current) {
      setLeftHeight(leftRef.current.offsetHeight);
    }
  }, [mainImage, product, selectedDetail, productImages]);

  /* ================= MUA NGAY ================= */
  const handleBuyNow = () => {
    if (!product || !selectedDetail) return;
    const price = Number(selectedDetail.sale_price) || Number(selectedDetail.original_price) || 0;

    const checkoutProduct = {
      id: Date.now(),
      productId: product.id,
      productDetailId: selectedDetail.id,
      quantity: quantity,
      priceAtTime: price,
      name: `${product.name} (${selectedDetail.product_type})`,
      image: mainImage,
      productType: selectedDetail.product_type,
    };

    const checkoutData = {
      userId: effectiveUserId,
      products: [checkoutProduct],
      totalQuantity: quantity,
      totalPrice: price * quantity,
      timestamp: new Date().toISOString(),
    };

    const storageKey = `checkout_${effectiveUserId}`;
    localStorage.setItem(storageKey, JSON.stringify(checkoutData));
    localStorage.setItem(`${storageKey}_expiry`, (Date.now() + 24 * 60 * 60 * 1000).toString());

    const queryParams = new URLSearchParams({
      userId: effectiveUserId,
      products: product.id.toString(),
      count: quantity.toString(),
      amount: (price * quantity).toString(),
    });

    navigate(`/thanh-toan/${effectiveUserId}?${queryParams.toString()}`, { state: checkoutData });
  };

  /* ================= RENDER ================= */
  if (loading) return <div className="container my-5 text-center"><div className="spinner-border text-primary" /><p className="mt-2">Đang tải...</p></div>;
  if (error || !product) return <div className="container my-5 text-center"><div className="alert alert-danger">{error}</div><button className="btn btn-primary" onClick={() => navigate("/")}>Quay lại</button></div>;

  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + Number(r.rating), 0) / reviews.length).toFixed(1) : "0.0";
  const ratingData = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => Number(r.rating) === star).length;
    return { stars: star, percent: reviews.length ? (count / reviews.length) * 100 : 0 };
  });

  const displayImages = productImages.length > 0 ? productImages : product.images;

  return (
    <div className="container my-4 product-detail-page">
      <Helmet><title>{product.name}</title></Helmet>

      <div className="row g-4 align-items-start">
        {/* ================= CỘT TRÁI (Đã set cứng chiều cao) ================= */}
        <div className="col-12 col-md-5">
          <div className="card product-details-card shadow-sm mb-4" ref={leftRef}>
            <div className="card-body">
              {/* style:
                  - width: "100%" -> Rộng hết cỡ cột
                  - height: "500px" -> Cao cố định 500px (bạn có thể sửa thành 600px, 400px tùy ý)
                  - objectFit: "contain" -> Ảnh nằm gọn trong khung 500px đó mà không bị méo/cắt
              */}
              <img 
                src={mainImage} 
                alt={product.name} 
                className="main-img mb-3" 
                style={{ width: "100%", height: "550px", objectFit: "contain" }}
              />
              
              <ThumbnailCarousel 
                images={displayImages} 
                mainImage={mainImage} 
                setMainImage={setMainImage}
                activeId={activeImageId} 
                setActiveId={setActiveImageId} 
                visibleCount={6} 
              />

              <div className="d-flex gap-2 mt-3">
                <button className="btn-add-cart">
                    <i className="bi bi-cart-plus me-1" /> Thêm vào giỏ
                </button>
                <button className="btn-buy-now" onClick={handleBuyNow}>
                    <i className="bi bi-bag-check me-1" /> Mua ngay
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ================= CỘT PHẢI ================= */}
        <div className="col-12 col-md-7">
          <div className="card shadow-sm overflow-auto" style={{ height: leftHeight ? `${leftHeight}px` : "auto" }}>
            <div className="card-body">
              <ProductRightSection 
                  product={product} 
                  quantity={quantity} 
                  setQuantity={setQuantity} 
                  selectedDetail={selectedDetail}
                  setSelectedDetail={setSelectedDetail}
              />
            </div>
          </div>
        </div>
      </div>

      {/* REVIEWS & FEATURED */}
      <h5 className="title-section mt-5">Đánh giá sản phẩm</h5>
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-12 col-md-4 border-end">
                <div className="text-center mb-3">
                    <h2 className="fw-bold mb-1">{avgRating} <small className="text-muted">/5</small></h2>
                    <p className="text-muted mb-0">{reviews.length} đánh giá</p>
                </div>
                 {ratingData.map((r) => (
                    <div key={r.stars} className="d-flex align-items-center gap-2 mb-2">
                          <span style={{ width: 60 }}>{r.stars} sao</span>
                          <div className="progress flex-grow-1" style={{ height: 8 }}><div className="progress-bar bg-warning" style={{ width: `${r.percent}%` }} /></div>
                          <span className="text-muted">{Math.round(r.percent)}%</span>
                    </div>
                 ))}
            </div>
            <div className="col-12 col-md-8 ps-md-4"><ReviewProductSection reviews={reviews} /></div>
          </div>
        </div>
      </div>
      {featuredProducts.length > 0 && (
          <>
            <h5 className="title-section mt-5 mb-3">Sản phẩm nổi bật</h5>
            <ProductGridSection products={featuredProducts} hiddenPagination itemsPerPage={8} colMd={3} />
          </>
      )}
    </div>
  );
};

export default ProductDetailPage;