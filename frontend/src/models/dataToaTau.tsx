export interface ToaTau {
  maToa: string;
  maDoanTau: string;
  maLoaiToa: string;
  soThuTuToa: number;
  sucChua: number;
  trangThaiHoatDong: boolean;
  ghiChu: string;
}

export const dataToaTau: ToaTau[] = [
  { maToa: "T001", maDoanTau: "DT01", maLoaiToa: "LTO1", soThuTuToa: 1, sucChua: 40, trangThaiHoatDong: true, ghiChu: "" },
  { maToa: "T002", maDoanTau: "DT01", maLoaiToa: "LTO2", soThuTuToa: 2, sucChua: 36, trangThaiHoatDong: true, ghiChu: "" },
  { maToa: "T003", maDoanTau: "DT01", maLoaiToa: "LTO3", soThuTuToa: 3, sucChua: 32, trangThaiHoatDong: false, ghiChu: "Bảo trì" },

  { maToa: "T004", maDoanTau: "DT02", maLoaiToa: "LTO2", soThuTuToa: 1, sucChua: 38, trangThaiHoatDong: true, ghiChu: "" },
  { maToa: "T005", maDoanTau: "DT02", maLoaiToa: "LTO1", soThuTuToa: 2, sucChua: 40, trangThaiHoatDong: false, ghiChu: "Đang nâng cấp" },

  { maToa: "T006", maDoanTau: "DT03", maLoaiToa: "LTO3", soThuTuToa: 1, sucChua: 34, trangThaiHoatDong: true, ghiChu: "" },
  { maToa: "T007", maDoanTau: "DT03", maLoaiToa: "LTO4", soThuTuToa: 2, sucChua: 30, trangThaiHoatDong: true, ghiChu: "" },
  { maToa: "T008", maDoanTau: "DT03", maLoaiToa: "LTO2", soThuTuToa: 3, sucChua: 36, trangThaiHoatDong: true, ghiChu: "" },

  { maToa: "T009", maDoanTau: "DT01", maLoaiToa: "LTO4", soThuTuToa: 4, sucChua: 28, trangThaiHoatDong: false, ghiChu: "Hỏng cửa" },
  { maToa: "T010", maDoanTau: "DT02", maLoaiToa: "LTO3", soThuTuToa: 3, sucChua: 34, trangThaiHoatDong: true, ghiChu: "" },
];
