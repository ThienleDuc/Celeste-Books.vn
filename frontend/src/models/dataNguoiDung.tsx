// src/models/dataNguoiDung.ts

export interface NguoiDung {
  maNguoiDung: number;
  hoTen: string;
  email: string;
  matKhau: string;
  soDienThoai: string;
  ngayTao: string; // ISO string, ví dụ "2025-12-03T00:00:00"
  anhDaiDien: string;
  trangThai: boolean;
  maVaiTro: string; // liên kết với dataVaiTro.maVaiTro
}

export const dataNguoiDung: NguoiDung[] = [
  {
    maNguoiDung: 1,
    hoTen: "Nguyen Van A",
    email: "nguyenvana@example.com",
    matKhau: "12345678",
    soDienThoai: "0901234567",
    ngayTao: "2025-12-03T08:00:00",
    anhDaiDien: "avatar1.png",
    trangThai: true,
    maVaiTro: "KH",
  },
  {
    maNguoiDung: 2,
    hoTen: "Tran Thi B",
    email: "tranthib@example.com",
    matKhau: "abcd1234",
    soDienThoai: "0912345678",
    ngayTao: "2025-12-03T09:00:00",
    anhDaiDien: "avatar2.png",
    trangThai: true,
    maVaiTro: "CSKH",
  },
  {
    maNguoiDung: 3,
    hoTen: "Le Van C",
    email: "levanc@example.com",
    matKhau: "pass1234",
    soDienThoai: "0923456789",
    ngayTao: "2025-12-03T10:00:00",
    anhDaiDien: "avatar3.png",
    trangThai: true,
    maVaiTro: "LT",
  },
  {
    maNguoiDung: 4,
    hoTen: "Pham Thi D",
    email: "phamthid@example.com",
    matKhau: "qwerty12",
    soDienThoai: "0934567890",
    ngayTao: "2025-12-03T11:00:00",
    anhDaiDien: "avatar4.png",
    trangThai: true,
    maVaiTro: "DHG",
  },
  {
    maNguoiDung: 5,
    hoTen: "Hoang Van E",
    email: "hoangvane@example.com",
    matKhau: "zxcvbn12",
    soDienThoai: "0945678901",
    ngayTao: "2025-12-03T12:00:00",
    anhDaiDien: "avatar5.png",
    trangThai: true,
    maVaiTro: "QLG",
  },
  {
    maNguoiDung: 6,
    hoTen: "Nguyen Thi F",
    email: "nguyenthif@example.com",
    matKhau: "admin1234",
    soDienThoai: "0956789012",
    ngayTao: "2025-12-03T13:00:00",
    anhDaiDien: "avatar6.png",
    trangThai: true,
    maVaiTro: "ADMIN",
  },
];
