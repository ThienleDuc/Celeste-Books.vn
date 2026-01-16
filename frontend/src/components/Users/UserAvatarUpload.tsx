// src/components/users/UserAvatarUpload.tsx
import React, { useState, useEffect } from 'react';
import { Card, Form, Button } from 'react-bootstrap';
import { userApi, type ApiResponse } from '../../api/users.api';
import Swal from 'sweetalert2';
import { getAvatarUrl, handleImageError } from '../../utils/imageHelper';
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
  // State cho ảnh hiển thị (luôn là URL đúng từ backend)
  const [displayAvatar, setDisplayAvatar] = useState<string>('/img/linh_vat_logo.png');
  
  // State cho ảnh tạm thời khi upload
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Cập nhật displayAvatar khi currentAvatar thay đổi từ props
  useEffect(() => {
    console.log('Current avatar prop changed:', currentAvatar);
    
    if (currentAvatar) {
      // Luôn sử dụng getAvatarUrl để đảm bảo URL đúng
      const processedUrl = getAvatarUrl(currentAvatar);
      console.log('Processed display avatar URL:', processedUrl);
      
      // Test load ảnh để đảm bảo hiển thị đúng
      const testImageLoad = () => {
        const img = new Image();
        img.onload = () => {
          console.log('✅ Display avatar loaded successfully');
          setDisplayAvatar(processedUrl);
        };
        img.onerror = () => {
          console.warn('⚠️ Display avatar failed to load, using default');
          setDisplayAvatar('/img/linh_vat_logo.png');
        };
        img.src = processedUrl;
      };
      
      testImageLoad();
    } else {
      setDisplayAvatar('/img/linh_vat_logo.png');
    }
  }, [currentAvatar]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('File selected for upload:', file.name, file.type, file.size);

      // Validate file type
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

      // Validate file size (2MB)
      const MAX_FILE_SIZE = 2 * 1024 * 1024;
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
      
      // Tạo preview từ file (chỉ dùng cho hiển thị tạm thời)
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

      console.log('Uploading avatar for user:', userId);
      const response = await userApi.uploadAvatar(userId, avatarFile);
      console.log('Upload response:', response.data);
      
      // Xử lý response từ server
      let newAvatarUrl: string | undefined;
      let successMessage = 'Cập nhật ảnh đại diện thành công';
      
      const directResponse = response.data as unknown as UploadAvatarResponse;
      if (directResponse && 'avatar_url' in directResponse) {
        newAvatarUrl = directResponse.avatar_url;
        successMessage = directResponse.message || successMessage;
        console.log('Direct response avatar:', newAvatarUrl);
      } else {
        const apiResponse = response.data as ApiResponse<{ avatar_url: string }>;
        if (apiResponse?.data?.avatar_url) {
          newAvatarUrl = apiResponse.data.avatar_url;
          successMessage = apiResponse.message || successMessage;
          console.log('ApiResponse avatar:', newAvatarUrl);
        }
      }
      
      if (!newAvatarUrl) {
        console.warn('No avatar_url found in response:', response.data);
        throw new Error('Không nhận được URL avatar từ server');
      }
            
      await Swal.fire({
        title: 'Thành công!',
        text: successMessage,
        icon: 'success',
        confirmButtonColor: '#6d5cae',
        confirmButtonText: 'OK'
      });
      
      // Reset upload state
      setAvatarFile(null);
      setAvatarPreview(null);
      
      // Cập nhật displayAvatar với URL mới từ server
      const processedUrl = getAvatarUrl(newAvatarUrl);
      console.log('Setting new display avatar:', processedUrl);
      setDisplayAvatar(processedUrl);
      
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

  // Xác định ảnh nào sẽ hiển thị
  const getCurrentAvatarSrc = () => {
    // Nếu đang có preview (upload mode) → hiển thị preview
    if (avatarPreview) {
      return avatarPreview;
    }
    // Ngược lại → hiển thị ảnh từ server
    return displayAvatar;
  };

  return (
    <Card className="manage-profile-card manage-avatar-upload shadow-sm border-0">
      <Card.Body className="text-center p-4 manage-avatar-body">
        <div className="mb-4 manage-avatar-section">
          <div className="position-relative mb-4 manage-avatar-wrapper">
            {/* Ảnh hiển thị chính */}
            <img
              src={getCurrentAvatarSrc()}
              alt={fullName || 'Người dùng'}
              className="manage-user-page-avatar rounded-circle manage-avatar-img"
              onError={handleImageError}
              style={{ 
                width: '150px', 
                height: '150px',
                objectFit: 'cover',
                border: avatarPreview ? '3px solid #6d5cae' : '3px solid #f0f0f0', // Highlight khi đang preview
                backgroundColor: '#f8f9fa',
                transition: 'border-color 0.3s ease'
              }}
            />
            
            {/* Badge trạng thái user */}
            {getStatusBadge(isActive)}
            
            {/* Badge hiển thị mode */}
            {avatarPreview && (
              <span className="manage-badge manage-bg-info position-absolute top-0 start-0 p-2 rounded-pill manage-preview-badge">
                <i className="bi bi-eye me-1"></i>
                Preview
              </span>
            )}
          </div>
          
          <h3 className="mb-2 fw-bold manage-user-name">
            {fullName || 'Người dùng không tên'}
          </h3>
          <div className="text-muted small">
            <div>User ID: {userId}</div>
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
              <input
                id={`avatarInput_${userId}`}
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                onChange={handleAvatarChange}
                className="d-none"
                disabled={uploading}
              />
              
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
              
              {avatarPreview && (
                <>
                  <Button 
                    variant="outline-secondary" 
                    size="sm"
                    onClick={() => {
                      setAvatarFile(null);
                      setAvatarPreview(null);
                    }}
                    className="manage-btn manage-btn-cancel"
                    disabled={uploading}
                  >
                    <i className="bi bi-x-circle me-1"></i>
                    Hủy
                  </Button>
                  
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
                </>
              )}
            </div>
            
            <Form.Text className="text-muted d-block mt-2 manage-upload-hint">
              <i className="bi bi-info-circle me-1"></i>
              Chọn ảnh JPG, JPEG, PNG kích thước tối đa 2MB
            </Form.Text>
            
            {avatarFile && (
              <div className="mt-3 p-2 bg-light rounded small">
                <div><strong>File:</strong> {avatarFile.name}</div>
                <div><strong>Size:</strong> {(avatarFile.size / 1024).toFixed(2)} KB</div>
                <div className="text-info small">
                  <i className="bi bi-info-circle me-1"></i>
                  Đang xem trước, nhấn "Lưu ảnh" để cập nhật
                </div>
              </div>
            )}
          </Form.Group>
        </div>
      </Card.Body>
    </Card>
  );
};

export default UserAvatarUpload;