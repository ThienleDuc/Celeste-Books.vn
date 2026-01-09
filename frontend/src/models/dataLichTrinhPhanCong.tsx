// src/models/dataPhanCong.ts

export interface LichTrinhPhanCong {
  maLichTrinhPhanCong: string;   // PK
  maChuyenTau: string;           // FK -> LichTrinhChuyenTau
  nguoiTao: number;              // FK
  trangThai: string;
  ghiChu: string;
  ngayCapNhat: string;           // DATETIME
  trangThaiPheDuyet: string;
  nguoiPheDuyet?: number | null; // FK, có thể null
  ngayPheDuyet?: string | null;  // DATETIME, có thể null
  ghiChuPheDuyet?: string;
}

export const dataPhanCong: LichTrinhPhanCong[] = [
  {
    maLichTrinhPhanCong: "PC01",
    maChuyenTau: "101225-01-01",
    nguoiTao: 1,
    trangThai: "Tạo mới",
    ghiChu: "Phân công sớm",
    ngayCapNhat: "2025-12-03T08:00:00",
    trangThaiPheDuyet: "Chưa duyệt",
    nguoiPheDuyet: null,
    ngayPheDuyet: null,
    ghiChuPheDuyet: "",
  },
  {
    maLichTrinhPhanCong: "PC02",
    maChuyenTau: "101225-02-01",
    nguoiTao: 2,
    trangThai: "Tạo mới",
    ghiChu: "Phân công thường",
    ngayCapNhat: "2025-12-03T09:00:00",
    trangThaiPheDuyet: "Chưa duyệt",
    nguoiPheDuyet: null,
    ngayPheDuyet: null,
    ghiChuPheDuyet: "",
  },
];
