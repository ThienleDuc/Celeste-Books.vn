import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import ProductGridSection from "../../components/Product/ProductGridSection";
import ProductCarousel from "../../components/Product/ProductCarousel";
import productsApi, { type Product } from "../../api/produts.api";
import PurchaseHistorySidebar from "../../components/Product/PurchaseHistorySidebar";
import TopSellingSidebar from "../../components/Product/TopSellingSidebar";

const ProductPage = () => {  
  // State cho product grid
  const [products, setProducts] = useState<Product[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Fetch sản phẩm
  const fetchProducts = async (page: number) => {
    setLoading(true);
    try {
      const response = await productsApi.getList({
        page,
        per_page: 16,
        sort_by: 'created_at',
        sort_order: 'desc'
      });
      
      if (response.data.status) {
        setProducts(response.data.data.data);
        setTotalItems(response.data.data.total);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage]);

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

        <ProductCarousel showRank={true} />

        {/* Lưới sản phẩm và sidebar bán chạy */}
        <div className="row g-3">
          <h5 className="mb-3 title-section">Celeste Books - Tất cả</h5>

          {/* Cột 1: chiếm 9/12 */}
          <div className="col-12 col-lg-9">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Đang tải...</span>
                </div>
                <p className="mt-2 text-muted">Đang tải sản phẩm...</p>
              </div>
            ) : (
              <ProductGridSection
                itemsPerPage={16}
                externalProducts={products}
                externalTotalItems={totalItems}
                externalCurrentPage={currentPage}
                onPageChangeExternal={setCurrentPage}
                showRank={false}
                colMd={3}
              />
            )}
          </div>

          {/* Cột 2: chiếm 3/12 */}
          <div className="col-12 col-lg-3">
            <div className="d-flex flex-column gap-3">
              {/* =========== */}
              {/* Lịch sử mua */}
              {/* =========== */}
              <PurchaseHistorySidebar
              />

              {/* ===================== */}
              {/* Sách bán chạy         */}
              {/* ===================== */}
              <TopSellingSidebar/>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductPage;