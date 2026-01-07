// Interface cho bảng Giá Vé
export interface GiaVe {
  maGiaVe: string;        // PK
  maLoaiGhe: string;      // FK -> LoaiGhe
  maTinhTrang: string;    // FK -> TinhTrangVe
  maLoaiTau: string;      // FK -> LoaiTau
  maLoaiToa: string;      // FK -> LoaiToa
  maLoaiKhoang: string;   // FK -> LoaiKhoang
  maHeSo: string;         // FK -> GiaTienTheoKhoangCach
  ngayApDung: string;     // Ngày áp dụng giá vé
  ghiChu?: string;        // Ghi chú
}

// Data mẫu cho DEMO
export const dataGiaVe: GiaVe[] = [
  {
    maGiaVe: "GV01",
    maLoaiGhe: "LG01",
    maTinhTrang: "TT01",
    maLoaiTau: "LT01",
    maLoaiToa: "T01",
    maLoaiKhoang: "K01",
    maHeSo: "HS01",
    ngayApDung: "2025-12-01T00:00",
    ghiChu: "Vé bình thường",
  },
  {
    maGiaVe: "GV02",
    maLoaiGhe: "LG02",
    maTinhTrang: "TT02",
    maLoaiTau: "LT02",
    maLoaiToa: "T02",
    maLoaiKhoang: "K02",
    maHeSo: "HS02",
    ngayApDung: "2025-12-01T00:00",
    ghiChu: "Vé giờ cao điểm",
  },
  {
    maGiaVe: "GV03",
    maLoaiGhe: "LG03",
    maTinhTrang: "TT03",
    maLoaiTau: "LT01",
    maLoaiToa: "T03",
    maLoaiKhoang: "K03",
    maHeSo: "HS03",
    ngayApDung: "2025-12-01T00:00",
    ghiChu: "Vé lễ hội",
  },
  {
    maGiaVe: "GV04",
    maLoaiGhe: "LG01",
    maTinhTrang: "TT01",
    maLoaiTau: "LT03",
    maLoaiToa: "T01",
    maLoaiKhoang: "K01",
    maHeSo: "HS01",
    ngayApDung: "2025-12-01T00:00",
    ghiChu: "Vé bình thường",
  },
  {
    maGiaVe: "GV05",
    maLoaiGhe: "LG02",
    maTinhTrang: "TT02",
    maLoaiTau: "LT02",
    maLoaiToa: "T02",
    maLoaiKhoang: "K02",
    maHeSo: "HS02",
    ngayApDung: "2025-12-01T00:00",
    ghiChu: "Vé giờ cao điểm",
  },
];
