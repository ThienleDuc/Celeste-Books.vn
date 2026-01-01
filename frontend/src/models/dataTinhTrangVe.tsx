export interface TinhTrangVe {
  maTinhTrang: string;
  tenTinhTrang: string;
  heSoGia: number;
  ghiChu?: string;
}

export const dataTinhTrangVe: TinhTrangVe[] = [
   { maTinhTrang: "TT01", tenTinhTrang: "Bình thường", heSoGia: 1.0, ghiChu: "" },
  { maTinhTrang:  "TT02", tenTinhTrang: "Giờ cao điểm", heSoGia: 1.5, ghiChu: "" },
  { maTinhTrang:  "TT03", tenTinhTrang: "Lễ hội", heSoGia: 1.2, ghiChu: "" },
];
