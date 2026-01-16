// src/components/users/UserAvatarUpload.tsx
import React, { useState, useEffect } from 'react';
import { Card, Form, Button, InputGroup } from 'react-bootstrap';
import { userApi, type ApiResponse } from '../../api/users.api';
import Swal from 'sweetalert2';
import { handleImageError } from '../../utils/imageHelper';
import { AxiosError } from 'axios';

// Interface cho response từ Laravel controller
interface UploadAvatarResponse {
  message: string;
  avatar_url: string;
}

interface UserAvatarUploadProps {
  userId: string;
  currentAvatar: string | null;
  fullName: string | null;
  isActive: boolean;
  onAvatarUpdated: (newAvatarUrl?: string) => void;
}

const UserAvatarUpload: React.FC<UserAvatarUploadProps> = ({
  userId,
  currentAvatar,
  fullName,
  isActive,
  onAvatarUpdated
}) => {
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [avatarSrc, setAvatarSrc] = useState<string>('/img/linh_vat_logo.png');

  // Cập nhật avatarSrc khi currentAvatar thay đổi
  useEffect(() => {
    console.log('Current avatar updated:', currentAvatar);
    
    if (!currentAvatar || currentAvatar.trim() === '') {
      console.log('Using default avatar');
      setAvatarSrc('/img/linh_vat_logo.png');
    } else {
      console.log('Using avatar from props:', currentAvatar);
      setAvatarSrc(currentAvatar);
    }
  }, [currentAvatar]);

  // Debug: Kiểm tra xem URL có hợp lệ không
  useEffect(() => {
    console.log('Avatar src state:', avatarSrc);
    console.log('Is valid URL:', avatarSrc.startsWith('http') || avatarSrc.startsWith('/'));
    
    // Test load image
    if (avatarSrc && !avatarSrc.includes('linh_vat_logo.png')) {
      const img = new Image();
      img.onload = () => {
        console.log('Image loaded successfully from:', avatarSrc);
      };
      img.onerror = () => {
        console.error('Image failed to load from:', avatarSrc);
      };
      img.src = avatarSrc;
    }
  }, [avatarSrc]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('File selected:', file.name, file.type, file.size);

      // Validate file type - khớp với Laravel validation
      const validMimes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!validMimes.includes(file.type)) {
        Swal.fire({
          title: 'Lỗi',
          text: 'Vui lòng chọn file ảnh định dạng JPG, JPEG hoặc PNG',
          icon: 'error',
          confirmButtonColor: '#6d5cae'
        });
        return;
      }

      // Validate file size (2MB) - khớp với Laravel validation max:2048 (2MB)
      const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
      if (file.size > MAX_FILE_SIZE) {
        Swal.fire({
          title: 'Lỗi',
          text: 'Kích thước ảnh không được vượt quá 2MB',
          icon: 'error',
          confirmButtonColor: '#6d5cae'
        });
        return;
      }

      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setAvatarPreview(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadAvatar = async () => {
    if (!avatarFile || !userId) return;

    try {
      setUploading(true);
      
      Swal.fire({
        title: 'Đang upload...',
        text: 'Vui lòng chờ trong giây lát',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Gọi API upload
      console.log('Uploading avatar for user:', userId);
      const response = await userApi.uploadAvatar(userId, avatarFile);
      console.log('Upload response:', response.data);
      
      // Kiểm tra response structure từ Laravel
      let newAvatarUrl: string | undefined;
      let successMessage = 'Cập nhật ảnh đại diện thành công';
      
      // Case 1: Direct response structure từ Laravel controller
      // { message: string, avatar_url: string }
      const directResponse = response.data as unknown as UploadAvatarResponse;
      if (directResponse && 'avatar_url' in directResponse) {
        newAvatarUrl = directResponse.avatar_url;
        successMessage = directResponse.message || successMessage;
        console.log('Case 1 - Direct response:', newAvatarUrl);
      } 
      // Case 2: ApiResponse structure với data wrapper
      // { success: boolean, message: string, data: { avatar_url: string } }
      else {
        const apiResponse = response.data as ApiResponse<{ avatar_url: string }>;
        if (apiResponse?.data?.avatar_url) {
          newAvatarUrl = apiResponse.data.avatar_url;
          successMessage = apiResponse.message || successMessage;
          console.log('Case 2 - ApiResponse:', newAvatarUrl);
        }
      }
      
      if (!newAvatarUrl) {
        console.warn('No avatar_url found in response:', response.data);
        throw new Error('Không nhận được URL avatar từ server');
      }
      
      console.log('New avatar URL received:', newAvatarUrl);
      
      await Swal.fire({
        title: 'Thành công!',
        text: successMessage,
        icon: 'success',
        confirmButtonColor: '#6d5cae',
        confirmButtonText: 'OK'
      });
      
      setAvatarFile(null);
      setAvatarPreview(null);
      
      // Cập nhật state với URL mới
      setAvatarSrc(newAvatarUrl);
      
      // Gọi callback để parent component biết
      onAvatarUpdated(newAvatarUrl);
      
    } catch (err) {
      console.error('Upload avatar error:', err);
      
      let errorMessage = 'Lỗi khi upload ảnh. Vui lòng thử lại.';
      
      if (err instanceof AxiosError) {
        console.error('Axios error details:', {
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data
        });
        
        if (err.response?.status === 404) {
          errorMessage = 'Không tìm thấy người dùng';
        } else if (err.response?.status === 422) {
          const validationErrors = err.response.data?.errors;
          if (validationErrors?.avatar) {
            errorMessage = validationErrors.avatar[0];
          } else if (err.response.data?.message) {
            errorMessage = err.response.data.message;
          }
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.message) {
          errorMessage = err.message;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      await Swal.fire({
        title: 'Lỗi',
        text: errorMessage,
        icon: 'error',
        confirmButtonColor: '#6d5cae'
      });
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = (active: boolean) => {
    return active ? (
      <span className="manage-badge manage-bg-success position-absolute bottom-0 end-0 p-2 rounded-pill manage-status-badge">
        <i className="bi bi-check-circle me-1"></i>
        Đang hoạt động
      </span>
    ) : (
      <span className="manage-badge manage-bg-danger position-absolute bottom-0 end-0 p-2 rounded-pill manage-status-badge">
        <i className="bi bi-x-circle me-1"></i>
        Đã khóa
      </span>
    );
  };

  const handleChooseFile = () => {
    const inputElement = document.getElementById(`avatarInput_${userId}`);
    if (inputElement) {
      inputElement.click();
    }
  };

  return (
    <Card className="manage-profile-card manage-avatar-upload shadow-sm border-0">
      <Card.Body className="text-center p-4 manage-avatar-body">
        <div className="mb-4 manage-avatar-section">
          <div className="position-relative mb-4 manage-avatar-wrapper">
            <img
              src={avatarPreview || avatarSrc}
              alt={fullName || 'Người dùng'}
              className="manage-user-page-avatar rounded-circle manage-avatar-img"
              onError={(e) => {
                const target = e.currentTarget;
                console.error('IMAGE LOAD ERROR - Details:', {
                  src: target.src,
                  currentSrc: target.currentSrc,
                  complete: target.complete,
                  naturalWidth: target.naturalWidth,
                  naturalHeight: target.naturalHeight
                });
                
                // Thử load lại với URL mặc định
                console.log('Falling back to default avatar');
                target.src = '/img/linh_vat_logo.png';
                
                handleImageError(e);
              }}
              onLoad={(e) => {
                const target = e.currentTarget;
                console.log('IMAGE LOADED SUCCESSFULLY:', {
                  src: target.src,
                  naturalWidth: target.naturalWidth,
                  naturalHeight: target.naturalHeight,
                  complete: target.complete
                });
              }}
              style={{ 
                width: '150px', 
                height: '150px',
                objectFit: 'cover',
                border: '3px solid #f0f0f0'
              }}
            />
            {getStatusBadge(isActive)}
          </div>
          
          <h3 className="mb-2 fw-bold manage-user-name">
            {fullName || 'Người dùng không tên'}
          </h3>
          <div className="text-muted small">
            <div>User ID: {userId}</div>
            <div>Avatar URL: {avatarSrc}</div>
            <div>Status: {isActive ? 'Active' : 'Inactive'}</div>
          </div>
        </div>
        
        <hr className="my-4 manage-divider" />
        
        <div className="manage-upload-section">
          <Form.Group controlId={`avatarInput_${userId}`} className="mb-3">
            <Form.Label className="d-block mb-2 manage-upload-label">
              <i className="bi bi-camera me-1 manage-upload-icon"></i>
              Thay đổi ảnh đại diện
            </Form.Label>
            <div className="d-flex gap-2 justify-content-center align-items-center manage-upload-controls">
              <Form.Control
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                onChange={handleAvatarChange}
                className="d-none"
                disabled={uploading}
              />
              <InputGroup className="w-auto manage-input-group">
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={handleChooseFile}
                  className="manage-btn manage-btn-choose"
                  disabled={uploading}
                >
                  <i className="bi bi-upload me-1"></i>
                  Chọn ảnh
                </Button>
              </InputGroup>
              
              {avatarFile && (
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={handleUploadAvatar}
                  disabled={uploading}
                  className="manage-btn manage-btn-upload"
                >
                  {uploading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Đang upload...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-1"></i>
                      Lưu ảnh
                    </>
                  )}
                </Button>
              )}
            </div>
            <Form.Text className="text-muted d-block mt-2 manage-upload-hint">
              <i className="bi bi-info-circle me-1"></i>
              Chọn ảnh JPG, JPEG, PNG kích thước tối đa 2MB
            </Form.Text>
          </Form.Group>
        </div>
      </Card.Body>
    </Card>
  );
};

export default UserAvatarUpload;