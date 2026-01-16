import  { useState, useEffect } from 'react';

// 1. Định nghĩa kiểu dữ liệu cho Order (Interface)
interface Order {
    id: number;
    order_code: string;
    user_id: number;
    username: string;
    subtotal: number;
    shipping_fee: number;
    total_amount: number;
    status: string;
    payment_method: string;
    payment_status: string;
    created_at: string;
    full_name:string;
}

const AdminOrderPage = () => {
    // 2. Sửa useState: Thêm <Order[]> để TypeScript hiểu đây là mảng các Order
    const [orders, setOrders] = useState<Order[]>([]); 
    const [loading, setLoading] = useState<boolean>(false);

    const formatCurrency = (amount: number | string) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(amount));
    };

    // Helper: Màu sắc cho badge trạng thái
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'processing': return 'bg-blue-100 text-blue-800';
            case 'shipped': return 'bg-purple-100 text-purple-800';
            case 'delivered': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // 1. Hàm lấy danh sách đơn hàng
    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:8000/api/orders`);
            if (!response.ok) throw new Error('Failed to fetch');
            const data = await response.json();
            setOrders(data);
        } catch (error) {
            console.error('Lỗi khi tải đơn hàng:', error);
        } finally {
            setLoading(false);
        }
    };

    // Gọi API khi component vừa chạy
    useEffect(() => {
        fetchOrders();
    }, []);

    // 2. Hàm cập nhật trạng thái
    const handleUpdateStatus = async (orderId: number, newStatus: string) => {
        try {
            // Cập nhật giao diện ngay lập tức (Optimistic UI)
            const updatedOrders = orders.map(order => 
                order.id === orderId ? { ...order, status: newStatus } : order
            );
            setOrders(updatedOrders);

            // Gọi API cập nhật
            const response = await fetch(`http://localhost:8000/api/orders/${orderId}}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                throw new Error('Cập nhật thất bại');
                fetchOrders(); // Nếu lỗi thì load lại data cũ
            } else {
                alert(`Đã cập nhật đơn hàng #${orderId} thành công!`);
            }
        } catch (error) {
            console.error('Lỗi cập nhật:', error);
            alert('Có lỗi xảy ra, vui lòng thử lại');
        }
    };

    if (loading && orders.length === 0) return <div className="p-4">Đang tải dữ liệu...</div>;

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">DANH SÁCH ĐƠN HÀNG CHƯA XÁC NHẬN</h1>
            
            <div className="overflow-x-auto shadow-md sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã Đơn</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách Hàng</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng Tiền</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phương thức thanh Toán</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái thanh toán</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày Đặt</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng Thái </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {orders.map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                {/* Mã đơn */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {order.order_code || `#${order.id}`}
                                </td>
                                
                                {/* Username */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {order.full_name || 'Khách vãng lai'}
                                </td>

                                {/* Tổng tiền */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                                    {formatCurrency(order.total_amount || order.subtotal)}
                                </td>

                              
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {order.payment_method }
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {order.payment_status }
                                </td>

                                {/* Ngày đặt */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(order.created_at).toLocaleDateString('vi-VN')}
                                </td>

                                {/* Cột Action: Thay đổi trạng thái */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <select
                                        value={order.status}
                                        onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                                        className={`block w-full px-3 py-1.5 text-sm font-semibold rounded-full border-0 cursor-pointer focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${getStatusColor(order.status)}`}
                                    >
                                        <option value="pending"> Chờ xác nhận</option>
                                        <option value="processing"> Xác nhận </option>
                                        
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminOrderPage;