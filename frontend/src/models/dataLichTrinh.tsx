// ===============================
// INTERFACE LichTrinhTheoNgay
// ===============================
export interface LichTrinhTheoNgay {
  maLichTrinh: string;
  maTuyen: string;
  ngayKhoiHanh: string;
  nguoiTao: number;
  ngayCapNhat: string;
  trangThai: string;
  trangThaiPheDuyet: string;
  nguoiPheDuyet: number | "";
  ngayPheDuyet: string;
  ghiChuPheDuyet: string;
  ghiChu: string;
}

// ===============================
// DỮ LIỆU MẪU (10 bản ghi)
// ===============================
export const dataLichTrinh: LichTrinhTheoNgay[] = [
  {
    maLichTrinh: "10122025-01",
    maTuyen: "DN-SG",
    ngayKhoiHanh: "2025-12-10",
    nguoiTao: 1,
    ngayCapNhat: "2025-12-01T10:00",
    trangThai: "Tạo mới",
    trangThaiPheDuyet: "Tạo mới, Chưa phê duyệt",
    nguoiPheDuyet: "",
    ngayPheDuyet: "",
    ghiChuPheDuyet: "",
    ghiChu: "Tuyến nhanh",
  },
  {
    maLichTrinh: "12122025-01",
    maTuyen: "HN-DN",
    ngayKhoiHanh: "2025-12-12",
    nguoiTao: 2,
    ngayCapNhat: "2025-12-02T14:00",
    trangThai: "Đã duyệt",
    trangThaiPheDuyet: "Đã duyệt",
    nguoiPheDuyet: 3,
    ngayPheDuyet: "2025-12-03T09:00",
    ghiChuPheDuyet: "OK",
    ghiChu: "",
  },
  {
    maLichTrinh: "15122025-01",
    maTuyen: "SG-HN",
    ngayKhoiHanh: "2025-12-15",
    nguoiTao: 1,
    ngayCapNhat: "2025-12-04T11:30",
    trangThai: "Tạo mới",
    trangThaiPheDuyet: "Tạo mới, Chưa phê duyệt",
    nguoiPheDuyet: "",
    ngayPheDuyet: "",
    ghiChuPheDuyet: "",
    ghiChu: "Tuyến buýt nhanh",
  },
  {
    maLichTrinh: "18122025-01",
    maTuyen: "DN-HN",
    ngayKhoiHanh: "2025-12-18",
    nguoiTao: 2,
    ngayCapNhat: "2025-12-05T16:45",
    trangThai: "Đã duyệt",
    trangThaiPheDuyet: "Đã duyệt",
    nguoiPheDuyet: 1,
    ngayPheDuyet: "2025-12-06T10:15",
    ghiChuPheDuyet: "OK",
    ghiChu: "Tuyến thường",
  },
  {
    maLichTrinh: "20122025-01",
    maTuyen: "HN-SG",
    ngayKhoiHanh: "2025-12-20",
    nguoiTao: 3,
    ngayCapNhat: "2025-12-07T09:20",
    trangThai: "Tạo mới",
    trangThaiPheDuyet: "Tạo mới, Chưa phê duyệt",
    nguoiPheDuyet: "",
    ngayPheDuyet: "",
    ghiChuPheDuyet: "",
    ghiChu: "Tuyến nhanh giờ cao điểm",
  },

  // ===== Bổ sung thêm 5 bản ghi =====

  {
    maLichTrinh: "22122025-01",
    maTuyen: "SG-DN",
    ngayKhoiHanh: "2025-12-22",
    nguoiTao: 1,
    ngayCapNhat: "2025-12-08T08:10",
    trangThai: "Đã duyệt",
    trangThaiPheDuyet: "Đã duyệt",
    nguoiPheDuyet: 2,
    ngayPheDuyet: "2025-12-08T12:30",
    ghiChuPheDuyet: "Ổn",
    ghiChu: "",
  },
  {
    maLichTrinh: "24122025-01",
    maTuyen: "DN-HCM",
    ngayKhoiHanh: "2025-12-24",
    nguoiTao: 2,
    ngayCapNhat: "2025-12-09T15:45",
    trangThai: "Đang xử lý",
    trangThaiPheDuyet: "Chờ duyệt",
    nguoiPheDuyet: "",
    ngayPheDuyet: "",
    ghiChuPheDuyet: "",
    ghiChu: "Tuyến đặc biệt lễ Giáng Sinh",
  },
  {
    maLichTrinh: "25122025-01",
    maTuyen: "HN-DL",
    ngayKhoiHanh: "2025-12-25",
    nguoiTao: 3,
    ngayCapNhat: "2025-12-10T13:35",
    trangThai: "Tạo mới",
    trangThaiPheDuyet: "Tạo mới, Chưa phê duyệt",
    nguoiPheDuyet: "",
    ngayPheDuyet: "",
    ghiChuPheDuyet: "",
    ghiChu: "Tuyến dịp Noel",
  },
  {
    maLichTrinh: "27122025-01",
    maTuyen: "SG-VT",
    ngayKhoiHanh: "2025-12-27",
    nguoiTao: 1,
    ngayCapNhat: "2025-12-11T09:50",
    trangThai: "Đã duyệt",
    trangThaiPheDuyet: "Đã duyệt",
    nguoiPheDuyet: 3,
    ngayPheDuyet: "2025-12-11T11:00",
    ghiChuPheDuyet: "Chuẩn",
    ghiChu: "Tuyến du lịch",
  },
  {
    maLichTrinh: "30122025-01",
    maTuyen: "QN-HN",
    ngayKhoiHanh: "2025-12-30",
    nguoiTao: 2,
    ngayCapNhat: "2025-12-12T10:20",
    trangThai: "Tạo mới",
    trangThaiPheDuyet: "Tạo mới, Chưa phê duyệt",
    nguoiPheDuyet: "",
    ngayPheDuyet: "",
    ghiChuPheDuyet: "",
    ghiChu: "Chuẩn bị cho dịp Tết dương lịch",
  }
];
