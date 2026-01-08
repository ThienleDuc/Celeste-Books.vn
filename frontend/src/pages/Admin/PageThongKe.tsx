import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import {
  LayoutDashboard, Calendar, Package, Download, TrendingUp
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

// Import CSS Module
import styles from './PageThongKe.module.css';

// ================= TYPES =================
interface TopCustomer {
  username: string;
  full_name: string;
  total_spent: string;
}

interface ProductStat {
  id: number;
  name: string;
  categories: string;
  product_type: string;
  sale_price: string;
  current_stock: number;
  units_sold: number;
  revenue: string;
  avg_rating: string;
  status: number;
}

interface StatisticsData {
  overview: {
    total_revenue: string;
    total_orders_delivered: number;
    top_customers: TopCustomer[];
  };
  products_list: ProductStat[];
}

// ================= UTILS =================
const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#10b981', '#f59e0b'];

const formatCurrency = (amount: string | number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
    .format(Number(amount));

const cn = (...classes: string[]) => classes.filter(Boolean).join(' ');

// ================= COMPONENT =================
const PageThongKe: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<StatisticsData | null>(null);

  const [filters, setFilters] = useState({
    date_from: '',
    date_to: '',
    status: '',
    language: '',
    search: ''
  });

  const [debouncedSearch, setDebouncedSearch] = useState(filters.search);

  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(filters.search), 500);
    return () => clearTimeout(t);
  }, [filters.search]);

  // ================= FETCH =================
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => v && params.append(k, v));
      if (debouncedSearch) params.set('search', debouncedSearch);

      const res = await axios.get(
        `http://127.0.0.1:8000/api/statistics?${params.toString()}`
      );

      if (res.data.success) setData(res.data.data);

    } catch (e) {
      console.error('Lỗi tải thống kê:', e);
    } finally {
      setLoading(false);
    }
  }, [filters, debouncedSearch]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setFilters(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleExport = async () => {
    try {
        setExporting(true);
        const params = new URLSearchParams();
        
        // Gán các filter hiện tại vào params để xuất báo cáo đúng theo bộ lọc
        Object.entries(filters).forEach(([k, v]) => v && params.append(k, v));
        if (debouncedSearch) params.set('search', debouncedSearch);

        // Gọi API với responseType là 'blob' (file binary)
        const response = await axios.get(
            `http://127.0.0.1:8000/api/statistics/export?${params.toString()}`,
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
    if (!data) return {
      topProducts: [], categoryData: [],
      statusData: [], topCustomers: []
    };

    // --- Top products ---
    const topProducts = [...data.products_list]
      .sort((a, b) => Number(b.revenue) - Number(a.revenue))
      .slice(0, 5)
      .map(p => ({
        name: p.name.length > 14 ? p.name.slice(0, 14) + '…' : p.name,
        revenue: Number(p.revenue),
        sold: Number(p.units_sold)
      }));

    // --- Category revenue ---
    const catMap: Record<string, number> = {};
    data.products_list.forEach(p => {
      const cats = p.categories?.split(', ') || ['Khác'];
      cats.forEach(c => catMap[c] = (catMap[c] || 0) + Number(p.revenue));
    });
    const categoryData = Object.entries(catMap)
      .map(([k, v]) => ({ name: k, value: v }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    // --- Status distribution ---
    const statusData = [
      { name: 'Đang bán', value: data.products_list.filter(p => p.status === 1).length },
      { name: 'Ngừng bán', value: data.products_list.filter(p => p.status === 0).length }
    ];

    // --- Top customers ---
    const topCustomers = data.overview.top_customers.map(c => ({
      name: c.full_name,
      value: Number(c.total_spent)
    }));

    return { topProducts, categoryData, statusData, topCustomers };
  }, [data]);

  // ================= TOOLTIP =================
type TooltipItem = {
  name?: string;
  value?: number | string;
  color?: string;
};

type CustomTooltipProps = {
  active?: boolean;
  payload?: TooltipItem[];
  label?: string;
};

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-white p-3 rounded-lg shadow-lg border text-sm">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((e: TooltipItem, i: number) => (
        <p key={i} style={{ color: e.color }}>
          {e.name}: {typeof e.value === 'number'
            ? formatCurrency(e.value)
            : e.value}
        </p>
      ))}
    </div>
  );
};


  // ================= RENDER =================
  return (
    <div className={styles.container}>
      {/* ================= HEADER ================= */}
      <div className={styles.header}>
        <div>
          <h1 className="text-3xl font-extrabold flex items-center gap-3">
            <LayoutDashboard className="w-8 h-8 text-indigo-600" />
            Dashboard Thống Kê
          </h1>
          <p className="text-slate-500">Báo cáo & phân tích dữ liệu kinh doanh</p>
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

      {/* ================= SUMMARY CARDS ================= */}
      <div className={styles.summaryGrid}>
        {/* Doanh thu */}
        <div className={styles.card}>
          <p className="text-slate-400 font-semibold">Tổng doanh thu</p>
          <h3 className="text-3xl font-bold mt-2 text-slate-800">
            {loading ? '...' : formatCurrency(data?.overview.total_revenue || 0)}
          </h3>
          <div className="mt-2 flex items-center text-emerald-500 text-sm font-medium">
            <TrendingUp className="w-4 h-4 mr-1" /> +12.5%
          </div>
        </div>

        {/* Đơn hàng */}
        <div className={styles.card}>
          <p className="text-slate-400 font-semibold">Đơn hoàn thành</p>
          <h3 className="text-3xl font-bold mt-2 text-slate-800">
            {loading ? '...' : data?.overview.total_orders_delivered || 0}
          </h3>
        </div>

        {/* Top customer */}
        <div className={`${styles.card} bg-gradient-to-br from-indigo-600 to-purple-700 text-#4b5563 border-none`}>
          <p className="text-indigo-200 font-semibold">Khách hàng VIP</p>
          <h3 className="text-2xl font-bold mt-1">
            {data?.overview.top_customers[0]?.full_name || '---'}
          </h3>
          <p className="text-indigo-100 text-sm mt-1">
            Chi tiêu: {formatCurrency(data?.overview.top_customers[0]?.total_spent || 0)}
          </p>
        </div>
      </div>

      {/* ================= PIE CHARTS (SPLIT) ================= */}
      {/* Đây là phần bạn đã gặp lỗi Layout, giờ nó được xử lý bởi class chartHalfGrid */}
      <div className={styles.chartHalfGrid}>
        
        {/* Pie: Category */}
        <div className={styles.card}>
          <h3 className="font-bold mb-4 text-slate-800">Doanh thu theo danh mục</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData.categoryData}
                cx="50%" cy="50%"
                innerRadius={60} outerRadius={100}
                dataKey="value"
                paddingAngle={5}
              >
                {chartData.categoryData.map((_, i) => (
                  <Cell key={`cat-${i}`} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Pie: Status */}
        <div className={styles.card}>
          <h3 className="font-bold mb-4 text-slate-800">Trạng thái sản phẩm</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData.statusData}
                cx="50%" cy="50%"
                outerRadius={90}
                dataKey="value"
              >
                {chartData.statusData.map((_, i) => (
                  <Cell key={`status-${i}`} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ================= BAR CHARTS (FULL WIDTH) ================= */}
      <div className={styles.section}>
        <div className={styles.card}>
          <h3 className="font-bold mb-4 text-slate-800">Top sản phẩm doanh thu</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.topProducts}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} dy={10} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
              <Legend />
              <Bar dataKey="revenue" name="Doanh thu" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={50} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.card}>
          <h3 className="font-bold mb-4 text-slate-800">Top khách hàng</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.topCustomers} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={150} tick={{fontSize: 12}} />
              <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
              <Bar dataKey="value" name="Chi tiêu" fill="#10b981" radius={[0, 6, 6, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ================= PRODUCT TABLE ================= */}
      <div className={styles.card} style={{ padding: 0, overflow: 'hidden' }}>
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold flex items-center gap-2 text-slate-800">
            <Package className="w-5 h-5 text-indigo-500" />
            Danh sách sản phẩm
          </h3>
          <div className="flex gap-3">
            <input type="text" name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Tìm sản phẩm..."
              className={styles.filterInput} />
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead className={styles.tableHeader}>
              <tr>
                <th>Tên sản phẩm</th>
                <th className="text-center">Đã bán</th>
                <th className="text-right">Doanh thu</th>
                <th className="text-center">Tồn kho</th>
                <th className="text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="p-6 text-center text-slate-500">Đang tải dữ liệu...</td></tr>
              ) : data?.products_list.length === 0 ? (
                <tr><td colSpan={5} className="p-6 text-center text-slate-500">Không tìm thấy sản phẩm nào</td></tr>
              ) : (
                data?.products_list.map(p => (
                  <tr key={`${p.id}-${p.product_type}`} className={styles.tableRow}>
                    <td className={styles.tableCell}>
                      <div className="font-medium text-slate-700">{p.name}</div>
                      <div className="text-xs text-slate-400">{p.categories}</div>
                    </td>
                    <td className={`${styles.tableCell} text-center`}>{p.units_sold}</td>
                    <td className={`${styles.tableCell} text-right text-indigo-600 font-semibold`}>
                      {formatCurrency(p.revenue)}
                    </td>
                    <td className={`${styles.tableCell} text-center`}>
                      <span className={cn(
                        "px-2 py-1 rounded text-xs font-bold",
                        p.current_stock < 10 ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
                      )}>
                        {p.current_stock}
                      </span>
                    </td>
                    <td className={`${styles.tableCell} text-center`}>
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-bold",
                        p.status === 1
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      )}>
                        {p.status === 1 ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PageThongKe;