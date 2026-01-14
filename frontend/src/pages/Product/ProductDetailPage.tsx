// pages/Product/ProductDetailPage.tsx
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useEffect, useRef, useState } from "react";
import { Breadcrumbs, Typography, Link } from "@mui/material";
import axios from "axios";

/* ===== COMPONENTS ===== */
import ProductRightSection from "../../components/Product/ProductRightDetailSection";
import ThumbnailCarousel from "../../components/Utils/ThumbnailCarousel";
import ProductReviewsSection from "../../components/Product/ProductReviewsSection";
import ProductRecommendedSection from "../../components/Product/ProductRecommendedSection";
import ProductSuggestedSection from "../../components/Product/ProductSuggestedSection";
import ProductLayout from "../../layouts/_ProductLayout"; // Thêm import

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
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [isAdding, setIsAdding] = useState(false);

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

/* ================= HANDLER: ADD TO CART (ĐÃ SỬA LỖI) ================= */
  const handleAddToCart = async () => {
    // 1. Kiểm tra biến 'product' (state chính của trang)
    if (!product || !product.id) {
      alert("Đang tải thông tin sản phẩm, vui lòng chờ...");
      return;
    }

    // 2. Kiểm tra biến 'selectedDetail' (biến thể đang chọn: Sách giấy/Ebook)
    // Thay vì dùng biến 'details' (mảng), ta dùng 'selectedDetail' (object)
    if (!selectedDetail || !selectedDetail.id) {
      alert("Vui lòng chọn loại sản phẩm (Sách giấy/Sách điện tử).");
      return;
    }

    // 3. Kiểm tra đăng nhập
    const userInfoStr = localStorage.getItem("user_info");
    const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;

    if (!userInfo || !userInfo.id) {
      const confirmLogin = window.confirm("Vui lòng đăng nhập để mua hàng. Đi đến trang đăng nhập ngay?");
      if (confirmLogin) {
        navigate("/login");
      }
      return;
    }

    const userId = userInfo.id;
    setIsAdding(true);

    // 4. Tạo Payload từ các state đã có dữ liệu
    const payload = {
      user_id: userId,
      product_id: product.id,           // Lấy ID từ state product
      product_details_id: selectedDetail.id, // Lấy ID từ state selectedDetail
      quantity: quantity,               // Lấy số lượng từ state quantity
    };

    console.log("=== ADD TO CART PAYLOAD ===", payload);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/shopping-carts/add",
        payload
      );

      if (response.data.success) {
        const confirmGoToCart = window.confirm(
          "Đã thêm vào giỏ thành công! Bạn có muốn đến giỏ hàng ngay không?"
        );
        if (confirmGoToCart) {
          navigate(`/gio-hang/${userId}`);
        }
      } else {
        alert("Có lỗi xảy ra: " + response.data.message);
      }
    } catch (error: any) {
      console.error("Lỗi thêm giỏ hàng:", error);
      
      const msg = error.response?.data?.message || "Lỗi kết nối đến server";
      
      // Xử lý lỗi tồn kho (nếu backend trả về mã 400)
      if (error.response?.status === 400 && error.response?.data?.data?.stock) {
         alert(`Không thể thêm. Kho chỉ còn ${error.response.data.data.stock} sản phẩm.`);
      } else {
         alert(msg);
      }
    } finally {
      setIsAdding(false);
    }
  };


  /* ================= RENDER ================= */
  if (loading) {
    return (
      <ProductLayout>
        <div className="container my-5 text-center">
          <div className="spinner-border text-primary" />
          <p className="mt-2">Đang tải...</p>
        </div>
      </ProductLayout>
    );
  }

  if (error || !product) {
    return (
      <ProductLayout>
        <div className="container my-5 text-center">
          <div className="alert alert-danger">{error}</div>
          <button className="btn btn-primary" onClick={() => navigate("/")}>
            Quay lại trang chủ
          </button>
        </div>
      </ProductLayout>
    );
  }

  const displayImages = productImages.length > 0 ? productImages : product.images;

  return (
    <ProductLayout>
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
          {/* ================= LEFT COLUMN ================= */}
          <div className="col-12 col-md-5">
            <div className="card product-details-card shadow-sm mb-4" ref={leftRef}>
              <div className="card-body">
                <img 
                  src={mainImage} 
                  alt={product.name} 
                  className="main-img mb-3" 
                  style={{ width: "100%", height: "500px", objectFit: "contain" }}
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
                <button 
                  className="btn-add-cart" 
                  onClick={handleAddToCart}
                  disabled={isAdding}
                  style={{ opacity: isAdding ? 0.7 : 1 }}
                >
                  <i className={`bi ${isAdding ? 'bi-hourglass-split' : 'bi-cart-plus'} me-1`} />
                  {isAdding ? "Đang xử lý..." : "Thêm vào giỏ hàng"}
                </button>
                  <button className="btn-buy-now" onClick={handleBuyNow}>
                    <i className="bi bi-bag-check me-1" /> Mua ngay
                  </button>
              </div>
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN ================= */}
          <div className="col-12 col-md-7">
            <div
              className="card shadow-sm overflow-auto overflow-scrollbar-webkit-none"
              style={{ height: leftHeight ? `${leftHeight}px` : "auto" }}
            >
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

        {/* ================== REVIEWS ================== */}
        <ProductReviewsSection 
          reviews={reviews}
          productId={product.id}
        />

        {/* ================== SUGGESTED ================== */}
        <ProductSuggestedSection
          title="Sản phẩm liên quan"
          productId={product.id}
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
    </ProductLayout>
  );
};

export default ProductDetailPage;