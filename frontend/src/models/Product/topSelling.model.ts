export interface TopSellingItem {
  name: string;
  price: number;
  image: string;
  views: number;
  bought: number;
  rating: number;
}

/* ===== DEMO DATA ===== */
export const topSellingItemsDemo: Record<"day" | "week" | "month", TopSellingItem[]> = {
  day: [
    { name: "Chúa tể bóng tối", price: 150000, image: "/img/book1.jpg", views: 120, bought: 30, rating: 4.5 },
    { name: "Hôn Nhân Hạnh Phúc Của Tôi", price: 120000, image: "/img/book2.jpg", views: 90, bought: 25, rating: 4.0 },
    { name: "Thiên Sứ Nhà Bên", price: 110000, image: "/img/book3.jpg", views: 80, bought: 20, rating: 4.2 },
    { name: "Nếu Biết Trăm Năm Là Hữu Hạn", price: 130000, image: "/img/book4.jpg", views: 70, bought: 18, rating: 4.1 },
    { name: "Mưa Đỏ", price: 140000, image: "/img/book5.jpg", views: 60, bought: 15, rating: 4.3 },
    { name: "Dám nghĩ lớn", price: 89000, image: "/img/book6.jpg", views: 55, bought: 12, rating: 4.4 },
    { name: "Atomic Habits", price: 125000, image: "/img/book7.jpg", views: 50, bought: 10, rating: 4.5 },
    { name: "Tư duy nhanh và chậm", price: 159000, image: "/img/book8.jpg", views: 45, bought: 9, rating: 4.3 },
    { name: "Clean Code", price: 199000, image: "/img/book9.jpg", views: 40, bought: 8, rating: 4.2 },
    { name: "Nhà giả kim", price: 120000, image: "/img/book10.jpg", views: 35, bought: 7, rating: 4.1 },
  ],
  week: [
    { name: "Chúa tể bóng tối", price: 150000, image: "/img/book1.jpg", views: 600, bought: 120, rating: 4.5 },
    { name: "Hôn Nhân Hạnh Phúc Của Tôi", price: 120000, image: "/img/book2.jpg", views: 500, bought: 100, rating: 4.0 },
    { name: "Thiên Sứ Nhà Bên", price: 110000, image: "/img/book3.jpg", views: 450, bought: 90, rating: 4.2 },
    { name: "Nếu Biết Trăm Năm Là Hữu Hạn", price: 130000, image: "/img/book4.jpg", views: 400, bought: 80, rating: 4.1 },
    { name: "Mưa Đỏ", price: 140000, image: "/img/book5.jpg", views: 350, bought: 70, rating: 4.3 },
    { name: "Dám nghĩ lớn", price: 89000, image: "/img/book6.jpg", views: 300, bought: 60, rating: 4.4 },
    { name: "Atomic Habits", price: 125000, image: "/img/book7.jpg", views: 250, bought: 50, rating: 4.5 },
    { name: "Tư duy nhanh và chậm", price: 159000, image: "/img/book8.jpg", views: 200, bought: 40, rating: 4.3 },
    { name: "Clean Code", price: 199000, image: "/img/book9.jpg", views: 150, bought: 30, rating: 4.2 },
    { name: "Nhà giả kim", price: 120000, image: "/img/book10.jpg", views: 100, bought: 20, rating: 4.1 },
  ],
  month: [
    { name: "Chúa tể bóng tối", price: 150000, image: "/img/book1.jpg", views: 2400, bought: 480, rating: 4.5 },
    { name: "Hôn Nhân Hạnh Phúc Của Tôi", price: 120000, image: "/img/book2.jpg", views: 2000, bought: 400, rating: 4.0 },
    { name: "Thiên Sứ Nhà Bên", price: 110000, image: "/img/book3.jpg", views: 1800, bought: 360, rating: 4.2 },
    { name: "Nếu Biết Trăm Năm Là Hữu Hạn", price: 130000, image: "/img/book4.jpg", views: 1600, bought: 320, rating: 4.1 },
    { name: "Mưa Đỏ", price: 140000, image: "/img/book5.jpg", views: 1400, bought: 280, rating: 4.3 },
    { name: "Dám nghĩ lớn", price: 89000, image: "/img/book6.jpg", views: 1200, bought: 240, rating: 4.4 },
    { name: "Atomic Habits", price: 125000, image: "/img/book7.jpg", views: 1000, bought: 200, rating: 4.5 },
    { name: "Tư duy nhanh và chậm", price: 159000, image: "/img/book8.jpg", views: 800, bought: 160, rating: 4.3 },
    { name: "Clean Code", price: 199000, image: "/img/book9.jpg", views: 600, bought: 120, rating: 4.2 },
    { name: "Nhà giả kim", price: 120000, image: "/img/book10.jpg", views: 400, bought: 80, rating: 4.1 },
  ],
};
