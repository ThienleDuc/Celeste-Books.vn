export interface LoaiToa {
  maLoaiToa: string;
  tenLoaiToa: string;
  moTa: string;
  heSo: number;
}

export const dataLoaiToa: LoaiToa[] = [
  { maLoaiToa: "T01", tenLoaiToa: "Toa khách thường", moTa: "Toa chở khách thông thường", heSo: 1.0 },
  { maLoaiToa: "T02", tenLoaiToa: "Toa VIP", moTa: "Toa khách VIP", heSo: 2.0 },
  { maLoaiToa: "T03", tenLoaiToa: "Toa nằm", moTa: "Toa khách nằm", heSo: 1.5 },
  { maLoaiToa: "T04", tenLoaiToa: "Toa giường nằm", moTa: "Toa giường nằm cao cấp", heSo: 2.2 },
  { maLoaiToa: "T05", tenLoaiToa: "Toa hàng", moTa: "Toa chở hàng hóa", heSo: 1.8 },
  { maLoaiToa: "T06", tenLoaiToa: "Toa xe máy", moTa: "Toa vận chuyển xe máy", heSo: 1.3 },
  { maLoaiToa: "T07", tenLoaiToa: "Toa xe hơi", moTa: "Toa vận chuyển ô tô", heSo: 2.5 },
  { maLoaiToa: "T08", tenLoaiToa: "Toa du lịch", moTa: "Toa tham quan du lịch", heSo: 1.2 },
  { maLoaiToa: "T09", tenLoaiToa: "Toa Express", moTa: "Toa tốc độ cao Express", heSo: 2.7 },
  { maLoaiToa: "T10", tenLoaiToa: "Toa tiết kiệm", moTa: "Toa giá rẻ tiết kiệm", heSo: 0.9 },
];
