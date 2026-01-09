export interface ChiTietViTri {
  MaViTri: string;
  MaToa: string;
  MaKhoang: string;
  MaGhe: string;
  TenToa?: string;
  TenKhoang?: string;
  SoGhe?: string;
}

export const dataChiTietViTri: ChiTietViTri[] = [
  {
    MaViTri: "V01",
    MaToa: "T001",
    MaKhoang: "K01",
    MaGhe: "G01",
    TenToa: "Toa 1",
    TenKhoang: "Khoang thường",
    SoGhe: "01",
  },
  {
    MaViTri: "V02",
    MaToa: "T001",
    MaKhoang: "K01",
    MaGhe: "G02",
    TenToa: "Toa 1",
    TenKhoang: "Khoang thường",
    SoGhe: "02",
  },
  {
    MaViTri: "V03",
    MaToa: "T002",
    MaKhoang: "K02",
    MaGhe: "G03",
    TenToa: "Toa 2",
    TenKhoang: "Khoang VIP",
    SoGhe: "03",
  },
  {
    MaViTri: "V04",
    MaToa: "T002",
    MaKhoang: "K02",
    MaGhe: "G04",
    TenToa: "Toa 2",
    TenKhoang: "Khoang VIP",
    SoGhe: "04",
  },
  {
    MaViTri: "V05",
    MaToa: "T003",
    MaKhoang: "K03",
    MaGhe: "G05",
    TenToa: "Toa 3",
    TenKhoang: "Khoang giường nằm",
    SoGhe: "05",
  },
];
