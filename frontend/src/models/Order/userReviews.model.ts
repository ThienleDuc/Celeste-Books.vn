import { sampleProducts } from "../Product/product.model";

/* =======================
   USER REVIEW MODEL
   ======================= */
export interface UserReview {
  id: number;
  avatar: string;
  name: string;
  date: string;
  productId: number;
  rating: number;
  title: string;
  content: string;
  images: string[];
}

/* =======================
   MOCK SOURCE
   ======================= */
const userNames = [
  "Người dùng A", "Người dùng B", "Người dùng C", "Người dùng D", "Người dùng E",
  "Người dùng F", "Người dùng G", "Người dùng H", "Người dùng I", "Người dùng J",
];

const reviewTitles = [
  "Rất hài lòng!",
  "Tốt nhưng chưa hoàn hảo",
  "Chất lượng tuyệt vời", 
  "Không như mong đợi",
  "Sẽ mua lại",
  "Thiếu sót nhỏ",
  "Giao hàng nhanh chóng",
  "Sản phẩm đẹp",
  "Đáng tiền",
  "Cần cải thiện",
];

const reviewContents = [
  "Sản phẩm chất lượng, giao hàng nhanh, đóng gói cẩn thận.",
  "Màu sắc hơi khác so với hình, nhưng tổng thể tốt.",
  "Rất thích, sẽ giới thiệu cho bạn bè.",
  "Sản phẩm tốt nhưng chưa đáp ứng hết nhu cầu.",
  "Giao hàng nhanh, chất lượng ổn.",
  "Hài lòng với dịch vụ và sản phẩm.",
  "Sản phẩm đẹp, giá hợp lý.",
  "Chưa hài lòng lắm, cần cải thiện chất lượng.",
  "Sẽ mua lại nếu có chương trình khuyến mãi.",
  "Tốt, nhưng đóng gói chưa chắc chắn.",
];

const reviewImagePool = Array.from({ length: 10 }, (_, i) => `/img/book${i + 1}.jpg`);

/* =======================
   HELPER
   ======================= */
const shuffleArray = <T>(arr: T[]): T[] =>
  [...arr].sort(() => Math.random() - 0.5);

/* =======================
   SAMPLE REVIEWS (50)
   ======================= */
export const sampleUserReviews: UserReview[] = Array.from({ length: 50 }, (_, i) => {
  const productFull = sampleProducts[i % sampleProducts.length];

  // Lấy ngẫu nhiên 0–3 ảnh, không trùng
  const imagesCount = Math.floor(Math.random() * 4);
  const images = shuffleArray(reviewImagePool).slice(0, imagesCount);

  const day = ((i % 28) + 1).toString().padStart(2, "0");

  return {
    id: i + 1,
    avatar: `https://i.pravatar.cc/50?img=${(i * 3) % 70 + 1}`,
    name: userNames[i % userNames.length],
    date: `2025-12-${day}`,
    productId: productFull.product.id,
    rating: Math.floor(Math.random() * 5) + 1,
    title: reviewTitles[i % reviewTitles.length],
    content: reviewContents[i % reviewContents.length],
    images,
  };
});

/* ===================== PRODUCT REVIEW STATS ===================== */
export interface ProductReviewStats {
  productId: number;
  averageRating: number; // số sao trung bình (có 1 chữ số thập phân)
  roundedRating: number; // số sao nguyên (làm tròn)
  reviewCount: number;   // số lượng review
}

/**
 * Tính thống kê review cho tất cả sản phẩm
 */
export const getAllProductReviewStats = (): ProductReviewStats[] => {
  const statsMap: Record<number, { total: number; count: number }> = {};

  sampleUserReviews.forEach((review) => {
    const pid = review.productId;
    if (!statsMap[pid]) statsMap[pid] = { total: 0, count: 0 };
    statsMap[pid].total += review.rating;
    statsMap[pid].count += 1;
  });

  return Object.entries(statsMap).map(([productId, { total, count }]) => {
    const averageRating = count > 0 ? parseFloat((total / count).toFixed(1)) : 0;
    return {
      productId: Number(productId),
      averageRating,
      roundedRating: Math.round(averageRating),
      reviewCount: count,
    };
  });
};

/**
 * Lấy thống kê review cho một sản phẩm cụ thể
 */
export const getProductReviewStatsById = (productId: number): ProductReviewStats => {
  const reviews = sampleUserReviews.filter(r => r.productId === productId);
  const count = reviews.length;
  const total = reviews.reduce((sum, r) => sum + r.rating, 0);
  const averageRating = count > 0 ? parseFloat((total / count).toFixed(1)) : 0;

  return {
    productId,
    averageRating,
    roundedRating: Math.round(averageRating),
    reviewCount: count,
  };
};
