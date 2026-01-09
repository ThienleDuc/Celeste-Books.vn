interface LoaiGhe {
  MaLoaiGhe: string;
  TenLoaiGhe: string;
  MoTa: string;
  HeSo: number;
}

export const dataLoaiGhe: LoaiGhe[] = [
    { MaLoaiGhe: "G01", TenLoaiGhe: "Ghế thường", MoTa: "Ghế tiêu chuẩn", HeSo: 1.0 },
    { MaLoaiGhe: "G02", TenLoaiGhe: "Ghế VIP", MoTa: "Ghế cao cấp", HeSo: 2.0 },
    { MaLoaiGhe: "G03", TenLoaiGhe: "Ghế gia đình", MoTa: "Ghế dành cho gia đình 3-5 người", HeSo: 1.8 },
    { MaLoaiGhe: "G04", TenLoaiGhe: "Ghế doanh nhân", MoTa: "Ghế riêng cho doanh nhân", HeSo: 2.5 },

    // Thêm giường
    { MaLoaiGhe: "G05", TenLoaiGhe: "Giường 4 chỗ", MoTa: "Giường nằm 4 chỗ", HeSo: 1.6 },
    { MaLoaiGhe: "G06", TenLoaiGhe: "Giường 6 chỗ", MoTa: "Giường nằm 6 chỗ", HeSo: 1.3 },
    { MaLoaiGhe: "G07", TenLoaiGhe: "Giường điều hòa", MoTa: "Giường có máy lạnh", HeSo: 1.2 },
    { MaLoaiGhe: "G08", TenLoaiGhe: "Giường gia đình", MoTa: "Giường cho gia đình 3-5 người", HeSo: 1.8 },
    { MaLoaiGhe: "G09", TenLoaiGhe: "Giường doanh nhân", MoTa: "Giường riêng cho doanh nhân", HeSo: 2.5 },
    { MaLoaiGhe: "G10", TenLoaiGhe: "Giường Express", MoTa: "Giường tốc độ cao Express", HeSo: 2.7 },
]