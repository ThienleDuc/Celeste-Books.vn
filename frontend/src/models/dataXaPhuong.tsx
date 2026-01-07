export interface XaPhuong {
  MaXa: string;
  TenXa: string;
  MaTinh: string; // FK -> TinhThanhPho.MaTinh
}

export const dataXaPhuong: XaPhuong[] = [
  // Hà Nội
  { MaXa: "X001", TenXa: "Phường Hoàn Kiếm", MaTinh: "T01" },
  { MaXa: "X002", TenXa: "Phường Hai Bà Trưng", MaTinh: "T01" },
  { MaXa: "X003", TenXa: "Xã Đông Anh", MaTinh: "T01" },

  // TP. HCM
  { MaXa: "X004", TenXa: "Phường Bến Nghé", MaTinh: "T02" },
  { MaXa: "X005", TenXa: "Phường Tân Định", MaTinh: "T02" },
  { MaXa: "X006", TenXa: "Xã Bình Chánh", MaTinh: "T02" },

  // Đà Nẵng
  { MaXa: "X007", TenXa: "Phường Hải Châu 1", MaTinh: "T03" },
  { MaXa: "X008", TenXa: "Phường Mỹ An", MaTinh: "T03" },
  { MaXa: "X009", TenXa: "Xã Hòa Tiến", MaTinh: "T03" },

  // Hải Phòng
  { MaXa: "X010", TenXa: "Phường Đổng Quốc Bình", MaTinh: "T04" },
  { MaXa: "X011", TenXa: "Phường Lạc Viên", MaTinh: "T04" },
  { MaXa: "X012", TenXa: "Xã An Đồng", MaTinh: "T04" },

  // Cần Thơ
  { MaXa: "X013", TenXa: "Phường An Cư", MaTinh: "T05" },
  { MaXa: "X014", TenXa: "Phường Cái Khế", MaTinh: "T05" },
  { MaXa: "X015", TenXa: "Xã Mỹ Khánh", MaTinh: "T05" },
];
