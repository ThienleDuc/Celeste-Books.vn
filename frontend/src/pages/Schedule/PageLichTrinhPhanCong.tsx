// src/pages/PageLichTrinhPhanCong.tsx
import { useState, useMemo, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef, GridRowParams } from "@mui/x-data-grid";
import SelectWithScroll from "../../components/SelectWithScroll";
import { useNavigate, useParams } from "react-router-dom";

import { dataChuyenTau } from "../../models/dataChuyenTau";
import { dataNguoiDung } from "../../models/dataNguoiDung";
import { dataLichTrinh } from "../../models/dataLichTrinh";
import { dataTuyenTau } from "../../models/dataTuyenTau";
import { type LichTrinhPhanCong, dataPhanCong } from "../../models/dataLichTrinhPhanCong";
import { Helmet } from "react-helmet";

const PageLichTrinhPhanCong = () => {
const { maChuyenTau } = useParams<{ maChuyenTau: string }>();

  const rowsWithNames = dataPhanCong.map((r) => ({
    ...r,
    tenChuyenTau:
      dataChuyenTau.find((ct) => ct.maChuyenTau === r.maChuyenTau)?.maChuyenTau ||
      "",
    tenNguoiTao:
      dataNguoiDung.find((u) => u.maNguoiDung === r.nguoiTao)?.hoTen || "",
  }));

  const [rows, setRows] = useState<LichTrinhPhanCong[]>(rowsWithNames);

  const [formData, setFormData] = useState<LichTrinhPhanCong>({
    maLichTrinhPhanCong: "",
    maChuyenTau: maChuyenTau ? maChuyenTau : "",
    nguoiTao: 0,
    trangThai: "Tạo mới",
    ghiChu: "",
    ngayCapNhat: new Date().toISOString(),
    trangThaiPheDuyet: "Chưa duyệt",
    nguoiPheDuyet: null,
    ngayPheDuyet: "",
    ghiChuPheDuyet: "",
  });

  const [isEdit, setIsEdit] = useState(false);
  const [searchText, setSearchText] = useState("");

  const generateMaPhanCong = (): string => {
    if (rows.length === 0) return "PC01";
    const maxNumber = Math.max(
      ...rows.map((r) =>
        parseInt(r.maLichTrinhPhanCong.replace("PC", ""), 10)
      )
    );
    return `PC${(maxNumber + 1).toString().padStart(2, "0")}`;
  };

  const resetFormForAdd = () => {
    setFormData({
      maLichTrinhPhanCong: generateMaPhanCong(),
      maChuyenTau: maChuyenTau ? maChuyenTau : "",
      nguoiTao: 0,
      trangThai: "Tạo mới",
      ghiChu: "",
      ngayCapNhat: new Date().toISOString(),
      trangThaiPheDuyet: "Chưa duyệt",
      nguoiPheDuyet: null,
      ngayPheDuyet: "",
      ghiChuPheDuyet: "",
    });
    setIsEdit(false);
  };

  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
        const chuyenTau = dataChuyenTau.find(ct => ct.maChuyenTau === r.maChuyenTau);
        const lichTrinh = chuyenTau 
        ? dataLichTrinh.find(lt => lt.maLichTrinh === chuyenTau.maLichTrinh)
        : null;
        const tenTuyen = lichTrinh 
        ? dataTuyenTau.find(tt => tt.maTuyen === lichTrinh.maTuyen)?.tenTuyen || "" 
        : "";
        const tenNguoiTao = dataNguoiDung.find(u => u.maNguoiDung === r.nguoiTao)?.hoTen || "";

        const lowerSearch = searchText.toLowerCase();
        return (
        r.maLichTrinhPhanCong.toLowerCase().includes(lowerSearch) ||
        (chuyenTau?.maChuyenTau.toLowerCase().includes(lowerSearch)) || // có thể dùng tên chuyến nếu có
        tenTuyen.toLowerCase().includes(lowerSearch) ||
        tenNguoiTao.toLowerCase().includes(lowerSearch) || r.maChuyenTau === maChuyenTau
        );
    });
}, [maChuyenTau, rows, searchText]);

const navigate = useNavigate();

  const columns: GridColDef[] = [
    { field: "maLichTrinhPhanCong", headerName: "Mã PC", flex: 1 },
    { field: "tenChuyenTau", headerName: "Chuyến Tàu", flex: 1.2 },
    { field: "tenNguoiTao", headerName: "Người Tạo", flex: 1.2 },
    { field: "trangThai", headerName: "Trạng Thái", flex: 1 },
    { field: "ngayCapNhat", headerName: "Ngày Cập Nhật", flex: 1.3 },
    { field: "trangThaiPheDuyet", headerName: "TT Phê Duyệt", flex: 1.2 },
    {
        field: "phanCong",
        headerName: "Phân Công",
        flex: 1.3,
        sortable: false,
        filterable: false,
        renderCell: (params) => (
            <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => {
                const maChuyenTau = params.row.maChuyenTau;
                const maLichTrinhPhanCong = params.row.maLichTrinhPhanCong;
                navigate(`/chuyen-tau/lich-trinh/${maChuyenTau}/phan-cong/${maLichTrinhPhanCong}`);
            }}
            >
            <i className="bi bi-person-plus"></i> Phân công 
            </button>
        ),
    }
  ];

  const handleRowClick = (row: LichTrinhPhanCong) => {
    setFormData(row);
    setIsEdit(true);
    };

    const handleAdd = () => {
    setRows([...rows, formData]);
    resetFormForAdd();
    };

    const handleUpdate = () => {
    setRows(
        rows.map(r => 
        r.maLichTrinhPhanCong === formData.maLichTrinhPhanCong ? formData : r
        )
    );
    resetFormForAdd();
    };

    const handleDelete = () => {
    setRows(
        rows.filter(r => r.maLichTrinhPhanCong !== formData.maLichTrinhPhanCong)
    );
    resetFormForAdd();
    };


  useEffect(() => {
    resetFormForAdd();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [showModal, setShowModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState<LichTrinhPhanCong | null>(null);

  return (
    <>
    <Helmet>
        <title>Quản lý Phân Công Lịch Trình</title>
    </Helmet>
    <div className="container mt-4">
      <h3>Quản lý Phân Công Lịch Trình</h3>
      <p>Hệ thống quản lý phân công lịch trình tàu</p>

      <div className="row">
        {/* Cột trái: Form */}
        <div className="col-md-4">
          <div className="input-group mb-3">
            <span className="input-group-text">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Tìm kiếm..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>

            <div className="card">
                <div className="card-header text-center">Tạo mới / Sửa / Xóa</div>
                <div className="card-body">
                <input
                    type="text"
                    className="form-control mb-2"
                    placeholder="Mã PC"
                    value={formData.maLichTrinhPhanCong}
                    readOnly
                />

                <SelectWithScroll
                    options={dataChuyenTau.map((ct) => ({
                    value: ct.maChuyenTau,
                    label: ct.maChuyenTau,
                    }))}
                    value={formData.maChuyenTau === maChuyenTau ? maChuyenTau : ""}
                    onChange={(val) =>
                    setFormData({ ...formData, maChuyenTau: val as string })
                    }
                    placeholder="-- Chọn Chuyến Tàu --"
                    isDisabled
                />

                <textarea
                    className="form-control mt-2"
                    placeholder="Ghi chú"
                    rows={2}
                    value={formData.ghiChu}
                    onChange={(e) =>
                    setFormData({ ...formData, ghiChu: e.target.value })
                    }
                />

                <div className="d-flex gap-2 mt-3">
                    <button
                    className="btn btn-secondary flex-fill"
                    onClick={resetFormForAdd}
                    >
                    <i className="bi bi-arrow-clockwise me-1"></i>Reload
                    </button>
                    <button
                    className="btn btn-primary flex-fill"
                    onClick={handleAdd}
                    disabled={isEdit}
                    >
                    <i className="bi bi-plus-lg me-1"></i>Thêm
                    </button>
                    <button
                    className="btn btn-success flex-fill"
                    onClick={handleUpdate}
                    disabled={!isEdit}
                    >
                    <i className="bi bi-pencil-square me-1"></i>Sửa
                    </button>
                    <button
                    className="btn btn-danger flex-fill"
                    onClick={handleDelete}
                    disabled={!isEdit}
                    >
                    <i className="bi bi-trash me-1"></i>Xóa
                    </button>
                </div>
            </div>
          </div>
        </div>

        {/* Cột phải: DataGrid */}
        <div className="col-md-8">
          <DataGrid
            rows={filteredRows.map((r) => ({
              ...r,
              id: r.maLichTrinhPhanCong,
            }))}
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
          // Map thêm tên ngay trong modal
          const mappedRow = {
            ...selectedRow,
            tenNguoiTao: dataNguoiDung.find(u => u.maNguoiDung === selectedRow.nguoiTao)?.hoTen || "",
          };

          return (
            <div
              className="modal fade show d-block"
              tabIndex={-1}
              style={{ background: "rgba(0,0,0,0.5)" }}
              onClick={() => setShowModal(false)}
            >
              <div
                className="modal-dialog modal-xl"
                onClick={e => e.stopPropagation()}
              >
                <div className="modal-content">

                  {/* HEADER */}
                  <div className="modal-header">
                    <h5 className="modal-title">Chi tiết lịch trình phân công</h5>
                    <button className="btn-close" onClick={() => setShowModal(false)}></button>
                  </div>

                  {/* BODY */}
                  <div className="modal-body">
                    <div className="row">

                      {/* CỘT TRÁI: Thông tin chung */}
                      <div className="col-4 border-end">
                        <h6 className="fw-bold mb-3">Thông tin chung</h6>

                        <label className="form-label">Mã lịch trình phân công</label>
                        <input className="form-control mb-3" value={mappedRow.maLichTrinhPhanCong} readOnly />

                        <label className="form-label">Mã chuyến tàu</label>
                        <input className="form-control mb-3" value={mappedRow.maChuyenTau} readOnly />

                        <label className="form-label">Tên chuyến tàu</label>
                        <input className="form-control mb-3" value={mappedRow.maChuyenTau} readOnly />

                        <label className="form-label">Ghi chú</label>
                        <textarea className="form-control" rows={5} value={mappedRow.ghiChu} readOnly />
                      </div>

                      {/* CỘT GIỮA: Thông tin xử lý */}
                      <div className="col-4 border-end">
                        <h6 className="fw-bold mb-3">Thông tin xử lý</h6>

                        <label className="form-label">Người tạo (ID)</label>
                        <input className="form-control mb-3" value={mappedRow.nguoiTao} readOnly />

                        <label className="form-label">Người tạo (Tên)</label>
                        <input className="form-control mb-3" value={mappedRow.tenNguoiTao} readOnly />

                        <label className="form-label">Ngày cập nhật</label>
                        <input className="form-control mb-3" value={mappedRow.ngayCapNhat} readOnly />

                        <label className="form-label">Trạng thái</label>
                        <input className="form-control mb-3" value={mappedRow.trangThai} readOnly />
                      </div>

                      {/* CỘT PHẢI: Thông tin phê duyệt */}
                      <div className="col-4">
                        <h6 className="fw-bold mb-3">Thông tin phê duyệt</h6>

                        <label className="form-label">Trạng thái phê duyệt</label>
                        <input className="form-control mb-3" value={mappedRow.trangThaiPheDuyet} readOnly />

                        <label className="form-label">Người phê duyệt (ID)</label>
                        <input className="form-control mb-3" value={mappedRow.nguoiPheDuyet || ""} readOnly />

                        <label className="form-label">Ngày phê duyệt</label>
                        <input className="form-control mb-3" value={mappedRow.ngayPheDuyet || ""} readOnly />

                        <label className="form-label">Ghi chú phê duyệt</label>
                        <textarea className="form-control" rows={4} value={mappedRow.ghiChuPheDuyet || ""} readOnly />
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

export default PageLichTrinhPhanCong;
