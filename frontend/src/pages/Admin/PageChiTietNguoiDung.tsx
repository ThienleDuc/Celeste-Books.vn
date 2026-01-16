// src/pages/users/UserDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert, Badge, Breadcrumb } from 'react-bootstrap';
import { userApi } from '../../api/users.api';
import type { UserDetail, UserAddress } from '../../api/users.api'; // Sửa AddressType thành UserAddress
import dayjs from 'dayjs';
import { getAvatarUrl, handleImageError } from '../../utils/imageHelper';
import '../../assets/css/UserDetailPage.css';
import { formatPhoneNumber } from '../../utils/formatPhoneNumber';

// Định nghĩa kiểu cho lỗi API
interface ApiError {
  response?: {
    data?: {
      message?: string;
      error?: string;
    };
  };
  message?: string;
}

const UserDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<UserDetail | null>(null);
    const [addresses, setAddresses] = useState<UserAddress[]>([]); // Tách addresses riêng
    const [activeTab, setActiveTab] = useState<'info' | 'addresses'>('info');
    const [addressesLoading, setAddressesLoading] = useState(false);

    const fetchUserDetail = async () => {
        if (!id) {
            setError('Không tìm thấy ID người dùng');
            setLoading(false);
            return;
        }
        
        setLoading(true);
        setError(null);
        
        try {
            // Gọi API getUserById để lấy thông tin chi tiết user
            const response = await userApi.getUserDetail(id);
            
            if (response.data?.success && response.data.data) {
                const userData = response.data.data;
                
                // Xử lý avatar URL
                const avatarUrl = userData.avatar_url || userData.profile?.avatar_url;
                const processedAvatarUrl = getAvatarUrl(avatarUrl);
                
                // Transform data để phù hợp với interface
                const transformedUser: UserDetail = {
                    ...userData,
                    avatar_url: processedAvatarUrl,
                    full_name: userData.full_name || userData.profile?.full_name || '',
                    phone: userData.phone || userData.profile?.phone || '',
                    role_name: userData.role_name || userData.role?.name || '',
                    addresses: userData.addresses || [], // Có thể có hoặc không
                    notifications: userData.notifications || [],
                    id: userData.id,
                    username: userData.username || null,
                    email: userData.email || null,
                    is_active: Boolean(userData.is_active),
                    role_id: userData.role_id,
                    created_at: userData.created_at || null,
                    status_text: userData.status_text || '',
                    gender: userData.gender || null,
                    birthday: userData.birthday || null,
                    created_at_raw: userData.created_at_raw || null,
                    gender_text: userData.gender_text || '',
                    role: userData.role || null,
                    profile: userData.profile || null
                };
                
                setUser(transformedUser);
                
                // Nếu userData không có addresses, fetch riêng
                if (!userData.addresses || userData.addresses.length === 0) {
                    fetchUserAddresses(id);
                } else {
                    setAddresses(userData.addresses);
                }
                
            } else {
                setError(response.data?.message || 'Không thể tải thông tin người dùng');
            }
        } catch (err) {
            console.error('Fetch user detail error:', err);
            const apiError = err as ApiError;
            const errorMessage = apiError.response?.data?.message || 
                                apiError.response?.data?.error || 
                                apiError.message || 
                                'Lỗi kết nối đến server';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserAddresses = async (userId: string) => {
        setAddressesLoading(true);
        try {
            const response = await userApi.getUserAddresses(userId);
            if (response.data?.success && response.data.data) {
                setAddresses(response.data.data);
            }
        } catch (err) {
            console.error('Fetch addresses error:', err);
        } finally {
            setAddressesLoading(false);
        }
    };

    const handleGoToList = () => {
        navigate('/nguoi-dung');
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Chưa cập nhật';
        try {
            return dayjs(dateString).format('DD/MM/YYYY');
        } catch {
            return 'Định dạng không hợp lệ';
        }
    };

    const formatDateTime = (dateString: string | null) => {
        if (!dateString) return 'Chưa cập nhật';
        try {
            return dayjs(dateString).format('DD/MM/YYYY HH:mm');
        } catch {
            return 'Định dạng không hợp lệ';
        }
    };

    const getGenderText = (gender: string | null) => {
        switch (gender?.toLowerCase()) {
            case 'nam': return 'Nam';
            case 'nữ': return 'Nữ';
            case 'female': return 'Nữ';
            case 'male': return 'Nam';
            case 'other': return 'Khác';
            case 'khác': return 'Khác';
            default: return 'Chưa cập nhật';
        }
    };

    const getStatusBadge = (isActive: boolean) => {
        return isActive ? (
            <Badge bg="success" className="manage-badge manage-badge-success">
                <i className="bi bi-check-circle me-1"></i>
                Đang hoạt động
            </Badge>
        ) : (
            <Badge bg="danger" className="manage-badge manage-badge-danger">
                <i className="bi bi-x-circle me-1"></i>
                Đã khóa
            </Badge>
        );
    };

    const formatAddress = (address: UserAddress) => {
        // Sử dụng full_address nếu có (từ controller)
        if (address.full_address) {
            return address.full_address;
        }
        
        // Fallback: tự tạo từ các phần
        const parts = [];
        if (address.street_address) parts.push(address.street_address);
        if (address.commune_name) parts.push(address.commune_name);
        if (address.province_name) parts.push(address.province_name);
        return parts.join(', ') || 'Chưa cập nhật';
    };

    useEffect(() => {
        fetchUserDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (loading) {
        return (
            <Container className="py-5">
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3">Đang tải thông tin người dùng...</p>
                </div>
            </Container>
        );
    }

    if (error || !user) {
        return (
            <Container className="py-5">
                <Alert variant="danger">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error || 'Không tìm thấy thông tin người dùng'}
                </Alert>
                <div className="mt-3">
                    <Button variant="primary" onClick={fetchUserDetail}>
                        <i className="bi bi-arrow-clockwise me-1"></i>
                        Thử lại
                    </Button>
                    <Button variant="outline-secondary" onClick={handleGoToList} className="ms-2">
                        <i className="bi bi-arrow-left me-1"></i>
                        Quay lại danh sách
                    </Button>
                </div>
            </Container>
        );
    }

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
                        <i className="bi bi-person-circle me-2 manage-title-icon"></i>
                        Thông tin người dùng
                    </h2>
                </div>
                
                <div className="d-flex gap-3">
                    <Button 
                        variant="outline-secondary" 
                        onClick={handleGoToList} 
                        className="manage-btn manage-btn-back manage-btn-action"
                    >
                        <i className="bi bi-arrow-left me-1 manage-btn-icon"></i>
                        Quay lại danh sách
                    </Button>
                    <Button 
                        variant="outline-secondary" 
                        onClick={() => navigate(`/nguoi-dung/chinh-sua/${id}`)}
                        className="manage-btn manage-btn-back manage-btn-action"
                    >
                        <i className="bi bi-pencil me-1 manage-btn-icon"></i>
                        Chỉnh sửa
                    </Button>
                </div>
            </div>

            <Row>
                <Col lg={4}>
                    <Card className="mb-4 manage-profile-card shadow-sm border-0">
                        <Card.Body className="text-center p-4">
                            <div className="mb-4">
                                <div className="position-relative mb-4">
                                    <img
                                        src={user.avatar_url || '/default-avatar.png'}
                                        alt={user.full_name || 'Người dùng'}
                                        className="manage-user-page-avatar rounded-circle"
                                        onError={handleImageError}
                                    />
                                    <div className="position-absolute bottom-0 end-0">
                                        {getStatusBadge(user.is_active)}
                                    </div>
                                </div>
                                
                                <h3 className="mb-2 fw-bold manage-user-name">{user.full_name || 'Người dùng không tên'}</h3>
                                <div className="mb-3">
                                    <Badge bg="info" className="manage-badge manage-badge-info">
                                        <i className="bi bi-person-badge me-1"></i>
                                        {user.role_name || 'Chưa phân quyền'}
                                    </Badge>
                                </div>
                                <p className="text-muted mb-0 fs-5 manage-username">
                                    <i className="bi bi-person me-1"></i>
                                    {user.username || 'Chưa có tên đăng nhập'}
                                </p>
                            </div>
                            
                            <hr className="my-4 manage-divider" />
                            
                            <div className="text-start">
                                <div className="mb-3 manage-contact-item">
                                    <div className="d-flex align-items-center mb-1">
                                        <i className="bi bi-envelope text-muted me-2 fs-5 manage-icon"></i>
                                        <small className="text-muted manage-label">Email</small>
                                    </div>
                                    {user.email ? (
                                        <a href={`mailto:${user.email}`} className="text-decoration-none d-block text-truncate fs-5 manage-email">
                                            {user.email}
                                        </a>
                                    ) : (
                                        <span className="text-muted fs-5 manage-no-data">Chưa cập nhật</span>
                                    )}
                                </div>
                                
                                <div className="mb-3 manage-contact-item">
                                    <div className="d-flex align-items-center mb-1">
                                        <i className="bi bi-telephone text-muted me-2 fs-5 manage-icon"></i>
                                        <small className="text-muted manage-label">Số điện thoại</small>
                                    </div>
                                    {user.phone ? (
                                        <a href={`tel:${user.phone}`} className="text-decoration-none d-block fs-5 manage-phone">
                                            {formatPhoneNumber(user?.phone || '')}
                                        </a>
                                    ) : (
                                        <span className="text-muted fs-5 manage-no-data">Chưa cập nhật</span>
                                    )}
                                </div>
                                
                                <div className="mb-3 manage-meta-item">
                                    <div className="d-flex align-items-center mb-1">
                                        <i className="bi bi-calendar text-muted me-2 fs-5 manage-icon"></i>
                                        <small className="text-muted manage-label">Ngày tạo tài khoản</small>
                                    </div>
                                    <div className="fs-5 manage-date">
                                        {formatDateTime(user.created_at)}
                                    </div>
                                </div>
                                
                                <div className="mb-3 manage-meta-item">
                                    <div className="d-flex align-items-center mb-1">
                                        <i className="bi bi-fingerprint text-muted me-2 fs-5 manage-icon"></i>
                                        <small className="text-muted manage-label">User ID</small>
                                    </div>
                                    <code className="manage-code bg-light p-2 rounded d-inline-block fs-5">{user.id}</code>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={8}>
                    <Card className="mb-4 shadow-sm border-0 manage-tabs-card">
                        <Card.Header className="bg-white border-bottom manage-tabs-header">
                            <div className="manage-nav-tabs-custom">
                                <ul className="nav manage-nav-tabs border-0">
                                    <li className="nav-item">
                                        <button
                                            className={`nav-link ${activeTab === 'info' ? 'active manage-tab-active' : ''} manage-tab-btn manage-tab-info`}
                                            onClick={() => setActiveTab('info')}
                                        >
                                            <i className="bi bi-info-circle me-1"></i>
                                            Thông tin cá nhân
                                        </button>
                                    </li>
                                    <li className="nav-item">
                                        <button
                                            className={`nav-link ${activeTab === 'addresses' ? 'active manage-tab-active' : ''} manage-tab-btn manage-tab-address`}
                                            onClick={() => setActiveTab('addresses')}
                                        >
                                            <i className="bi bi-geo-alt me-1"></i>
                                            Địa chỉ
                                            {addresses.length > 0 && (
                                                <Badge bg="primary" className="ms-1 manage-badge manage-badge-primary manage-count-badge">
                                                    {addresses.length}
                                                </Badge>
                                            )}
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </Card.Header>
                        
                        <Card.Body className="p-4">
                            {activeTab === 'info' && (
                                <div className="manage-user-info-content">
                                    <h4 className="mb-4 fw-bold text-primary manage-section-title">
                                        <i className="bi bi-person-lines-fill me-2"></i>
                                        Chi tiết thông tin
                                    </h4>
                                    
                                    <Row>
                                        <Col md={6}>
                                            <div className="manage-info-item mb-4">
                                                <label className="text-muted small d-block mb-2 manage-field-label">Họ và tên</label>
                                                <div className="manage-info-value p-3 bg-light rounded border">
                                                    <div className="d-flex align-items-center">
                                                        <i className="bi bi-person me-3 text-primary fs-5 manage-field-icon"></i>
                                                        <span className="fs-5 manage-field-value">{user.full_name || 'Chưa cập nhật'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="manage-info-item mb-4">
                                                <label className="text-muted small d-block mb-2 manage-field-label">Tên đăng nhập</label>
                                                <div className="manage-info-value p-3 bg-light rounded border">
                                                    <div className="d-flex align-items-center">
                                                        <i className="bi bi-at me-3 text-primary fs-5 manage-field-icon"></i>
                                                        <span className="fs-5 manage-field-value">{user.username || 'Chưa có'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="manage-info-item mb-4">
                                                <label className="text-muted small d-block mb-2 manage-field-label">Email</label>
                                                <div className="manage-info-value p-3 bg-light rounded border">
                                                    <div className="d-flex align-items-center">
                                                        <i className="bi bi-envelope me-3 text-primary fs-5 manage-field-icon"></i>
                                                        <span className="fs-5 manage-field-value">{user.email || 'Chưa cập nhật'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Col>
                                        
                                        <Col md={6}>
                                            <div className="manage-info-item mb-4">
                                                <label className="text-muted small d-block mb-2 manage-field-label">Giới tính</label>
                                                <div className="manage-info-value p-3 bg-light rounded border">
                                                    <div className="d-flex align-items-center">
                                                        <i className="bi bi-gender-ambiguous me-3 text-primary fs-5 manage-field-icon"></i>
                                                        <span className="fs-5 manage-field-value">{getGenderText(user.gender)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="manage-info-item mb-4">
                                                <label className="text-muted small d-block mb-2 manage-field-label">Ngày sinh</label>
                                                <div className="manage-info-value p-3 bg-light rounded border">
                                                    <div className="d-flex align-items-center">
                                                        <i className="bi bi-calendar-heart me-3 text-primary fs-5 manage-field-icon"></i>
                                                        <span className="fs-5 manage-field-value">{formatDate(user.birthday)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="manage-info-item mb-4">
                                                <label className="text-muted small d-block mb-2 manage-field-label">Vai trò</label>
                                                <div className="manage-info-value p-3 bg-light rounded border">
                                                    <div className="d-flex align-items-center">
                                                        <i className="bi bi-person-badge me-3 text-primary fs-5 manage-field-icon"></i>
                                                        <span className="fs-5 manage-field-value">{user.role_name || 'Chưa phân quyền'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Col>
                                    </Row>
                                </div>
                            )}

                            {activeTab === 'addresses' && (
                                <div className="manage-addresses-content">
                                    <div className="d-flex justify-content-between align-items-center mb-4 manage-section-header">
                                        <h4 className="mb-0 fw-bold text-primary manage-section-title">
                                            <i className="bi bi-geo-alt-fill me-2"></i>
                                            Địa chỉ người dùng
                                        </h4>
                                        <Badge bg="secondary" className="fs-6 px-3 py-2 manage-badge manage-badge-secondary manage-count-badge">
                                            {addresses.length} địa chỉ
                                        </Badge>
                                    </div>
                                    
                                    {addressesLoading ? (
                                        <div className="text-center py-4">
                                            <Spinner animation="border" size="sm" variant="primary" />
                                            <p className="mt-2">Đang tải địa chỉ...</p>
                                        </div>
                                    ) : addresses.length > 0 ? (
                                        <Row>
                                            {addresses.map((address) => (
                                                <Col md={6} key={address.id} className="mb-4">
                                                    <Card className={`h-100 ${address.is_default ? 'border-primary border-3 manage-address-default' : 'border-light'} manage-hover-lift shadow-sm manage-address-card`}>
                                                        <Card.Body className="p-3">
                                                            <div className="d-flex justify-content-between align-items-start mb-3 manage-address-header">
                                                                <Card.Title className="mb-0 d-flex align-items-center manage-address-title">
                                                                    <i className="bi bi-geo me-2 text-primary manage-address-icon"></i>
                                                                    {address.label || 'Địa chỉ không có nhãn'}
                                                                </Card.Title>
                                                                {address.is_default && (
                                                                    <Badge bg="primary" className="px-3 py-2 manage-badge manage-badge-primary manage-default-badge">
                                                                        <i className="bi bi-star-fill me-1"></i>
                                                                        Mặc định
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            
                                                            <div className="mb-3 manage-address-details">
                                                                <div className="d-flex align-items-center mb-2 manage-address-field">
                                                                    <i className="bi bi-person text-muted me-2 manage-detail-icon"></i>
                                                                    <strong className="me-2 manage-detail-label">Người nhận:</strong>
                                                                    <span className="manage-detail-value">{address.receiver_name || 'N/A'}</span>
                                                                </div>
                                                                
                                                                <div className="d-flex align-items-center mb-2 manage-address-field">
                                                                    <i className="bi bi-telephone text-muted me-2 manage-detail-icon"></i>
                                                                    <strong className="me-2 manage-detail-label">SĐT:</strong>
                                                                    <span className="manage-detail-value">{address.phone || 'N/A'}</span>
                                                                </div>
                                                                
                                                                <div className="d-flex align-items-start mb-3 manage-address-field">
                                                                    <i className="bi bi-house text-muted me-2 mt-1 manage-detail-icon"></i>
                                                                    <div>
                                                                        <strong className="me-2 manage-detail-label">Địa chỉ:</strong>
                                                                        <span className="manage-detail-value">{formatAddress(address)}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="text-muted small border-top pt-3 d-flex align-items-center manage-address-footer">
                                                                <i className="bi bi-clock me-2 manage-time-icon"></i>
                                                                <span className="manage-time-value">{formatDateTime(address.created_at)}</span>
                                                            </div>
                                                        </Card.Body>
                                                    </Card>
                                                </Col>
                                            ))}
                                        </Row>
                                    ) : (
                                        <div className="text-center py-5 manage-empty-state">
                                            <div className="mb-4">
                                                <i className="bi bi-geo-alt text-muted display-1 manage-empty-icon"></i>
                                            </div>
                                            <h5 className="text-muted mb-3 manage-empty-title">Người dùng chưa có địa chỉ nào</h5>
                                            <p className="text-muted manage-empty-message">Người dùng chưa thêm địa chỉ vào hệ thống</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default UserDetailPage;