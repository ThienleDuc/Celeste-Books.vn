import { useState, useMemo, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef, GridRowParams } from "@mui/x-data-grid";

import SelectWithScroll from "../../components/SelectWithScroll";
import { dataTuyenTau } from "../../models/dataTuyenTau";
import { dataNguoiDung } from "../../models/dataNguoiDung";
import { dataGaTau } from "../../models/dataGaTau";
import { useNavigate } from "react-router-dom";
import { type LichTrinhTheoNgay, dataLichTrinh } from "../../models/dataLichTrinh";
import { Helmet } from "react-helmet";

const PageLichTrinhTheoNgay = () => {
  const mapRowsWithNames = dataLichTrinh.map(r => ({
      ...r,
      tenTuyen: dataTuyenTau.find(t => t.maTuyen === r.maTuyen)?.tenTuyen || "",
      tenNguoiTao: dataNguoiDung.find(u => u.maNguoiDung === r.nguoiTao)?.hoTen || "",
    }));

  const [rows, setRows] = useState<LichTrinhTheoNgay[]>(mapRowsWithNames);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState<LichTrinhTheoNgay>({
  maLichTrinh: "",
  maTuyen: "",
  ngayKhoiHanh: "",
  nguoiTao: 0,              
  ngayCapNhat: "",
  trangThai: "",
  trangThaiPheDuyet: "",
  nguoiPheDuyet: "",       
  ngayPheDuyet: "",
  ghiChuPheDuyet: "",
  ghiChu: ""
});


  const generateMaLichTrinh = (ngayKhoiHanh: string, index: number) => {
    const date = new Date(ngayKhoiHanh);
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yy = String(date.getFullYear()).slice(-2);
    const seq = String(index + 1).padStart(2, "0");
    return `${dd}${mm}${yy}-${seq}`;
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    return now.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
  };

  const resetFormForAdd = () => {
    setFormData({
      maLichTrinh: "",
      maTuyen: "",
      ngayKhoiHanh: "",
      nguoiTao: 0, // number
      ngayCapNhat: getCurrentDateTime(),
      trangThai: "Tạo mới",
      trangThaiPheDuyet: "Tạo mới, Chưa phê duyệt",
      nguoiPheDuyet: "",
      ngayPheDuyet: "",
      ghiChuPheDuyet: "",
      ghiChu: ""
    });
    setIsEdit(false);
  };


  const handleAdd = () => {
    // Tạo mã lịch trình tự động theo ngày khởi hành và số thứ tự
    const sameDateCount = rows.filter(r => r.ngayKhoiHanh === formData.ngayKhoiHanh).length;
    const maLichTrinh = generateMaLichTrinh(formData.ngayKhoiHanh, sameDateCount);

    setRows([...rows, { ...formData, maLichTrinh }]);
    resetFormForAdd();
  };

  const handleUpdate = () => {
    setRows(rows.map(r => r.maLichTrinh === formData.maLichTrinh ? { ...formData, ngayCapNhat: getCurrentDateTime() } : r));
    resetFormForAdd();
  };

  const handleDelete = () => {
    setRows(rows.filter(r => r.maLichTrinh !== formData.maLichTrinh));
    resetFormForAdd();
  };

  const handleRowClick = (row: LichTrinhTheoNgay) => {
    setFormData({ ...row, ngayCapNhat: getCurrentDateTime() });
    setIsEdit(true);
  };

    const [isStartInput, setIsStartInput] = useState(true);
    const [gaDi, setGaDi] = useState("");
    const [gaDen, setGaDen] = useState("");
    const [ngayDi, setNgayDi] = useState("");

    const filteredRows = useMemo(() => {
      return rows.filter(r => {
          const tuyen = dataTuyenTau.find(t => t.maTuyen === r.maTuyen);
          if (!tuyen) return false;

          // Kiểm tra Ga đi/Ga đến theo isStartInput
          const checkGaDi = isStartInput
            ? tuyen.gaKetThuc.toLowerCase().includes(gaDen.toLowerCase())
            : tuyen.gaBatDau.toLowerCase().includes(gaDi.toLowerCase());

          const checkGaDen = isStartInput
            ? tuyen.gaBatDau.toLowerCase().includes(gaDi.toLowerCase())
            : tuyen.gaKetThuc.toLowerCase().includes(gaDen.toLowerCase());

          const checkNgayDi = ngayDi
            ? new Date(r.ngayKhoiHanh).toISOString().slice(0, 10) === new Date(ngayDi).toISOString().slice(0, 10)
            : true;

          return checkGaDi && checkGaDen && checkNgayDi;
        });
    }, [rows, gaDi, gaDen, ngayDi, isStartInput]);

    const navigate = useNavigate();
  const columns: GridColDef[] = [
    { field: "maLichTrinh", headerName: "Mã Lịch Trình", flex: 1 },
    { field: "tenTuyen", headerName: "Tên Tuyến", flex: 1.4 },
    { field: "ngayKhoiHanh", headerName: "Ngày Khởi Hành", flex: 1 },
    { field: "tenNguoiTao", headerName: "Người Tạo", flex: 1 },
    { field: "trangThai", headerName: "Trạng thái", flex: 1 },
    { field: "ngayCapNhat", headerName: "Ngày Cập Nhật", flex: 1 },
    { field: "ghiChu", headerName: "Ghi Chú", flex: 1.5 },
    { field: "trangThaiPheDuyet", headerName: "Phê duyệt", flex: 1 },
    {
    field: "xemChuyenTau",
    headerName: "Xem",
    flex: 1,
    sortable: false,
    filterable: false,
    renderCell: (params) => (
        <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => {
                const maLichTrinh = params.row.maLichTrinh;
                navigate(`/lich-trinh/chuyen-tau/${maLichTrinh}`);
            }}
        >
            <i className="bi bi-eye"></i> Xem
        </button>
    ),
},

  ];

  useEffect(() => {
    resetFormForAdd();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [showModal, setShowModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState<LichTrinhTheoNgay | null>(null);


  return (
    <>
    <Helmet>
        <title>Quản lý Lịch Trình Theo Ngày</title>
    </Helmet>
    <div className="container mt-4">
      <h3>Quản lý Lịch Trình Theo Ngày</h3>
      <p>Hệ thống quản lý lịch trình ga xe lửa</p>

      <div className="d-flex flex-column gap-3">
        <div className="row g-3">
          {/* Cột tìm kiếm */}
            <div className="col-md-4">
                <div className="card p-3">
                    <div className="d-flex flex-column gap-3">
                      <div className="card p-3 mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span>Chọn chế độ tìm kiếm:</span>
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => setIsStartInput(prev => !prev)}
                            title="Đảo ngược chế độ Ga đi/Ga đến cố định"
                          >
                            <i className="bi bi-arrow-left-right"></i> {isStartInput ? "Ga đi cố định DN" : "Ga đến cố định DN"}
                          </button>
                        </div>

                        {/* Ga đi */}
                        {isStartInput ? (
                          <input
                            className="form-control mb-2"
                            value={dataGaTau.find(g => g.maGa === "DN")?.tenGa || "DN"} // hiển thị tên
                            readOnly
                          />
                        ) : (
                          <SelectWithScroll
                            options={Array.from(new Set(dataTuyenTau.map(t => t.gaBatDau)))
                                  .filter(g => g !== "DN")   // loại bỏ DN
                                  .map(g => ({ value: g, label: g }))}                            
                                  value={gaDi} // giữ giá trị cũ
                            onChange={val => setGaDi(val as string)}
                            placeholder="Chọn Ga đi"
                          />
                        )}

                        {/* Ga đến */}
                        {isStartInput ? (
                          <SelectWithScroll
                            options={Array.from(new Set(dataTuyenTau.map(t => t.gaKetThuc)))
                                .filter(g => g !== "DN")   // loại bỏ DN
                                .map(g => ({ value: g, label: g }))}                            
                            value={gaDen}                   
                            onChange={val => setGaDen(val as string)}
                            placeholder="Chọn Ga đến"
                          />
                        ) : (
                          <input
                            className="form-control mt-2"
                            value={dataGaTau.find(g => g.maGa === "DN")?.tenGa || "DN"} // hiển thị tên
                            readOnly
                          />
                        )}

                        {/* Ngày đi */}
                        <div className="d-flex flex-column mt-2">
                          <label className="form-label">Ngày đi</label>
                          <input
                            type="date"
                            className="form-control"
                            value={ngayDi}
                            onChange={e => setNgayDi(e.target.value)}
                          />
                        </div>

                        {/* Nút tìm kiếm */}
                        <div className="d-grid mt-2">
                          <button
                            className="btn btn-primary"
                            onClick={() => { /* trigger filteredRows qua state */ }}
                          >
                            Tìm kiếm
                          </button>
                        </div>
                      </div>

                    </div>
                </div>
            </div>

          {/* Cột Form */}
          <div className="col-md-8">
            <div className="card">
              <div className="card-header text-center">Tạo mới / Sửa / Xóa</div>

              <div className="card-body">
                <div className="row g-2">

                  {/* CỘT TRÁI */}
                  <div className="col-6 d-flex flex-column gap-2">

                    {/* Mã lịch trình (chỉ khi sửa) */}
                    {isEdit && (
                      <fieldset className="border rounded p-2">
                        <legend className="float-none w-auto px-2 small">Mã lịch trình</legend>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.maLichTrinh}
                          readOnly
                        />
                      </fieldset>
                    )}

                    {/* Tuyến tàu */}
                    <fieldset className="border rounded p-2">
                      <legend className="float-none w-auto px-2 small">Tuyến tàu</legend>
                      <SelectWithScroll
                        options={dataTuyenTau.map(t => ({
                          value: t.maTuyen,
                          label: t.tenTuyen,
                        }))}
                        value={formData.maTuyen}
                        onChange={val => setFormData({ ...formData, maTuyen: val as string })}
                        placeholder="-- Chọn tuyến --"
                      />
                    </fieldset>

                    {/* Ngày khởi hành */}
                    <fieldset className="border rounded p-2">
                      <legend className="float-none w-auto px-2 small">Ngày khởi hành</legend>
                      <input
                        type="date"
                        className="form-control"
                        value={formData.ngayKhoiHanh}
                        onChange={e => setFormData({ ...formData, ngayKhoiHanh: e.target.value })}
                      />
                    </fieldset>
                  </div>

                  {/* CỘT PHẢI */}
                  <div className="col-6 d-flex flex-column gap-2">

                    {/* Ghi chú */}
                    <fieldset className="border rounded p-2">
                      <legend className="float-none w-auto px-2 small">Ghi chú</legend>
                      <textarea
                        className="form-control"
                        rows={5}
                        value={formData.ghiChu}
                        onChange={e => setFormData({ ...formData, ghiChu: e.target.value })}
                      ></textarea>
                    </fieldset>

                  </div>

                </div>
              </div>

              {/* FOOTER BUTTONS */}
              <div className="card-footer d-flex gap-2">
                <button className="btn btn-secondary" onClick={resetFormForAdd}>
                  <i className="bi bi-arrow-clockwise me-1"></i> Reload
                </button>

                <button className="btn btn-primary" onClick={handleAdd} disabled={isEdit}>
                  <i className="bi bi-plus-lg me-1"></i> Thêm
                </button>

                <button className="btn btn-success" onClick={handleUpdate} disabled={!isEdit}>
                  <i className="bi bi-pencil-square me-1"></i> Sửa
                </button>

                <button className="btn btn-danger" onClick={handleDelete} disabled={!isEdit}>
                  <i className="bi bi-trash me-1"></i> Xóa
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* DataGrid */}
        <div className="card">
          <DataGrid
            rows={filteredRows.map(r => ({ ...r, id: r.maLichTrinh }))}
            columns={columns}
            pageSizeOptions={[5, 10]}
            initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
            onRowClick={(params: GridRowParams) => handleRowClick(params.row)}
            autoHeight
            onRowDoubleClick={(params) => {
                setSelectedRow(params.row);
                setShowModal(true);
            }}
          />
        </div>     
      </div>
      
      {showModal && selectedRow && (() => {
        const mappedRow = {
          ...selectedRow,
          tenTuyen: dataTuyenTau.find(t => t.maTuyen === selectedRow.maTuyen)?.tenTuyen || "",
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
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-content">

                {/* HEADER */}
                <div className="modal-header">
                  <h5 className="modal-title">Chi tiết lịch trình</h5>
                  <button className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>

                {/* BODY */}
                <div className="modal-body">
                  <div className="row">

                    {/* ==== CỘT TRÁI ==== */}
                    <div className="col-4 border-end">
                      <h6 className="fw-bold mb-3">Thông tin lịch trình</h6>

                      <label className="form-label">Mã lịch trình</label>
                      <input className="form-control mb-3" value={mappedRow.maLichTrinh} readOnly />

                      <label className="form-label">Ngày khởi hành</label>
                      <input className="form-control mb-3" value={mappedRow.ngayKhoiHanh} readOnly />

                      <label className="form-label">Tuyến tàu</label>
                      <input className="form-control mb-3" value={mappedRow.tenTuyen} readOnly />

                      <label className="form-label">Ghi chú</label>
                      <textarea
                        className="form-control"
                        rows={5}
                        value={mappedRow.ghiChu}
                        readOnly
                      />
                    </div>

                    {/* ==== CỘT GIỮA ==== */}
                    <div className="col-4 border-end">
                      <h6 className="fw-bold mb-3">Trạng thái</h6>

                      <label className="form-label">Người tạo</label>
                      <input className="form-control mb-3" value={mappedRow.tenNguoiTao} readOnly />

                      <label className="form-label">Ngày cập nhật</label>
                      <input className="form-control mb-3" value={mappedRow.ngayCapNhat} readOnly />

                      <label className="form-label">Trạng thái</label>
                      <input className="form-control mb-3" value={mappedRow.trangThai} readOnly />

                      <label className="form-label">Trạng thái phê duyệt</label>
                      <input className="form-control" value={mappedRow.trangThaiPheDuyet} readOnly />
                    </div>

                    {/* ==== CỘT PHẢI ==== */}
                    <div className="col-4">
                      <h6 className="fw-bold mb-3">Phê duyệt</h6>

                      <label className="form-label">Người phê duyệt</label>
                      <input className="form-control mb-3" value={mappedRow.nguoiPheDuyet || ""} readOnly />

                      <label className="form-label">Ngày phê duyệt</label>
                      <input className="form-control mb-3" value={mappedRow.ngayPheDuyet} readOnly />

                      <label className="form-label">Ghi chú phê duyệt</label>
                      <textarea
                        className="form-control"
                        rows={5}
                        value={mappedRow.ghiChuPheDuyet}
                        readOnly
                      />
                    </div>

                  </div>
                </div>

              </div>
            </div>
          </div>
        );
      })()}
    </div>
    </>
  );
};

export default PageLichTrinhTheoNgay;
