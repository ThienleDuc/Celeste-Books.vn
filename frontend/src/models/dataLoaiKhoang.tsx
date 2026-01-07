export interface LoaiKhoang {
  maLoaiKhoang: string;
  tenLoaiKhoang: string;
  moTa: string;
  heSo: number;
}

export const dataLoaiKhoang: LoaiKhoang[]  = [
  {
    maLoaiKhoang: "K01",
    tenLoaiKhoang: "Khoang thường",
    moTa: "Khoang tiêu chuẩn cho hành khách",
    heSo: 1.0,
  },
  {
    maLoaiKhoang: "K02",
    tenLoaiKhoang: "Khoang VIP",
    moTa: "Khoang tiện nghi cao cấp",
    heSo: 2.0,
  },
  {
    maLoaiKhoang: "K03",
    tenLoaiKhoang: "Khoang 4 giường",
    moTa: "Khoang giường nằm 4 chỗ",
    heSo: 1.6,
  },
  {
    maLoaiKhoang: "K04",
    tenLoaiKhoang: "Khoang 6 giường",
    moTa: "Khoang giường nằm 6 chỗ",
    heSo: 1.3,
  },
  {
    maLoaiKhoang: "K05",
    tenLoaiKhoang: "Khoang điều hòa",
    moTa: "Khoang có máy lạnh",
    heSo: 1.2,
  },
  {
    maLoaiKhoang: "K06",
    tenLoaiKhoang: "Khoang gia đình",
    moTa: "Khoang dành cho gia đình 3–5 người",
    heSo: 1.8,
  },
  {
    maLoaiKhoang: "K07",
    tenLoaiKhoang: "Khoang doanh nhân",
    moTa: "Khoang riêng cho doanh nhân",
    heSo: 2.5,
  },
  {
    maLoaiKhoang: "K08",
    tenLoaiKhoang: "Khoang Express",
    moTa: "Khoang tốc độ cao Express",
    heSo: 2.7,
  },
  {
    maLoaiKhoang: "K09",
    tenLoaiKhoang: "Khoang du lịch",
    moTa: "Khoang có cửa sổ lớn và tầm nhìn đẹp",
    heSo: 1.4,
  },
  {
    maLoaiKhoang: "K10",
    tenLoaiKhoang: "Khoang tiết kiệm",
    moTa: "Khoang giá rẻ cho hành khách phổ thông",
    heSo: 0.9,
  },
];
