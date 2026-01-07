import { Breadcrumbs, Link, Typography } from "@mui/material";
import { useState } from "react";
import { Helmet } from "react-helmet";

const ThongBaoLichTrinh = () => {
  const notiList = [
    {
      maLichTrinh: "LT001",
      tenTuyen: "Tuyến Sài Gòn → Hà Nội",
      trangThaiPheDuyet: "Đã phê duyệt",
      trangThaiHanhDong: "Tạo mới",
      ngayKhoiHanh: "2025-01-15",
      ngayCapNhat: "2025-01-10 14:32",
    },
    {
      maLichTrinh: "LT002",
      tenTuyen: "Tuyến Đà Nẵng → Nha Trang",
      trangThaiPheDuyet: "Chờ phê duyệt",
      trangThaiHanhDong: "Chỉnh sửa",
      ngayKhoiHanh: "2025-01-20",
      ngayCapNhat: "2025-01-12 09:20",
    },
    {
      maLichTrinh: "LT003",
      tenTuyen: "Tuyến Huế → Quảng Ngãi",
      trangThaiPheDuyet: "Bị từ chối",
      trangThaiHanhDong: "Hủy bỏ",
      ngayKhoiHanh: "2025-02-02",
      ngayCapNhat: "2025-01-11 17:40",
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

  const getActionColor = (action: string) => {
    switch (action) {
      case "Tạo mới":
        return "text-success fw-semibold";
      case "Chỉnh sửa":
        return "text-primary fw-semibold";
      case "Hủy bỏ":
        return "text-danger fw-semibold";
      default:
        return "text-muted";
    }
  };

  return (
    <>
      <Helmet>
        <title>Thông Báo Lịch Trình</title>
      </Helmet>
      <div className="container my-4">
        <div className="mb-4">
          <h5 className="fw-bold title-page">
            Thông báo lịch trình
          </h5>

          <Breadcrumbs aria-label="breadcrumb" className="mb-1">
            <Link underline="hover" color="inherit" href="/">
              Trang chủ
            </Link>
            <Typography color="text.primary">
              Thông báo lịch trình
            </Typography>
          </Breadcrumbs>
        </div>

        <div className="row">
          {/* LEFT SIDE — TABLE */}
          <div className="col-9">

            {/* Header */}
            <div className="row bg-dark text-white fw-bold py-2 rounded-top g-0">
              <div className="col-8 text-center">NỘI DUNG</div>
              <div className="col-4 text-center">THỜI GIAN</div>
            </div>

            {/* BODY */}
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
                    key={item.maLichTrinh}
                    className="row g-0 border-top hover-bg-light"
                    style={{ cursor: "pointer" }}
                  >
                    {/* CONTENT */}
                    <div className="col-8 p-3">
                      <div className="fw-bold mb-1">{item.tenTuyen}</div>

                      <span className={getBadgeClass(item.trangThaiPheDuyet)}>
                        {item.trangThaiPheDuyet}
                      </span>

                      <div className="text-muted small mt-1">
                        Chuyến tàu sẽ khởi hành vào ngày {item.ngayKhoiHanh} —{" "}
                        <span className={getActionColor(item.trangThaiHanhDong)}>
                          {item.trangThaiHanhDong}
                        </span>
                      </div>

                      <a
                        href={`/lich-trinh/${item.maLichTrinh}`}
                        className="d-block mt-1 small fw-semibold text-decoration-none text-primary"
                      >
                        Xem chi tiết
                      </a>
                    </div>

                    {/* TIME */}
                    <div className="col-4 p-3 text-end text-muted small">
                      {item.ngayCapNhat}
                    </div>
                  </div>
                ))}
              </div>

            </div>

          </div>

          {/* RIGHT SIDE — FILTER BOX */}
          <div className="col-3">
            <div className="border rounded p-3 bg-light">

              <h6 className="fw-bold mb-3">Bộ lọc trạng thái</h6>

              <div
                className={`filter-item p-2 rounded mb-2 ${
                  filter === "Tất cả" ? "bg-primary text-white" : "bg-white"
                }`}
                style={{ cursor: "pointer" }}
                onClick={() => setFilter("Tất cả")}
              >
                Tất cả
              </div>

              <div
                className={`filter-item p-2 rounded mb-2 ${
                  filter === "Đã phê duyệt" ? "bg-success text-white" : "bg-white"
                }`}
                style={{ cursor: "pointer" }}
                onClick={() => setFilter("Đã phê duyệt")}
              >
                Đã phê duyệt
              </div>

              <div
                className={`filter-item p-2 rounded mb-2 ${
                  filter === "Chờ phê duyệt" ? "bg-warning text-white" : "bg-white"
                }`}
                style={{ cursor: "pointer" }}
                onClick={() => setFilter("Chờ phê duyệt")}
              >
                Chờ phê duyệt
              </div>

              <div
                className={`filter-item p-2 rounded mb-2 ${
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

        {/* Hover style */}
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

export default ThongBaoLichTrinh;
