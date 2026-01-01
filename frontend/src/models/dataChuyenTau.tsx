export interface LichTrinhChuyenTau {
  maChuyenTau: string;             // PK
  maLichTrinh: string;             // FK -> LichTrinhTheoNgay
  maDoanTau: string;               // FK -> DoanTau
  thoiDiemKhoiHanh: string;        // DATETIME
  ngayDenDuKien: string;           // DATETIME
  ngayKhoiHanhChieuVe?: string;    // DATETIME (nullable)
  ngayDuKienTroVe?: string;        // DATETIME (nullable)
  loaiHanhTrinh: 0 | 1;            // BIT
  trangThaiChuyen: string;         // NVARCHAR(50)
  ghiChu?: string;                 // NVARCHAR(255)
  nguoiTao: number | "";           // Bạn tự bổ sung => vẫn giữ
}

export const dataChuyenTau: LichTrinhChuyenTau[] = [
  {
    maChuyenTau: "101225-01-01",
    maLichTrinh: "10122025-01",
    maDoanTau: "DT01",
    thoiDiemKhoiHanh: "2025-12-10T08:00",
    ngayDenDuKien: "2025-12-10T12:00",
    loaiHanhTrinh: 0,
    trangThaiChuyen: "Tạo mới",
    nguoiTao: 1,
    ghiChu: "Chuyến sớm",
  },
  {
    maChuyenTau: "101225-02-01",
    maLichTrinh: "12122025-01",
    maDoanTau: "DT02",
    thoiDiemKhoiHanh: "2025-12-12T09:00",
    ngayDenDuKien: "2025-12-12T13:00",
    loaiHanhTrinh: 1,
    ngayKhoiHanhChieuVe: "2025-12-12T17:00",
    ngayDuKienTroVe: "2025-12-12T21:00",
    trangThaiChuyen: "Chỉnh sửa",
    nguoiTao: 2,
    ghiChu: "Chuyến thường",
  },
  {
    maChuyenTau: "101225-03-01",
    maLichTrinh: "15122025-01",
    maDoanTau: "DT03",
    thoiDiemKhoiHanh: "2025-12-15T10:30",
    ngayDenDuKien: "2025-12-15T14:30",
    loaiHanhTrinh: 0,
    trangThaiChuyen: "Đang chạy",
    nguoiTao: 1,
    ghiChu: "Tuyến buýt nhanh",
  },
  {
    maChuyenTau: "101225-04-01",
    maLichTrinh: "18122025-01",
    maDoanTau: "DT04",
    thoiDiemKhoiHanh: "2025-12-18T11:15",
    ngayDenDuKien: "2025-12-18T16:00",
    loaiHanhTrinh: 1,
    ngayKhoiHanhChieuVe: "2025-12-18T18:00",
    ngayDuKienTroVe: "2025-12-18T22:30",
    trangThaiChuyen: "Tạo mới",
    nguoiTao: 2,
    ghiChu: "Tuyến thường",
  },
  {
    maChuyenTau: "101225-05-01",
    maLichTrinh: "20122025-01",
    maDoanTau: "DT05",
    thoiDiemKhoiHanh: "2025-12-20T12:00",
    ngayDenDuKien: "2025-12-20T17:00",
    loaiHanhTrinh: 0,
    trangThaiChuyen: "Khóa",
    nguoiTao: 3,
    ghiChu: "Tuyến nhanh giờ cao điểm",
  },
];
