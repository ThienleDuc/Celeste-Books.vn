export interface Ghe {
  MaGhe: string;
  MaLoaiGhe: string;
  SoGhe: string;
  TrangThaiHoatDong: boolean;
  GhiChu: string;
}

export const dataGhe: Ghe[] = [
  { MaGhe: "G01", MaLoaiGhe: "G01", SoGhe: "01A", TrangThaiHoatDong: true, GhiChu: "" },
  { MaGhe: "G02", MaLoaiGhe: "G01", SoGhe: "01B", TrangThaiHoatDong: true, GhiChu: "" },
  { MaGhe: "G03", MaLoaiGhe: "G02", SoGhe: "02A", TrangThaiHoatDong: true, GhiChu: "Ghế VIP" },
  { MaGhe: "G04", MaLoaiGhe: "G02", SoGhe: "02B", TrangThaiHoatDong: false, GhiChu: "Bảo trì" },
  { MaGhe: "G05", MaLoaiGhe: "G03", SoGhe: "03A", TrangThaiHoatDong: true, GhiChu: "Ghế gia đình" },
  { MaGhe: "G06", MaLoaiGhe: "G04", SoGhe: "04A", TrangThaiHoatDong: true, GhiChu: "Ghế doanh nhân" },
  
  // Giường
  { MaGhe: "G07", MaLoaiGhe: "G05", SoGhe: "K01", TrangThaiHoatDong: true, GhiChu: "Giường 4 chỗ" },
  { MaGhe: "G08", MaLoaiGhe: "G06", SoGhe: "K02", TrangThaiHoatDong: true, GhiChu: "Giường 6 chỗ" },
  { MaGhe: "G09", MaLoaiGhe: "G07", SoGhe: "K03", TrangThaiHoatDong: false, GhiChu: "Giường điều hòa" },
  { MaGhe: "G10", MaLoaiGhe: "G08", SoGhe: "K04", TrangThaiHoatDong: true, GhiChu: "Giường gia đình" },
  { MaGhe: "G11", MaLoaiGhe: "G09", SoGhe: "K05", TrangThaiHoatDong: true, GhiChu: "Giường doanh nhân" },
  { MaGhe: "G12", MaLoaiGhe: "G10", SoGhe: "K06", TrangThaiHoatDong: true, GhiChu: "Giường Express" },
];
