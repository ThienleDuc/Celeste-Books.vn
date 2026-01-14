import { Helmet } from "react-helmet";
import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Breadcrumbs, Typography, Link, CircularProgress, Alert } from "@mui/material";
import axios from "axios"; 

// Import Model (Bỏ import sampleProducts vì không dùng nữa)
import { type ProductFull } from "../../models/Product/product.model";

// Import Components
import ProductRightSection from "../../components/Product/ProductRightDetailSection";
import ThumbnailCarousel from "../../components/Utils/ThumbnailCarousel";

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  
  // --- 1. STATE QUẢN LÝ DỮ LIỆU THẬT ---
  const [productData, setProductData] = useState<ProductFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State quản lý ảnh chính (cần set lại khi có dữ liệu)
  const [mainImage, setMainImage] = useState<string>("");
  const [isAdding, setIsAdding] = useState(false);

  // --- 2. GỌI API LẤY CHI TIẾT SẢN PHẨM ---
  // --- 2. GỌI API & MAP DỮ LIỆU ---
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        // Gọi API Backend
        const response = await axios.get(`http://127.0.0.1:8000/api/products/${id}`);
        
        // Log dữ liệu gốc để kiểm tra
        console.log("Dữ liệu gốc từ Backend:", response.data);

        if (response.data.success || response.data.data) {
            const rawData = response.data.data || response.data;

            // [QUAN TRỌNG] MAP DỮ LIỆU TỪ SNAKE_CASE (BE) SANG CAMELCASE (FE)
            // Nếu không map, các biến như product.salePrice sẽ bị undefined
            const mappedData: ProductFull = {
                product: {
                    id: rawData.id,
                    name: rawData.name,
                    slug: rawData.slug,
                    description: rawData.description,
                    author: rawData.author,
                    publisher: rawData.publisher,
                    publicationYear: rawData.publication_year, // map: publication_year -> publicationYear
                    language: rawData.language,
                    status: rawData.status === 1,
                    views: rawData.views,
                    createdAt: rawData.created_at,
                },
                // Backend trả về 'detail' (object), FE cần 'details' (array)
                details: rawData.detail ? [{
                    id: rawData.detail.id,
                    productId: rawData.id,
                    productType: rawData.detail.product_type, // map: product_type -> productType
                    sku: rawData.detail.sku,
                    originalPrice: Number(rawData.detail.original_price), // Đảm bảo là số
                    salePrice: Number(rawData.detail.sale_price),
                    stock: Number(rawData.detail.stock),
                    fileUrl: rawData.detail.file_url,
                    weight: rawData.detail.weight,
                    length: rawData.detail.length,
                    width: rawData.detail.width,
                    height: rawData.detail.height,
                    createdAt: rawData.detail.created_at
                }] : [],
                // Map mảng ảnh
                images: Array.isArray(rawData.images) ? rawData.images.map((img: any) => ({
                    id: img.id,
                    productId: img.product_id,
                    imageUrl: img.image_url, // map: image_url -> imageUrl
                    isPrimary: img.is_primary === 1,
                    sortOrder: img.sort_order,
                    createdAt: img.created_at
                })) : [],
                categories: rawData.categories || []
            };

            setProductData(mappedData);
            
            // Set ảnh chính an toàn
            const primaryImg = mappedData.images.find(img => img.isPrimary) || mappedData.images[0];
            setMainImage(primaryImg ? primaryImg.imageUrl : "/img/no-image.png");

        } else {
            setError("Không tìm thấy dữ liệu sản phẩm");
        }
      } catch (err) {
        console.error("Lỗi tải sản phẩm:", err);
        setError("Lỗi kết nối hoặc sản phẩm không tồn tại");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  const leftRef = useRef<HTMLDivElement>(null);
  const [leftHeight, setLeftHeight] = useState<number | undefined>();

  // Cập nhật chiều cao cột trái
  useEffect(() => {
    if (leftRef.current) {
      setLeftHeight(leftRef.current.offsetHeight);
    }
  }, [mainImage, productData]); // Chạy lại khi ảnh hoặc dữ liệu thay đổi

  // --- 3. XỬ LÝ THÊM VÀO GIỎ HÀNG (Dùng dữ liệu thật) ---
  const handleAddToCart = async () => {
    if (!productData) return;
    const { product, details } = productData;

    // Kiểm tra chi tiết
    if (!details || details.length === 0) {
      alert("Sản phẩm này hiện đang hết hàng hoặc chưa có thông tin chi tiết.");
      return;
    }

    const userId = "C01"; // ID người dùng giả lập (Lưu ý: Đảm bảo User này có trong DB thật)
    const defaultDetail = details[0]; // Lấy ID detail thật từ DB

    setIsAdding(true);
    try {
      const payload = {
        user_id: userId,
        product_id: product.id,
        product_details_id: defaultDetail.id, // ID NÀY GIỜ ĐÃ LÀ ID THẬT TỪ DB
        quantity: 1,
      };

      console.log("Gửi payload:", payload);
      
      const response = await axios.post("http://127.0.0.1:8000/api/shopping-carts/add", payload);

      if (response.data.success) {
        alert("Đã thêm sản phẩm vào giỏ hàng thành công!");
      } else {
        alert("Có lỗi xảy ra: " + response.data.message);
      }

    } catch (error: any) {
      console.error("Lỗi thêm giỏ hàng:", error);
      const message = error.response?.data?.message || "Lỗi kết nối đến server";
      alert(message);
    } finally {
      setIsAdding(false);
    }
  };

  // --- 4. RENDER THEO TRẠNG THÁI ---
  if (loading) {
      return (
        <div className="container my-5 text-center">
            <CircularProgress />
            <p className="mt-2">Đang tải sản phẩm...</p>
        </div>
      );
  }

  if (error || !productData) {
    return (
      <div className="container my-4">
        <Alert severity="error">{error || "Sản phẩm không tồn tại"}</Alert>
        <Link href="/" className="btn btn-outline-primary mt-3">Quay về trang chủ</Link>
      </div>
    );
  }

  // Destructure từ dữ liệu thật
  const { product, images } = productData; 

  return (
    <div className="container my-4 product-detail-page">
      <Helmet>
        <title>{product.name} - Celeste Books</title>
        <meta name="description" content={`Chi tiết sản phẩm ${product.name}`} />
      </Helmet>

      <Breadcrumbs className="mb-4">
        <Link underline="hover" color="inherit" href="/">Trang chủ</Link>
        <Typography color="text.primary">{product.name}</Typography>
      </Breadcrumbs>

      <div className="row g-4 align-items-start">
        {/* ================= LEFT ================= */}
        <div className="col-12 col-md-5">
          <div className="card product-details-card shadow-sm mb-4" ref={leftRef}>
            <div className="card-body">
              <img src={mainImage} alt={product.name} className="main-img mb-3" style={{width: '100%', objectFit: 'contain'}} />
              
              <ThumbnailCarousel
                images={images}
                mainImage={mainImage}
                setMainImage={setMainImage}
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
                <button className="btn-buy-now">
                  <i className="bi bi-bag-check me-1" /> Mua ngay
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT ================= */}
        <div className="col-12 col-md-7">
          <div
            className="card shadow-sm overflow-auto"
            style={{ height: leftHeight ? `${leftHeight}px` : "auto" }}
          >
            <div className="card-body">
              {/* Truyền dữ liệu thật vào component con */}
              <ProductRightSection productFull={productData} />
            </div>
          </div>
        </div>
      </div>

      {/* TẠM THỜI ẨN HOẶC CẦN SỬA LẠI CÁC SECTION DƯỚI ĐỂ DÙNG DỮ LIỆU THẬT */}
      {/* <ProductReviewsSection ... /> */} 
      {/* <ProductGridSection ... /> */}
    </div>
  );
};

export default ProductDetailPage;