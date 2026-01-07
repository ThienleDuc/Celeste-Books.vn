// src/models/dataPhanCongLaiTau.ts

export interface PhanCongLaiTau {
  maPhanCong: string;
  maLichTrinhPhanCong: string;
  maNguoiDung: number;
  loaiNhanVien: string;
  thoiDiemBatDau: string;
  thoiDiemKetThuc?: string;
  trangThai: boolean;
}

export const dataPhanCongLaiTau: PhanCongLaiTau[] = [
  {
    maPhanCong: "PCLT01",
    maLichTrinhPhanCong: "PC01",
    maNguoiDung: 3,
    loaiNhanVien: "Lái Tàu",
    thoiDiemBatDau: "2025-12-10T08:00",
    thoiDiemKetThuc: "2025-12-10T12:00",
    trangThai: false,
  },
  {
    maPhanCong: "PCLT02",
    maLichTrinhPhanCong: "PC02",
    maNguoiDung: 3,
    loaiNhanVien: "Lái Tàu",
    thoiDiemBatDau: "2025-12-12T09:00",
    thoiDiemKetThuc: "2025-12-12T13:00",
    trangThai: false,
  },
  {
    maPhanCong: "PCLT03",
    maLichTrinhPhanCong: "PC01",
    maNguoiDung: 4,
    loaiNhanVien: "Trưởng tàu",
    thoiDiemBatDau: "2025-12-10T08:00",
    thoiDiemKetThuc: "2025-12-10T12:00",
    trangThai: false,
  },
  {
    maPhanCong: "PCLT04",
    maLichTrinhPhanCong: "PC02",
    maNguoiDung: 4,
    loaiNhanVien: "Trưởng tàu",
    thoiDiemBatDau: "2025-12-12T09:00",
    thoiDiemKetThuc: "2025-12-12T13:00",
    trangThai: false,
  },
];
