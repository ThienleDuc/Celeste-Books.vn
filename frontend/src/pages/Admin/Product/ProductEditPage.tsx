import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import type { Product } from '../../../models/Product/Product';
import ProductForm from './ProductForm';

const ProductEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        // Gọi API lấy chi tiết sản phẩm
        // ProductController@index (hoặc show) trả về JSON có kèm relation 'detail' và 'categories'
        // Cần đảm bảo backend trả về đúng cấu trúc này.
        // Dựa vào code ProductController bạn gửi, phương thức searchByName hoặc index có join bảng.
        // Tuy nhiên, để sửa, tốt nhất nên có 1 API show($id) trả về Product::with(['detail', 'categories', 'images'])->find($id)
        
        const res = await axios.get(`http://127.0.0.1:8000/api/products/${id}`);
        
        // Kiểm tra cấu trúc response của Laravel
        if (res.data.status || res.data.success) {
            setProduct(res.data.data); 
        } else {
            alert(res.data.message || "Không lấy được dữ liệu sản phẩm");
            navigate('/admin/products');
        }
      } catch (error) {
        console.error("Lỗi:", error);
        alert("Không tìm thấy sản phẩm hoặc lỗi kết nối");
        navigate('/admin/products');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id, navigate]);

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{minHeight: '300px'}}>
        <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
        </div>
        <span className="ms-2">Đang tải dữ liệu sản phẩm...</span>
    </div>
  );

  return (
    <div className="container mt-4 mb-5">
      <div className="d-flex align-items-center mb-4">
        <button className="btn btn-link text-decoration-none me-2" onClick={() => navigate('/admin/products')}>
            <i className="bi bi-arrow-left"></i>
        </button>
        <h2 className="mb-0">Cập Nhật Sản Phẩm #{id}</h2>
      </div>
      
      {/* Truyền dữ liệu vào Form */}
      {product && <ProductForm initialData={product} isEdit={true} />}
    </div>
  );
};

export default ProductEditPage;