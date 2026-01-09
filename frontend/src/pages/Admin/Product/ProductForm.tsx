import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import type { Category, Product, ProductFormData } from '../../../models/Product/Product';
import mammoth from 'mammoth';

// Bổ sung interface cho đầy đủ field
interface ExtendedProductFormData extends ProductFormData {
  sku: string;
  file_url: string;
  weight: number;
  length: number;
  width: number;
  height: number;
}

interface ProductFormProps {
  initialData?: Product;
  isEdit?: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({ initialData, isEdit = false }) => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState<(File | null)[]>([null]);
  const [descriptionFile, setDescriptionFile] = useState<File | null>(null);

  // State form đầy đủ
  const [formData, setFormData] = useState<ExtendedProductFormData>({
    name: '',
    author: '',
    publisher: '',
    publication_year: new Date().getFullYear(),
    language: 'Tiếng Việt',
    description: '',
    status: 1,
    
    // Product Detail
    product_type: 'Sách giấy',
    sku: '', // Mã SKU
    original_price: 0,
    sale_price: 0,
    stock: 0,
    
    // Các trường bổ sung
    file_url: '', // Cho sách điện tử
    weight: 0,    // Gram
    length: 0,    // cm
    width: 0,     // cm
    height: 0,    // cm
    
    category_ids: [],
    images: [''] 
  });

  // Load danh mục
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/api/categories');
        if (res.data.success) setCategories(res.data.data.data); 
      } catch (err) { console.error("Lỗi tải danh mục:", err); }
    };
    fetchCategories();
  }, []);

  // Đổ dữ liệu khi sửa
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        author: initialData.author || '',
        publisher: initialData.publisher || '',
        publication_year: initialData.publication_year || 2024,
        language: initialData.language || 'Tiếng Việt',
        description: initialData.description || '',
        status: initialData.status ? 1 : 0,
        
        // Detail
        product_type: initialData.detail?.product_type || 'Sách giấy',
        sku: initialData.detail?.sku || '',
        original_price: Number(initialData.detail?.original_price || 0),
        sale_price: Number(initialData.detail?.sale_price || 0),
        stock: Number(initialData.detail?.stock || 0),
        
        file_url: initialData.detail?.file_url || '',
        weight: Number(initialData.detail?.weight || 0),
        length: Number(initialData.detail?.length || 0),
        width: Number(initialData.detail?.width || 0),
        height: Number(initialData.detail?.height || 0),
        
        category_ids: initialData.categories?.map(c => c.id) || [],
        images: initialData.images && initialData.images.length > 0
          ? initialData.images.map(img => img.image_url) 
          : ['']
      });
      setImageFiles(new Array(initialData.images?.length || 1).fill(null));
    }
  }, [initialData]);

  // --- Handlers ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    const categoryId = Number(e.target.value);
    setFormData(prev => {
        const currentIds = prev.category_ids;
        return {
            ...prev,
            category_ids: isChecked ? [...currentIds, categoryId] : currentIds.filter(id => id !== categoryId)
        };
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setDescriptionFile(file);
      try {
        if (file.type === 'text/plain') {
          const text = await file.text();
          setFormData(prev => ({ ...prev, description: text }));
        } else if (file.name.endsWith('.docx')) {
          const arrayBuffer = await file.arrayBuffer();
          const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
          setFormData(prev => ({ ...prev, description: result.value }));
        }
      } catch (error) { alert("Không thể đọc nội dung file này."); }
    }
  };

  // Image Handlers giữ nguyên như code cũ...
  const handleImageFileSelect = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const previewUrl = URL.createObjectURL(file);
      const newImages = [...formData.images];
      newImages[index] = previewUrl;
      setFormData(prev => ({ ...prev, images: newImages }));
      const newImageFiles = [...imageFiles];
      newImageFiles[index] = file;
      setImageFiles(newImageFiles);
    }
  };
  const handleImageChange = (index: number, value: string) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData(prev => ({ ...prev, images: newImages }));
  };
  const addImageField = () => {
    setFormData(prev => ({ ...prev, images: [...prev.images, ''] }));
    setImageFiles(prev => [...prev, null]);
  };
  const removeImageField = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, images: newImages }));
    const newImageFiles = imageFiles.filter((_, i) => i !== index);
    setImageFiles(newImageFiles);
  };

  // --- SUBMIT ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(formData.sale_price) > Number(formData.original_price)) {
        alert('Giá bán không được lớn hơn giá gốc'); return;
    }
    setLoading(true);

    try {
      // 1. Dữ liệu Product (FormData)
      const productPayload = new FormData();
      productPayload.append('name', formData.name);
      productPayload.append('author', formData.author);
      productPayload.append('publisher', formData.publisher);
      productPayload.append('publication_year', String(formData.publication_year));
      productPayload.append('language', formData.language);
      productPayload.append('status', String(formData.status));
      productPayload.append('description', formData.description); 
      formData.category_ids.forEach(id => productPayload.append('categories[]', String(id)));
      
      formData.images.forEach((url, idx) => {
        const file = imageFiles[idx];
        if (file) productPayload.append('image_uploads[]', file);
        else if (url.trim() && !url.startsWith('blob:')) productPayload.append('images[]', url);
      });

      // 2. Dữ liệu Detail (JSON Object)
      const detailPayload = {
        product_type: formData.product_type,
        sku: formData.sku || `SKU-${Date.now()}`, // Tự sinh nếu rỗng
        original_price: formData.original_price,
        sale_price: formData.sale_price,
        stock: formData.stock,
        file_url: formData.product_type === 'Sách điện tử' ? formData.file_url : null,
        weight: formData.product_type === 'Sách giấy' ? formData.weight : null,
        length: formData.product_type === 'Sách giấy' ? formData.length : null,
        width: formData.product_type === 'Sách giấy' ? formData.width : null,
        height: formData.product_type === 'Sách giấy' ? formData.height : null,
      };

      if (isEdit && initialData) {
        // === SỬA ===
        productPayload.append('_method', 'PUT');
        await axios.post(`http://127.0.0.1:8000/api/products/${initialData.id}`, productPayload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (initialData.detail?.id) {
            // Thêm product_id vào payload update detail
            await axios.put(`http://127.0.0.1:8000/api/product-details/${initialData.detail.id}`, {
                ...detailPayload,
                product_id: initialData.id 
            });
        } else {
            // Nếu sản phẩm cũ chưa có detail thì tạo mới
            await axios.post('http://127.0.0.1:8000/api/product-details', {
                ...detailPayload,
                product_id: initialData.id
            });
        }
        alert('Cập nhật sản phẩm thành công!');

      } else {
        // === THÊM MỚI ===
        const res = await axios.post('http://127.0.0.1:8000/api/products', productPayload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (res.data.status) {
            const newProduct = res.data.data;
            await axios.post('http://127.0.0.1:8000/api/product-details', {
                ...detailPayload,
                product_id: newProduct.id
            });
            alert('Thêm sản phẩm thành công!');
        }
      }
      navigate('/admin/products');

    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || 'Có lỗi xảy ra';
      alert(`Lỗi: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="row g-3">
      {/* CỘT TRÁI: THÔNG TIN CƠ BẢN */}
      <div className="col-md-8">
        <div className="card mb-3">
          <div className="card-header fw-bold">Thông tin chung</div>
          <div className="card-body row g-3">
            <div className="col-12">
              <label className="form-label">Tên sản phẩm <span className="text-danger">*</span></label>
              <input type="text" className="form-control" name="name" value={formData.name} required onChange={handleChange} />
            </div>
            {/* Các trường Author, Publisher... giữ nguyên */}
            <div className="col-md-6">
                <label className="form-label">Tác giả</label>
                <input type="text" className="form-control" name="author" value={formData.author} onChange={handleChange} />
            </div>
            <div className="col-md-6">
                <label className="form-label">Nhà xuất bản</label>
                <input type="text" className="form-control" name="publisher" value={formData.publisher} onChange={handleChange} />
            </div>
            <div className="col-md-6">
                <label className="form-label">Năm xuất bản</label>
                <input type="number" className="form-control" name="publication_year" value={formData.publication_year} onChange={handleChange} />
            </div>
            <div className="col-md-6">
                <label className="form-label">Ngôn ngữ</label>
                <select className="form-select" name="language" value={formData.language} onChange={handleChange}>
                    <option value="Tiếng Việt">Tiếng Việt</option>
                    <option value="Tiếng Anh">Tiếng Anh</option>
                </select>
            </div>
            
            <div className="col-12">
                <label className="form-label">Mô tả (File)</label>
                <input type="file" className="form-control" accept=".docx,.txt" onChange={handleFileChange} />
                <textarea className="form-control mt-2" rows={4} name="description" value={formData.description} onChange={handleChange}></textarea>
            </div>
          </div>
        </div>

        {/* THÔNG TIN CHI TIẾT & GIÁ */}
        <div className="card mb-3">
          <div className="card-header fw-bold text-primary">Chi tiết & Giá bán</div>
          <div className="card-body row g-3">
            <div className="col-md-6">
              <label className="form-label">Loại sản phẩm</label>
              <select className="form-select" name="product_type" value={formData.product_type} onChange={handleChange}>
                <option value="Sách giấy">Sách giấy</option>
                <option value="Sách điện tử">Sách điện tử</option>
              </select>
            </div>
            
            <div className="col-md-6">
              <label className="form-label">Mã SKU</label>
              <input type="text" className="form-control" name="sku" value={formData.sku} placeholder="Tự động nếu để trống" onChange={handleChange} />
            </div>

            <div className="col-md-6">
              <label className="form-label">Giá gốc (VNĐ)</label>
              <input type="number" className="form-control" name="original_price" min="0" value={formData.original_price} required onChange={handleChange} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Giá bán (VNĐ)</label>
              <input type="number" className="form-control" name="sale_price" min="0" value={formData.sale_price} required onChange={handleChange} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Tồn kho</label>
              <input type="number" className="form-control" name="stock" min="0" value={formData.stock} required onChange={handleChange} />
            </div>

            {/* Hiển thị động dựa theo loại sản phẩm */}
            {formData.product_type === 'Sách điện tử' ? (
                <div className="col-md-12">
                    <label className="form-label">Link File Sách (URL)</label>
                    <input type="text" className="form-control" name="file_url" value={formData.file_url} onChange={handleChange} placeholder="https://..." />
                </div>
            ) : (
                <>
                    <div className="col-md-3">
                        <label className="form-label">Trọng lượng (g)</label>
                        <input type="number" className="form-control" name="weight" value={formData.weight} onChange={handleChange} />
                    </div>
                    <div className="col-md-3">
                        <label className="form-label">Dài (cm)</label>
                        <input type="number" className="form-control" name="length" value={formData.length} onChange={handleChange} />
                    </div>
                    <div className="col-md-3">
                        <label className="form-label">Rộng (cm)</label>
                        <input type="number" className="form-control" name="width" value={formData.width} onChange={handleChange} />
                    </div>
                    <div className="col-md-3">
                        <label className="form-label">Cao (cm)</label>
                        <input type="number" className="form-control" name="height" value={formData.height} onChange={handleChange} />
                    </div>
                </>
            )}
          </div>
        </div>
      </div>

      {/* CỘT PHẢI */}
      <div className="col-md-4">
        <div className="card mb-3">
          <div className="card-header fw-bold">Thiết lập</div>
          <div className="card-body">
            <div className="mb-3">
              <label className="form-label">Trạng thái</label>
              <select className="form-select" name="status" value={formData.status} onChange={handleChange}>
                <option value={1}>Hiển thị</option>
                <option value={0}>Ẩn</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Danh mục</label>
              <div className="card p-3" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                {categories.map(cat => (
                  <div key={cat.id} className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`category-${cat.id}`}
                      value={cat.id}
                      checked={formData.category_ids.includes(cat.id)}
                      onChange={handleCategoryChange}
                    />
                    <label className="form-check-label" htmlFor={`category-${cat.id}`}>{cat.name}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* IMAGE UPLOAD SECTION */}
        <div className="card">
          <div className="card-header fw-bold">Hình ảnh</div>
          <div className="card-body">
            {formData.images.map((url, idx) => (
              <div key={idx} className="mb-3 border p-2 rounded bg-light">
                <div className="d-flex justify-content-between mb-2">
                    <span className="badge bg-secondary">Ảnh {idx + 1}</span>
                    {formData.images.length > 1 && <button type="button" className="btn-close" onClick={() => removeImageField(idx)}></button>}
                </div>
                <div className="input-group mb-2">
                    <span className="input-group-text"><i className="bi bi-link-45deg"></i></span>
                    <input type="text" className="form-control form-control-sm" value={!imageFiles[idx] ? url : ''} disabled={!!imageFiles[idx]} onChange={(e) => handleImageChange(idx, e.target.value)} placeholder="Link online..." />
                </div>
                <div className="input-group mb-2">
                    <span className="input-group-text"><i className="bi bi-upload"></i></span>
                    <input type="file" className="form-control form-control-sm" accept="image/*" onChange={(e) => handleImageFileSelect(idx, e)} />
                </div>
                {url && <div className="text-center"><img src={url} alt="preview" style={{maxHeight: '100px'}} /></div>}
              </div>
            ))}
            <button type="button" className="btn btn-sm btn-outline-primary w-100" onClick={addImageField}>+ Thêm ảnh</button>
          </div>
        </div>
      </div>

      <div className="col-12 mt-3 text-end">
        <button type="button" className="btn btn-secondary me-2" onClick={() => navigate('/admin/products')}>Hủy bỏ</button>
        <button type="submit" className="btn btn-primary px-4" disabled={loading}>{loading ? 'Đang xử lý...' : (isEdit ? 'Lưu thay đổi' : 'Tạo sản phẩm')}</button>
      </div>
    </form>
  );
};

export default ProductForm;