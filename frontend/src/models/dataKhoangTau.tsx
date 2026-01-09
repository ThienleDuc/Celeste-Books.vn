interface KhoangTau {
  maKhoang: string;
  maToa: string;
  maLoaiKhoang: string;
  tenKhoang: string;
  sucChua: number;
  trangThaiHoatDong: boolean;
  ghiChu: string;
}

export const dataKhoangTau: KhoangTau[] = [
  {
    maKhoang: "K01",
    maToa: "T001",
    maLoaiKhoang: "K01",
    tenKhoang: "Khoang Thường 1",
    sucChua: 20,
    trangThaiHoatDong: true,
    ghiChu: "Tiêu chuẩn cho hành khách",
  },
  {
    maKhoang: "K02",
    maToa: "T001",
    maLoaiKhoang: "K02",
    tenKhoang: "Khoang VIP 2",
    sucChua: 15,
    trangThaiHoatDong: true,
    ghiChu: "Tiện nghi cao cấp",
  },
  {
    maKhoang: "K03",
    maToa: "T002",
    maLoaiKhoang: "K03",
    tenKhoang: "Khoang 4 giường 3",
    sucChua: 25,
    trangThaiHoatDong: false,
    ghiChu: "Bảo trì",
  },
];
