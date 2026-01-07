import { Breadcrumbs, Link, Typography } from "@mui/material";
import { useState } from "react";
import { Helmet } from "react-helmet";

const ThongBaoPhanCong = () => {
  const notiList = [
    {
      maLichTrinhPhanCong: "PC001",
      maChuyenTau: "CT001",
      tenTuyen: "Sài Gòn → Hà Nội",
      trangThaiPheDuyet: "Đã phê duyệt",
      ghiChuPheDuyet: "Hợp lệ",
      ngayPheDuyet: "2025-01-10 09:12",
    },
    {
      maLichTrinhPhanCong: "PC002",
      maChuyenTau: "CT045",
      tenTuyen: "Đà Nẵng → Nha Trang",
      trangThaiPheDuyet: "Chờ phê duyệt",
      ghiChuPheDuyet: "",
      ngayPheDuyet: "—",
    },
    {
      maLichTrinhPhanCong: "PC003",
      maChuyenTau: "CT078",
      tenTuyen: "Huế → Quảng Ngãi",
      trangThaiPheDuyet: "Bị từ chối",
      ghiChuPheDuyet: "Lý do: Thiếu nhân sự",
      ngayPheDuyet: "2025-01-11 14:55",
    },
  ];

  const [filter, setFilter] = useState("Tất cả");

  const filteredList =
    filter === "Tất cả"
      ? notiList
      : notiList.filter((n) => n.trangThaiPheDuyet === filter);

  const getBadgeClass = (status: string) => {
    switch (status) {
      case "Đã phê duyệt":
        return "border border-success text-success px-2 py-1 rounded-pill small fw-semibold";
      case "Chờ phê duyệt":
        return "border border-warning text-warning px-2 py-1 rounded-pill small fw-semibold";
      case "Bị từ chối":
        return "border border-danger text-danger px-2 py-1 rounded-pill small fw-semibold";
      default:
        return "border text-muted px-2 py-1 rounded-pill small";
    }
  };

  return (
    <>
      <Helmet>
        <title>Thông Báo Phân Công</title>
      </Helmet>
      <div className="container my-4">
        <div className="mb-4">
          <h5 className="fw-bold title-page">
            Thông báo phân cônng
          </h5>

          <Breadcrumbs aria-label="breadcrumb" className="mb-1">
            <Link underline="hover" color="inherit" href="/">
              Trang chủ
            </Link>
            <Typography color="text.primary">
              Thông báo phân công
            </Typography>
          </Breadcrumbs>
        </div>

        <div className="row">
          
          {/* LEFT — NOTIFICATION TABLE */}
          <div className="col-9">

            {/* Header */}
            <div className="row bg-dark text-white fw-bold py-2 rounded-top g-0">
              <div className="col-8 text-center">NỘI DUNG</div>
              <div className="col-4 text-center">THỜI GIAN</div>
            </div>

            {/* Body */}
            <div className="border border-top-0 rounded-bottom overflow-hidden">

              {filteredList.length === 0 && (
                <div className="p-3 text-center text-muted">
                  Không có dữ liệu phù hợp.
                </div>
              )}

              <div className="border border-top-0 rounded-bottom overflow-hidden"
                style={{ maxHeight: "420px", overflowY: "auto" }}>
                {filteredList.map((item) => (
                  <div
                    key={item.maLichTrinhPhanCong}
                    className="row g-0 border-top hover-bg-light"
                    style={{ cursor: "pointer" }}
                  >
                    {/* LEFT CONTENT */}
                    <div className="col-8 p-3">

                      <div className="fw-bold mb-1">
                        {item.tenTuyen} ({item.maChuyenTau})
                      </div>

                      <span className={getBadgeClass(item.trangThaiPheDuyet)}>
                        {item.trangThaiPheDuyet}
                      </span>

                      {item.ghiChuPheDuyet && (
                        <div className="text-muted small mt-1">
                          {item.ghiChuPheDuyet}
                        </div>
                      )}

                      <a
                        href={`/phan-cong/${item.maLichTrinhPhanCong}`}
                        className="d-block mt-1 small fw-semibold text-decoration-none text-primary"
                      >
                        Xem chi tiết
                      </a>

                    </div>

                    {/* RIGHT TIME */}
                    <div className="col-4 p-3 text-end text-muted small">
                      {item.ngayPheDuyet}
                    </div>

                  </div>
                ))}
              </div>

            </div>
          </div>

          {/* RIGHT — FILTER PANEL */}
          <div className="col-3">
            <div className="border rounded p-3 bg-light">

              <h6 className="fw-bold mb-3">Bộ lọc trạng thái</h6>

              <div
                className={`p-2 rounded mb-2 ${
                  filter === "Tất cả" ? "bg-primary text-white" : "bg-white"
                }`}
                style={{ cursor: "pointer" }}
                onClick={() => setFilter("Tất cả")}
              >
                Tất cả
              </div>

              <div
                className={`p-2 rounded mb-2 ${
                  filter === "Đã phê duyệt" ? "bg-success text-white" : "bg-white"
                }`}
                style={{ cursor: "pointer" }}
                onClick={() => setFilter("Đã phê duyệt")}
              >
                Đã phê duyệt
              </div>

              <div
                className={`p-2 rounded mb-2 ${
                  filter === "Chờ phê duyệt" ? "bg-warning text-white" : "bg-white"
                }`}
                style={{ cursor: "pointer" }}
                onClick={() => setFilter("Chờ phê duyệt")}
              >
                Chờ phê duyệt
              </div>

              <div
                className={`p-2 rounded mb-2 ${
                  filter === "Bị từ chối" ? "bg-danger text-white" : "bg-white"
                }`}
                style={{ cursor: "pointer" }}
                onClick={() => setFilter("Bị từ chối")}
              >
                Bị từ chối
              </div>

            </div>
          </div>
        </div>

        {/* Hover effect */}
        <style>
          {`
            .hover-bg-light:hover {
              background-color: #f8f9fa;
            }
          `}
        </style>

      </div>
    </>
  );
};

export default ThongBaoPhanCong;
