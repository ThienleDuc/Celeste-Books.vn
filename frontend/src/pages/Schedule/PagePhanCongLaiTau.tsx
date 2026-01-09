// src/pages/PagePhanCongLaiTau.tsx
import { useState, useMemo, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef, GridRowParams } from "@mui/x-data-grid";

import { dataNguoiDung } from "../../models/dataNguoiDung";
import { dataChuyenTau } from "../../models/dataChuyenTau";
import { dataLichTrinh } from "../../models/dataLichTrinh";
import { dataTuyenTau } from "../../models/dataTuyenTau";
import SelectWithScroll from "../../components/SelectWithScroll";
import { useParams } from "react-router-dom";
import { type PhanCongLaiTau, dataPhanCongLaiTau } from "../../models/dataPhanCongLaiTau";
import { Helmet } from "react-helmet";

const PagePhanCongLaiTau = () => {
  // LẤY PARAMS ĐÚNG CHUẨN
  const { maChuyenTau, maLichTrinhPhanCong } = useParams<{
    maChuyenTau: string;
    maLichTrinhPhanCong: string;
  }>();

  // LẤY ĐÚNG THÔNG TIN TUYẾN
  const maLichTrinh = dataChuyenTau.find((ct) => ct.maChuyenTau === maChuyenTau)?.maLichTrinh;
  const maTuyen = dataLichTrinh.find((l) => l.maLichTrinh === maLichTrinh)?.maTuyen;
  const tenTuyen = dataTuyenTau.find((tt) => tt.maTuyen === maTuyen)?.tenTuyen || "";

  // LỌC THEO MÃ LỊCH TRÌNH PHÂN CÔNG TỪ URL
  const filteredByLichTrinh = dataPhanCongLaiTau.filter(
    (r) => r.maLichTrinhPhanCong === maLichTrinhPhanCong
  );

  // MAP THÊM TÊN NGƯỜI DÙNG & TÊN CHUYẾN TÀU
  const rowsWithNames = filteredByLichTrinh.map((r) => ({
    ...r,
    tenNguoiDung:
      dataNguoiDung.find((u) => u.maNguoiDung === r.maNguoiDung)?.hoTen || "",
    tenChuyenTau: maChuyenTau || "", // QUAN TRỌNG
  }));

  const [rows, setRows] = useState<PhanCongLaiTau[]>(rowsWithNames);

  const [formData, setFormData] = useState<PhanCongLaiTau>({
    maPhanCong: "",
    maLichTrinhPhanCong: "",
    maNguoiDung: 0,
    loaiNhanVien: "",
    thoiDiemBatDau: "",
    thoiDiemKetThuc: "",
    trangThai: true,
  });

  const [isEdit, setIsEdit] = useState(false);
  const [searchText, setSearchText] = useState("");

  // TẠO MÃ PHÂN CÔNG MỚI
  const generateMaPhanCong = () => {
    if (rows.length === 0) return "PC01";
    const maxNumber = Math.max(
      ...rows.map((r) => parseInt(r.maPhanCong.replace("PC", ""), 10))
    );
    return `PC${String(maxNumber + 1).padStart(2, "0")}`;
  };

  // RESET FORM KHI ADD
  const resetFormForAdd = () => {
    setFormData({
      maPhanCong: generateMaPhanCong(),
      maLichTrinhPhanCong: maLichTrinhPhanCong ?? "",
      maNguoiDung: 0,
      loaiNhanVien: "",
      thoiDiemBatDau: "",
      thoiDiemKetThuc: "",
      trangThai: true,
    });
    setIsEdit(false);
  };

  // LOAD LẠI FORM KHI PARAMS THAY ĐỔI
  useEffect(() => {
    resetFormForAdd();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // LỌC SEARCH
    const filteredRows = useMemo(() => {
        return rowsWithNames.filter(
            (row) =>
            row.maPhanCong.toLowerCase().includes(searchText.toLowerCase()) ||
            row.tenNguoiDung.toLowerCase().includes(searchText.toLowerCase())
        );
    }, [rowsWithNames, searchText]);

  // CỘT
  const columns: GridColDef[] = [
    { field: "maPhanCong", headerName: "Mã PC", flex: 1 },
    { field: "tenChuyenTau", headerName: "Chuyến Tàu", flex: 1 },
    { field: "tenNguoiDung", headerName: "Người Thực Hiện", flex: 1.5 },
    { field: "loaiNhanVien", headerName: "Loại NV", flex: 1 },
    { field: "thoiDiemBatDau", headerName: "Bắt Đầu", flex: 1.3 },
    { field: "thoiDiemKetThuc", headerName: "Kết Thúc", flex: 1.3 },
    { field: "trangThai", headerName: "Trạng Thái", type: "boolean", flex: 0.7 },
  ];

  // CLICK ROW
  const handleRowClick = (row: PhanCongLaiTau) => {
    setFormData(row);
    setIsEdit(true);
  };

  // CRUD
    const handleAdd = () => {
        setRows([...rows, formData]);
        resetFormForAdd();
    };

    const handleUpdate = () => {
        setRows(
            rows.map((r) =>
            r.maPhanCong === formData.maPhanCong
                ? { ...r, ...formData }
                : r
            )
        );
        resetFormForAdd();
    };

  const handleDelete = () => {
    setRows(rows.filter((r) => r.maPhanCong !== formData.maPhanCong));
    resetFormForAdd();
  };

  const [showModal, setShowModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState<PhanCongLaiTau | null>(null);

  return (
    <>
    <Helmet>
        <title>Quản lý Phân Công Lái Tàu</title>
    </Helmet>
    <div className="container mt-4">
      <h3>Quản lý Phân Công Lái Tàu</h3>
      <p>
        Hệ thống quản lý phân công cho tuyến <b>{tenTuyen}</b> – Chuyến tàu: {" "}
        <b>{maChuyenTau}</b>
      </p>

      <div className="row">
        {/* Form */}
        <div className="col-md-4">
            {/* Thanh tìm kiếm */}
            <div className="input-group mb-3">
                <span className="input-group-text">
                    <i className="bi bi-search"></i>
                </span>
                <input
                    type="text"
                    className="form-control"
                    placeholder="Tìm kiếm phân công..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                />
            </div>
          <div className="card">
            <div className="card-header text-center">Tạo mới / Sửa / Xóa</div>
            <div className="card-body">

              {/* Mã PC */}
              <input className="form-control mb-2" value={formData.maPhanCong} readOnly />

              {/* CHUYẾN TÀU */}
              <input
                type="text"
                className="form-control mb-2"
                value={maChuyenTau || ""}
                readOnly
              />

              {/* Loại nhân viên */}
            <div className="mt-2">
                <SelectWithScroll
                    options={[
                    { value: "Lái tàu chính", label: "Lái tàu chính" },
                    { value: "Phụ lái", label: "Phụ lái" },
                    ]}
                    value={formData.loaiNhanVien}
                    onChange={(val) =>
                    setFormData({ ...formData, loaiNhanVien: val as string })
                    }
                    placeholder="-- Chọn Loại Nhân Viên --"
                />
            </div>


              {/* Thời điểm Bắt Đầu */}
            <div className="mt-2">
                <label className="form-label">Giờ Bắt Đầu</label>
                <input
                    type="datetime-local"
                    className="form-control"
                    value={formData.thoiDiemBatDau}
                    onChange={(e) =>
                    setFormData({ ...formData, thoiDiemBatDau: e.target.value })
                    }
                />
            </div>

                {/* Thời điểm Kết Thúc */}
            <div className="mt-2">
                <label className="form-label">Giờ Kết Thúc</label>
                <input
                    type="datetime-local"
                    className="form-control"
                    value={formData.thoiDiemKetThuc}
                    onChange={(e) =>
                    setFormData({ ...formData, thoiDiemKetThuc: e.target.value })
                    }
                />
            </div>

              {/* Trạng thái */}
              <div className="form-check mt-2">
                <input
                  id="trang-thai"
                  className="form-check-input"
                  type="checkbox"
                  checked={formData.trangThai}
                  onChange={(e) =>
                    setFormData({ ...formData, trangThai: e.target.checked })
                  }
                />
                <label className="form-check-label" htmlFor="trang-thai">Hoàn Thành</label>
              </div>

              {/* Buttons */}
              <div className="d-flex gap-2 mt-3">
                <button className="btn btn-secondary flex-fill" onClick={resetFormForAdd}>
                  <i className="bi bi-arrow-clockwise me-1"></i> Reload
                </button>

                <button className="btn btn-primary flex-fill" onClick={handleAdd} disabled={isEdit}>
                  <i className="bi bi-plus-lg me-1"></i> Thêm
                </button>

                <button className="btn btn-success flex-fill" onClick={handleUpdate} disabled={!isEdit}>
                  <i className="bi bi-pencil-square me-1"></i> Sửa
                </button>

                <button className="btn btn-danger flex-fill" onClick={handleDelete} disabled={!isEdit}>
                  <i className="bi bi-trash me-1"></i> Xóa
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bảng */}
        <div className="col-md-8">
          <DataGrid
            rows={filteredRows.map((r) => ({ ...r, id: r.maPhanCong }))}
            columns={columns}
            pageSizeOptions={[5, 10]}
            initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
            onRowClick={(params: GridRowParams) => handleRowClick(params.row)}
            onRowDoubleClick={(params) => {
                    setSelectedRow(params.row);
                    setShowModal(true);
            }}
          />
        </div>
      </div>
      {showModal && selectedRow && (
        (() => {
          // Map thêm tên người dùng ngay trong modal
          const mappedRow = {
            ...selectedRow,
            tenNguoiDung: dataNguoiDung.find(u => u.maNguoiDung === selectedRow.maNguoiDung)?.hoTen || "",
            tenChuyenTau: maChuyenTau || "",
          };

          return (
            <div
              className="modal fade show d-block"
              tabIndex={-1}
              style={{ background: "rgba(0,0,0,0.5)" }}
              onClick={() => setShowModal(false)}
            >
              <div
                className="modal-dialog modal-lg"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-content">

                  {/* HEADER */}
                  <div className="modal-header">
                    <h5 className="modal-title">Chi tiết phân công lái tàu</h5>
                    <button className="btn-close" onClick={() => setShowModal(false)}></button>
                  </div>

                  {/* BODY */}
                  <div className="modal-body">
                    <div className="row">

                      {/* CỘT TRÁI */}
                      <div className="col-6 border-end">
                        <h6 className="fw-bold mb-3">Thông tin phân công</h6>

                        <label className="form-label">Mã phân công</label>
                        <input className="form-control mb-3" value={mappedRow.maPhanCong} readOnly />

                        <label className="form-label">Mã lịch trình phân công</label>
                        <input className="form-control mb-3" value={mappedRow.maLichTrinhPhanCong} readOnly />

                        <label className="form-label">Tên chuyến tàu</label>
                        <input className="form-control mb-3" value={mappedRow.tenChuyenTau} readOnly />

                        <label className="form-label">Loại nhân viên</label>
                        <input className="form-control mb-3" value={mappedRow.loaiNhanVien} readOnly />
                      </div>

                      {/* CỘT PHẢI */}
                      <div className="col-6">
                        <h6 className="fw-bold mb-3">Thời gian & trạng thái</h6>

                        <label className="form-label">Người được phân công</label>
                        <input className="form-control mb-3" value={`${mappedRow.maNguoiDung} - ${mappedRow.tenNguoiDung}`} readOnly />

                        <label className="form-label">Thời điểm bắt đầu</label>
                        <input className="form-control mb-3" value={mappedRow.thoiDiemBatDau} readOnly />

                        <label className="form-label">Thời điểm kết thúc</label>
                        <input className="form-control mb-3" value={mappedRow.thoiDiemKetThuc || ""} readOnly />

                        <label className="form-label">Trạng thái</label>
                        <input className="form-control mb-3" value={mappedRow.trangThai ? "Đã hoàn thành" : "Chưa hoàn thành"} readOnly />
                      </div>

                    </div>
                  </div>

                </div>
              </div>
            </div>
          );
        })()
      )}

    </div>
    </>
  );
};

export default PagePhanCongLaiTau;
