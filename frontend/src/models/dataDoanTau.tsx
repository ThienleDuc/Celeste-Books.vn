export interface DoanTau {
  maDoanTau: string;
  tenDoanTau: string;
  maLoaiTau: string;
  soToa: number;
  trangThaiHoatDong: boolean;
  ghiChu: string;
}

export const dataDoanTau: DoanTau[] = [
  { maDoanTau: "DT01", tenDoanTau: "SE01", maLoaiTau: "LT01", soToa: 8, trangThaiHoatDong: true, ghiChu: "Đang khai thác" },
  { maDoanTau: "DT02", tenDoanTau: "SE02", maLoaiTau: "LT03", soToa: 10, trangThaiHoatDong: true, ghiChu: "Tàu tốc hành" },
  { maDoanTau: "DT03", tenDoanTau: "SE03", maLoaiTau: "LT07", soToa: 12, trangThaiHoatDong: true, ghiChu: "Tàu cao tốc" },
  { maDoanTau: "DT04", tenDoanTau: "SE04", maLoaiTau: "LT02", soToa: 20, trangThaiHoatDong: false, ghiChu: "Đang bảo trì" },
  { maDoanTau: "DT05", tenDoanTau: "SE05", maLoaiTau: "LT05", soToa: 9, trangThaiHoatDong: true, ghiChu: "Express" },
  { maDoanTau: "DT06", tenDoanTau: "SE06", maLoaiTau: "LT06", soToa: 18, trangThaiHoatDong: false, ghiChu: "Hàng nặng" },
  { maDoanTau: "DT07", tenDoanTau: "SE07", maLoaiTau: "LT04", soToa: 7, trangThaiHoatDong: true, ghiChu: "Tàu du lịch" },
  { maDoanTau: "DT08", tenDoanTau: "SE08", maLoaiTau: "LT08", soToa: 6, trangThaiHoatDong: true, ghiChu: "" },
  { maDoanTau: "DT09", tenDoanTau: "SE09", maLoaiTau: "LT09", soToa: 15, trangThaiHoatDong: true, ghiChu: "Chở xe" },
  { maDoanTau: "DT10", tenDoanTau: "SE10", maLoaiTau: "LT10", soToa: 10, trangThaiHoatDong: false, ghiChu: "Tàu nhẹ" },
];
