// pages/Product/ProductDetailPage.tsx
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useEffect, useRef, useState } from "react";
import { Breadcrumbs, Typography, Link } from "@mui/material";
import axios from "axios";
import Swal from "sweetalert2";

/* ===== COMPONENTS ===== */
import ProductRightSection from "../../components/Product/ProductRightDetailSection";
import ThumbnailCarousel from "../../components/Utils/ThumbnailCarousel";
import ReviewProductSection from "../../components/Product/ReviewProductSection"; 
import ProductRecommendedSection from "../../components/Product/ProductRecommendedSection";
import ProductSuggestedSection from "../../components/Product/ProductSuggestedSection";
import ProductLayout from "../../layouts/_ProductLayout";

/* ===== API ===== */
import authApi from "../../api/auth.api";

// Cấu hình SweetAlert2
const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  },
});

const ProductDetailPage = () => {
  /* ================= ROUTER ================= */
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

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
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isBuyNowProcessing, setIsBuyNowProcessing] = useState<boolean>(false); // Thêm state riêng cho Mua ngay

  const leftRef = useRef<HTMLDivElement>(null);
  const [leftHeight, setLeftHeight] = useState<number>();

  /* ================= 0. LẤY USER_ID ================= */
  useEffect(() => {
    const fetchCurrentUserId = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          setCurrentUserId("guest");
          return;
        }
        const cachedUser = localStorage.getItem("user_info");
        if (cachedUser) {
           const userData = JSON.parse(cachedUser);
           if(userData?.id) {
               setCurrentUserId(userData.id);
               return;
           }
        }
        const meRes = await authApi.me();
        if (meRes.data?.data?.id) {
setCurrentUserId(meRes.data.data.id);
          localStorage.setItem("user_info", JSON.stringify(meRes.data.data));
        } else {
          setCurrentUserId("guest");
        }
      } catch (error) {
        setCurrentUserId("guest");
      }
    };
    fetchCurrentUserId();
  }, []);

  /* ================= 1. FETCH PRODUCT INFO ================= */
  useEffect(() => {
    if (!slug) {
      setError("Không tìm thấy mã sản phẩm");
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
          const defaultVariant = data.detail || (data.product_details && data.product_details[0]);
          setSelectedDetail(defaultVariant);
          setReviews(data.reviews || []);
          
          if (data.images && data.images.length > 0) {
              const firstImg = data.images.find((img: any) => img.is_primary) || data.images[0];
              setMainImage(firstImg.image_url);
              setActiveImageId(firstImg.id);
          } else {
              setMainImage("/img/no-image.png");
          }
        } else {
          setError(res.data.message || "Lỗi tải sản phẩm");
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Lỗi hệ thống");
        setLoading(false);
      });
  }, [slug]);

  /* ================= 2. FETCH MORE DATA ================= */
  useEffect(() => {
    if (product?.id) {
       const desc = product.description || "";
       if (desc.trim().startsWith("http")) {
            axios.get(`http://127.0.0.1:8000/api/product-details/${product.id}/description-content`)
                .then(res => {
                    if (res.data.status) {
                        setProduct((prev: any) => ({ ...prev, description: res.data.data.content }));
                    }
                })
                .catch(console.error);
       }
       
       axios.get(`http://127.0.0.1:8000/api/product-details/${product.id}/images`)
        .then((res) => {
            if (res.data.status && res.data.data.length > 0) {
                setProductImages(res.data.data);
                if (!mainImage || mainImage === "/img/no-image.png") {
                    setMainImage(res.data.data[0].image_url);
                    setActiveImageId(res.data.data[0].id);
                }
            }
        })
        .catch(console.error);
    }
  }, [product?.id]);

  /* ================= SYNC HEIGHT ================= */
  useEffect(() => {
    if (leftRef.current) setLeftHeight(leftRef.current.offsetHeight);
  }, [mainImage, product, selectedDetail, productImages]);

  /* ================= THÊM VÀO GIỎ HÀNG (Chỉ thêm vào giỏ) ================= */
const handleAddToCart = async () => {
    // 1. Validation
    if (!currentUserId || currentUserId === "guest") {
      Swal.fire({
        icon: 'warning',
        title: 'Vui lòng đăng nhập',
        text: 'Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng',
        confirmButtonText: 'Đăng nhập ngay',
        showCancelButton: true,
        cancelButtonText: 'Hủy'
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/dang-nhap");
        }
      });
      return;
    }
    
    if (!product || !selectedDetail) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Vui lòng chọn loại sản phẩm',
        timer: 2000
      });
      return;
    }

    if (isProcessing) return;
    setIsProcessing(true);

    // OPTIMISTIC UI: Cập nhật ngay lập tức
    window.dispatchEvent(new Event('cart-updated'));
    
    Toast.fire({
      icon: 'success',
      title: `Đang thêm ${quantity} "${product.name}" vào giỏ hàng...`
    });

    const payload = {
        user_id: currentUserId,
        product_id: product.id,
        product_details_id: selectedDetail.id,
        quantity: quantity,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await axios.post(
        "http://127.0.0.1:8000/api/shopping-carts/add",
        payload,
        { 
          headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` },
          signal: controller.signal 
        }
      );
      
      clearTimeout(timeoutId);

      if (response.data.success) {
          window.dispatchEvent(new Event('cartUpdated'));
        
        Toast.fire({
          icon: 'success',
          title: `Đã thêm ${quantity} sản phẩm vào giỏ hàng!`
        });
        
        console.log("Thêm vào giỏ hàng thành công");
      } else {
        console.error("Lỗi server:", response.data.message);
        
        Swal.fire({
          icon: 'warning',
          title: 'Có lỗi xảy ra',
          text: response.data.message,
          timer: 3000
        });
      }
    } catch (error: any) {
      console.error("Lỗi mạng:", error);
      
      if (error.code === 'ECONNABORTED' || error.name === 'AbortError') {
        Toast.fire({
          icon: 'warning',
          title: 'Yêu cầu hết thời gian chờ',
          text: 'Vẫn đã thêm vào giỏ hàng tạm thời'
        });
      } 
      else if (error.response?.status === 401) {
        Swal.fire({
          icon: 'error',
          title: 'Phiên đăng nhập hết hạn',
          text: 'Vui lòng đăng nhập lại',
          confirmButtonText: 'Đăng nhập'
        }).then(() => {
          localStorage.removeItem("access_token");
          localStorage.removeItem("user_info");
          navigate("/dang-nhap");
        });
      } 
      else {
const errorMsg = error.response?.data?.message || 'Lỗi kết nối';
        Toast.fire({
          icon: 'error',
          title: 'Không thể thêm vào giỏ hàng',
          text: errorMsg
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  /* ================= MUA NGAY (Thêm vào giỏ hàng + Đi đến thanh toán) ================= */
  const handleBuyNow = async () => {
    // 1. Validation
    if (!currentUserId || currentUserId === "guest") {
      Swal.fire({
        icon: 'warning',
        title: 'Vui lòng đăng nhập',
        text: 'Bạn cần đăng nhập để mua hàng',
        confirmButtonText: 'Đăng nhập ngay',
        showCancelButton: true,
        cancelButtonText: 'Hủy'
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/dang-nhap");
        }
      });
      return;
    }
    
    if (!product || !selectedDetail) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Vui lòng chọn loại sản phẩm',
        timer: 2000
      });
      return;
    }

    // 2. Ngăn chặn click nhiều lần
    if (isBuyNowProcessing) return;
    setIsBuyNowProcessing(true);

    // 3. Hiển thị loading
    Swal.fire({
      title: 'Đang xử lý...',
      text: 'Vui lòng đợi trong giây lát',
      allowOutsideClick: false,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      // 4. Gọi API thêm vào giỏ hàng
      const payload = {
        user_id: currentUserId,
        product_id: product.id,
        product_details_id: selectedDetail.id,
        quantity: quantity,
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await axios.post(
        "http://127.0.0.1:8000/api/shopping-carts/add",
        payload,
        { 
          headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` },
          signal: controller.signal 
        }
      );

      clearTimeout(timeoutId);

      // 5. Kiểm tra kết quả
      if (response.data.success) {
        // Cập nhật badge giỏ hàng
        window.dispatchEvent(new Event('cart-updated'));
        
        // Đóng loading
        Swal.close();
        
        // Hiển thị thông báo thành công
        Toast.fire({
          icon: 'success',
          title: `Đã thêm ${quantity} sản phẩm vào giỏ hàng!`
        });
        
        // Delay 500ms để user thấy thông báo, sau đó điều hướng
        setTimeout(() => {
          navigate(`/thanh-toan/${currentUserId}?checkoutType=buy_now`);
        }, 500);
        
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Không thể mua hàng',
          text: response.data.message || 'Có lỗi xảy ra khi thêm vào giỏ hàng',
          confirmButtonText: 'OK'
        });
      }
    } catch (error: any) {
      console.error("Lỗi mua ngay:", error);
let errorMessage = 'Lỗi hệ thống, vui lòng thử lại sau';
      
      if (error.code === 'ECONNABORTED' || error.name === 'AbortError') {
        errorMessage = 'Yêu cầu hết thời gian chờ, vui lòng thử lại';
      } 
      else if (error.response?.status === 401) {
        errorMessage = 'Phiên đăng nhập hết hạn, vui lòng đăng nhập lại';
        
        Swal.fire({
          icon: 'error',
          title: 'Phiên đăng nhập hết hạn',
          text: 'Vui lòng đăng nhập lại',
          confirmButtonText: 'Đăng nhập'
        }).then(() => {
          localStorage.removeItem("access_token");
          localStorage.removeItem("user_info");
          navigate("/dang-nhap");
        });
        return;
      } 
      else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      Swal.fire({
        icon: 'error',
        title: 'Không thể mua hàng',
        text: errorMessage,
        confirmButtonText: 'OK'
      });
    } finally {
      setIsBuyNowProcessing(false);
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
          <button className="btn btn-primary" onClick={() => navigate("/")}>Về trang chủ</button>
        </div>
      </ProductLayout>
    );
  }

  // Logic tính toán hiển thị sao
  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + Number(r.rating), 0) / reviews.length).toFixed(1) : "0.0";
  const ratingData = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => Number(r.rating) === star).length;
    return { stars: star, percent: reviews.length ? (count / reviews.length) * 100 : 0 };
  });

  const displayImages = productImages.length > 0 ? productImages : product.images;

  return (
    <ProductLayout>
      <div className="container my-4 product-detail-page">
        <Helmet>
          <title>{product.name} - Celeste Books</title>
          <meta name="description" content={`Chi tiết sản phẩm ${product.name}`} />
        </Helmet>

        <Breadcrumbs className="mb-4">
          <Link underline="hover" color="inherit" href="/">Trang chủ</Link>
          <Link underline="hover" color="inherit" href="/tim-sach">Tìm kiếm</Link>
          <Typography color="text.primary">{product.name}</Typography>
        </Breadcrumbs>

        <div className="row g-4 align-items-start">
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
                  visibleCount={5} 
                />
                <div className="d-flex gap-2 mt-3">
                  <button 
                    className="btn-add-cart" 
                    onClick={handleAddToCart}
                    disabled={!currentUserId || currentUserId === "guest" || isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-cart-plus me-1" /> 
                        {!currentUserId || currentUserId === "guest" ? "Đăng nhập để mua" : "Thêm vào giỏ hàng"}
                      </>
                    )}
                  </button>
                  <button 
                    className="btn-buy-now" 
                    onClick={handleBuyNow}
                    disabled={!currentUserId || currentUserId === "guest" || isBuyNowProcessing}
                  >
                    {isBuyNowProcessing ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-bag-check me-1" /> Mua ngay
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

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

        {/* ===== PHẦN REVIEW ===== */}
        <h5 className="title-section mt-5">Đánh giá sản phẩm</h5>
        <div className="card shadow-sm mb-4">
            <div className="card-body">
                <div className="row">
{/* Cột trái: Thống kê sao */}
                    <div className="col-12 col-md-4 border-end">
                        <div className="text-center mb-3">
                            <h2 className="fw-bold mb-1">{avgRating} <small className="text-muted">/5</small></h2>
                            <p className="text-muted mb-0">{reviews.length} đánh giá</p>
                        </div>
                        {ratingData.map((r) => (
                            <div key={r.stars} className="d-flex align-items-center gap-2 mb-2">
                                <span style={{ width: 60 }}>{r.stars} sao</span>
                                <div className="progress flex-grow-1" style={{ height: 8 }}>
                                    <div className="progress-bar bg-warning" style={{ width: `${r.percent}%` }} />
                                </div>
                                <span className="text-muted">{Math.round(r.percent)}%</span>
                            </div>
                        ))}
                    </div>
                    {/* Cột phải: Danh sách review */}
                    <div className="col-12 col-md-8 ps-md-4">
                        <ReviewProductSection reviews={reviews} />
                    </div>
                </div>
            </div>
        </div>
        {/* ================================================= */}
        
        <ProductSuggestedSection title="Sản phẩm liên quan" productId={product.id} itemsPerLoad={6} colMd={2} />
        <ProductRecommendedSection title="Sản phẩm giới thiệu" itemsPerLoad={6} colMd={2} />
      </div>
    </ProductLayout>
  );
};

export default ProductDetailPage;
