import type { ReactNode } from "react";
import ProductHeader from "../components/Header/ProductHeader";
import Footer from "../components/Footer/Footer";
import "../assets/css/product-layout.css";
import ChatBox from "../components/Utils/ChatBox ";

interface ProductLayoutProps {
  children: ReactNode;
}

const ProductLayout = ({ children }: ProductLayoutProps) => {
  return (
    <div className="product-layout">
      {/* Header riêng cho trang sản phẩm */}
      <ProductHeader />

      {/* Main content */}
      <div className="product-content">
        <main>{children}</main>
      </div>

      {/* Chat box hỗ trợ */} 
      <ChatBox />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ProductLayout;
