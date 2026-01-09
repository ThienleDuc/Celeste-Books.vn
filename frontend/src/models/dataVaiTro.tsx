// src/models/dataVaiTro.ts

export interface VaiTro {
  maVaiTro: string;
  tenVaiTro: string;
  moTa: string;
}

export const dataVaiTro: VaiTro[] = [
  { maVaiTro: "KH", tenVaiTro: "Khách hàng", moTa: "Người mua vé và sử dụng dịch vụ tàu" },
  { maVaiTro: "CSKH", tenVaiTro: "Nhân viên CSKH", moTa: "Nhân viên chăm sóc khách hàng" },
  { maVaiTro: "LT", tenVaiTro: "Nhân viên lái tàu", moTa: "Nhân viên trực tiếp lái tàu" },
  { maVaiTro: "DHG", tenVaiTro: "Nhân viên điều hành ga", moTa: "Điều phối hoạt động tại ga" },
  { maVaiTro: "QLG", tenVaiTro: "Nhân viên quản lý ga", moTa: "Quản lý chung các ga và nhân sự" },
  { maVaiTro: "ADMIN", tenVaiTro: "Quản trị hệ thống", moTa: "Quản trị viên hệ thống, toàn quyền truy cập" },
];
