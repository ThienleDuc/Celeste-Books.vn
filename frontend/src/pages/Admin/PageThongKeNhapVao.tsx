import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Package, AlertTriangle, Archive, DollarSign, Calendar, Download } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import styles from './PageThongKe.module.css';
import Pagination from '../../components/Utils/Pagination';

// ================= TYPES =================
interface InventoryProductStat {
  id: number;
  name: string;
  sku: string;
  categories: string;
  original_price: string;
  current_stock: number;
  total_import_value: string;
  status: number;
}

interface InventoryData {
  overview: {
    total_inventory_value: string;
    total_items_in_stock: number;
    low_stock_items: number;
  };
  products_list: InventoryProductStat[];
}

// ================= UTILS =================
const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6'];
const formatCurrency = (amount: string | number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(amount));

const PageThongKeNhapVao: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<InventoryData | null>(null);
  const [search, setSearch] = useState('');

  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
    // --- Filter State ---

      // State bộ lọc
    const [filters, setFilters] = useState({ 
    date_from: '', 
    date_to: '', 
    search: '' 
    });

    const [debouncedSearch] = useState(filters.search);

  const [exporting, setExporting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://127.0.0.1:8000/api/statistics/inventory?search=${search}`);
      if (res.data.success) {
        setData(res.data.data);
        setCurrentPage(1); // Reset page khi search đổi
      }
    } catch (e) {
      console.error('Lỗi tải thống kê kho:', e);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchData(); }, [fetchData]);

    // Hàm xử lý thay đổi input
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleExport = async () => {
    try {
        setExporting(true);
        const params = new URLSearchParams();
        
        // Gán các filter hiện tại vào params để xuất báo cáo đúng theo bộ lọc
        Object.entries(filters).forEach(([k, v]) => v && params.append(k, v));
        if (debouncedSearch) params.set('search', debouncedSearch);

        // Gọi API với responseType là 'blob' (file binary)
        const response = await axios.get(
            `http://127.0.0.1:8000/api/statistics/inventory/export/?${params.toString()}`,
            { responseType: 'blob' }
        );

        // Tạo đường dẫn tải về ảo
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        
        // Đặt tên file (lấy ngày giờ hiện tại)
        const fileName = `BaoCao_ThongKe_${new Date().toISOString().split('T')[0]}.csv`;
        link.setAttribute('download', fileName);
        
        // Kích hoạt click và dọn dẹp
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

    } catch (error) {
        console.error("Lỗi xuất báo cáo:", error);
        alert("Có lỗi xảy ra khi xuất báo cáo.");
    } finally {
        setExporting(false);
    }
};

  // ================= CHART DATA =================
  const chartData = useMemo(() => {
    if (!data) return { stockDistribution: [], inventoryValueByCat: [] };

    const stockMap: Record<string, number> = {};
    const valueMap: Record<string, number> = {};

    data.products_list.forEach(p => {
      const cat = p.categories?.split(', ')[0] || 'Khác';
      stockMap[cat] = (stockMap[cat] || 0) + p.current_stock;
      valueMap[cat] = (valueMap[cat] || 0) + Number(p.total_import_value);
    });

    const stockDistribution = Object.entries(stockMap).map(([k, v]) => ({ name: k, value: v }));
    const inventoryValueByCat = Object.entries(valueMap).map(([k, v]) => ({ name: k, value: v }));

    return { stockDistribution, inventoryValueByCat };
  }, [data]);

  // ================= PAGINATION LOGIC =================
  const currentTableData = useMemo(() => {
    if (!data?.products_list) return [];
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return data.products_list.slice(indexOfFirstItem, indexOfLastItem);
  }, [data, currentPage]);

  return (
    <div className={styles.container}>
      {/* ... (Giữ nguyên phần Header & Summary Cards) ... */}
      <div className={styles.header}>
        <div>
          <h1 className="text-3xl font-extrabold flex items-center gap-3 text-emerald-700">
            <Package className="w-8 h-8" /> Thống Kê Kho & Nhập Hàng
          </h1>
          <p className="text-slate-500">Quản lý giá trị tồn kho và tình trạng hàng hóa</p>
        </div>

        <div className={styles.headerActions}>
          <div
            className="
              group flex items-center gap-3
              bg-white px-4 py-2.5 rounded-2xl border shadow-sm
              transition-all duration-300 ease-out
              hover:shadow-lg hover:-translate-y-0.5
              focus-within:ring-2 focus-within:ring-indigo-500
            "
          >
            {/* ICON */}
            <Calendar
              className="
                w-5 h-5 text-indigo-500
                transition-transform duration-300
                group-hover:scale-110
              "
            />

            {/* DATE FROM */}
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 leading-none">
                Từ ngày
              </span>
              <input
                type="date"
                name="date_from"
                value={filters.date_from}
                max={filters.date_to}
                onChange={handleFilterChange}
                className="
                  text-sm font-medium text-slate-700
                  bg-transparent outline-none
                  transition-colors duration-200
                  focus:text-indigo-600
                "
              />
            </div>

            {/* DIVIDER */}
            <span className="h-7 w-px bg-slate-200" />

            {/* DATE TO */}
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 leading-none">
                Đến ngày
              </span>
              <input
                type="date"
                name="date_to"
                value={filters.date_to}
                min={filters.date_from}
                onChange={handleFilterChange}
                className="
                  text-sm font-medium text-slate-700
                  bg-transparent outline-none
                  transition-colors duration-200
                  focus:text-indigo-600
                "
              />
            </div>
          </div>
          <button 
              onClick={handleExport}
              disabled={exporting || loading}
              className={`border-none flex items-center gap-2 px-4 py-2 rounded-xl shadow transition-colors text-#212529 
                  ${exporting || loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
              {exporting ? (
                  // Icon loading xoay xoay khi đang tải
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                  <Download className="w-4 h-4" />
              )}
              {exporting ? 'Đang xuất...' : 'Xuất báo cáo'}
          </button>
        </div>
      </div>

      <div className={styles.summaryGrid}>
        <div className={styles.card}>
          <p className="text-slate-400 font-semibold flex items-center gap-2">
             <DollarSign className="w-4 h-4" /> Tổng giá trị tồn kho (Vốn)
          </p>
          <h3 className="text-3xl font-bold mt-2 text-emerald-600">
            {loading ? '...' : formatCurrency(data?.overview.total_inventory_value || 0)}
          </h3>
        </div>
        <div className={styles.card}>
          <p className="text-slate-400 font-semibold flex items-center gap-2">
            <Archive className="w-4 h-4" /> Tổng sản phẩm trong kho
          </p>
          <h3 className="text-3xl font-bold mt-2 text-slate-800">
            {loading ? '...' : data?.overview.total_items_in_stock || 0}
          </h3>
          <span className="text-xs text-slate-400">đơn vị sản phẩm</span>
        </div>
        <div className={`${styles.card} ${Number(data?.overview.low_stock_items) > 0 ? 'bg-red-50 border-red-200' : ''}`}>
          <p className="text-slate-400 font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" /> Cảnh báo sắp hết hàng
          </p>
          <h3 className="text-3xl font-bold mt-2 text-red-600">
            {loading ? '...' : data?.overview.low_stock_items || 0}
          </h3>
          <span className="text-xs text-red-400">sản phẩm có tồn kho &lt; 10</span>
        </div>
      </div>

      {/* CHARTS */}
      <div className={styles.chartHalfGrid}>
         {/* (Giữ nguyên charts) */}
        <div className={styles.card}>
          <h3 className="font-bold mb-4">Phân bổ vốn theo danh mục</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={chartData.inventoryValueByCat} cx="50%" cy="50%" outerRadius={80} dataKey="value">
                {chartData.inventoryValueByCat.map((_, i) => (
                  <Cell key={`cell-v-${i}`} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.card}>
          <h3 className="font-bold mb-4">Số lượng tồn kho theo danh mục</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.stockDistribution}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" name="Số lượng" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* TABLE WITH PAGINATION */}
      <div className={styles.card}>
        <div className="p-4 border-b font-bold flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5" /> Chi tiết Nhập & Tồn kho
          </div>
          <input 
            type="text" 
            placeholder="Tìm theo tên hoặc SKU..." 
            className="border rounded px-3 py-1 text-sm font-normal"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        {/* Table Wrapper */}
        <div className="overflow-x-auto min-h-[300px]">
            <table className={styles.table}>
            <thead className={styles.tableHeader}>
                <tr>
                <th>Sản phẩm / SKU</th>
                <th className="text-right">Giá gốc (Giá nhập)</th>
                <th className="text-center">Tồn kho hiện tại</th>
                <th className="text-right">Tổng giá trị kho</th>
                <th className="text-center">Trạng thái</th>
                </tr>
            </thead>
            <tbody>
                {loading ? (
                    <tr><td colSpan={5} className="text-center p-4">Đang tải...</td></tr>
                ) : currentTableData.length > 0 ? (
                    currentTableData.map(p => (
                    <tr key={p.id} className={styles.tableRow}>
                        <td className={styles.tableCell}>
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-slate-500 font-mono">SKU: {p.sku}</div>
                        </td>
                        <td className="text-right px-4 text-slate-600">{formatCurrency(p.original_price)}</td>
                        <td className="text-center px-4">
                        <span className={`px-2 py-1 rounded font-bold text-xs ${p.current_stock < 10 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                            {p.current_stock}
                        </span>
                        </td>
                        <td className="text-right px-4 text-emerald-700 font-bold">{formatCurrency(p.total_import_value)}</td>
                        <td className="text-center px-4">
                        <span className={`text-xs ${p.status === 1 ? 'text-green-600' : 'text-gray-400'}`}>
                            {p.status === 1 ? 'Đang kinh doanh' : 'Ngừng kinh doanh'}
                        </span>
                        </td>
                    </tr>
                    ))
                ) : (
                    <tr><td colSpan={5} className="text-center p-4">Không tìm thấy sản phẩm</td></tr>
                )}
            </tbody>
            </table>
        </div>

        {/* Component Pagination */}
        <div className="card-footer bg-white border-top-0 py-3">
             <Pagination
                currentPage={currentPage}
                totalItems={data?.products_list.length || 0}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
             />
        </div>
      </div>
    </div>
  );
};

export default PageThongKeNhapVao;