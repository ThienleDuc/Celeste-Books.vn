// models/dataGaTau.ts
export interface GaTau {
  maGa: string;
  tenGa: string;
  diaChi: string;
  trangThaiHoatDong: boolean;
  ghiChu: string;
  maXa: string; // FK: dataXaPhuong.MaXa (ví dụ: X001, X002, ...)
}

export const dataGaTau: GaTau[] = [
  { maGa: "HN", tenGa: "Hà Nội",        diaChi: "120 Lê Duẩn, Quận Hoàn Kiếm, Hà Nội", trangThaiHoatDong: true,  ghiChu: "Ga trung tâm",            maXa: "X001" }, 
  { maGa: "SG", tenGa: "Sài Gòn",        diaChi: "01 Nguyễn Thông, Quận 3, TP.HCM",     trangThaiHoatDong: true,  ghiChu: "",                       maXa: "X004" }, 
  { maGa: "DN", tenGa: "Đà Nẵng",       diaChi: "791 Hải Phòng, Q. Thanh Khê, Đà Nẵng",trangThaiHoatDong: true,  ghiChu: "",                       maXa: "X007" }, 
  { maGa: "HP", tenGa: "Hải Phòng",     diaChi: "TP. Hải Phòng",                       trangThaiHoatDong: true,  ghiChu: "",                       maXa: "X010" }, 
  { maGa: "CT", tenGa: "Cần Thơ",       diaChi: "TP. Cần Thơ",                         trangThaiHoatDong: true,  ghiChu: "",                       maXa: "X013" }, 
  { maGa: "MA", tenGa: "Mỹ An (ĐN)",       diaChi: "Phường Mỹ An, Đà Nẵng",               trangThaiHoatDong: true,  ghiChu: "",                       maXa: "X008" }, 
  { maGa: "BN", tenGa: "Bến Nghé (HCM)",   diaChi: "Quận 1, TP.HCM",                      trangThaiHoatDong: true,  ghiChu: "",                       maXa: "X004" }, 
  { maGa: "BC", tenGa: "Bình Chánh",       diaChi: "Huyện Bình Chánh, TP.HCM",            trangThaiHoatDong: true,  ghiChu: "",                       maXa: "X006" }, 
  { maGa: "DA", tenGa: "Đông Anh",         diaChi: "Huyện Đông Anh, Hà Nội",              trangThaiHoatDong: false, ghiChu: "Đang sửa chữa",         maXa: "X003" }, 
  { maGa: "CK", tenGa: "Cái Khế",          diaChi: "Quận Ninh Kiều, Cần Thơ",             trangThaiHoatDong: true,  ghiChu: "",                       maXa: "X014" }, 
  { maGa: "HT", tenGa: "Hòa Tiến",         diaChi: "Hòa Vang, Đà Nẵng",                    trangThaiHoatDong: true,  ghiChu: "",                       maXa: "X009" }, 
  { maGa: "AD", tenGa: "An Đồng",          diaChi: "Hải Phòng - An Đồng",                 trangThaiHoatDong: true,  ghiChu: "",                       maXa: "X012" }, 
  { maGa: "MK", tenGa: "Mỹ Khánh",         diaChi: "Cần Thơ - Mỹ Khánh",                  trangThaiHoatDong: true,  ghiChu: "",                       maXa: "X015" }, 
  { maGa: "HK", tenGa: "Hoàn Kiếm (vt)",   diaChi: "Khu vực Hoàn Kiếm, Hà Nội",           trangThaiHoatDong: true,  ghiChu: "Ga phụ",                  maXa: "X002" }, 
];
