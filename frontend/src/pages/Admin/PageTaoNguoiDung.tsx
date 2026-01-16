// src/components/users/CreateUserPage.tsx
import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Breadcrumb, 
  Card, 
  Row, 
  Col, 
  Button, 
  Form, 
  Alert, 
  Spinner
} from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { AxiosError } from 'axios';
import { userApi } from '../../api/users.api';
import { rolesApi } from '../../api/roles.api';
import type { Role } from '../../api/roles.api';
import type { CreateUserPayload } from '../../api/users.api';
import '../../assets/css/CreateUserPage.css';

// Define interface for API errors
interface ApiErrorResponse {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
}

// Helper function to format date to YYYY-MM-DD
const formatToMySQLDate = (dateString: string): string | null => {
  if (!dateString.trim()) return null;
  
  const str = dateString.trim();
  
  try {
    // If already YYYY-MM-DD, validate it
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      const date = new Date(str);
      return isNaN(date.getTime()) ? null : str;
    }
    
    // Try parsing as Date object
    const date = new Date(str);
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    
    // Try DD/MM/YYYY format
    if (str.includes('/')) {
      const parts = str.split('/').map(p => p.trim());
      if (parts.length === 3) {
        const [day, month, year] = parts;
        const fullYear = year.length === 2 ? `20${year}` : year;
        const date = new Date(`${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
        return isNaN(date.getTime()) ? null : `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
    }
    
    // Try DD-MM-YYYY format
    if (str.includes('-') && str.match(/-/g)?.length === 2) {
      const parts = str.split('-').map(p => p.trim());
      if (parts.length === 3) {
        let year: string, month: string, day: string;
        
        if (parts[0].length === 4) {
          // YYYY-MM-DD
          [year, month, day] = parts;
        } else {
          // DD-MM-YYYY
          [day, month, year] = parts;
        }
        
        const fullYear = year.length === 2 ? `20${year}` : year;
        const date = new Date(`${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
        return isNaN(date.getTime()) ? null : `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error formatting date:', error);
    return null;
  }
};

const CreateUserPage: React.FC = () => {
  const navigate = useNavigate();
  
  // ========== Form State ==========
  const [formData, setFormData] = useState<CreateUserPayload>({
    username: '',
    email: '',
    password: '',
    role_id: '',
    full_name: '',
    phone: '',
    birthday: '',
    gender: null,
    is_active: true
  });
  
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // ========== Effects ==========

  // Load roles on mount
  useEffect(() => {
    fetchRoles();
  }, []);

  // ========== API Functions ==========

  const fetchRoles = async () => {
    setLoadingRoles(true);
    try {
      const response = await rolesApi.getAll();
      if (response.data?.success && response.data.data) {
        setRoles(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching roles:', err);
      setError('Không thể tải danh sách vai trò');
    } finally {
      setLoadingRoles(false);
    }
  };

  // ========== Event Handlers ==========

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    let finalValue: string | boolean | null = value;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      finalValue = checkbox.checked;
    } else if (name === 'is_active') {
      finalValue = value === 'true';
    } else if (name === 'gender') {
      // Handle gender: empty string means null
      finalValue = value === '' ? null : value;
    } else if (name === 'birthday') {
      // For birthday, we'll format it on submit
      finalValue = value === '' ? null : value;
    } else if (name === 'phone' || name === 'full_name') {
      // For optional fields, empty string becomes null
      finalValue = value === '' ? null : value;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: finalValue
    }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.username.trim()) {
      errors.username = 'Tên đăng nhập là bắt buộc';
    } else if (formData.username.length < 8 || formData.username.length > 16) {
      errors.username = 'Tên đăng nhập phải từ 8 đến 16 ký tự';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email là bắt buộc';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email không hợp lệ';
    }
    
    if (!formData.password) {
      errors.password = 'Mật khẩu là bắt buộc';
    } else if (formData.password.length < 6) {
      errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    
    if (!formData.role_id) {
      errors.role_id = 'Vai trò là bắt buộc';
    }
    
    if (formData.phone && formData.phone !== null && !/^\d{10}$/.test(formData.phone)) {
      errors.phone = 'Số điện thoại phải có 10 chữ số';
    }
    
    // Validate birthday if provided
    if (formData.birthday && formData.birthday !== null) {
      const formattedBirthday = formatToMySQLDate(formData.birthday);
      if (!formattedBirthday) {
        errors.birthday = 'Ngày sinh không hợp lệ. Vui lòng nhập theo định dạng YYYY-MM-DD';
      } else {
        // Check if date is in the future
        const date = new Date(formattedBirthday);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to compare only dates
        
        if (date > today) {
          errors.birthday = 'Ngày sinh không thể ở tương lai';
        }
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const preparePayload = (): CreateUserPayload => {
    // Format birthday for MySQL if provided
    let formattedBirthday = formData.birthday;
    if (formData.birthday && formData.birthday !== null) {
      const mysqlDate = formatToMySQLDate(formData.birthday);
      if (mysqlDate) {
        formattedBirthday = mysqlDate;
      } else {
        // If can't format, set to null
        formattedBirthday = null;
      }
    }
    
    // Create payload with all fields
    const payload: CreateUserPayload = {
      username: formData.username.trim(),
      email: formData.email.trim(),
      password: formData.password,
      role_id: formData.role_id,
      is_active: formData.is_active,
      full_name: formData.full_name,
      phone: formData.phone,
      birthday: formattedBirthday,
      gender: formData.gender
    };
    
    console.log('=== DEBUG PAYLOAD ===');
    console.log('Full payload:', payload);
    console.log('Birthday:', payload.birthday, 'Type:', typeof payload.birthday);
    console.log('=====================');
    
    return payload;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setValidationErrors({});
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const payload = preparePayload();
      
      // Create user
      const createUserResponse = await userApi.createUser(payload);
      
      console.log('API Response:', createUserResponse.data);
      
      if (!createUserResponse.data?.success) {
        const message = createUserResponse.data?.message || 'Không thể tạo người dùng';
        setError(message);
        
        // Handle validation errors from server
        if (createUserResponse.data?.errors) {
          const serverErrors: Record<string, string> = {};
          Object.entries(createUserResponse.data.errors).forEach(([key, value]) => {
            if (Array.isArray(value)) {
              serverErrors[key] = value[0];
            }
          });
          setValidationErrors(serverErrors);
        }
        
        return;
      }
      
      const userId = createUserResponse.data.data?.id;
      const userName = formData.full_name || formData.username;
      const roleName = roles.find(r => r.id === formData.role_id)?.name || 'N/A';
      
      if (!userId) {
        setError('Không nhận được ID người dùng từ server');
        return;
      }
      
      // Show success message with SweetAlert2
      Swal.fire({
        title: 'Thành công!',
        html: `
          <div class="create-user-swal-content">
            <div class="create-user-swal-icon">
              <i class="bi bi-check-circle-fill text-success" style="font-size: 3.5rem;"></i>
            </div>
            <div class="create-user-swal-text">
              <h5 class="create-user-swal-title">Người dùng đã được tạo thành công!</h5>
              <p class="create-user-swal-message">
                Tài khoản <strong>"${userName}"</strong> đã được thêm vào hệ thống.
              </p>
              <div class="create-user-swal-details">
                <div class="create-user-swal-detail-item">
                  <i class="bi bi-person-badge"></i>
                  <span>Tên đăng nhập: <strong>${formData.username}</strong></span>
                </div>
                <div class="create-user-swal-detail-item">
                  <i class="bi bi-envelope"></i>
                  <span>Email: <strong>${formData.email}</strong></span>
                </div>
                <div class="create-user-swal-detail-item">
                  <i class="bi bi-person-badge"></i>
                  <span>Vai trò: <strong>${roleName}</strong></span>
                </div>
                ${formData.gender ? `
                <div class="create-user-swal-detail-item">
                  <i class="bi bi-gender-ambiguous"></i>
                  <span>Giới tính: <strong>${formData.gender}</strong></span>
                </div>
                ` : ''}
                ${formData.birthday ? `
                <div class="create-user-swal-detail-item">
                  <i class="bi bi-calendar"></i>
                  <span>Ngày sinh: <strong>${formData.birthday}</strong></span>
                </div>
                ` : ''}
              </div>
            </div>
          </div>
        `,
        icon: 'success',
        showCancelButton: true,
        confirmButtonText: 'Xem chi tiết',
        cancelButtonText: 'Quay lại danh sách',
        confirmButtonColor: '#4a6bff',
        cancelButtonColor: '#6c757d',
        reverseButtons: true,
        customClass: {
          popup: 'create-user-swal-popup',
          title: 'create-user-swal-title-container',
          htmlContainer: 'create-user-swal-html-container',
          confirmButton: 'create-user-swal-confirm-btn',
          cancelButton: 'create-user-swal-cancel-btn',
          actions: 'create-user-swal-actions'
        },
        buttonsStyling: false,
        allowOutsideClick: false,
        allowEscapeKey: false,
        showCloseButton: true
      }).then((result) => {
        if (result.isConfirmed) {
          // Navigate to user detail page
          navigate(`/nguoi-dung/chi-tiet/${userId}`);
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          // Navigate back to user list
          navigate('/nguoi-dung');
        }
      });
      
      // Reset form after successful creation
      setTimeout(() => {
        setFormData({
          username: '',
          email: '',
          password: '',
          role_id: '',
          full_name: null,
          phone: null,
          birthday: null,
          gender: null,
          is_active: true
        });
        setValidationErrors({});
      }, 500);
      
    } catch (err: unknown) {
      console.error('Error creating user:', err);
      
      // Handle different error types using axios error
      if (isAxiosError(err)) {
        const errorData = err.response?.data as ApiErrorResponse | undefined;
        
        if (errorData?.errors) {
          const serverErrors: Record<string, string> = {};
          Object.entries(errorData.errors).forEach(([key, value]) => {
            if (Array.isArray(value)) {
              serverErrors[key] = value[0];
            }
          });
          setValidationErrors(serverErrors);
          setError('Có lỗi xác thực. Vui lòng kiểm tra lại thông tin.');
        } else {
          setError(errorData?.message || err.message || 'Đã xảy ra lỗi khi tạo người dùng');
        }
      } else if (err instanceof Error) {
        setError(err.message || 'Đã xảy ra lỗi khi tạo người dùng');
      } else {
        setError('Đã xảy ra lỗi không xác định khi tạo người dùng');
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper function to check if error is AxiosError
  const isAxiosError = (error: unknown): error is AxiosError<ApiErrorResponse> => {
    return (error as AxiosError).isAxiosError !== undefined;
  };

  const handleCancel = () => {
    navigate('/nguoi-dung');
  };

  const handleResetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      role_id: '',
      full_name: null,
      phone: null,
      birthday: null,
      gender: null,
      is_active: true
    });
    setValidationErrors({});
    setError(null);
  };

  // ========== Render ==========

  return (
    <Container className="create-user-page py-5 px-3 px-md-4 px-lg-5">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-4 create-user-breadcrumb create-user-breadcrumb-custom">
        <Breadcrumb.Item 
          linkAs={Link} 
          linkProps={{ to: '/' }} 
          className="create-user-breadcrumb-item"
        >
          <i className="bi bi-house-door create-user-breadcrumb-icon me-2"></i>
          Trang chủ
        </Breadcrumb.Item>
        <Breadcrumb.Item 
          linkAs={Link} 
          linkProps={{ to: '/nguoi-dung' }} 
          className="create-user-breadcrumb-item"
        >
          <i className="bi bi-people create-user-breadcrumb-icon me-2"></i>
          Danh sách người dùng
        </Breadcrumb.Item>
        <Breadcrumb.Item 
          active 
          className="create-user-breadcrumb-item create-user-breadcrumb-active"
        >
          <span className="ms-2">Thêm người dùng mới</span>
        </Breadcrumb.Item>
      </Breadcrumb>

      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 create-user-page-header">
        <div>
          <h2 className="mb-2 create-user-page-title">
            <i className="bi bi-person-plus create-user-title-icon me-3"></i>
            Thêm người dùng mới
          </h2>
          <p className="create-user-subtitle mb-0">
            Tạo tài khoản người dùng mới cho hệ thống
          </p>
        </div>
        
        <div>
          <Button 
            variant="outline-secondary" 
            onClick={() => navigate('/nguoi-dung')} 
            className="create-user-btn create-user-btn-back create-user-btn-action"
          >
            <i className="bi bi-arrow-left create-user-btn-icon me-2"></i>
            Quay lại danh sách
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Row>
        <Col lg={12}>
          <Card className="shadow-sm border-0 create-user-main-card">
            <Card.Header className="bg-white border-bottom create-user-card-header">
              <div className="d-flex align-items-center">
                <i className="bi bi-person-badge text-primary create-user-card-icon me-3"></i>
                <h5 className="mb-0 create-user-card-title">
                  Thông tin người dùng mới
                </h5>
              </div>
            </Card.Header>
            
            <Card.Body className="p-4 p-md-5">
              {/* Create User Form */}
              <Card className="create-user-form-card">
                <Card.Header className="create-user-form-header">
                  <h5 className="mb-0">
                    <i className="bi bi-person-plus me-2"></i>
                    Thêm người dùng mới
                  </h5>
                </Card.Header>
                
                <Card.Body>
                  {error && (
                    <Alert variant="danger" className="create-user-alert create-user-alert-error">
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      {error}
                    </Alert>
                  )}
                  
                  <Form onSubmit={handleSubmit} className="create-user-form">
                    <div className="create-user-form-section">
                      <h6 className="create-user-section-title mb-3 border-bottom pb-2">
                        <i className="bi bi-info-circle me-2"></i>
                        Thông tin người dùng
                      </h6>
                      
                      <Row>
                        {/* Username */}
                        <Col md={6}>
                          <Form.Group controlId="username" className="create-user-form-group mb-3">
                            <Form.Label className="create-user-form-label">
                              <i className="bi bi-person-badge me-2"></i>
                              Tên đăng nhập *
                            </Form.Label>
                            <Form.Control
                              type="text"
                              name="username"
                              value={formData.username}
                              onChange={handleInputChange}
                              placeholder="Nhập tên đăng nhập"
                              isInvalid={!!validationErrors.username}
                              disabled={loading}
                              className="create-user-form-control"
                            />
                            <Form.Control.Feedback type="invalid" className="create-user-feedback">
                              {validationErrors.username}
                            </Form.Control.Feedback>
                            <Form.Text className="create-user-help-text text-muted">
                              Từ 8 đến 16 ký tự
                            </Form.Text>
                          </Form.Group>
                        </Col>
                        
                        {/* Email */}
                        <Col md={6}>
                          <Form.Group controlId="email" className="create-user-form-group mb-3">
                            <Form.Label className="create-user-form-label">
                              <i className="bi bi-envelope me-2"></i>
                              Email *
                            </Form.Label>
                            <Form.Control
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              placeholder="Nhập email"
                              isInvalid={!!validationErrors.email}
                              disabled={loading}
                              className="create-user-form-control"
                            />
                            <Form.Control.Feedback type="invalid" className="create-user-feedback">
                              {validationErrors.email}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                        
                        {/* Password */}
                        <Col md={6}>
                          <Form.Group controlId="password" className="create-user-form-group mb-3">
                            <Form.Label className="create-user-form-label">
                              <i className="bi bi-key me-2"></i>
                              Mật khẩu *
                            </Form.Label>
                            <Form.Control
                              type="password"
                              name="password"
                              value={formData.password}
                              onChange={handleInputChange}
                              placeholder="Nhập mật khẩu"
                              isInvalid={!!validationErrors.password}
                              disabled={loading}
                              className="create-user-form-control"
                            />
                            <Form.Control.Feedback type="invalid" className="create-user-feedback">
                              {validationErrors.password}
                            </Form.Control.Feedback>
                            <Form.Text className="create-user-help-text text-muted">
                              Ít nhất 6 ký tự
                            </Form.Text>
                          </Form.Group>
                        </Col>
                        
                        {/* Role */}
                        <Col md={6}>
                          <Form.Group controlId="role_id" className="create-user-form-group mb-3">
                            <Form.Label className="create-user-form-label">
                              <i className="bi bi-shield me-2"></i>
                              Vai trò *
                            </Form.Label>
                            <Form.Select
                              name="role_id"
                              value={formData.role_id}
                              onChange={handleInputChange}
                              isInvalid={!!validationErrors.role_id}
                              disabled={loading || loadingRoles}
                              className="create-user-form-select"
                            >
                              <option value="">Chọn vai trò</option>
                              {roles.map(role => (
                                <option key={role.id} value={role.id}>
                                  {role.name}
                                </option>
                              ))}
                            </Form.Select>
                            <Form.Control.Feedback type="invalid" className="create-user-feedback">
                              {validationErrors.role_id}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                        
                        {/* Full Name */}
                        <Col md={6}>
                          <Form.Group controlId="full_name" className="create-user-form-group mb-3">
                            <Form.Label className="create-user-form-label">
                              <i className="bi bi-person me-2"></i>
                              Họ và tên
                            </Form.Label>
                            <Form.Control
                              type="text"
                              name="full_name"
                              value={formData.full_name || ''}
                              onChange={handleInputChange}
                              placeholder="Nhập họ và tên"
                              disabled={loading}
                              className="create-user-form-control"
                            />
                            <Form.Text className="create-user-help-text text-muted">
                              Không bắt buộc
                            </Form.Text>
                          </Form.Group>
                        </Col>
                        
                        {/* Phone */}
                        <Col md={6}>
                          <Form.Group controlId="phone" className="create-user-form-group mb-3">
                            <Form.Label className="create-user-form-label">
                              <i className="bi bi-phone me-2"></i>
                              Số điện thoại
                            </Form.Label>
                            <Form.Control
                              type="tel"
                              name="phone"
                              value={formData.phone || ''}
                              onChange={handleInputChange}
                              placeholder="Nhập số điện thoại"
                              isInvalid={!!validationErrors.phone}
                              disabled={loading}
                              className="create-user-form-control"
                            />
                            <Form.Control.Feedback type="invalid" className="create-user-feedback">
                              {validationErrors.phone}
                            </Form.Control.Feedback>
                            <Form.Text className="create-user-help-text text-muted">
                              10 chữ số (không bắt buộc)
                            </Form.Text>
                          </Form.Group>
                        </Col>
                        
                        {/* Birthday */}
                        <Col md={6}>
                          <Form.Group controlId="birthday" className="create-user-form-group mb-3">
                            <Form.Label className="create-user-form-label">
                              <i className="bi bi-calendar me-2"></i>
                              Ngày sinh
                            </Form.Label>
                            <Form.Control
                              type="date"
                              name="birthday"
                              value={formData.birthday || ''}
                              onChange={handleInputChange}
                              isInvalid={!!validationErrors.birthday}
                              disabled={loading}
                              className="create-user-form-control"
                              max={new Date().toISOString().split('T')[0]}
                            />
                            <Form.Control.Feedback type="invalid" className="create-user-feedback">
                              {validationErrors.birthday}
                            </Form.Control.Feedback>
                            <Form.Text className="create-user-help-text text-muted">
                              Hoặc nhập: DD/MM/YYYY hoặc YYYY-MM-DD
                            </Form.Text>
                          </Form.Group>
                        </Col>
                        
                        {/* Gender */}
                        <Col md={6}>
                          <Form.Group controlId="gender" className="create-user-form-group mb-3">
                            <Form.Label className="create-user-form-label">
                              <i className="bi bi-gender-ambiguous me-2"></i>
                              Giới tính
                            </Form.Label>
                            <Form.Select
                              name="gender"
                              value={formData.gender || ''}
                              onChange={handleInputChange}
                              disabled={loading}
                              isInvalid={!!validationErrors.gender}
                              className="create-user-form-select"
                            >
                              <option value="">Chọn giới tính</option>
                              <option value="Nam">Nam</option>
                              <option value="Nữ">Nữ</option>
                              <option value="Khác">Khác</option>
                            </Form.Select>
                            <Form.Control.Feedback type="invalid" className="create-user-feedback">
                              {validationErrors.gender}
                            </Form.Control.Feedback>
                            <Form.Text className="create-user-help-text text-muted">
                              Không bắt buộc
                            </Form.Text>
                          </Form.Group>
                        </Col>
                        
                        {/* Status */}
                        <Col md={6}>
                          <Form.Group controlId="is_active" className="create-user-form-group mb-3">
                            <Form.Label className="create-user-form-label">
                              <i className="bi bi-toggle-on me-2"></i>
                              Trạng thái
                            </Form.Label>
                            <Form.Select
                              name="is_active"
                              value={formData.is_active ? 'true' : 'false'}
                              onChange={handleInputChange}
                              disabled={loading}
                              className="create-user-form-select"
                            >
                              <option value="true">Hoạt động</option>
                              <option value="false">Đã khóa</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                      </Row>
                    </div>
                    
                    <div className="create-user-footer mt-4 pt-3 border-top">
                      <div className="create-user-footer-content d-flex justify-content-between">
                        <div className="create-user-footer-left">
                          <Button 
                            variant="outline-secondary" 
                            onClick={handleCancel}
                            disabled={loading}
                            className="create-user-btn create-user-btn-cancel"
                          >
                            <i className="bi bi-x-lg me-2"></i>
                            Hủy bỏ
                          </Button>
                        </div>
                        
                        <div className="create-user-footer-right d-flex gap-2">
                          <Button 
                            variant="outline-primary" 
                            type="button"
                            onClick={handleResetForm}
                            disabled={loading}
                            className="create-user-btn create-user-btn-reset"
                          >
                            <i className="bi bi-arrow-clockwise me-2"></i>
                            Làm mới
                          </Button>
                          
                          <Button 
                            variant="primary" 
                            type="submit"
                            disabled={loading || loadingRoles}
                            className="create-user-btn create-user-btn-submit"
                          >
                            {loading ? (
                              <>
                                <Spinner
                                  as="span"
                                  animation="border"
                                  size="sm"
                                  role="status"
                                  aria-hidden="true"
                                  className="me-2 create-user-spinner"
                                />
                                Đang tạo...
                              </>
                            ) : (
                              <>
                                <i className="bi bi-plus-lg me-2 create-user-btn-icon"></i>
                                Tạo người dùng
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                      
                      {!loading && !loadingRoles && (
                        <div className="create-user-footer-note mt-3">
                          <small className="create-user-help-text text-muted">
                            <i className="bi bi-info-circle me-1"></i>
                            Các trường có dấu * là bắt buộc.
                          </small>
                        </div>
                      )}
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CreateUserPage;