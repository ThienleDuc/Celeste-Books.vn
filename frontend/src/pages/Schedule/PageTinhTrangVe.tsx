import { useState, useMemo, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef, GridRowParams } from "@mui/x-data-grid";
import { type TinhTrangVe, dataTinhTrangVe } from "../../models/dataTinhTrangVe";
import { Helmet } from "react-helmet";

const PageTinhTrangVe = () => {
  const [rows, setRows] = useState<TinhTrangVe[]>(dataTinhTrangVe);

  // Sinh mã mới tự động theo định dạng TT01, TT02, ...
  const generateMaTinhTrang = (): string => {
    if (rows.length === 0) return "TT01";
    const maxNumber = Math.max(
      ...rows.map(r => parseInt(r.maTinhTrang.replace("TT", ""), 10))
    );
    return `TT${(maxNumber + 1).toString().padStart(2, "0")}`;
  };

  const [formData, setFormData] = useState<TinhTrangVe>({
    maTinhTrang: generateMaTinhTrang(),
    tenTinhTrang: "",
    heSoGia: 1.0,
    ghiChu: "",
  });

  const [isEdit, setIsEdit] = useState(false);
  const [searchText, setSearchText] = useState("");

  const resetFormForAdd = () => {
    setFormData({
      maTinhTrang: generateMaTinhTrang(),
      tenTinhTrang: "",
      heSoGia: 1.0,
      ghiChu: "",
    });
    setIsEdit(false);
  };

  const filteredRows = useMemo(() => {
    const text = searchText.toLowerCase();
    return rows.filter(
      r =>
        r.tenTinhTrang.toLowerCase().includes(text) ||
        r.maTinhTrang.toLowerCase().includes(text)
    );
  }, [rows, searchText]);

  const columns: GridColDef[] = [
    { field: "maTinhTrang", headerName: "Mã Tình Trạng", type: "string", flex: 1 },
    { field: "tenTinhTrang", headerName: "Tên Tình Trạng", flex: 2 },
    { field: "heSoGia", headerName: "Hệ Số Giá", type: "number", flex: 1 },
    { field: "ghiChu", headerName: "Ghi Chú", flex: 2 },
  ];

  const handleRowClick = (row: TinhTrangVe) => {
    setFormData(row);
    setIsEdit(true);
  };

  const handleAdd = () => {
    setRows([...rows, formData]);
    resetFormForAdd();
  };

  const handleUpdate = () => {
    setRows(rows.map(r => r.maTinhTrang === formData.maTinhTrang ? formData : r));
    resetFormForAdd();
  };

  const handleDelete = () => {
    setRows(rows.filter(r => r.maTinhTrang !== formData.maTinhTrang));
    resetFormForAdd();
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
  useEffect(() => { resetFormForAdd(); }, []);

  return (
    <>
    <Helmet>
        <title>Quản lý Tình Trạng Vé</title>
    </Helmet>
    <div className="container mt-4">
      <h3>Quản lý Tình Trạng Vé</h3>

      <div className="row">
        {/* Cột trái: Form + Search */}
        <div className="col-md-4">
          <input
            type="text"
            className="form-control mb-2"
            placeholder="Tìm kiếm..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
          />
          <div className="card">
            <div className="card-header text-center">Tạo / Sửa / Xóa</div>
            <div className="card-body">
              <input
                type="text"
                className="form-control mb-2"
                placeholder="Mã Tình Trạng"
                value={formData.maTinhTrang}
                readOnly
              />
              <input
                type="text"
                className="form-control mb-2"
                placeholder="Tên Tình Trạng"
                value={formData.tenTinhTrang}
                onChange={e => setFormData({ ...formData, tenTinhTrang: e.target.value })}
              />
              <input
                type="number"
                className="form-control mb-2"
                placeholder="Hệ Số Giá"
                value={formData.heSoGia}
                onChange={e => setFormData({ ...formData, heSoGia: parseFloat(e.target.value) })}
              />
              <textarea
                className="form-control mb-2"
                placeholder="Ghi Chú"
                rows={2}
                value={formData.ghiChu}
                onChange={e => setFormData({ ...formData, ghiChu: e.target.value })}
              />

              <div className="d-flex gap-2 mt-2">
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
          </div>
        </div>

        {/* Cột phải: DataGrid */}
        <div className="col-md-8">
          <DataGrid
            rows={filteredRows.map(r => ({ ...r, id: r.maTinhTrang }))}
            columns={columns}
            pageSizeOptions={[5, 10]}
            initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
            onRowClick={(params: GridRowParams) => handleRowClick(params.row as TinhTrangVe)}
          />
        </div>
      </div>
    </div>
    </>
  );
};

export default PageTinhTrangVe;
