export interface PurchaseHistoryItem {
  id: number;
  name: string;
  image: string;
  price: number;
  date: string;
}

/* ===== DEMO DATA ===== */
export const myPurchaseHistory: PurchaseHistoryItem[] = [
  {
    id: 1,
    name: "Dám nghĩ lớn",
    image: "/img/book1.jpg",
    price: 89000,
    date: "12/01/2025",
  },
  {
    id: 2,
    name: "Atomic Habits",
    image: "/img/book2.jpg",
    price: 125000,
    date: "05/01/2025",
  },
  {
    id: 3,
    name: "Tư duy nhanh và chậm",
    image: "/img/book3.jpg",
    price: 159000,
    date: "28/12/2024",
  },
];
