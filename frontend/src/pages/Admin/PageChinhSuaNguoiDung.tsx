// src/pages/users/UserEditPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Button, Breadcrumb } from 'react-bootstrap';
import { userApi } from '../../api/users.api';
import type { UserDetail } from '../../api/users.api';
import Swal from 'sweetalert2';

// Import components
import UserAvatarUpload from '../../components/Users/UserAvatarUpload';
import UserInfoUpdate from '../../components/Users/UserInfoUpdate';
import UserAddressManagement from '../../components/Users/UserAddressManagement';

import '../../assets/css/UserDetailPage.css';

const UserEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserDetail | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'addresses'>('info');
  const [refreshKey, setRefreshKey] = useState(0); // Force refresh children

  const fetchUserDetail = async () => {
    if (!id) {
      Swal.fire({
        title: 'Lỗi',
        text: 'Không tìm thấy ID người dùng',
        icon: 'error',
        confirmButtonColor: '#6d5cae'
      }).then(() => navigate('/nguoi-dung'));
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await userApi.getUserDetail(id);
      
      if (response.data?.success && response.data.data) {
        setUser(response.data.data);
      } else {
        Swal.fire({
          title: 'Lỗi',
          text: response.data?.message || 'Không thể tải thông tin người dùng',
          icon: 'error',
          confirmButtonColor: '#6d5cae'
        }).then(() => navigate('/nguoi-dung'));
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Fetch user detail error:', err);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          'Lỗi kết nối đến server';
      
      Swal.fire({
        title: 'Lỗi',
        text: errorMessage,
        icon: 'error',
        confirmButtonColor: '#6d5cae'
      }).then(() => navigate('/nguoi-dung'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoToList = () => {
    navigate('/nguoi-dung');
  };

  const handleToggleStatus = async () => {
    if (!id || !user) return;

    const confirmed = await Swal.fire({
      title: 'Xác nhận thay đổi trạng thái',
      text: user.is_active 
        ? 'Bạn có chắc chắn muốn khóa tài khoản này? Người dùng sẽ không thể đăng nhập.'
        : 'Bạn có chắc chắn muốn kích hoạt tài khoản này?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: user.is_active ? '#ff6b6b' : '#6d5cae',
      cancelButtonColor: '#6d5cae',
      confirmButtonText: user.is_active ? 'Khóa tài khoản' : 'Kích hoạt',
      cancelButtonText: 'Hủy'
    });

    if (!confirmed.isConfirmed) return;

    try {
      Swal.fire({
        title: 'Đang xử lý...',
        text: 'Vui lòng chờ trong giây lát',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const response = await userApi.toggleStatus(id);
      
      if (response.data?.success) {
        Swal.fire({
          title: 'Thành công!',
          text: user.is_active ? 'Đã khóa tài khoản' : 'Đã kích hoạt tài khoản',
          icon: 'success',
          confirmButtonColor: '#6d5cae',
          confirmButtonText: 'OK'
        }).then(() => {
          fetchUserDetail();
          setRefreshKey(prev => prev + 1); // Refresh children
        });
      } else {
        throw new Error(response.data?.message || 'Thay đổi trạng thái thất bại');
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Toggle status error:', err);
      
      Swal.fire({
        title: 'Lỗi',
        text: err.response?.data?.message || 'Lỗi khi thay đổi trạng thái',
        icon: 'error',
        confirmButtonColor: '#6d5cae'
      });
    }
  };

  const handleRefreshData = () => {
    fetchUserDetail();
    setRefreshKey(prev => prev + 1);
  };

  useEffect(() => {
    fetchUserDetail();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <Container className="py-5 manage-user-detail-page">
        <div className="text-center py-5 manage-loading-container">
          <div className="spinner-border text-primary manage-spinner" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
          <p className="mt-3 text-muted manage-loading-text">Đang tải thông tin người dùng...</p>
        </div>
      </Container>
    );
  }

  if (!user) return null;

  return (
    <Container className="py-4 manage-user-detail-page">
      <Breadcrumb className="mb-4 manage-breadcrumb manage-breadcrumb-custom">
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }} className="manage-breadcrumb-item">
          <i className="bi bi-house-door me-1 manage-breadcrumb-icon"></i>
          Trang chủ
        </Breadcrumb.Item>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/nguoi-dung' }} className="manage-breadcrumb-item">
          <i className="bi bi-people me-1 manage-breadcrumb-icon"></i>
          Danh sách người dùng
        </Breadcrumb.Item>
        <Breadcrumb.Item active className="manage-breadcrumb-item manage-breadcrumb-active">
          <span>{user.full_name || 'Người dùng không tên'}</span>
        </Breadcrumb.Item>
      </Breadcrumb>

      <div className="d-flex justify-content-between align-items-center mb-4 manage-page-header">
        <div>
          <h2 className="mb-0 manage-page-title">
            <i className="bi bi-person-gear me-2 manage-title-icon"></i>
            Chỉnh sửa người dùng
          </h2>
        </div>
        
        <div className="d-flex gap-2">
          <Button 
            variant="secondary"
            onClick={handleGoToList} 
            className="manage-btn manage-btn-back manage-btn-action"
          >
            <i className="bi bi-arrow-left me-1 manage-btn-icon"></i>
            Quay lại
          </Button>
          <Button 
            variant={user.is_active ? "danger" : "success"}
            onClick={handleToggleStatus}
            className="manage-btn manage-btn-action"
          >
            <i className={`bi bi-${user.is_active ? 'lock' : 'unlock'} me-1`}></i>
            {user.is_active ? 'Khóa tài khoản' : 'Kích hoạt tài khoản'}
          </Button>
        </div>
      </div>

      <Row>
        <Col lg={4}>
          <UserAvatarUpload
            key={`avatar-${refreshKey}`}
            userId={user.id}
            currentAvatar={user.avatar_url || ''}
            fullName={user.full_name || ''}
            isActive={user.is_active}
            onAvatarUpdated={handleRefreshData}
          />
        </Col>

        <Col lg={8}>
          <div className="manage-tabs-container">
            <div className="manage-nav-tabs-custom">
              <ul className="nav manage-nav-tabs border-0">
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'info' ? 'active manage-tab-active' : ''} manage-tab-btn manage-tab-info`}
                    onClick={() => setActiveTab('info')}
                  >
                    <i className="bi bi-pencil-square me-1"></i>
                    Chỉnh sửa thông tin
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'addresses' ? 'active manage-tab-active' : ''} manage-tab-btn manage-tab-address`}
                    onClick={() => setActiveTab('addresses')}
                  >
                    <i className="bi bi-geo-alt me-1"></i>
                    Quản lý địa chỉ
                  </button>
                </li>
              </ul>
            </div>

            <div className="manage-tab-content mt-3">
              {activeTab === 'info' && (
                <UserInfoUpdate
                  key={`info-${refreshKey}`}
                  userId={user.id}
                  userData={user}
                  onUserUpdated={handleRefreshData}
                />
              )}

              {activeTab === 'addresses' && (
                <UserAddressManagement
                  key={`addresses-${refreshKey}`}
                  userId={user.id}
                />
              )}
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default UserEditPage;