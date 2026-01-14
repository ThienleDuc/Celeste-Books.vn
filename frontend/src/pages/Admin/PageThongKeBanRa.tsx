import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import { TrendingUp, ShoppingBag, Calendar ,Download} from 'lucide-react'; // Thêm icon Calendar, X
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import styles from './PageThongKe.module.css';
import Pagination from '../../components/Utils/Pagination';

// ================= TYPES =================
interface TopCustomer {
  username: string;
  full_name: string;
  total_spent: string;
}

interface SalesProductStat {
  id: number;
  name: string;
  categories: string;
  sale_price: string;
  units_sold: number;
  revenue: string;
  status: number;
}

interface SalesData {
  overview: {
    total_revenue: string;
    total_orders_delivered: number;
    avg_order_value: string;
    top_customers: TopCustomer[];
  };
  products_list: SalesProductStat[];
}

// ================= UTILS =================
const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#10b981', '#f59e0b'];
const formatCurrency = (amount: string | number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(amount));

const PageThongKeBanRa: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<SalesData | null>(null);
  
  // State bộ lọc
  const [filters, setFilters] = useState({ 
    date_from: '', 
    date_to: '', 
    search: '' 
  });

  const [debouncedSearch] = useState(filters.search);

  const [exporting, setExporting] = useState(false);

  // State phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
            `http://127.0.0.1:8000/api/statistics/sales/export/?${params.toString()}`,
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



  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      // Chỉ append param nếu có giá trị
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      if (filters.search) params.append('search', filters.search);

      const res = await axios.get(`http://127.0.0.1:8000/api/statistics/sales?${params.toString()}`);
      if (res.data.success) {
        setData(res.data.data);
        setCurrentPage(1); // Reset về trang 1 khi filter đổi
      }
    } catch (e) {
      console.error('Lỗi tải thống kê bán ra:', e);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ================= DATA PROCESSING =================
  const chartData = useMemo(() => {
    if (!data) return { topProducts: [], categoryRevenue: [] };

    const topProducts = [...data.products_list]
      .sort((a, b) => Number(b.revenue) - Number(a.revenue))
      .slice(0, 5)
      .map(p => ({
        name: p.name.length > 15 ? p.name.slice(0, 15) + '...' : p.name,
        revenue: Number(p.revenue),
      }));

    const catMap: Record<string, number> = {};
    data.products_list.forEach(p => {
      const cats = p.categories?.split(', ') || ['Khác'];
      cats.forEach(c => catMap[c] = (catMap[c] || 0) + Number(p.revenue));
    });
    
    const categoryRevenue = Object.entries(catMap)
      .map(([k, v]) => ({ name: k, value: v }))
      .sort((a, b) => b.value - a.value);

    return { topProducts, categoryRevenue };
  }, [data]);

  const currentTableData = useMemo(() => {
    if (!data?.products_list) return [];
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return data.products_list.slice(indexOfFirstItem, indexOfLastItem);
  }, [data, currentPage]);

  return (
    <div className={styles.container}>
      {/* HEADER & FILTERS */}
      <div className={styles.header}>
        <div>
          <h1 className="text-3xl font-extrabold flex items-center gap-3 text-indigo-700">
            <TrendingUp className="w-8 h-8" /> Thống Kê Bán Ra
          </h1>
          <p className="text-slate-500">Doanh thu và hiệu quả kinh doanh</p>
        </div>

        {/* DATE FILTER UI */}
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

      {/* SUMMARY CARDS */}
      <div className={styles.summaryGrid}>
        <div className={styles.card}>
          <p className="text-slate-400 font-semibold">Tổng doanh thu</p>
          <h3 className="text-3xl font-bold mt-2 text-indigo-600">
            {loading ? '...' : formatCurrency(data?.overview.total_revenue || 0)}
          </h3>
          {filters.date_from && <span className="text-xs text-indigo-400 mt-1 block">(Trong khoảng đã chọn)</span>}
        </div>
        <div className={styles.card}>
          <p className="text-slate-400 font-semibold">Số đơn hoàn thành</p>
          <h3 className="text-3xl font-bold mt-2 text-slate-800">
            {loading ? '...' : data?.overview.total_orders_delivered || 0}
          </h3>
        </div>
        <div className={styles.card}>
          <p className="text-slate-400 font-semibold">Giá trị đơn trung bình</p>
          <h3 className="text-3xl font-bold mt-2 text-emerald-600">
            {loading ? '...' : formatCurrency(data?.overview.avg_order_value || 0)}
          </h3>
        </div>
      </div>

      {/* CHARTS */}
      <div className={styles.chartHalfGrid}>
        <div className={styles.card}>
          <h3 className="font-bold mb-4">Tỷ trọng doanh thu theo danh mục</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={chartData.categoryRevenue} cx="50%" cy="50%" outerRadius={80} dataKey="value">
                {chartData.categoryRevenue.map((_, i) => (
                  <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className={styles.card}>
          <h3 className="font-bold mb-4">Top 5 Sản phẩm doanh thu cao nhất</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.topProducts}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis hide />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* TABLE */}
      <div className={styles.card}>
        <div className="p-4 border-b font-bold flex items-center gap-2">
          <ShoppingBag className="w-5 h-5" /> Chi tiết sản phẩm bán ra
        </div>
        <div className="overflow-x-auto min-h-[300px]">
            <table className={styles.table}>
            <thead className={styles.tableHeader}>
                <tr>
                <th>Sản phẩm</th>
                <th className="text-right">Giá bán</th>
                <th className="text-center">Số lượng bán</th>
                <th className="text-right">Tổng doanh thu</th>
                </tr>
            </thead>
            <tbody>
                {loading ? (
                    <tr><td colSpan={4} className="text-center p-4">Đang tải...</td></tr>
                ) : currentTableData.length > 0 ? (
                    currentTableData.map(p => (
                    <tr key={p.id} className={styles.tableRow}>
                        <td className={styles.tableCell}>
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-slate-400">{p.categories}</div>
                        </td>
                        <td className="text-right px-4">{formatCurrency(p.sale_price)}</td>
                        <td className="text-center px-4 font-bold">{p.units_sold}</td>
                        <td className="text-right px-4 text-indigo-600 font-bold">{formatCurrency(p.revenue)}</td>
                    </tr>
                    ))
                ) : (
                    <tr><td colSpan={4} className="text-center p-4">Không có dữ liệu trong khoảng thời gian này</td></tr>
                )}
            </tbody>
            </table>
        </div>
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

export default PageThongKeBanRa;