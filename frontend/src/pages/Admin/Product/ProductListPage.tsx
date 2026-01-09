import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
// Đảm bảo đường dẫn import đúng với dự án của bạn
import type { ProductListItem } from '../../../models/Product/Product'; 

const ProductListPage: React.FC = () => {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState('');
  
  // 1. Thêm state cho việc sắp xếp
  const [sortBy, setSortBy] = useState('id'); // Mặc định sắp xếp theo ID
  const [sortOrder, setSortOrder] = useState('desc'); // Mặc định mới nhất trước

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://127.0.0.1:8000/api/products', {
        params: { 
            search: search,
            sort_by: sortBy,      // Gửi cột cần sort
            sort_order: sortOrder // Gửi chiều sort (asc/desc)
        }
      });

      if (response.data && response.data.data && Array.isArray(response.data.data.data)) {
         setProducts(response.data.data.data);
      } else if (response.data && Array.isArray(response.data.data)) {
         setProducts(response.data.data);
      }
    } catch (error) {
      console.error("Lỗi tải sản phẩm:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Thêm dependency sortBy và sortOrder để tự động fetch lại khi đổi sort
  useEffect(() => {
    const timer = setTimeout(() => {
        fetchProducts();
    }, 500);
    return () => clearTimeout(timer);
  }, [search, sortBy, sortOrder]);

  const handleDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/products/${id}`);
        alert('Xóa thành công!');
        fetchProducts(); 
      } catch (error) {
        alert('Xóa thất bại');
      }
    }
  };

  // 3. Hàm xử lý khi click vào header
  const handleSort = (column: string) => {
    if (sortBy === column) {
      // Nếu click lại cột đang sort -> Đảo chiều
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Nếu click cột mới -> Set cột đó và mặc định là desc (hoặc asc tùy ý)
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  // 4. Hàm hiển thị icon sort
  const renderSortIcon = (column: string) => {
    if (sortBy !== column) {
      // Icon mờ khi không sort cột này
      return <i className="bi bi-arrow-down-up text-muted ms-1" style={{ fontSize: '0.75rem', opacity: 0.5 }}></i>;
    }
    return sortOrder === 'asc' 
      ? <i className="bi bi-sort-up ms-1 text-primary"></i> 
      : <i className="bi bi-sort-down ms-1 text-primary"></i>;
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Quản Lý Sản Phẩm</h2>
        <Link to="/admin/products/add" className="btn btn-primary">
          <i className="bi bi-plus-lg"></i> Thêm Sản Phẩm
        </Link>
      </div>

      <div className="card shadow-sm">
        <div className="card-header bg-white">
          <input 
            type="text" 
            className="form-control" 
            placeholder="Tìm kiếm theo tên..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="card-body p-0">
          <table className="table table-hover mb-0 align-middle">
            <thead className="table-light">
              <tr>
                {/* Cột ID */}
                <th 
                    style={{ cursor: 'pointer', userSelect: 'none' }} 
                    onClick={() => handleSort('id')}
                >
                    ID {renderSortIcon('id')}
                </th>
                
                <th>Hình ảnh</th>
                
                {/* Cột Tên */}
                <th 
                    style={{ cursor: 'pointer', userSelect: 'none' }} 
                    onClick={() => handleSort('name')}
                >
                    Tên Sản Phẩm {renderSortIcon('name')}
                </th>
                
                {/* Cột Giá Bán (backend dùng 'sale_price') */}
                <th 
                    style={{ cursor: 'pointer', userSelect: 'none' }} 
                    onClick={() => handleSort('sale_price')}
                >
                    Giá Bán {renderSortIcon('sale_price')}
                </th>
                
                {/* Cột Thống Kê (Sắp xếp theo Lượt xem làm đại diện) */}
                <th 
                    style={{ cursor: 'pointer', userSelect: 'none' }} 
                    onClick={() => handleSort('views')}
                    title="Sắp xếp theo lượt xem"
                >
                    Thống Kê {renderSortIcon('views')}
                </th>
                
                <th className="text-end">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center p-4">Đang tải...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={6} className="text-center p-4">Không có dữ liệu</td></tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id}>
                    <td>#{p.id}</td>
                    <td>
                      <img 
                        src={p.image || '/img/no-image.png'} 
                        alt={p.name} 
                        width="50" 
                        height="65" 
                        className="object-fit-cover rounded border"
                      />
                    </td>
                    <td>
                      <div className="fw-bold text-truncate" style={{maxWidth: '250px'}}>{p.name}</div>
                      <small className="text-muted">{p.slug}</small>
                    </td>
                    <td>
                      <div className="fw-bold text-primary">
                        {Number(p.sale_price).toLocaleString('vi-VN')} đ
                      </div>
                      <small className="text-decoration-line-through text-muted" style={{fontSize: '0.8em'}}>
                        {Number(p.original_price).toLocaleString('vi-VN')} đ
                      </small>
                    </td>
                    <td>
                      <div style={{fontSize: '0.85rem'}}>
                        <div><i className="bi bi-eye"></i> {p.views}</div>
                        <div><i className="bi bi-cart"></i> {p.purchase_count}</div>
                        <div><i className="bi bi-star-fill text-warning"></i> {p.rating}</div>
                      </div>
                    </td>
                    <td className="text-end">
                      <Link to={`/admin/products/edit/${p.id}`} className="btn btn-sm btn-outline-primary me-2">
                        <i className="bi bi-pencil"></i>
                      </Link>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(p.id)}>
                        <i className="bi bi-trash"></i>
                      </button>
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

export default ProductListPage;