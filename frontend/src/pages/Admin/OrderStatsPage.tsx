import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { TrendingUp, ShoppingBag, Calendar, Users } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';

const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

const OrderStatsPage = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Filter state
  const [dateFrom, setDateFrom] = useState(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);

  const fetchData = () => {
    setLoading(true);
    axios.get(`http://127.0.0.1:8000/api/statistics/orders?date_from=${dateFrom}&date_to=${dateTo}`)
      .then(res => res.data.success && setData(res.data.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []); // First load

  const chartData = useMemo(() => {
    if (!data) return { revenueTrend: [], statusData: [], topCustomers: [] };

    // 1. Xu hướng doanh thu (Line/Area)
    const revenueTrend = data.revenue_trend.map((d: any) => ({
        date: new Date(d.date).toLocaleDateString('vi-VN', {day: '2-digit', month: '2-digit'}),
        revenue: Number(d.revenue),
        orders: d.order_count
    }));

    // 2. Phân bố trạng thái đơn (Bar)
    const statusMap: Record<string, string> = { 
        'pending': 'Chờ xử lý', 'processing': 'Đang xử lý', 'shipping': 'Đang giao', 
        'delivered': 'Đã giao', 'cancelled': 'Đã hủy', 'returned': 'Trả hàng' 
    };
    const statusData = data.status_distribution.map((s: any) => ({
        name: statusMap[s.status] || s.status,
        value: s.count,
        color: s.status === 'delivered' ? '#10b981' : (s.status === 'cancelled' ? '#ef4444' : '#f59e0b')
    }));

    // 3. Top khách hàng
    const topCustomers = data.top_customers.map((c: any) => ({
        name: c.username,
        spent: Number(c.total_spent)
    }));

    return { revenueTrend, statusData, topCustomers };
  }, [data]);

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShoppingBag className="text-emerald-600" /> Thống Kê Kinh Doanh
        </h1>
        
        {/* Date Filter */}
        <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm border">
            <Calendar className="w-4 h-4 text-slate-400"/>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="text-sm outline-none"/>
            <span className="text-slate-400">-</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="text-sm outline-none"/>
            <button onClick={fetchData} className="ml-2 bg-emerald-600 text-white px-3 py-1 rounded text-sm hover:bg-emerald-700">Lọc</button>
        </div>
      </div>

      {loading ? <div className="text-center py-10">Đang cập nhật dữ liệu...</div> : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-5 rounded-xl shadow-sm">
                <p className="text-slate-500 text-sm">Doanh thu thực tế</p>
                <h3 className="text-2xl font-bold text-emerald-600">{formatCurrency(data?.overview.total_revenue || 0)}</h3>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm">
                <p className="text-slate-500 text-sm">Tổng đơn hàng</p>
                <h3 className="text-2xl font-bold">{data?.overview.total_orders}</h3>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm">
                <p className="text-slate-500 text-sm">Tỷ lệ thành công</p>
                <h3 className="text-2xl font-bold text-blue-600">
                    {data?.overview.total_orders ? Math.round((data.overview.delivered_orders / data.overview.total_orders) * 100) : 0}%
                </h3>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm">
                <p className="text-slate-500 text-sm">Đơn hủy</p>
                <h3 className="text-2xl font-bold text-red-500">{data?.overview.cancelled_orders}</h3>
            </div>
          </div>

          {/* Charts Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Revenue Trend (Chiếm 2/3) */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4"/> Xu hướng doanh thu
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={chartData.revenueTrend}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" />
                        <YAxis tickFormatter={(val) => `${val/1000000}M`} />
                        <Tooltip formatter={(val) => formatCurrency(Number(val))} />
                        <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Order Status (Chiếm 1/3) */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="font-bold mb-4">Trạng thái đơn hàng</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData.statusData} layout="vertical">
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
          </div>

          {/* Top Customers */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
             <h3 className="font-bold mb-4 flex items-center gap-2">
                <Users className="w-4 h-4"/> Khách hàng VIP
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {chartData.topCustomers.map((c: any, idx: number) => (
                    <div key={idx} className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                        <div className="font-bold text-indigo-700 mb-1">{c.name}</div>
                        <div className="text-sm text-slate-500">Chi tiêu:</div>
                        <div className="font-semibold text-slate-800">{formatCurrency(c.spent)}</div>
                    </div>
                ))}
             </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OrderStatsPage;