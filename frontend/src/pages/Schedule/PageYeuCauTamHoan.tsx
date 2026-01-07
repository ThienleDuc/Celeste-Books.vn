import { useState, useMemo, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef, GridRowParams } from "@mui/x-data-grid";


import { dataChuyenTau } from "../../models/dataChuyenTau";
import { dataNguoiDung } from "../../models/dataNguoiDung";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet";

interface YeuCauTamHoan {
  maYeuCau: string;
  maChuyenTau: string;
  nguoiTao: number;
  ngayTao: string;
  lyDo: string;
  trangThaiPheDuyet: string;
  nguoiPheDuyet?: number;
  ngayPheDuyet?: string;
  ghiChu?: string;
}

const PageYeuCauTamHoan = () => {
  const { maChuyenTau } = useParams<{ maChuyenTau: string }>();
  const rawRows: YeuCauTamHoan[] = [
  {
    maYeuCau: "YCH01",
    maChuyenTau: "101225-01-01",
    nguoiTao: 1,
    ngayTao: "2025-12-03T08:00",
    lyDo: "Bảo trì",
    trangThaiPheDuyet: "Chưa duyệt",
    nguoiPheDuyet: undefined,
    ngayPheDuyet: undefined,
    ghiChu: "",
  },
  {
    maYeuCau: "YCH02",
    maChuyenTau: "101225-01-02",
    nguoiTao: 2,
    ngayTao: "2025-12-04T09:30",
    lyDo: "Vấn đề tín hiệu",
    trangThaiPheDuyet: "Chưa duyệt",
    nguoiPheDuyet: undefined,
    ngayPheDuyet: undefined,
    ghiChu: "Cần kiểm tra trước khi chạy",
  },
  {
    maYeuCau: "YCH03",
    maChuyenTau: "101225-01-03",
    nguoiTao: 3,
    ngayTao: "2025-12-05T10:15",
    lyDo: "Hỏng động cơ",
    trangThaiPheDuyet: "Đã duyệt",
    nguoiPheDuyet: 1,
    ngayPheDuyet: "2025-12-05T11:00",
    ghiChu: "",
  },
];


 // Ánh xạ trước
    const rowsWithNames = rawRows.map(r => ({
        ...r,
        tenChuyenTau: dataChuyenTau.find(ct => ct.maChuyenTau === r.maChuyenTau)?.maChuyenTau || "",
        tenNguoiTao: dataNguoiDung.find(u => u.maNguoiDung === r.nguoiTao)?.hoTen || "",
        tenNguoiPheDuyet: dataNguoiDung.find(u => u.maNguoiDung === r.nguoiPheDuyet)?.hoTen || "",
    }));

  const [rows, setRows] = useState<YeuCauTamHoan[]>(rowsWithNames);

  const [formData, setFormData] = useState<YeuCauTamHoan>({
    maYeuCau: "",
    maChuyenTau: maChuyenTau ? maChuyenTau : "",
    nguoiTao: 0,
    ngayTao: "",
    lyDo: "",
    trangThaiPheDuyet: "Chưa duyệt",
    nguoiPheDuyet: undefined,
    ngayPheDuyet: "",
    ghiChu: "",
  });

  const [isEdit, setIsEdit] = useState(false);
  const [searchText, setSearchText] = useState("");

  const generateMaYeuCau = () => {
    if (rows.length === 0) return "YCH01";
    const maxNumber = Math.max(...rows.map(r => parseInt(r.maYeuCau.replace("YCH", ""), 10)));
    return `YCH${(maxNumber + 1).toString().padStart(2, "0")}`;
  };

  const resetFormForAdd = () => {
    setFormData({
      maYeuCau: generateMaYeuCau(),
      maChuyenTau: maChuyenTau ? maChuyenTau : "",
      nguoiTao: 0,
      ngayTao: new Date().toISOString().slice(0, 16),
      lyDo: "",
      trangThaiPheDuyet: "Chưa duyệt",
      nguoiPheDuyet: undefined,
      ngayPheDuyet: "",
      ghiChu: "",
    });
    setIsEdit(false);
  };
 
    const filteredRows = useMemo(() => {
    const text = searchText.toLowerCase();
    return rowsWithNames.filter(r =>
        r.maChuyenTau === maChuyenTau && // lọc theo maChuyenTau từ params
        (
        r.maYeuCau.toLowerCase().includes(text) ||
        r.tenChuyenTau.toLowerCase().includes(text) ||
        r.tenNguoiTao.toLowerCase().includes(text) ||
        r.tenNguoiPheDuyet?.toLowerCase().includes(text)
        )
    );
    }, [rowsWithNames, searchText, maChuyenTau]);

  const columns: GridColDef[] = [
    { field: "maYeuCau", headerName: "Mã Yêu Cầu", flex: 1 },
    { field: "tenChuyenTau", headerName: "Mã Chuyến Tàu", flex: 1.4 },
    { field: "tenNguoiTao", headerName: "Người Tạo", flex: 1.2 },
    { field: "lyDo", headerName: "Lý Do", flex: 1.5 },
    { field: "trangThaiPheDuyet", headerName: "Trạng Thái PD", flex: 1 },
    { field: "ghiChu", headerName: "Ghi Chú", flex: 1.5 },
  ];

  const handleRowClick = (row: YeuCauTamHoan) => {
    setFormData(row);
    setIsEdit(true);
  };

  const handleAdd = () => {
    setRows([...rows, formData]);
    resetFormForAdd();
  };

  const handleUpdate = () => {
    setRows(rows.map(r => (r.maYeuCau === formData.maYeuCau ? formData : r)));
    resetFormForAdd();
  };

  const handleDelete = () => {
    setRows(rows.filter(r => r.maYeuCau !== formData.maYeuCau));
    resetFormForAdd();
  };

  useEffect(() => {
    resetFormForAdd();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

      const [showModal, setShowModal] = useState(false);
      const [selectedRow, setSelectedRow] = useState<YeuCauTamHoan | null>(null);

  return (
    <>
    <Helmet>
        <title>Quản lý Yêu Cầu Tạm Hoãn</title>
    </Helmet>
    <div className="container mt-4">
      <h3>Quản lý Yêu Cầu Tạm Hoãn</h3>

      <div className="row">
        <div className="col-md-4">

          <div className="input-group mb-3">
            <span className="input-group-text"><i className="bi bi-search"></i></span>
            <input
              type="text"
              className="form-control"
              placeholder="Tìm kiếm..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
            />
          </div>

          <div className="card">
            <div className="card-header text-center">Tạo mới / Sửa / Xóa</div>
            <div className="card-body">

              <input type="text" className="form-control mb-2" placeholder="Mã Yêu Cầu" value={formData.maYeuCau} readOnly />

              <input
                type="text"
                className="form-control mb-2"
                placeholder="Mã Chuyến Tàu"
                value={formData.maChuyenTau}
                onChange={e => setFormData({ ...formData, maChuyenTau: e.target.value })}
                readOnly
              />

              <input
                type="text"
                className="form-control mb-2"
                placeholder="Lý Do"
                value={formData.lyDo}
                onChange={e => setFormData({ ...formData, lyDo: e.target.value })}
              />

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

        <div className="col-md-8">
          <DataGrid
            rows={filteredRows.map(r => ({ ...r, id: r.maYeuCau }))}
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
          const mappedRow = {
            ...selectedRow,
            tenChuyenTau: dataChuyenTau.find(ct => ct.maChuyenTau === selectedRow.maChuyenTau)?.maChuyenTau || "",
            tenNguoiTao: dataNguoiDung.find(u => u.maNguoiDung === selectedRow.nguoiTao)?.hoTen || "",
            tenNguoiPheDuyet: selectedRow.nguoiPheDuyet
              ? dataNguoiDung.find(u => u.maNguoiDung === selectedRow.nguoiPheDuyet)?.hoTen || ""
              : "",
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
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-content">

                  {/* HEADER */}
                  <div className="modal-header">
                    <h5 className="modal-title">Chi tiết yêu cầu tạm hoãn</h5>
                    <button className="btn-close" onClick={() => setShowModal(false)}></button>
                  </div>

                  {/* BODY */}
                  <div className="modal-body">
                    <div className="row">

                      {/* CỘT TRÁI */}
                      <div className="col-4 border-end">
                        <h6 className="fw-bold mb-3">Thông tin cơ bản</h6>

                        <label className="form-label">Mã yêu cầu</label>
                        <input className="form-control mb-3" value={mappedRow.maYeuCau} readOnly />

                        <label className="form-label">Mã chuyến tàu</label>
                        <input className="form-control mb-3" value={mappedRow.tenChuyenTau} readOnly />

                        <label className="form-label">Người tạo</label>
                        <input className="form-control mb-3" value={`${mappedRow.nguoiTao} - ${mappedRow.tenNguoiTao}`} readOnly />

                        <label className="form-label">Ngày tạo</label>
                        <input className="form-control mb-3" value={mappedRow.ngayTao} readOnly />
                      </div>

                      {/* CỘT GIỮA */}
                      <div className="col-4 border-end">
                        <h6 className="fw-bold mb-3">Chi tiết yêu cầu</h6>

                        <label className="form-label">Lý do tạm hoãn</label>
                        <textarea className="form-control mb-3" rows={5} value={mappedRow.lyDo} readOnly />

                        <label className="form-label">Trạng thái phê duyệt</label>
                        <input className="form-control mb-3" value={mappedRow.trangThaiPheDuyet} readOnly />
                      </div>

                      {/* CỘT PHẢI */}
                      <div className="col-4">
                        <h6 className="fw-bold mb-3">Thông tin phê duyệt</h6>

                        <label className="form-label">Người phê duyệt</label>
                        <input className="form-control mb-3" value={mappedRow.nguoiPheDuyet ? `${mappedRow.nguoiPheDuyet} - ${mappedRow.tenNguoiPheDuyet}` : ""} readOnly />

                        <label className="form-label">Ngày phê duyệt</label>
                        <input className="form-control mb-3" value={mappedRow.ngayPheDuyet || ""} readOnly />

                        <label className="form-label">Ghi chú</label>
                        <textarea className="form-control mb-3" rows={3} value={mappedRow.ghiChu || ""} readOnly />
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

export default PageYeuCauTamHoan;
