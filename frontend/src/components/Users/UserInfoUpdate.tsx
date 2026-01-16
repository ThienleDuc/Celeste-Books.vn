// src/components/users/UserInfoUpdate.tsx
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Form, Button, Spinner } from 'react-bootstrap';
import { userApi } from '../../api/users.api';
import type { UserDetail, UpdateUserPayload, ApiResponse } from '../../api/users.api';
import dayjs from 'dayjs';
import Swal from 'sweetalert2';
import { AxiosError } from 'axios';

interface UserInfoUpdateProps {
  userId: string;
  userData: UserDetail;
  onUserUpdated: () => void;
}

const UserInfoUpdate: React.FC<UserInfoUpdateProps> = ({
  userId,
  userData,
  onUserUpdated
}) => {
  const [saving, setSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: userData.full_name || '',
    username: userData.username || '',
    email: userData.email || '',
    phone: userData.phone || '',
    gender: userData.gender || '',
    birthday: userData.birthday || '',
    role_id: userData.role_id || '',
    is_active: userData.is_active,
  });

  // Reset form khi userData thay đổi
  useEffect(() => {
    setFormData({
      full_name: userData.full_name || '',
      username: userData.username || '',
      email: userData.email || '',
      phone: userData.phone || '',
      gender: userData.gender || '',
      birthday: userData.birthday || '',
      role_id: userData.role_id || '',
      is_active: userData.is_active,
    });
  }, [userData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSaveUser = async () => {
    if (!userId) {
      await Swal.fire({
        title: 'Lỗi',
        text: 'Không tìm thấy ID người dùng',
        icon: 'error',
        confirmButtonColor: '#6d5cae'
      });
      return;
    }

    // Validate required fields
    if (!formData.username.trim()) {
      await Swal.fire({
        title: 'Lỗi',
        text: 'Tên đăng nhập không được để trống',
        icon: 'error',
        confirmButtonColor: '#6d5cae'
      });
      return;
    }

    if (!formData.email.trim()) {
      await Swal.fire({
        title: 'Lỗi',
        text: 'Email không được để trống',
        icon: 'error',
        confirmButtonColor: '#6d5cae'
      });
      return;
    }

    const confirmed = await Swal.fire({
      title: 'Xác nhận cập nhật',
      text: 'Bạn có chắc chắn muốn cập nhật thông tin người dùng?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#6d5cae',
      cancelButtonColor: '#ff6b6b',
      confirmButtonText: 'Cập nhật',
      cancelButtonText: 'Hủy'
    });

    if (!confirmed.isConfirmed) return;

    // Bắt đầu loading
    setSaving(true);
    setIsLoading(true);

    try {
      // Hiển thị loading với Swal
      Swal.fire({
        title: 'Đang cập nhật...',
        html: `
          <div style="text-align: center; margin: 20px 0;">
            <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-3">Vui lòng chờ trong giây lát</p>
          </div>
        `,
        allowOutsideClick: false,
        showConfirmButton: false,
        showCancelButton: false,
        backdrop: true
      });

      // Xử lý birthday
      let processedBirthday = null;
      if (formData.birthday && formData.birthday.trim() !== '') {
        const birthdayStr = formData.birthday.trim();
        
        if (birthdayStr === '') {
          processedBirthday = null;
        }
        else if (/^\d{4}-\d{2}-\d{2}$/.test(birthdayStr)) {
          processedBirthday = birthdayStr;
        }
        else if (/^\d{2}\/\d{2}\/\d{4}$/.test(birthdayStr)) {
          const [day, month, year] = birthdayStr.split('/');
          processedBirthday = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
        else {
          try {
            const date = dayjs(birthdayStr);
            if (date.isValid()) {
              processedBirthday = date.format('YYYY-MM-DD');
            } else {
              processedBirthday = null;
            }
          } catch {
            processedBirthday = null;
          }
        }
      }

      // Chuẩn bị data gửi lên API
      const updateData: UpdateUserPayload = {
        full_name: formData.full_name.trim() || null,
        username: formData.username.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        gender: formData.gender || null,
        birthday: processedBirthday,
        role_id: formData.role_id,
        is_active: formData.is_active,
      };
      
      console.log('Sending update data:', updateData);
      
      const response = await userApi.updateUser(userId, updateData);
      
      console.log('Update response:', response.data);
      
      // ĐÓNG loading Swal trước khi hiển thị kết quả
      Swal.close();
      
      // Đánh dấu loading đã xong
      setIsLoading(false);
      
      // ✅ SỬA ĐIỀU KIỆN QUAN TRỌNG Ở ĐÂY:
      console.log('Debug response.data:', {
        data: response.data,
        success: response.data?.success,
        successType: typeof response.data?.success,
        successBoolean: Boolean(response.data?.success),
        successStrictTrue: response.data?.success === true,
        successStrictFalse: response.data?.success === false,
        hasSuccess: 'success' in (response.data || {})
      });
      
      // CÁCH 1: Kiểm tra success không phải false
      if (response.data?.success !== false) {
        console.log('✅ SUCCESS: success is not false (could be true, 1, or undefined)');
        await Swal.fire({
          title: 'Thành công!',
          text: response.data?.message || 'Cập nhật thông tin thành công',
          icon: 'success',
          confirmButtonColor: '#6d5cae',
          confirmButtonText: 'OK'
        });
        
        onUserUpdated();
      } 
      // CÁCH 2: Chỉ throw error khi success là false
      else if (response.data?.success === false) {
        console.log('❌ FAILURE: success is strictly false');
        throw new Error(response.data?.message || 'Cập nhật thất bại');
      }
      // CÁCH 3: Fallback nếu không có success field
      else {
        console.log('⚠️ No success field, assuming success');
        await Swal.fire({
          title: 'Thành công!',
          text: 'Cập nhật thông tin thành công',
          icon: 'success',
          confirmButtonColor: '#6d5cae',
          confirmButtonText: 'OK'
        });
        
        onUserUpdated();
      }
        
    } catch (err) {
      console.error('Update user error:', err);
      
      // Đóng loading Swal
      Swal.close();
      
      // Đánh dấu loading đã xong (dù có lỗi)
      setIsLoading(false);
      
      let errorMessage = 'Lỗi khi cập nhật thông tin. Vui lòng thử lại.';
      
      // Xử lý lỗi với AxiosError type safety
      if (err instanceof AxiosError) {
        const axiosError = err as AxiosError<ApiResponse>;
        
        if (axiosError.response?.status === 404) {
          errorMessage = 'Không tìm thấy người dùng';
        } else if (axiosError.response?.status === 422) {
          const validationErrors = axiosError.response.data?.errors;
          if (validationErrors && typeof validationErrors === 'object') {
            const errorMessages: string[] = [];
            
            // Type-safe iteration
            for (const key in validationErrors) {
              if (Object.prototype.hasOwnProperty.call(validationErrors, key)) {
                const errorItem = validationErrors[key];
                if (Array.isArray(errorItem)) {
                  errorMessages.push(...errorItem);
                } else if (typeof errorItem === 'string') {
                  errorMessages.push(errorItem);
                }
              }
            }
            
            if (errorMessages.length > 0) {
              errorMessage = errorMessages.join(', ');
            } else if (axiosError.response.data?.message) {
              errorMessage = axiosError.response.data.message;
            }
          } else if (axiosError.response.data?.message) {
            errorMessage = axiosError.response.data.message;
          }
        } else if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        } else if (axiosError.message) {
          errorMessage = axiosError.message;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      await Swal.fire({
        title: 'Lỗi',
        text: errorMessage,
        icon: 'error',
        confirmButtonColor: '#6d5cae',
        confirmButtonText: 'Đóng'
      });
        
    } finally {
      // Đảm bảo đóng tất cả Swal và reset state
      Swal.close();
      setSaving(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    try {
      // Nếu đã là định dạng YYYY-MM-DD thì giữ nguyên
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString;
      }
      // Chuyển đổi từ định dạng khác
      return dayjs(dateString).format('YYYY-MM-DD');
    } catch {
      return '';
    }
  };

  // Hiển thị loading overlay nếu đang loading
  if (isLoading) {
    return (
      <Card className="manage-info-card shadow-sm border-0">
        <Card.Body className="p-4 manage-info-body">
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
            <p className="mt-3 text-muted">Đang tải dữ liệu người dùng...</p>
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="manage-info-card shadow-sm border-0">
      <Card.Body className="p-4 manage-info-body">
        <h4 className="mb-4 fw-bold text-primary manage-section-title">
          <i className="bi bi-person-lines-fill me-2"></i>
          Chỉnh sửa thông tin cá nhân
        </h4>
        
        <div className="mb-4 p-3 bg-light rounded border">
          <small className="text-muted d-block">
            <i className="bi bi-info-circle me-1"></i>
            User ID: <strong>{userId}</strong>
          </small>
          <small className="text-muted d-block mt-1">
            <i className="bi bi-shield-check me-1"></i>
            Vai trò: <strong>{userData.role_name || 'Chưa xác định'}</strong>
          </small>
          {isLoading && (
            <small className="text-info d-block mt-1">
              <i className="bi bi-hourglass-split me-1"></i>
              Đang xử lý...
            </small>
          )}
        </div>
        
        <Row className="manage-form-row">
          <Col md={6}>
            <Form.Group className="mb-4 manage-form-group">
              <Form.Label className="text-muted small d-block mb-2 manage-field-label">
                Họ và tên
              </Form.Label>
              <Form.Control
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                className="manage-form-control p-3 bg-light rounded border manage-input"
                placeholder="Nhập họ và tên"
                disabled={saving || isLoading}
              />
            </Form.Group>
            
            <Form.Group className="mb-4 manage-form-group">
              <Form.Label className="text-muted small d-block mb-2 manage-field-label">
                Tên đăng nhập <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="manage-form-control p-3 bg-light rounded border manage-input"
                placeholder="Nhập tên đăng nhập"
                required
                disabled={saving || isLoading}
              />
            </Form.Group>
            
            <Form.Group className="mb-4 manage-form-group">
              <Form.Label className="text-muted small d-block mb-2 manage-field-label">
                Email <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="manage-form-control p-3 bg-light rounded border manage-input"
                placeholder="Nhập email"
                required
                disabled={saving || isLoading}
              />
            </Form.Group>
          </Col>
          
          <Col md={6}>
            <Form.Group className="mb-4 manage-form-group">
              <Form.Label className="text-muted small d-block mb-2 manage-field-label">
                Giới tính
              </Form.Label>
              <Form.Select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="manage-form-select p-3 bg-light rounded border manage-select"
                disabled={saving || isLoading}
              >
                <option value="">Chọn giới tính</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-4 manage-form-group">
              <Form.Label className="text-muted small d-block mb-2 manage-field-label">
                Ngày sinh
              </Form.Label>
              <Form.Control
                type="date"
                name="birthday"
                value={formatDate(formData.birthday)}
                onChange={handleInputChange}
                className="manage-form-control p-3 bg-light rounded border manage-input"
                disabled={saving || isLoading}
              />
            </Form.Group>
            
            <Form.Group className="mb-4 manage-form-group">
              <Form.Label className="text-muted small d-block mb-2 manage-field-label">
                Số điện thoại
              </Form.Label>
              <Form.Control
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="manage-form-control p-3 bg-light rounded border manage-input"
                placeholder="Nhập số điện thoại"
                maxLength={10}
                disabled={saving || isLoading}
              />
              <Form.Text className="text-muted">
                Ví dụ: 0912345678
              </Form.Text>
            </Form.Group>
          </Col>
        </Row>
        
        <Form.Group className="mb-4 manage-form-group">
          <Form.Check
            type="switch"
            id="is-active-switch"
            label="Tài khoản đang hoạt động"
            name="is_active"
            checked={formData.is_active}
            onChange={handleInputChange}
            className="manage-form-switch"
            disabled={saving || isLoading}
          />
        </Form.Group>
        
        <div className="mt-4 pt-4 border-top manage-form-actions">
          <div className="d-flex justify-content-between">
            <div>
              <small className="text-muted">
                <i className="bi bi-exclamation-triangle me-1"></i>
                Các trường có dấu * là bắt buộc
              </small>
              {(saving || isLoading) && (
                <small className="text-info d-block mt-1">
                  <i className="bi bi-info-circle me-1"></i>
                  Đang xử lý yêu cầu...
                </small>
              )}
            </div>
            <div>
              <Button 
                variant="secondary" 
                onClick={() => {
                  setFormData({
                    full_name: userData.full_name || '',
                    username: userData.username || '',
                    email: userData.email || '',
                    phone: userData.phone || '',
                    gender: userData.gender || '',
                    birthday: userData.birthday || '',
                    role_id: userData.role_id || '',
                    is_active: userData.is_active,
                  });
                }}
                className="me-3 manage-btn manage-btn-reset"
                disabled={saving || isLoading}
              >
                {isLoading ? (
                  <Spinner animation="border" size="sm" className="me-2" />
                ) : (
                  <i className="bi bi-arrow-clockwise me-2 manage-btn-icon"></i>
                )}
                Đặt lại
              </Button>
              
              <Button 
                variant="primary" 
                onClick={handleSaveUser}
                disabled={saving || isLoading}
                className="manage-btn manage-btn-save"
              >
                {saving ? (
                  <>
                    <Spinner 
                      animation="border" 
                      size="sm" 
                      className="me-2 manage-spinner" 
                      as="span"
                    />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-2 manage-btn-icon"></i>
                    Lưu thay đổi
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default UserInfoUpdate;