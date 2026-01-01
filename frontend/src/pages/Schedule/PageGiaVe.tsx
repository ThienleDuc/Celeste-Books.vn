import { useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef, GridRowParams } from "@mui/x-data-grid";

import { dataLoaiGhe } from "../../models/dataLoaiGhe";
import { dataTinhTrangVe } from "../../models/dataTinhTrangVe";
import { dataLoaiTau } from "../../models/dataLoaiTau";
import { dataLoaiToa } from "../../models/dataLoaiToa";
import { dataLoaiKhoang } from "../../models/dataLoaiKhoang";
import { dataGiaTienTheoKhoangCach } from "../../models/dataGiaTienTheoKhoangCach";
import { type GiaVe, dataGiaVe } from "../../models/dataGiaVe";
import SelectWithScroll from "../../components/SelectWithScroll";
import { Helmet } from "react-helmet";

// ------------------------------
// Component
export default function PageGiaVe() {
  // ------------------------------
  // Hàm tính giá vé
  const tinhGiaVe = (row: GiaVe) => {
    const loaiGhe = dataLoaiGhe.find(x => x.MaLoaiGhe === row.maLoaiGhe);
    const tinhTrang = dataTinhTrangVe.find(x => x.maTinhTrang === row.maTinhTrang);
    const loaiTau = dataLoaiTau.find(x => x.maLoaiTau === row.maLoaiTau);
    const loaiToa = dataLoaiToa.find(x => x.maLoaiToa === row.maLoaiToa);
    const loaiKhoang = dataLoaiKhoang.find(x => x.maLoaiKhoang === row.maLoaiKhoang);
    const khoangCach = dataGiaTienTheoKhoangCach.find(x => x.maHeSo === row.maHeSo);

    const heSoTong = 
        (loaiGhe?.HeSo ?? 1) +
        (tinhTrang?.heSoGia ?? 1) +
        (loaiTau?.heSo ?? 1) +
        (loaiToa?.heSo ?? 1) +
        (loaiKhoang?.heSo ?? 1);

    return (khoangCach?.khoangCach ?? 0) * (khoangCach?.heSo ?? 0) * heSoTong;
  };

  // ------------------------------
  // Map row để hiển thị trực tiếp
  const mapRows = (rows: GiaVe[]) => {
    return rows.map(row => {
      const loaiGhe = dataLoaiGhe.find(x => x.MaLoaiGhe === row.maLoaiGhe)?.TenLoaiGhe || row.maLoaiGhe;
      const tinhTrang = dataTinhTrangVe.find(x => x.maTinhTrang === row.maTinhTrang)?.tenTinhTrang || row.maTinhTrang;
      const loaiTau = dataLoaiTau.find(x => x.maLoaiTau === row.maLoaiTau)?.tenLoaiTau || row.maLoaiTau;
      const loaiToa = dataLoaiToa.find(x => x.maLoaiToa === row.maLoaiToa)?.tenLoaiToa || row.maLoaiToa;
      const loaiKhoang = dataLoaiKhoang.find(x => x.maLoaiKhoang === row.maLoaiKhoang)?.tenLoaiKhoang || row.maLoaiKhoang;
      const khoangCach = dataGiaTienTheoKhoangCach.find(x => x.maHeSo === row.maHeSo);
      const giaVe = tinhGiaVe(row);

      return {
        ...row,
        loaiGhe,
        tinhTrang,
        loaiTau,
        loaiToa,
        loaiKhoang,
        khoangCachKm: khoangCach?.khoangCach ?? 0,
        giaVe
      };
    });
  };

  const [rows, setRows] = useState(mapRows(dataGiaVe));

  // Hàm sinh mã Giá Vé tự động
  const generateMaGiaVe = (): string => {
    if (rows.length === 0) return "GV01"; // bắt đầu từ GV01
    const maxNumber = Math.max(
      ...rows.map(r => parseInt(r.maGiaVe.replace("GV", ""), 10))
    );
    return `GV${(maxNumber + 1).toString().padStart(2, "0")}`;
  };
  const [form, setForm] = useState<GiaVe>({
    maGiaVe: generateMaGiaVe(),
    maLoaiGhe: "",
    maTinhTrang: "",
    maLoaiTau: "",
    maLoaiToa: "",
    maLoaiKhoang: "",
    maHeSo: "",
    ngayApDung: "",
    ghiChu: "",
  });

  const [isEdit, setIsEdit] = useState(false);

  const handleRowClick = (params: GridRowParams) => {
    setForm(params.row as GiaVe);
    setIsEdit(true);
  };

  const resetFormForAdd = () => {
    setForm({
      maGiaVe: generateMaGiaVe(),
      maLoaiGhe: "",
      maTinhTrang: "",
      maLoaiTau: "",
      maLoaiToa: "",
      maLoaiKhoang: "",
      maHeSo: "",
      ngayApDung: "",
      ghiChu: "",
    });
    setIsEdit(false);
  };

  const handleAdd = () => {
    if (!isEdit) {
      setRows(prev => mapRows([...prev, form]));
      resetFormForAdd();
    }
  };

  const handleUpdate = () => {
    if (isEdit) {
      setRows(prev => mapRows(prev.map(r => r.maGiaVe === form.maGiaVe ? form : r)));
      resetFormForAdd();
    }
  };

  const handleDelete = () => {
    if (isEdit) {
      setRows(prev => mapRows(prev.filter(r => r.maGiaVe !== form.maGiaVe)));
      resetFormForAdd();
    }
  };

  const columns: GridColDef[] = [
    { field: "maGiaVe", headerName: "Mã Giá Vé", flex: 1 },
    { field: "loaiGhe", headerName: "Loại Ghế", flex: 1.2 },
    { field: "tinhTrang", headerName: "Tình Trạng Vé", flex: 1.2 },
    { field: "loaiTau", headerName: "Loại Tàu", flex: 1.2 },
    { field: "loaiToa", headerName: "Loại Toa", flex: 1.2 },
    { field: "loaiKhoang", headerName: "Loại Khoang", flex: 1.2 },
    { field: "khoangCachKm", headerName: "Khoảng cách (km)", flex: 1.2 },
    { field: "ngayApDung", headerName: "Ngày Áp Dụng", flex: 1 },
    { field: "ghiChu", headerName: "Ghi Chú", flex: 1 },
    { field: "giaVe", headerName: "Giá Vé (VND)", flex: 1 },
  ];

  const [showModal, setShowModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState<GiaVe | null>(null);

  return (
    <>
    <Helmet>
      <title>Quản Lý Giá Vé</title>
    </Helmet>
    <div className="container py-3">
      <h3 className="mb-3">Quản Lý Giá Vé</h3>

      {/* FORM */}
      <div className="card p-3 mb-4">
        <div className="row g-3">

          {/* Mã Giá Vé */}
          <div className="col-md-4">
            <fieldset className="border rounded p-2">
              <legend className="float-none w-auto px-2 small">Mã Giá Vé</legend>
              <input
                type="text"
                className="form-control"
                value={form.maGiaVe}
                onChange={(e) => setForm({ ...form, maGiaVe: e.target.value })}
                disabled={isEdit}
              />
            </fieldset>
          </div>

          {/* Loại Ghế */}
          <div className="col-md-4">
            <fieldset className="border rounded p-2">
              <legend className="float-none w-auto px-2 small">Loại Ghế</legend>
              <SelectWithScroll
                value={form.maLoaiGhe}
                options={dataLoaiGhe.map(l => ({ value: l.MaLoaiGhe, label: l.TenLoaiGhe }))}
                onChange={(value) => setForm({ ...form, maLoaiGhe: value })}
              />
            </fieldset>
          </div>

          {/* Tình Trạng Vé */}
          <div className="col-md-4">
            <fieldset className="border rounded p-2">
              <legend className="float-none w-auto px-2 small">Tình Trạng Vé</legend>
              <SelectWithScroll
                value={form.maTinhTrang}
                options={dataTinhTrangVe.map(t => ({ value: t.maTinhTrang, label: t.tenTinhTrang }))}
                onChange={(value) => setForm({ ...form, maTinhTrang: value })}
              />
            </fieldset>
          </div>

          {/* Loại Tàu */}
          <div className="col-md-4">
            <fieldset className="border rounded p-2">
              <legend className="float-none w-auto px-2 small">Loại Tàu</legend>
              <SelectWithScroll
                value={form.maLoaiTau}
                options={dataLoaiTau.map(t => ({ value: t.maLoaiTau, label: t.tenLoaiTau }))}
                onChange={(value) => setForm({ ...form, maLoaiTau: value })}
              />
            </fieldset>
          </div>

          {/* Loại Toa */}
          <div className="col-md-4">
            <fieldset className="border rounded p-2">
              <legend className="float-none w-auto px-2 small">Loại Toa</legend>
              <SelectWithScroll
                value={form.maLoaiToa}
                options={dataLoaiToa.map(t => ({ value: t.maLoaiToa, label: t.tenLoaiToa }))}
                onChange={(value) => setForm({ ...form, maLoaiToa: value })}
              />
            </fieldset>
          </div>

          {/* Loại Khoang */}
          <div className="col-md-4">
            <fieldset className="border rounded p-2">
              <legend className="float-none w-auto px-2 small">Loại Khoang</legend>
              <SelectWithScroll
                value={form.maLoaiKhoang}
                options={dataLoaiKhoang.map(k => ({ value: k.maLoaiKhoang, label: k.tenLoaiKhoang }))}
                onChange={(value) => setForm({ ...form, maLoaiKhoang: value })}
              />
            </fieldset>
          </div>

          {/* Mã Hệ Số */}
          <div className="col-md-4">
            <fieldset className="border rounded p-2">
              <legend className="float-none w-auto px-2 small">Mã Hệ Số</legend>
              <SelectWithScroll
                value={form.maHeSo}
                options={dataGiaTienTheoKhoangCach.map(hs => ({
                  value: hs.maHeSo,
                  label: `${hs.maHeSo} - ${hs.khoangCach} km, hệ số ${hs.heSo}`
                }))}
                onChange={(value) => setForm({ ...form, maHeSo: value })}
              />
            </fieldset>
          </div>

          {/* Ngày Áp Dụng */}
          <div className="col-md-4">
            <fieldset className="border rounded p-2">
              <legend className="float-none w-auto px-2 small">Ngày Áp Dụng</legend>
              <input
                type="datetime-local"
                className="form-control"
                value={form.ngayApDung}
                onChange={(e) => setForm({ ...form, ngayApDung: e.target.value })}
              />
            </fieldset>
          </div>

          {/* Ghi Chú */}
          <div className="col-md-4">
            <fieldset className="border rounded p-2">
              <legend className="float-none w-auto px-2 small">Ghi Chú</legend>
              <textarea
                className="form-control"
                rows={2}
                value={form.ghiChu}
                onChange={(e) => setForm({ ...form, ghiChu: e.target.value })}
              />
            </fieldset>
          </div>

        </div>

        {/* BUTTONS */}
        <div className="d-flex gap-2 mt-3">
          <button className="btn btn-secondary flex-fill" onClick={resetFormForAdd}>
            <i className="bi bi-arrow-clockwise me-1"></i>Reload
          </button>
          <button className="btn btn-primary flex-fill" onClick={handleAdd} disabled={isEdit}>
            <i className="bi bi-plus-lg me-1"></i>Thêm
          </button>
          <button className="btn btn-success flex-fill" onClick={handleUpdate} disabled={!isEdit}>
            <i className="bi bi-pencil-square me-1"></i>Sửa
          </button>
          <button className="btn btn-danger flex-fill" onClick={handleDelete} disabled={!isEdit}>
            <i className="bi bi-trash me-1"></i>Xóa
          </button>
        </div>
      </div>


      {/* DATAGRID */}
      <DataGrid
        rows={rows}
        columns={columns}
        autoHeight
        getRowId={(r) => r.maGiaVe}
        onRowClick={handleRowClick}
        pageSizeOptions={[5, 10]}
                    onRowDoubleClick={(params) => {
                setSelectedRow(params.row);
                setShowModal(true);
            }}
      />

      {showModal && selectedRow && (
        (() => {
          // Chuyển row sang phiên bản có tên hiển thị
          const mappedRow = mapRows([selectedRow])[0];

          return (
            <div
              className="modal fade show d-block"
              tabIndex={-1}
              style={{ background: "rgba(0,0,0,0.5)" }}
              onClick={() => setShowModal(false)}
            >
              <div className="modal-dialog modal-xl" onClick={(e) => e.stopPropagation()}>
                <div className="modal-content">

                  {/* HEADER */}
                  <div className="modal-header">
                    <h5 className="modal-title">Chi tiết Giá Vé</h5>
                    <button className="btn-close" onClick={() => setShowModal(false)}></button>
                  </div>

                  {/* BODY */}
                  <div className="modal-body">
                    <div className="row g-3">

                      {/* CỘT TRÁI */}
                      <div className="col-4 border-end">
                        <h6 className="fw-bold mb-3">Thông tin cơ bản</h6>
                        <label className="form-label">Mã Giá Vé</label>
                        <input className="form-control mb-3" value={mappedRow.maGiaVe} readOnly />

                        <label className="form-label">Loại Ghế</label>
                        <input className="form-control mb-3" value={mappedRow.loaiGhe} readOnly />

                        <label className="form-label">Tình Trạng Vé</label>
                        <input className="form-control mb-3" value={mappedRow.tinhTrang} readOnly />

                        <label className="form-label">Loại Tàu</label>
                        <input className="form-control mb-3" value={mappedRow.loaiTau} readOnly />
                      </div>

                      {/* CỘT GIỮA */}
                      <div className="col-4 border-end">
                        <h6 className="fw-bold mb-3">Thông tin Toa & Khoang</h6>
                        <label className="form-label">Loại Toa</label>
                        <input className="form-control mb-3" value={mappedRow.loaiToa} readOnly />

                        <label className="form-label">Loại Khoang</label>
                        <input className="form-control mb-3" value={mappedRow.loaiKhoang} readOnly />

                        <label className="form-label">Khoảng cách (km)</label>
                        <input className="form-control mb-3" value={mappedRow.khoangCachKm} readOnly />

                        <label className="form-label">Mã Hệ Số</label>
                        <input className="form-control mb-3" value={mappedRow.maHeSo} readOnly />
                      </div>

                      {/* CỘT PHẢI */}
                      <div className="col-4">
                        <h6 className="fw-bold mb-3">Chi tiết khác</h6>
                        <label className="form-label">Ngày Áp Dụng</label>
                        <input className="form-control mb-3" value={mappedRow.ngayApDung} readOnly />

                        <label className="form-label">Giá Vé (VND)</label>
                        <input className="form-control mb-3" value={mappedRow.giaVe} readOnly />

                        <label className="form-label">Ghi Chú</label>
                        <textarea className="form-control" rows={3} value={mappedRow.ghiChu} readOnly />
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
}
