import { sampleProducts, type ProductFull } from "./product.model";

/* ================== INTERFACE ================== */
export interface TopRecommendedItem {
  id: number;
  name: string;
  slug: string;

  originalPrice: number;
  salePrice: number;
  discountPercent: number;

  image: string; // ảnh chính

  // frontend-only (demo / thống kê)
  views: number;
  rating: number;
}

/* ================== DATA ================== */
export const TopRecommendedItems: TopRecommendedItem[] = sampleProducts
  .map((p: ProductFull) => {
    const detail = p.details[0]; // lấy biến thể chính

    if (!detail) return null;

    // Ảnh chính
    const mainImage =
      p.images.find(img => img.isPrimary)?.imageUrl ||
      p.images[0]?.imageUrl ||
      "/img/no-image.png";

    // % giảm giá
    const discountPercent =
      detail.originalPrice > detail.salePrice
        ? Math.round(
            ((detail.originalPrice - detail.salePrice) /
              detail.originalPrice) *
              100
          )
        : 0;

    return {
      id: p.product.id,
      name: p.product.name,
      slug: p.product.slug,

      originalPrice: detail.originalPrice,
      salePrice: detail.salePrice,
      discountPercent,

      image: mainImage,

      views: p.product.views,
      rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // demo rating 3.0 → 5.0
    };
  })
  .filter((item): item is TopRecommendedItem => item !== null) // loại null
  .sort((a, b) => b.rating - a.rating)
  .slice(0, 10);
