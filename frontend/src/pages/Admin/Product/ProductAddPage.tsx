import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProductForm from './ProductForm';

const ProductAddPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="container mt-4 mb-5">
      <div className="d-flex align-items-center mb-4">
        <button 
          className="btn btn-link text-decoration-none me-2" 
          onClick={() => navigate('/admin/products')}
          title="Quay lại danh sách"
        >
            <i className="bi bi-arrow-left" style={{ fontSize: '1.5rem' }}></i>
        </button>
        <h2 className="mb-0">Thêm Sản Phẩm Mới</h2>
      </div>
      
      <ProductForm isEdit={false} />
    </div>
  );
};

export default ProductAddPage;