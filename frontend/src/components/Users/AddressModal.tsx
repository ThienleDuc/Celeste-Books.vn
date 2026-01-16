// src/components/users/AddressModal.tsx
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import AddressSelect from './AddressSelect';
import type { UserAddress } from '../../api/user.adress.api';
import { locationApi } from '../../api/locations.api';

interface AddressModalProps {
  show: boolean;
  onHide: () => void;
  editingAddress: UserAddress | null;
  onSave: (data: {
    label?: string | null;
    receiver_name: string;
    phone: string;
    street_address: string;
    commune_id?: number | null;
    is_default?: boolean;
  }) => Promise<void>;
  saving: boolean;
  userId: string;
}

const AddressModal: React.FC<AddressModalProps> = ({
  show,
  onHide,
  editingAddress,
  onSave,
  saving,
  userId
}) => {
  const [formData, setFormData] = useState({
    label: '',
    receiver_name: '',
    phone: '',
    street_address: '',
    commune_id: '',
    is_default: false,
  });

  const [selectedProvinceId, setSelectedProvinceId] = useState<string>('');
  const [selectedCommuneId, setSelectedCommuneId] = useState<string>('');
  const [loadingProvince, setLoadingProvince] = useState(false);
  const [errors, setErrors] = useState<{
    receiver_name?: string;
    phone?: string;
    street_address?: string;
    commune_id?: string;
  }>({});

  // Validate phone number - KHỚP với BE: digits:10
  const validatePhoneNumber = (phone: string): boolean => {
    return /^\d{10}$/.test(phone);
  };

  // Load province từ commune_id khi edit
  const loadProvinceFromCommuneId = async (communeId: number) => {
    if (!communeId) return;
    
    try {
      setLoadingProvince(true);
      const response = await locationApi.getProvinceByCommuneId(communeId);
      
      if (response.data?.success && response.data.data) {
        const provinceId = response.data.data.province_id;
        setSelectedProvinceId(provinceId.toString());
      }
    } catch (error) {
      console.error('Failed to load province from commune:', error);
    } finally {
      setLoadingProvince(false);
    }
  };

  // Initialize form with editing address data
  useEffect(() => {
    if (editingAddress && show) {
      const initialFormData = {
        label: editingAddress.label || '',
        receiver_name: editingAddress.receiver_name || '',
        phone: editingAddress.phone || '',
        street_address: editingAddress.street_address || '',
        commune_id: editingAddress.commune_id?.toString() || '',
        is_default: editingAddress.is_default || false,
      };
      
      setFormData(initialFormData);
      
      const communeId = editingAddress.commune_id;
      if (communeId) {
        setSelectedCommuneId(communeId.toString());
        // Load province từ commune_id
        loadProvinceFromCommuneId(communeId);
      } else {
        setSelectedCommuneId('');
        setSelectedProvinceId('');
      }
      
      // Clear errors khi edit
      setErrors({});
    } else {
      // Reset form khi thêm mới
      setFormData({
        label: '',
        receiver_name: '',
        phone: '',
        street_address: '',
        commune_id: '',
        is_default: false,
      });
      setSelectedProvinceId('');
      setSelectedCommuneId('');
      setErrors({});
    }
  }, [editingAddress, show]);

  // Xử lý input thay đổi (text/textarea)
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Xử lý phone: chỉ cho nhập số
    if (name === 'phone') {
      const numericValue = value.replace(/\D/g, '');
      setFormData(prev => ({ ...prev, [name]: numericValue }));
      
      // Validate phone real-time
      if (numericValue && !validatePhoneNumber(numericValue)) {
        setErrors(prev => ({ 
          ...prev, 
          phone: 'Số điện thoại phải có đúng 10 chữ số' 
        }));
      } else {
        setErrors(prev => ({ ...prev, phone: undefined }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error khi user bắt đầu nhập lại
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // Xử lý checkbox thay đổi
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleProvinceSelect = (provinceId: string) => {
    setSelectedProvinceId(provinceId);
    // Reset commune khi chọn tỉnh mới
    setSelectedCommuneId('');
    setFormData(prev => ({ ...prev, commune_id: '' }));
    
    // Clear commune error
    if (errors.commune_id) {
      setErrors(prev => ({ ...prev, commune_id: undefined }));
    }
  };

  const handleCommuneSelect = (communeId: string) => {
    setSelectedCommuneId(communeId);
    setFormData(prev => ({ ...prev, commune_id: communeId }));
    
    // Clear commune error
    if (errors.commune_id) {
      setErrors(prev => ({ ...prev, commune_id: undefined }));
    }
  };

  // Validate form data - KHỚP với BE validation
  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};
    let isValid = true;

    // 1. Tên người nhận: required, max 50 (BE: required|string|max:50)
    if (!formData.receiver_name.trim()) {
      newErrors.receiver_name = 'Vui lòng nhập tên người nhận';
      isValid = false;
    } else if (formData.receiver_name.length > 50) {
      newErrors.receiver_name = 'Tên người nhận không được quá 50 ký tự';
      isValid = false;
    }

    // 2. Phone: required, digits:10 (BE: required|digits:10)
    if (!formData.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
      isValid = false;
    } else if (!validatePhoneNumber(formData.phone)) {
      newErrors.phone = 'Số điện thoại phải có đúng 10 chữ số';
      isValid = false;
    }

    // 3. Địa chỉ chi tiết: required, max 255 (BE: required|string|max:255)
    if (!formData.street_address.trim()) {
      newErrors.street_address = 'Vui lòng nhập địa chỉ chi tiết';
      isValid = false;
    } else if (formData.street_address.length > 255) {
      newErrors.street_address = 'Địa chỉ không được quá 255 ký tự';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    // Prepare data khớp với BE
    const saveData = {
      label: formData.label.trim() || null,
      receiver_name: formData.receiver_name.trim(),
      phone: formData.phone.trim(),
      street_address: formData.street_address.trim(),
      commune_id: formData.commune_id ? parseInt(formData.commune_id) : null,
      is_default: formData.is_default,
    };

    console.log('Submitting address data:', saveData, 'for userId:', userId);
    onSave(saveData);
  };

  // Format phone number để hiển thị đẹp
  const formatPhoneDisplay = (phone: string): string => {
    if (!phone) return '';
    if (phone.length === 10) {
      return phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
    }
    return phone;
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" backdrop="static" keyboard={false}>
      <Modal.Header closeButton={!saving && !loadingProvince}>
        <Modal.Title>
          <i className="bi bi-geo-alt me-2"></i>
          {editingAddress ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
        </Modal.Title>
        {userId && (
          <span className="text-muted small ms-2">
            User ID: {userId}
          </span>
        )}
      </Modal.Header>
      <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        <Form>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Tên địa chỉ (tùy chọn)</Form.Label>
                <Form.Control
                  type="text"
                  name="label"
                  value={formData.label}
                  onChange={handleTextChange}
                  placeholder="VD: Nhà riêng, Công ty"
                  disabled={saving}
                  maxLength={50}
                />
                <Form.Text className="text-muted">
                  Tên dễ nhớ cho địa chỉ, tối đa 50 ký tự
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  Tên người nhận <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="receiver_name"
                  value={formData.receiver_name}
                  onChange={handleTextChange}
                  placeholder="Nhập tên người nhận"
                  required
                  disabled={saving}
                  isInvalid={!!errors.receiver_name}
                  maxLength={50}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.receiver_name}
                </Form.Control.Feedback>
                <div className="small text-end text-muted">
                  {formData.receiver_name.length}/50
                </div>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  Số điện thoại <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="tel"
                  name="phone"
                  value={formatPhoneDisplay(formData.phone)}
                  onChange={handleTextChange}
                  placeholder="VD: 0987654321"
                  required
                  disabled={saving}
                  isInvalid={!!errors.phone}
                  maxLength={10}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.phone}
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                  Nhập đúng 10 chữ số, ví dụ: 0987654321
                </Form.Text>
                <div className="small text-end text-muted">
                  {formData.phone.length}/10
                </div>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  Địa chỉ chi tiết <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="street_address"
                  value={formData.street_address}
                  onChange={handleTextChange}
                  placeholder="VD: Số 123, Đường ABC, Tòa nhà XYZ"
                  required
                  disabled={saving}
                  isInvalid={!!errors.street_address}
                  maxLength={255}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.street_address}
                </Form.Control.Feedback>
                <div className="small text-end text-muted">
                  {formData.street_address.length}/255
                </div>
              </Form.Group>
            </Col>
          </Row>

          {/* Address Selection Component */}
          {loadingProvince ? (
            <div className="text-center py-3">
              <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
              <span>Đang tải thông tin tỉnh...</span>
            </div>
          ) : (
            <AddressSelect
              selectedProvinceId={selectedProvinceId}
              selectedCommuneId={selectedCommuneId}
              onProvinceSelect={handleProvinceSelect}
              onCommuneSelect={handleCommuneSelect}
              disabled={saving}
            />
          )}

          {/* Hiển thị warning nếu không chọn commune */}
          {!formData.commune_id && (
            <div className="alert alert-warning small mb-3 py-2">
              <i className="bi bi-exclamation-triangle me-2"></i>
              Bạn chưa chọn Phường/Xã. Bạn có thể lưu địa chỉ không có thông tin này.
            </div>
          )}

          <Form.Group className="mb-3">
            <div className="d-flex align-items-center">
              <Form.Check
                type="checkbox"
                id="is_default_checkbox"
                name="is_default"
                checked={formData.is_default}
                onChange={handleCheckboxChange}
                disabled={saving}
                className="me-2"
              />
              <Form.Label 
                htmlFor="is_default_checkbox"
                className="mb-0"
                style={{ cursor: saving ? 'not-allowed' : 'pointer' }}
              >
                Đặt làm địa chỉ mặc định
              </Form.Label>
            </div>
            <Form.Text className="text-muted">
              {editingAddress && editingAddress.is_default 
                ? 'Đây là địa chỉ mặc định hiện tại' 
                : 'Địa chỉ mặc định sẽ được sử dụng cho giao hàng'}
            </Form.Text>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button 
          variant="secondary" 
          onClick={onHide} 
          disabled={saving || loadingProvince}
        >
          Hủy
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSubmit}
          disabled={saving || loadingProvince}
          className="px-4"
        >
          {saving ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              Đang lưu...
            </>
          ) : editingAddress ? (
            <>
              <i className="bi bi-check-circle me-2"></i>
              Cập nhật
            </>
          ) : (
            <>
              <i className="bi bi-plus-circle me-2"></i>
              Thêm mới
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddressModal;