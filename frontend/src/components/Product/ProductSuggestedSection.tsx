import React, { useCallback } from 'react';
import { useParams } from "react-router-dom";
import ProductLoadMoreSection from './ProductLoadMoreSection';
import productsApi, { type Product } from '../../api/produts.api';

interface ProductSuggestedSectionProps {
  productId?: number;
  title?: string;
  itemsPerLoad?: number;
  colMd?: number;
  colLg?: number;
  showHeader?: boolean;
  showLoadMoreButton?: boolean;
}

const ProductSuggestedSection: React.FC<ProductSuggestedSectionProps> = ({
  productId: propProductId,
  title = "Sản phẩm liên quan",
  itemsPerLoad = 6,
  colMd = 2,
  colLg = 2,
  showHeader = true,
  showLoadMoreButton = true,
}) => {
  const { id: urlId } = useParams<{ id: string }>();
  
  // Ưu tiên productId từ props, nếu không có thì lấy từ URL
  const productId = propProductId || Number(urlId);

  // Hàm fetch sản phẩm gợi ý tương thích với ProductLoadMoreSection
  const fetchSuggestedProducts = useCallback(async ({ offset }: { limit: number; offset: number }): Promise<Product[]> => {
    if (!productId) return [];
    
    try {
      // Gọi API với limit và offset
      const response = await productsApi.suggest(productId, { 
        limit: 6, 
        offset 
      });
      
      if (response.data.status && response.data.data) {
        return response.data.data.products || [];
      }
      
      return [];
    } catch (error) {
      console.error("Lỗi khi tải sản phẩm gợi ý:", error);
      return [];
    }
  }, [productId]);

  // Nếu không có productId, không render component
  if (!productId) return null;

  return (
    <ProductLoadMoreSection
      title={title}
      fetchFunction={fetchSuggestedProducts}
      itemsPerLoad={itemsPerLoad}
      showHeader={showHeader}
      showLoadMoreButton={showLoadMoreButton}
      colMd={colMd}
      colLg={colLg}
      showEmptyMessage={false}
    />
  );
};

export default ProductSuggestedSection;