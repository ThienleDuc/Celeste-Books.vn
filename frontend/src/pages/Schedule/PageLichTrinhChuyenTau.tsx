import { useState, useMemo, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef, GridRowParams } from "@mui/x-data-grid";

import SelectWithScroll from "../../components/SelectWithScroll";
import { dataTuyenTau } from "../../models/dataTuyenTau";
import { dataDoanTau } from "../../models/dataDoanTau";
import { dataGaTau } from "../../models/dataGaTau";
import { dataNguoiDung } from "../../models/dataNguoiDung";
import { dataLichTrinh } from "../../models/dataLichTrinh";
import { type LichTrinhChuyenTau, dataChuyenTau } from "../../models/dataChuyenTau";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet";

const PageLichTrinhChuyenTau = () => {
    const { maLichTrinh } = useParams();
  const [rows, setRows] = useState<LichTrinhChuyenTau[]>(dataChuyenTau);

    const mapRowsWithNames = (rows: LichTrinhChuyenTau[]) => {
        return rows.map(r => {
            // Lấy thông tin lịch trình
            const lich = dataLichTrinh.find(l => l.maLichTrinh === r.maLichTrinh);

            // lấy tuyến từ lịch trình
            const tuyen = dataTuyenTau.find(t => t.maTuyen === lich?.maTuyen);

            // lấy thông tin ga từ mã ga
            const gaBD = dataGaTau.find(g => g.maGa === tuyen?.gaBatDau);
            const gaKT = dataGaTau.find(g => g.maGa === tuyen?.gaKetThuc);
            // Lấy đoàn tàu
            const doan = dataDoanTau.find(d => d.maDoanTau === r.maDoanTau);

            return {
            ...r,
            tenTuyen: tuyen?.tenTuyen || "",
            tenDoanTau: doan?.tenDoanTau || "",

            // Mã ga
            gaBatDau: tuyen?.gaBatDau || "",
            gaKetThuc: tuyen?.gaKetThuc || "",
            // Tên ga
            tenGaBatDau: gaBD?.tenGa || "",
            tenGaKetThuc: gaKT?.tenGa || "",

            // Người tạo
            tenNguoiTao: dataNguoiDung.find(u => u.maNguoiDung === r.nguoiTao)?.hoTen || "",

            // Loại hành trình
            loaiHanhTrinhText: r.loaiHanhTrinh === 0 ? "Một chiều" : "Khứ hồi",
            };
        });
    };
    
    const [isEdit, setIsEdit] = useState(false);

    const [formData, setFormData] = useState<LichTrinhChuyenTau>({
        maChuyenTau: "",
        maLichTrinh: maLichTrinh ? maLichTrinh : "",
        maDoanTau: "",
        thoiDiemKhoiHanh: "",
        ngayDenDuKien: "",
        ngayKhoiHanhChieuVe: "",
        ngayDuKienTroVe: "",
        loaiHanhTrinh: 0,
        trangThaiChuyen: "Tạo mới",
        nguoiTao: "",
        ghiChu: "",
    });

    const [isStartInput, setIsStartInput] = useState(true);
    const [gaDi, setGaDi] = useState("");
    const [gaDen, setGaDen] = useState("");
    const [ngayDi, setNgayDi] = useState("");

        // Ánh xạ tên
    const filteredRows: LichTrinhChuyenTau[] = useMemo(() => {
        const rowsTheoLichTrinh = rows.filter(r => r.maLichTrinh === maLichTrinh);

        return mapRowsWithNames(
            rowsTheoLichTrinh.filter(r => {

                // Lấy lịch trình
                const lt = dataLichTrinh.find(l => l.maLichTrinh === r.maLichTrinh);
                if (!lt) return false;

                // Lấy tuyến tàu
                const tuyen = dataTuyenTau.find(t => t.maTuyen === lt.maTuyen);
                if (!tuyen) return false;

                // Ga bắt đầu / kết thúc
                const gaBD = dataGaTau.find(g => g.maGa === tuyen.gaBatDau);
                const gaKT = dataGaTau.find(g => g.maGa === tuyen.gaKetThuc);

                // Kiểm tra Ga đi
                const checkGaDi = gaDi
                    ? gaBD?.tenGa.toLowerCase().includes(gaDi.toLowerCase())
                    : true;

                // Kiểm tra Ga đến
                const checkGaDen = gaDen
                    ? gaKT?.tenGa.toLowerCase().includes(gaDen.toLowerCase())
                    : true;

                // Kiểm tra Ngày đi
                const checkNgayDi = ngayDi
                    ? new Date(r.thoiDiemKhoiHanh).toISOString().slice(0, 10) ===
                    new Date(ngayDi).toISOString().slice(0, 10)
                    : true;

                // Kiểm tra Loại hành trình
                const checkLoaiHanhTrinh = formData.loaiHanhTrinh !== null
                    ? r.loaiHanhTrinh === formData.loaiHanhTrinh
                    : true;

                return checkGaDi && checkGaDen && checkNgayDi && checkLoaiHanhTrinh;
            })
        );
    }, [rows, maLichTrinh, gaDi, gaDen, ngayDi, formData.loaiHanhTrinh]);


    // Tạo maChuyenTau tự động
    const generateMaChuyenTau = (maLichTrinh: string, index: number) => {
    const seq = String(index + 1).padStart(2, "0");
    return `${maLichTrinh}-${seq}`;
    };

  
  const resetFormForAdd = () => {
    setFormData({
      maChuyenTau: "",
      maLichTrinh: maLichTrinh ? maLichTrinh : "",
      maDoanTau: "",
      thoiDiemKhoiHanh: "",
      ngayDenDuKien: "",
      ngayKhoiHanhChieuVe: "",
      ngayDuKienTroVe: "",
      loaiHanhTrinh: 0,
      trangThaiChuyen: "Tạo mới",
      nguoiTao: "",
      ghiChu: "",
    });
    setIsEdit(false);
  };

  const handleAdd = () => {
    const sameLichCount = rows.filter(r => r.maLichTrinh === formData.maLichTrinh).length;
    const maChuyenTau = generateMaChuyenTau(formData.maLichTrinh, sameLichCount);
    setRows([...rows, { ...formData, maChuyenTau }]);
    resetFormForAdd();
  };

  const handleUpdate = () => {
    setRows(rows.map(r => r.maChuyenTau === formData.maChuyenTau ? { ...formData } : r));
    resetFormForAdd();
  };

  const handleDelete = () => {
    setRows(rows.filter(r => r.maChuyenTau !== formData.maChuyenTau));
    resetFormForAdd();
  };

  const handleRowClick = (row: LichTrinhChuyenTau) => {
    setFormData({ ...row });
    setIsEdit(true);
  };

  const navigate = useNavigate();

  const columns: GridColDef[] = [
    { field: "maChuyenTau", headerName: "Mã Chuyến Tàu", flex: 1 },
    { field: "tenDoanTau", headerName: "Tên Đoàn Tàu", flex: 1.2 },
    { field: "tenTuyen", headerName: "Tên Tuyến", flex: 1.2 },
    { field: "tenGaBatDau", headerName: "Ga Bắt Đầu", flex: 1 },
    { field: "tenGaKetThuc", headerName: "Ga Kết Thúc", flex: 1 },
    { field: "loaiHanhTrinhText", headerName: "Loại Hành Trình", flex: 1 },
    {
        field: "phanCong",
        headerName: "Phân Công",
        flex: 1,
        sortable: false,
        filterable: false,
        renderCell: (params) => (
            <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => {
                const maChuyenTau = params.row.maChuyenTau;
                navigate( `/chuyen-tau/lich-trinh/${maChuyenTau}`);
            }}
            >
            <i className="bi bi-person-plus"></i> Phân công 
            </button>
        ),
    },
    {
        field: "tamHoan",
        headerName: "Tạm Hoãn",
        flex: 1,
        sortable: false,
        filterable: false,
        renderCell: (params) => (
            <button
            className="btn btn-sm btn-outline-warning"
            onClick={() => {
                const maChuyenTau = params.row.maChuyenTau;
                navigate(`/chuyen-tau/tam-hoan/${maChuyenTau}`);
            }}
            >
            <i className="bi bi-clock-history"></i> Tạm Hoãn
            </button>
        ),
    },
    {
        field: "dungKhancap",
        headerName: "Dừng Khẩn Cấp",
        flex: 1.3,
        sortable: false,
        filterable: false,
        renderCell: (params) => (
            <button
            className="btn btn-sm btn-outline-danger"
            onClick={() => {
                const maChuyenTau = params.row.maChuyenTau;
                navigate(`/chuyen-tau/dung-khan-cap/${maChuyenTau}`);
            }}
            >
            <i className="bi bi-exclamation-triangle me-1"></i> Dừng Khẩn Cấp
            </button>
        ),
    }
  ];

  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
  useEffect(() => resetFormForAdd(), []);

    const [showModal, setShowModal] = useState(false);
    const [selectedRow, setSelectedRow] = useState<LichTrinhChuyenTau | null>(null);

  return (
    <>
    <Helmet>
        <title>Quản Lý Chuyến Tàu</title>
    </Helmet>
    <div className="container mt-4">
      <h3>Quản lý Chuyến Tàu</h3>
      <p>Hệ thống quản lý chuyến tàu theo lịch trình</p>

        <div className="d-flex flex-column gap-3">
            <div className="row g-3">
                {/* Filter Ga đi / Ga đến / Ngày đi */}
                <div className="col-md-4">
                    <div className="card h-100 p-3">
                        <h5 className="card-title">Bộ lọc</h5>
                        <div className="mb-3">
                        <label className="form-label d-block">Chọn chế độ tìm kiếm</label>
                        <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => setIsStartInput(prev => !prev)}
                            title="Đảo ngược chế độ Ga đi/Ga đến cố định"
                        >
                            <i className="bi bi-arrow-left-right"></i> {isStartInput ? "Đà Nẵng đến" : "Đến Đà Nẵng"}
                        </button>
                        </div>

                        {/* Ga đi / Ga đến */}
                        <div className="mb-3">
                        {isStartInput ? (
                            <input className="form-control mb-2" value={dataGaTau.find(g => g.maGa === "DN")?.tenGa || "DN"} readOnly />
                        ) : (
                            <SelectWithScroll
                            options={Array.from(new Set(dataTuyenTau.map(t => t.gaBatDau))).map(g => ({ value: g, label: g }))}
                            value={gaDi}
                            onChange={val => setGaDi(val as string)}
                            placeholder="Chọn Ga đi"
                            />
                        )}

                        {isStartInput ? (
                            <SelectWithScroll
                            options={Array.from(new Set(dataTuyenTau.map(t => t.gaKetThuc))).map(g => ({ value: g, label: g }))}
                            value={gaDen}
                            onChange={val => setGaDen(val as string)}
                            placeholder="Chọn Ga đến"
                            />
                        ) : (
                            <input className="form-control mt-2" value={dataGaTau.find(g => g.maGa === "DN")?.tenGa || "DN"} readOnly />
                        )}
                        </div>

                        {/* Ngày đi */}
                        <div className="mb-3">
                        <label className="form-label">Ngày đi</label>
                        <input type="date" className="form-control" value={ngayDi} onChange={e => setNgayDi(e.target.value)} />
                        </div>

                        {/* Loại hành trình */}
                        <div className="mb-3">
                        <label className="form-label d-block">Loại hành trình</label>
                        <div className="d-flex gap-3">
                            <div className="form-check flex-fill text-center">
                            <input
                                id="mot-chieu"
                                className="form-check-input"
                                type="radio"
                                name="loaiHanhTrinh"
                                value={0}
                                checked={formData.loaiHanhTrinh === 0}
                                onChange={() => setFormData({ ...formData, loaiHanhTrinh: 0, ngayKhoiHanhChieuVe: "", ngayDuKienTroVe: "" })}
                            />
                            <label className="form-check-label" htmlFor="mot-chieu">Một chiều</label>
                            </div>
                            <div className="form-check flex-fill text-center">
                            <input
                                id="khu-hoi"
                                className="form-check-input"
                                type="radio"
                                name="loaiHanhTrinh"
                                value={1}
                                checked={formData.loaiHanhTrinh === 1}
                                onChange={() => setFormData({ ...formData, loaiHanhTrinh: 1 })}
                            />
                            <label className="form-check-label" htmlFor="khu-hoi">Khứ hồi</label>
                            </div>
                        </div>
                        </div>

                        {formData.loaiHanhTrinh === 1 && (
                        <div className="mb-3">
                            <label className="form-label">Ngày dự kiến trở về</label>
                            <input
                            type="datetime-local"
                            className="form-control"
                            value={formData.ngayDuKienTroVe}
                            onChange={e => setFormData({ ...formData, ngayDuKienTroVe: e.target.value })}
                            />
                        </div>
                        )}

                        <button className="btn btn-primary w-100 mt-2" onClick={() => { /* trigger filteredRows */ }}>
                        Tìm kiếm
                        </button>
                    </div>
                </div>

                {/* Form Thêm / Sửa / Xóa */}
                <div className="col-md-8">
                    <div className="card h-100">
                        <div className="card-header text-center">Tạo mới / Sửa / Xóa</div>

                        <div className="card-body">
                        <div className="row g-2">

                            {/* CỘT TRÁI */}
                            <div className="col-6 d-flex flex-column gap-2">

                            {/* Mã chuyến tàu (chỉ hiển thị khi sửa) */}
                            {isEdit && (
                                <fieldset className="border rounded p-2">
                                <legend className="float-none w-auto px-2 small">Mã chuyến tàu</legend>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={formData.maChuyenTau}
                                    readOnly
                                />
                                </fieldset>
                            )}

                            {/* Lịch trình */}
                            <fieldset className="border rounded p-2">
                                <legend className="float-none w-auto px-2 small">Lịch trình</legend>
                                <SelectWithScroll
                                options={dataTuyenTau.map(t => ({ value: t.maTuyen, label: t.tenTuyen }))}
                                value={formData.maLichTrinh}
                                onChange={val => setFormData({ ...formData, maLichTrinh: val as string })}
                                placeholder="-- Chọn Lịch Trình --"
                                />
                            </fieldset>

                            {/* Đoàn tàu */}
                            <fieldset className="border rounded p-2">
                                <legend className="float-none w-auto px-2 small">Đoàn tàu</legend>
                                <SelectWithScroll
                                options={dataDoanTau.map(d => ({ value: d.maDoanTau, label: d.tenDoanTau }))}
                                value={formData.maDoanTau}
                                onChange={val => setFormData({ ...formData, maDoanTau: val as string })}
                                placeholder="-- Chọn Đoàn Tàu --"
                                />
                            </fieldset>

                            {/* Ghi chú */}
                            <fieldset className="border rounded p-2">
                                <legend className="float-none w-auto px-2 small">Ghi chú</legend>
                                <textarea
                                className="form-control"
                                rows={4}
                                value={formData.ghiChu}
                                onChange={e => setFormData({ ...formData, ghiChu: e.target.value })}
                                placeholder="Nhập ghi chú..."
                                />
                            </fieldset>

                            </div>

                            {/* CỘT PHẢI */}
                            <div className="col-6 d-flex flex-column gap-2">

                            {/* Thời điểm khởi hành */}
                            <fieldset className="border rounded p-2">
                                <legend className="float-none w-auto px-2 small">Thời điểm khởi hành</legend>
                                <input
                                type="datetime-local"
                                className="form-control"
                                value={formData.thoiDiemKhoiHanh}
                                onChange={e => setFormData({ ...formData, thoiDiemKhoiHanh: e.target.value })}
                                />
                            </fieldset>

                            {/* Ngày dự kiến đến */}
                            <fieldset className="border rounded p-2">
                                <legend className="float-none w-auto px-2 small">Ngày dự kiến đến</legend>
                                <input
                                type="datetime-local"
                                className="form-control"
                                value={formData.ngayDenDuKien}
                                onChange={e => setFormData({ ...formData, ngayDenDuKien: e.target.value })}
                                />
                            </fieldset>

                            {/* Chiều về (nếu có) */}
                            {formData.loaiHanhTrinh === 1 && (
                                <>
                                <fieldset className="border rounded p-2">
                                    <legend className="float-none w-auto px-2 small">Ngày khởi hành chiều về</legend>
                                    <input
                                    type="datetime-local"
                                    className="form-control"
                                    value={formData.ngayKhoiHanhChieuVe}
                                    onChange={e =>
                                        setFormData({ ...formData, ngayKhoiHanhChieuVe: e.target.value })
                                    }
                                    />
                                </fieldset>

                                <fieldset className="border rounded p-2">
                                    <legend className="float-none w-auto px-2 small">Ngày dự kiến trở về</legend>
                                    <input
                                    type="datetime-local"
                                    className="form-control"
                                    value={formData.ngayDuKienTroVe}
                                    onChange={e =>
                                        setFormData({ ...formData, ngayDuKienTroVe: e.target.value })
                                    }
                                    />
                                </fieldset>
                                </>
                            )}

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
            <div className="card mt-3 p-3">
                <DataGrid
                rows={filteredRows.map(r => ({ ...r, id: r.maChuyenTau }))}
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
        {showModal && selectedRow && (
            // lấy phiên bản có tên
            (() => {
                const mappedRow = mapRowsWithNames([selectedRow])[0];

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
                        <h5 className="modal-title">Chi tiết chuyến tàu</h5>
                        <button className="btn-close" onClick={() => setShowModal(false)}></button>
                        </div>

                        {/* BODY */}
                        <div className="modal-body">
                        <div className="row">

                            {/* ===== CỘT TRÁI ===== */}
                            <div className="col-4 border-end">
                            <h6 className="fw-bold mb-3">Thông tin chung</h6>

                            <div className="row">
                                {/* Cột trái */}
                                <div className="col-md-6">
                                    <label className="form-label">Mã chuyến tàu</label>
                                    <input className="form-control mb-3" value={mappedRow.maChuyenTau} readOnly />

                                    <label className="form-label">Tuyến tàu</label>
                                    <input className="form-control mb-3" value={mappedRow.tenTuyen} readOnly />

                                    <label className="form-label">Ga bắt đầu</label>
                                    <input className="form-control mb-3" value={mappedRow.tenGaBatDau} readOnly />
                                </div>

                                {/* Cột phải */}
                                <div className="col-md-6">
                                    <label className="form-label">Ga kết thúc</label>
                                    <input className="form-control mb-3" value={mappedRow.tenGaKetThuc} readOnly />

                                    <label className="form-label">Đoàn tàu</label>
                                    <input className="form-control mb-3" value={mappedRow.tenDoanTau} readOnly />

                                    <label className="form-label">Loại hành trình</label>
                                    <input className="form-control mb-3" value={mappedRow.loaiHanhTrinhText} readOnly />
                                </div>
                                </div>

                                <label className="form-label mt-3">Ghi chú</label>
                                <textarea className="form-control" rows={5} value={mappedRow.ghiChu} readOnly />
                            </div>

                            {/* ===== CỘT GIỮA ===== */}
                            <div className="col-4 border-end">
                            <h6 className="fw-bold mb-3">Thời gian</h6>

                            <label className="form-label">Thời điểm khởi hành</label>
                            <input className="form-control mb-3" value={mappedRow.thoiDiemKhoiHanh} readOnly />

                            <label className="form-label">Ngày dự kiến đến</label>
                            <input className="form-control mb-3" value={mappedRow.ngayDenDuKien} readOnly />

                            {mappedRow.loaiHanhTrinh === 1 && (
                                <>
                                <label className="form-label">Ngày khởi hành chiều về</label>
                                <input
                                    className="form-control mb-3"
                                    value={mappedRow.ngayKhoiHanhChieuVe || ""}
                                    readOnly
                                />

                                <label className="form-label">Ngày dự kiến trở về</label>
                                <input
                                    className="form-control mb-3"
                                    value={mappedRow.ngayDuKienTroVe || ""}
                                    readOnly
                                />
                                </>
                            )}
                            </div>

                            {/* ===== CỘT PHẢI ===== */}
                            <div className="col-4">
                            <h6 className="fw-bold mb-3">Trạng thái & Người tạo</h6>

                            <label className="form-label">Trạng thái chuyến</label>
                            <input className="form-control mb-3" value={mappedRow.trangThaiChuyen} readOnly />

                            <label className="form-label">Người tạo</label>
                            <input className="form-control mb-3" value={mappedRow.tenNguoiTao} readOnly />

                            <label className="form-label">Mã người tạo</label>
                            <input className="form-control mb-3" value={mappedRow.nguoiTao} readOnly />
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

export default PageLichTrinhChuyenTau;
