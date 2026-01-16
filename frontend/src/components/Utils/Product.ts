// src/components/Utils/Product.ts

export interface ProductData {
  id: number;
  name: string;
  slug: string;
  description: string;
  author: string;
  publisher?: string;
  publication_year?: number;
  price: number; // Lưu dạng số để dễ tính toán
  original_price?: number;
  rating?: number;
  image?: string;
}

// Dữ liệu chuẩn hóa (Đã gộp thông tin và thêm giá tiền)
export const products: ProductData[] = [
  {
    id: 1,
    name: "Nhà Giả Kim",
    slug: "nha-gia-kim",
    description: "Hành trình theo đuổi ước mơ đầy cảm hứng của chàng chăn cừu Santiago.",
    author: "Paulo Coelho",
    publisher: "NXB Văn Học",
    publication_year: 2020,
    price: 79000, 
    original_price: 85000,
    rating: 5,
    image: "..." 
  },
  {
    id: 2,
    name: "Đắc Nhân Tâm",
    slug: "dac-nhan-tam",
    description: "Nghệ thuật thu phục lòng người, cuốn sách kỹ năng sống bán chạy nhất mọi thời đại.",
    author: "Dale Carnegie",
    publisher: "NXB Tổng Hợp",
    publication_year: 2021,
    price: 86000,
    rating: 5
  },
  {
    id: 3,
    name: "Clean Code",
    slug: "clean-code",
    description: "Mã sạch và con đường trở thành nghệ nhân phần mềm.",
    author: "Robert C. Martin",
    publisher: "NXB Xây Dựng",
    publication_year: 2019,
    price: 350000,
    rating: 5
  },
  {
    id: 4,
    name: "Mắt Biếc",
    slug: "mat-biec",
    description: "Chuyện tình thanh xuân buồn man mác của Ngạn và Hà Lan.",
    author: "Nguyễn Nhật Ánh",
    publisher: "NXB Trẻ",
    publication_year: 2018,
    price: 110000,
    rating: 5
  },
  {
    id: 5,
    name: "Doraemon Tập 1",
    slug: "doraemon-1",
    description: "Chú mèo máy đến từ tương lai và những bảo bối thần kỳ.",
    author: "Fujiko F. Fujio",
    publisher: "NXB Kim Đồng",
    publication_year: 2022,
    price: 25000,
    rating: 5
  },
  {
    id: 6,
    name: "Nguyên Lý Marketing",
    slug: "marketing-principles",
    description: "Sách gối đầu giường dân Marketer, kiến thức nền tảng quan trọng.",
    author: "Philip Kotler",
    publisher: "NXB Lao Động",
    publication_year: 2020,
    price: 450000,
    rating: 5
  },
  {
    id: 7,
    name: "Steve Jobs",
    slug: "steve-jobs",
    description: "Tiểu sử chính thức về người sáng lập Apple, thiên tài công nghệ.",
    author: "Walter Isaacson",
    publisher: "NXB Trẻ",
    publication_year: 2017,
    price: 290000,
    rating: 5
  },
  {
    id: 8,
    name: "Rừng Na Uy",
    slug: "rung-na-uy",
    description: "Kiệt tác của Murakami về tình yêu, mất mát và tuổi trẻ.",
    author: "Haruki Murakami",
    publisher: "NXB Hội Nhà Văn",
    publication_year: 2016,
    price: 155000,
    rating: 5
  },
  {
    id: 9,
    name: "Tuổi Trẻ Đáng Giá Bao Nhiêu",
    slug: "tuoi-tre-dang-gia",
    description: "Cuốn sách kỹ năng, truyền cảm hứng sống đẹp cho giới trẻ.",
    author: "Rosie Nguyễn",
    publisher: "NXB Nhã Nam",
    publication_year: 2018,
    price: 89000,
    rating: 5
  },
  {
    id: 10,
    name: "One Piece Tập 100",
    slug: "one-piece-100",
    description: "Đảo hải tặc tập đặc biệt, hành trình của Luffy Mũ Rơm.",
    author: "Eiichiro Oda",
    publisher: "NXB Kim Đồng",
    publication_year: 2023,
    price: 25000,
    rating: 5
  }
];