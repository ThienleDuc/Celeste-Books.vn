export interface GiaTienTheoKhoangCach {
  maHeSo: string;
  khoangCach: number;
  heSo: number;
  ghiChu?: string;
}

export const dataGiaTienTheoKhoangCach: GiaTienTheoKhoangCach[] = [
    { maHeSo: "HS01", khoangCach: 100, heSo: 1000, ghiChu: "Tuyến ngắn dưới 100 km, 1 km = 1.000 VND" },
    { maHeSo: "HS02", khoangCach: 300, heSo: 1200, ghiChu: "Tuyến trung bình 100-300 km, 1 km = 1.200 VND" },
    { maHeSo: "HS03", khoangCach: 700, heSo: 1500, ghiChu: "Tuyến dài 300-700 km, 1 km = 1.500 VND" },
    { maHeSo: "HS04", khoangCach: 2000, heSo: 2000, ghiChu: "Tuyến rất dài 700-2000 km, 1 km = 2.000 VND" },
];
