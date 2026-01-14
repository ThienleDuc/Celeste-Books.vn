import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Package, AlertTriangle } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#10b981', '#f59e0b'];

const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

const ProductStatsPage = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/statistics/products')
      .then(res => res.data.success && setData(res.data.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const chartData = useMemo(() => {
    if (!data) return { categoryData: [], topProducts: [] };
    
    // Top 5 sản phẩm
    const topProducts = data.top_products.map((p: any) => ({
      name: p.name.length > 15 ? p.name.slice(0, 15) + '...' : p.name,
      revenue: Number(p.total_revenue),
      sold: Number(p.total_sold)
    }));

    // Danh mục
    const categoryData = data.category_distribution.map((c: any) => ({
        name: c.name,
        value: Number(c.value)
    }));

    return { topProducts, categoryData };
  }, [data]);

  if (loading) return <div className="p-8 text-center">Đang tải dữ liệu sản phẩm...</div>;

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Package className="text-indigo-600" /> Thống Kê Hiệu Suất Sản Phẩm
      </h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-indigo-500">
          <p className="text-slate-500">Tổng sản phẩm</p>
          <h3 className="text-3xl font-bold">{data?.overview.total_products}</h3>
          <span className="text-sm text-green-600">Active: {data?.overview.active_products}</span>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500">
          <p className="text-slate-500 flex items-center gap-2">
             Cảnh báo tồn kho <AlertTriangle className="w-4 h-4 text-red-500"/>
          </p>
          <h3 className="text-3xl font-bold text-red-600">{data?.overview.out_of_stock_alert}</h3>
          <span className="text-sm text-slate-400">Sản phẩm dưới 10 items</span>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-emerald-500">
          <p className="text-slate-500">Sản phẩm bán chạy nhất</p>
          <h3 className="text-lg font-bold truncate" title={data?.top_products[0]?.name}>
            {data?.top_products[0]?.name || 'Chưa có'}
          </h3>
          <span className="text-sm text-emerald-600">
            {formatCurrency(data?.top_products[0]?.total_revenue || 0)}
          </span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Revenue Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="font-bold mb-4 text-slate-700">Top 5 Sản phẩm doanh thu cao</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.topProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={120} tick={{fontSize: 12}} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} cursor={{fill: 'transparent'}} />
              <Bar dataKey="revenue" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="font-bold mb-4 text-slate-700">Tỷ trọng doanh thu theo danh mục</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData.categoryData}
                cx="50%" cy="50%"
                innerRadius={60} outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.categoryData.map((_:any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table Detail */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="font-bold">Chi tiết kho & Doanh thu</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase">
              <tr>
                <th className="px-6 py-3">Sản phẩm</th>
                <th className="px-6 py-3 text-center">Tồn kho</th>
                <th className="px-6 py-3 text-center">Đã bán</th>
                <th className="px-6 py-3 text-right">Doanh thu</th>
              </tr>
            </thead>
            <tbody>
              {data?.products_list.map((p: any) => (
                <tr key={p.id} className="border-b hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium">{p.name}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs ${Number(p.current_stock) < 10 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                      {p.current_stock}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">{p.units_sold}</td>
                  <td className="px-6 py-4 text-right font-bold text-indigo-600">
                    {formatCurrency(Number(p.revenue))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductStatsPage;