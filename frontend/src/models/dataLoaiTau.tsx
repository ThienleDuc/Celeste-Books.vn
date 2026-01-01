export interface LoaiTau {
  maLoaiTau: string;
  tenLoaiTau: string;
  moTa: string;
  heSo: number;
}

export const dataLoaiTau: LoaiTau[] = [
 { maLoaiTau: "LT01", tenLoaiTau: "Tàu khách", moTa: "Tàu chở khách", heSo: 1.0 },
    { maLoaiTau: "LT02", tenLoaiTau: "Tàu hàng", moTa: "Tàu chở hàng", heSo: 1.5 },
    { maLoaiTau: "LT03", tenLoaiTau: "Tàu tốc hành", moTa: "Tàu nhanh", heSo: 2.0 },
    { maLoaiTau: "LT04", tenLoaiTau: "Tàu du lịch", moTa: "Tàu du lịch", heSo: 1.2 },
    { maLoaiTau: "LT05", tenLoaiTau: "Tàu Express", moTa: "Tàu nhanh Express", heSo: 2.5 },
    { maLoaiTau: "LT06", tenLoaiTau: "Tàu hàng nặng", moTa: "Tàu chở hàng nặng", heSo: 1.8 },
    { maLoaiTau: "LT07", tenLoaiTau: "Tàu cao tốc", moTa: "Tàu cao tốc", heSo: 2.2 },
    { maLoaiTau: "LT08", tenLoaiTau: "Tàu hỏa du lịch", moTa: "Tàu hỏa du lịch", heSo: 1.3 },
    { maLoaiTau: "LT09", tenLoaiTau: "Tàu chở xe", moTa: "Tàu chở xe ô tô", heSo: 1.7 },
    { maLoaiTau: "LT10", tenLoaiTau: "Tàu chở hàng nhẹ", moTa: "Tàu nhẹ", heSo: 1.1 },
];
