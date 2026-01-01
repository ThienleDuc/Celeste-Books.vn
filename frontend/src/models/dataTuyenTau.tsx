// src/models/dataTuyenTau.ts
export interface TuyenTau {
  maTuyen: string;
  tenTuyen: string;  
  gaBatDau: string;
  gaKetThuc: string;
  doDai: number;
  soLuongGa: number;
  trangThaiHoatDong: boolean;
  ghiChu: string;
  id: string;
}

export const dataTuyenTau: TuyenTau[] = [
  {
    maTuyen: "DN-SG",
    tenTuyen: "Đà Nẵng - Sài Gòn",
    gaBatDau: "DN",
    gaKetThuc: "SG",
    doDai: 960,
    soLuongGa: 10,
    trangThaiHoatDong: true,
    ghiChu: "Tuyến nhanh",
    id: "DN-SG",
  },
  {
    maTuyen: "HN-DN",
    tenTuyen: "Hà Nội - Đà Nẵng",
    gaBatDau: "HN",
    gaKetThuc: "DN",
    doDai: 764,
    soLuongGa: 8,
    trangThaiHoatDong: true,
    ghiChu: "Tuyến thường",
    id: "HN-DN",
  },
  {
    maTuyen: "HP-HN",
    tenTuyen: "Hải Phòng - Hà Nội",
    gaBatDau: "HP",
    gaKetThuc: "HN",
    doDai: 120,
    soLuongGa: 5,
    trangThaiHoatDong: false,
    ghiChu: "Tuyến bảo trì",
    id: "HP-HN",
  },
  {
    maTuyen: "DN-HN",
    tenTuyen: "Đà Nẵng - Hà Nội",
    gaBatDau: "DN",
    gaKetThuc: "HN",
    doDai: 764,
    soLuongGa: 9,
    trangThaiHoatDong: true,
    ghiChu: "Tuyến ngược",
    id: "DN-HN",
  },
];
