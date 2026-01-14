import React, { useCallback, memo } from 'react';
import ProductLoadMoreSection from './ProductLoadMoreSection';
import productsApi, { type Product } from '../../api/produts.api';

interface ProductRecommendedSectionProps {
  productId?: number;
  title?: string;
  itemsPerLoad?: number;
  colMd?: number;
  colLg?: number;
  showHeader?: boolean;
  showLoadMoreButton?: boolean;
}

const ProductRecommendedSection: React.FC<ProductRecommendedSectionProps> = ({
  title = "Sản phẩm đề xuất",
  itemsPerLoad = 12,
  colMd = 2,
  colLg = 2,
  showHeader = true,
  showLoadMoreButton = true,
  // productId // Nếu sau này API cần productId để gợi ý chính xác hơn, hãy thêm vào dependency
}) => {
  
  // Sử dụng useCallback để giữ reference của hàm không đổi giữa các lần render
  // Giúp ProductLoadMoreSection không bị re-render hoặc reset state ngoài ý muốn
  const fetchRecommendedProducts = useCallback(async ({ 
    offset 
  }: { 
    limit: number; 
    offset: number 
  }): Promise<Product[]> => {
    try {
      const response = await productsApi.featured({ 
        limit: 12, 
        offset 
      });
      
      if (response.data.status && response.data.data) {
        return response.data.data.products || [];
      }
      
      return [];
    } catch (error) {
      console.error("Lỗi khi tải sản phẩm đề xuất:", error);
      return [];
    }
  }, []); // Dependency array rỗng vì API featured hiện tại không phụ thuộc biến ngoài

  return (
    <ProductLoadMoreSection
      title={title}
      fetchFunction={fetchRecommendedProducts}
      itemsPerLoad={itemsPerLoad}
      colMd={colMd}
      colLg={colLg}
      showHeader={showHeader}
      showLoadMoreButton={showLoadMoreButton}
    />
  );
};

// Tối ưu: Ngăn re-render nếu props từ cha không đổi
// Rất quan trọng vì mục này thường nằm cuối trang, dễ bị ảnh hưởng bởi các state phía trên
export default memo(ProductRecommendedSection);