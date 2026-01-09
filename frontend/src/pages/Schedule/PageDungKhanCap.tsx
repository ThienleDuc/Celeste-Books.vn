import { useState, useMemo, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef, GridRowParams } from "@mui/x-data-grid";
import { dataChuyenTau } from "../../models/dataChuyenTau";
import { dataNguoiDung } from "../../models/dataNguoiDung";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet";

interface DungKhanCap {
  maDungKhanCap: string;
  maChuyenTau: string;
  nguoiBao: number;
  ngayBao: string;
  huongDiChuyen: string;
  thoiGianDung: string;
  lyDo: string;
  thoiGianDenThucTe?: string;
  nguoiXuLy?: number;
  trangThaiXuLy: string;
  ngayXuLy?: string;
}

const PageDungKhanCap = () => {
  const { maChuyenTau } = useParams<{ maChuyenTau: string }>();

  const rawRows: DungKhanCap[] = [
  {
    maDungKhanCap: "DKC01",
    maChuyenTau: "101225-01-01",
    nguoiBao: 1,
    ngayBao: "2025-12-03T08:00",
    huongDiChuyen: "Hướng A",
    thoiGianDung: "2025-12-03T08:15",
    lyDo: "Sự cố kỹ thuật",
    thoiGianDenThucTe: "2025-12-03T09:00",
    nguoiXuLy: 2,
    trangThaiXuLy: "Đang xử lý",
    ngayXuLy: "2025-12-03T09:05",
  },
  {
    maDungKhanCap: "DKC02",
    maChuyenTau: "101225-01-02",
    nguoiBao: 2,
    ngayBao: "2025-12-04T10:30",
    huongDiChuyen: "Hướng B",
    thoiGianDung: "2025-12-04T10:45",
    lyDo: "Vấn đề tín hiệu",
    thoiGianDenThucTe: "2025-12-04T11:15",
    nguoiXuLy: 3,
    trangThaiXuLy: "Chưa xử lý",
    ngayXuLy: "",
  },
  {
    maDungKhanCap: "DKC03",
    maChuyenTau: "101225-01-03",
    nguoiBao: 3,
    ngayBao: "2025-12-05T14:20",
    huongDiChuyen: "Hướng C",
    thoiGianDung: "2025-12-05T14:30",
    lyDo: "Hỏng động cơ",
    thoiGianDenThucTe: "2025-12-05T15:10",
    nguoiXuLy: 1,
    trangThaiXuLy: "Đang xử lý",
    ngayXuLy: "2025-12-05T15:15",
  },
];


  // Ánh xạ tên
  const rowsWithNames = rawRows.map(r => ({
    ...r,
    tenChuyenTau: dataChuyenTau.find(ct => ct.maChuyenTau === r.maChuyenTau)?.maChuyenTau || "",
    tenNguoiBao: dataNguoiDung.find(u => u.maNguoiDung === r.nguoiBao)?.hoTen || "",
    tenNguoiXuLy: dataNguoiDung.find(u => u.maNguoiDung === r.nguoiXuLy)?.hoTen || "",
  }));

  const [rows, setRows] = useState<DungKhanCap[]>(rowsWithNames);

  const [formData, setFormData] = useState<DungKhanCap>({
    maDungKhanCap: "",
    maChuyenTau: maChuyenTau || "",
    nguoiBao: 0,
    ngayBao: new Date().toISOString().slice(0,16),
    huongDiChuyen: "",
    thoiGianDung: new Date().toISOString().slice(0,16),
    lyDo: "",
    thoiGianDenThucTe: "",
    nguoiXuLy: undefined,
    trangThaiXuLy: "",
    ngayXuLy: "",
  });

  const [isEdit, setIsEdit] = useState(false);
  const [searchText, setSearchText] = useState("");

  const generateMaDungKhanCap = () => {
    if (rows.length === 0) return "DKC01";
    const maxNumber = Math.max(...rows.map(r => parseInt(r.maDungKhanCap.replace("DKC", ""), 10)));
    return `DKC${(maxNumber + 1).toString().padStart(2, "0")}`;
  };

  const resetFormForAdd = () => {
    setFormData({
      ...formData,
      maDungKhanCap: generateMaDungKhanCap(),
      maChuyenTau: maChuyenTau || "",
      ngayBao: new Date().toISOString().slice(0,16),
      thoiGianDung: new Date().toISOString().slice(0,16),
      nguoiBao: 0,
      huongDiChuyen: "",
      lyDo: "",
      trangThaiXuLy: "",
      nguoiXuLy: undefined,
      thoiGianDenThucTe: "",
      ngayXuLy: "",
    });
    setIsEdit(false);
  };

  const filteredRows = useMemo(() => {
    const text = searchText.toLowerCase();
    return rowsWithNames.filter(r =>
      r.maChuyenTau === maChuyenTau &&
      (
        r.maDungKhanCap.toLowerCase().includes(text) ||
        r.tenChuyenTau.toLowerCase().includes(text) ||
        r.tenNguoiBao.toLowerCase().includes(text) ||
        r.tenNguoiXuLy?.toLowerCase().includes(text) ||
        r.lyDo.toLowerCase().includes(text)
      )
    );
  }, [rowsWithNames, searchText, maChuyenTau]);

  const columns: GridColDef[] = [
    { field: "maDungKhanCap", headerName: "Mã Dừng KC", flex: 1 },
    { field: "tenChuyenTau", headerName: "Mã Chuyến Tàu", flex: 1.2 },
    { field: "tenNguoiBao", headerName: "Người Báo", flex: 1 },
    { field: "ngayBao", headerName: "Ngày Báo", flex: 1.2 },
    { field: "huongDiChuyen", headerName: "Hướng Di Chuyển", flex: 1.2 },
    { field: "thoiGianDung", headerName: "Thời Gian Dừng", flex: 1.2 },
    { field: "lyDo", headerName: "Lý Do", flex: 1.5 },
    { field: "tenNguoiXuLy", headerName: "Người Xử Lý", flex: 1 },
    { field: "trangThaiXuLy", headerName: "Trạng Thái Xử Lý", flex: 1 },
  ];

  const handleRowClick = (row: DungKhanCap) => {
    setFormData(row);
    setIsEdit(true);
  };

  const handleAdd = () => {
    setRows([...rows, formData]);
    resetFormForAdd();
  };

  const handleUpdate = () => {
    setRows(rows.map(r => (r.maDungKhanCap === formData.maDungKhanCap ? formData : r)));
    resetFormForAdd();
  };

  const handleDelete = () => {
    setRows(rows.filter(r => r.maDungKhanCap !== formData.maDungKhanCap));
    resetFormForAdd();
  };

  useEffect(() => {
    resetFormForAdd();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

    const [showModal, setShowModal] = useState(false);
    const [selectedRow, setSelectedRow] = useState<DungKhanCap | null>(null);

  return (
    <>
      <Helmet>
        <title>Quản Lý Dừng Khẩn Cấp</title>
      </Helmet>
      <div className="container mt-4">
        <h3>Quản lý Dừng Khẩn Cấp</h3>

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

                <input type="text" className="form-control mb-2" placeholder="Mã Dừng KC" value={formData.maDungKhanCap} readOnly />
                <input type="text" className="form-control mb-2" placeholder="Mã Chuyến Tàu" value={formData.maChuyenTau} readOnly />
                <input type="text" className="form-control mb-2" placeholder="Hướng Di Chuyển" value={formData.huongDiChuyen} onChange={e => setFormData({ ...formData, huongDiChuyen: e.target.value })} />
                <input type="datetime-local" className="form-control mb-2" placeholder="Thời Gian Dừng" value={formData.thoiGianDung} onChange={e => setFormData({ ...formData, thoiGianDung: e.target.value })} />
                <input type="text" className="form-control mb-2" placeholder="Lý Do" value={formData.lyDo} onChange={e => setFormData({ ...formData, lyDo: e.target.value })} />

                <div className="d-flex gap-2 mt-3">
                  <button className="btn btn-secondary flex-fill" onClick={resetFormForAdd}><i className="bi bi-arrow-clockwise me-1"></i> Reload</button>
                  <button className="btn btn-primary flex-fill" onClick={handleAdd} disabled={isEdit}><i className="bi bi-plus-lg me-1"></i> Thêm</button>
                  <button className="btn btn-success flex-fill" onClick={handleUpdate} disabled={!isEdit}><i className="bi bi-pencil-square me-1"></i> Sửa</button>
                  <button className="btn btn-danger flex-fill" onClick={handleDelete} disabled={!isEdit}><i className="bi bi-trash me-1"></i> Xóa</button>
                </div>

              </div>
            </div>

          </div>

          <div className="col-md-8">
            <DataGrid
              rows={filteredRows.map(r => ({ ...r, id: r.maDungKhanCap }))}
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
              tenNguoiBao: dataNguoiDung.find(u => u.maNguoiDung === selectedRow.nguoiBao)?.hoTen || "",
              tenNguoiXuLy: selectedRow.nguoiXuLy 
                ? dataNguoiDung.find(u => u.maNguoiDung === selectedRow.nguoiXuLy)?.hoTen || ""
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
                      <h5 className="modal-title">Chi tiết dừng khẩn cấp</h5>
                      <button className="btn-close" onClick={() => setShowModal(false)}></button>
                    </div>

                    {/* BODY */}
                    <div className="modal-body">
                      <div className="row">

                        {/* CỘT TRÁI */}
                        <div className="col-4 border-end">
                          <h6 className="fw-bold mb-3">Thông tin cơ bản</h6>

                          <label className="form-label">Mã dừng khẩn cấp</label>
                          <input className="form-control mb-3" value={mappedRow.maDungKhanCap} readOnly />

                          <label className="form-label">Mã chuyến tàu</label>
                          <input className="form-control mb-3" value={mappedRow.tenChuyenTau} readOnly />

                          <label className="form-label">Người báo</label>
                          <input className="form-control mb-3" value={`${mappedRow.nguoiBao} - ${mappedRow.tenNguoiBao}`} readOnly />

                          <label className="form-label">Ngày báo</label>
                          <input className="form-control mb-3" value={mappedRow.ngayBao} readOnly />
                        </div>

                        {/* CỘT GIỮA */}
                        <div className="col-4 border-end">
                          <h6 className="fw-bold mb-3">Chi tiết sự kiện</h6>

                          <label className="form-label">Hướng di chuyển</label>
                          <input className="form-control mb-3" value={mappedRow.huongDiChuyen} readOnly />

                          <label className="form-label">Thời gian dừng</label>
                          <input className="form-control mb-3" value={mappedRow.thoiGianDung} readOnly />

                          <label className="form-label">Thời gian đến thực tế</label>
                          <input className="form-control mb-3" value={mappedRow.thoiGianDenThucTe || ""} readOnly />

                          <label className="form-label">Lý do</label>
                          <textarea className="form-control mb-3" rows={3} value={mappedRow.lyDo} readOnly />
                        </div>

                        {/* CỘT PHẢI */}
                        <div className="col-4">
                          <h6 className="fw-bold mb-3">Thông tin xử lý</h6>

                          <label className="form-label">Người xử lý</label>
                          <input className="form-control mb-3" value={mappedRow.nguoiXuLy ? `${mappedRow.nguoiXuLy} - ${mappedRow.tenNguoiXuLy}` : ""} readOnly />

                          <label className="form-label">Trạng thái xử lý</label>
                          <input className="form-control mb-3" value={mappedRow.trangThaiXuLy} readOnly />

                          <label className="form-label">Ngày xử lý</label>
                          <input className="form-control mb-3" value={mappedRow.ngayXuLy || ""} readOnly />
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

export default PageDungKhanCap;
