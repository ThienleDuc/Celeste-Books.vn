// models/dataTuyenTauGa.ts
interface TuyenTauGa {
  maTuyen: string;
  maGa: string;
  thuTu: number;
  khoangCach: number;
  ghiChu: string;
}

export const dataTuyenTauGa: TuyenTauGa[] = [
  // Tuyến DN-SG
  { maTuyen: "DN-SG", maGa: "DN", thuTu: 1, khoangCach: 0, ghiChu: "Ga đầu" },
  { maTuyen: "DN-SG", maGa: "MA", thuTu: 2, khoangCach: 10, ghiChu: "" },
  { maTuyen: "DN-SG", maGa: "HT", thuTu: 3, khoangCach: 20, ghiChu: "" },
  { maTuyen: "DN-SG", maGa: "SG", thuTu: 4, khoangCach: 960, ghiChu: "Ga cuối" },

  // Tuyến HN-DN
  { maTuyen: "HN-DN", maGa: "HN", thuTu: 1, khoangCach: 0, ghiChu: "Ga đầu" },
  { maTuyen: "HN-DN", maGa: "DA", thuTu: 2, khoangCach: 30, ghiChu: "" },
  { maTuyen: "HN-DN", maGa: "DN", thuTu: 3, khoangCach: 764, ghiChu: "Ga cuối" },

  // Tuyến HP-HN
  { maTuyen: "HP-HN", maGa: "HP", thuTu: 1, khoangCach: 0, ghiChu: "Ga đầu" },
  { maTuyen: "HP-HN", maGa: "DA", thuTu: 2, khoangCach: 60, ghiChu: "" },
  { maTuyen: "HP-HN", maGa: "HN", thuTu: 3, khoangCach: 120, ghiChu: "Ga cuối" },

  // Tuyến DN-HN
  { maTuyen: "DN-HN", maGa: "DN", thuTu: 1, khoangCach: 0, ghiChu: "Ga đầu" },
  { maTuyen: "DN-HN", maGa: "HT", thuTu: 2, khoangCach: 30, ghiChu: "" },
  { maTuyen: "DN-HN", maGa: "HN", thuTu: 3, khoangCach: 764, ghiChu: "Ga cuối" },
];
