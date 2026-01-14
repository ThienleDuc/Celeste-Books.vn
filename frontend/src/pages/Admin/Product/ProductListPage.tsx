import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
// Đảm bảo đường dẫn import đúng với dự án của bạn
import type { ProductListItem } from '../../../models/Product/Product.ts';
import Pagination from '../../../components/Utils/Pagination.tsx';

const ProductListPage: React.FC = () => {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState('');
  
  // 1. Thêm state cho việc sắp xếp
  const [sortBy, setSortBy] = useState('id'); // Mặc định sắp xếp theo ID
  const [sortOrder, setSortOrder] = useState('desc'); // Mặc định mới nhất trước

  // 2. Thêm State phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Mặc định 20 hoặc lấy từ API

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Gọi API với các tham số khớp với ProductController::index
      const response = await axios.get('http://127.0.0.1:8000/api/products/list', {
        params: { 
            search: search,       // Backend: $request->get('search')
            sort_by: sortBy,      // Backend: $request->get('sort_by')
            sort_order: sortOrder,// Backend: $request->get('sort_order')
            page: currentPage,    // Backend: $request->get('page')
            per_page: itemsPerPage // Backend: $request->get('per_page')
        }
      });

      const res = response.data;

      // 3. Xử lý dữ liệu trả về dựa trên cấu trúc JSON của Controller
      if (res.status) {
         // Controller trả về: 'data' => ['data' => ..., 'total' => ..., 'per_page' => ...]
         const paginationData = res.data;
         
         if (paginationData) {
             setProducts(paginationData.data || []);
             setTotalItems(paginationData.total || 0);
             setItemsPerPage(paginationData.per_page || 20);
             // Đồng bộ lại trang hiện tại từ server (đề phòng trường hợp request trang quá lớn)
             if (paginationData.current_page !== currentPage) {
                 setCurrentPage(paginationData.current_page);
             }
         }
      } else {
          // Xử lý trường hợp status: false
          setProducts([]);
          setTotalItems(0);
          console.warn(res.message);
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
  }, [search, sortBy, sortOrder, currentPage]);

  // 6. Hàm xử lý khi chuyển trang
  const handlePageChange = (page: number) => {
      setCurrentPage(page);
      // Scroll lên đầu trang cho mượt
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      try {
        const res = await axios.delete(`http://127.0.0.1:8000/api/products/${id}`);
        if (res.data.status) {
            alert('Xóa thành công!');
            // Nếu xóa hết item ở trang cuối, lùi lại 1 trang
            if (products.length === 1 && currentPage > 1) {
                setCurrentPage(prev => prev - 1);
            } else {
                fetchProducts(); 
            }
        } else {
            alert(res.data.message || 'Xóa thất bại');
        }
      } catch (error) {
        alert('Lỗi khi xóa sản phẩm');
      }
    }
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
    setCurrentPage(1); // Reset về trang 1 khi sort
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
          <div className="row g-2">
              <div className="col-md-4">
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Tìm kiếm theo tên..." 
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setCurrentPage(1); // Reset trang khi search
                    }}
                  />
              </div>
              {/* Nếu muốn cho phép chọn số lượng item/trang */}
              {/* <div className="col-md-2">
                  <select 
                    className="form-select" 
                    value={itemsPerPage} 
                    onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                    }}
                  >
                      <option value="10">10 / trang</option>
                      <option value="20">20 / trang</option>
                      <option value="50">50 / trang</option>
                  </select>
              </div> */}
          </div>
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
        {/* 7. Thêm Component Pagination vào Footer của Card */}
        <div className="card-footer bg-white border-top-0 py-3">
            <Pagination 
                currentPage={currentPage}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
            />
        </div>
      </div>
    </div>
  );
};

export default ProductListPage;