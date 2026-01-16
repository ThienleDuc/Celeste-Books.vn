// ./Product/product.model.ts
export interface Product {
  id: number;

  name: string;
  slug: string;
  description: string | null;

  author: string | null;
  publisher: string | null;
  publicationYear: number | null;
  language: string | null;

  status: boolean;
  views: number;

  createdAt: string;
}

/* =======================
   PRODUCT DETAILS TABLE
   ======================= */
export type ProductType = "Sách giấy" | "Sách điện tử";

export interface ProductDetail {
  id: number;
  productId: number;

  productType: ProductType;
  sku: string;

  originalPrice: number;
  salePrice: number;
  stock: number;

  // ebook
  fileUrl: string | null;

  // physical
  weight: number | null;
  length: number | null;
  width: number | null;
  height: number | null;

  createdAt: string;
}

/* =======================
   PRODUCT IMAGES TABLE
   ======================= */
export interface ProductImage {
  id: number;
  productId: number;

  imageUrl: string;
  isPrimary: boolean;
  sortOrder: number;

  createdAt: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface ProductCategory {
  productId: number;
  categoryId: number;
}

/* =======================
   FRONTEND COMPOSE MODEL
   ======================= */
export interface ProductFull {
  product: Product;
  details: ProductDetail[];
  images: ProductImage[];
  categories: Category[];
}

/* =========================================================
   DEMO DATA
   ========================================================= */
export const categories: Category[] = [
  { id: 1, name: "Văn học", slug: "van-hoc" },
  { id: 2, name: "Kỹ năng sống", slug: "ky-nang-song" },
  { id: 3, name: "Giáo dục", slug: "giao-duc" },
  { id: 4, name: "Tiểu thuyết", slug: "tieu-thuyet" },
  { id: 5, name: "Truyện tranh", slug: "truyen-tranh" },
];

const names = [
  "Chúa tể bóng tối",
  "Hôn Nhân Hạnh Phúc Của Tôi",
  "Thiên Sứ Nhà Bên",
  "Nếu Biết Trăm Năm Là Hữu Hạn",
  "Mưa Đỏ",
];

/* ---------- IMAGE SOURCE (book1 → book10) ---------- */
const imageList = Array.from(
  { length: 10 },
  (_, i) => `/img/book${i + 1}.jpg`
);

/* ---------- HELPER ---------- */
const shuffleArray = <T>(arr: T[]): T[] =>
  [...arr].sort(() => Math.random() - 0.5);


/* =========================================================
   SAMPLE PRODUCTS
   ========================================================= */
export const sampleProducts: ProductFull[] = Array.from({ length: 11 }, (_, i) => {
  const productId = i + 1;
  const name = names[i % names.length];
  const createdAt = `2025-01-${((i % 28) + 1).toString().padStart(2, "0")}`;

  const loremSentences = [
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    "Curabitur pretium tincidunt lacus. Nulla gravida orci a odio.",
    "Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris.",
    "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    "Curabitur pretium tincidunt lacus. Nulla gravida orci a odio.",
    "Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris."
  ];

  // Hàm lấy 1-3 câu ngẫu nhiên
  const getRandomDescription = () => {
    const count = Math.floor(Math.random() * 10) + 5; 
    return shuffleArray(loremSentences).slice(0, count).join(" ");
  };

  const pickRandomCategories = () => {
    const available = categories.filter(c => c.slug !== "all");
    const count = Math.floor(Math.random() * 3) + 1;
    return shuffleArray(available).slice(0, count);
  };

  const productCategories = pickRandomCategories();

  /* ---------- PRODUCT ---------- */
  const product: Product = {
    id: productId,
    name,
    slug: name.toLowerCase().replace(/ /g, "-"),
    description: getRandomDescription(),
    author: "Tác giả A",
    publisher: "NXB Trẻ",
    publicationYear: 2020 + (i % 5),
    language: "Tiếng Việt",
    status: true,
    views: Math.floor(Math.random() * 1000),
    createdAt,
  };

  /* ---------- Decide types ---------- */
  const types: ProductType[] = [];
    const rand = Math.random();
    if (rand < 0.33) types.push("Sách giấy");
    else if (rand < 0.66) types.push("Sách điện tử");
    else types.push("Sách giấy", "Sách điện tử");

    const details: ProductDetail[] = types.map((type, idx) => {
      const originalPrice = 150000 + (i % 50) * 1000;
      const salePrice = Math.floor(originalPrice * 0.8);

      return {
        id: productId * 10 + (idx + 1),
        productId,
        productType: type,
        sku: `BOOK-${productId}-${type === "Sách giấy" ? "P" : "E"}`,
        originalPrice,
        salePrice,
        stock: type === "Sách giấy" ? 100 - (i % 30) : 9999,
        fileUrl: type === "Sách điện tử" ? `/ebooks/book${i + 1}.pdf` : null,
        weight: type === "Sách giấy" ? 0.5 : null,
        length: 20, // số trang
        width: type === "Sách giấy" ? 14 : null,
        height: type === "Sách giấy" ? 3 : null,
        createdAt,
      } as ProductDetail;
    });

  /* ---------- PRODUCT IMAGES ---------- */
  const primaryImage = imageList[i % 10];
  const secondaryImages = shuffleArray(imageList.filter(img => img !== primaryImage)).slice(0, 7);
  const images: ProductImage[] = [
    {
      id: productId * 100,
      productId,
      imageUrl: primaryImage,
      isPrimary: true,
      sortOrder: 0,
      createdAt,
    },
    ...secondaryImages.map((url, idx) => ({
      id: productId * 100 + idx + 1,
      productId,
      imageUrl: url,
      isPrimary: false,
      sortOrder: idx + 1,
      createdAt,
    })),
  ];

  
  return { product, details, images, categories: productCategories, };
});
