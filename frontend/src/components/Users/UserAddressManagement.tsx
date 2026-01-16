// src/components/users/UserAddressManagement.tsx
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  Badge, 
  Spinner,
} from 'react-bootstrap';
import { userAddressApi } from '../../api/user.adress.api'; // Sửa import
import type { 
  UserAddress, 
  CreateAddressPayload, 
  UpdateAddressPayload,
} from '../../api/user.adress.api'; // Sửa import
import AddressModal from './AddressModal';
import dayjs from 'dayjs';
import Swal from 'sweetalert2';
import axios, { AxiosError } from 'axios';

interface UserAddressManagementProps {
  userId: string;
}

interface ApiErrorResponse {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
}

// Hiển thị tối đa số địa chỉ ban đầu, sau đó có nút "Xem thêm"
const INITIAL_DISPLAY_LIMIT = 4;
const LOAD_MORE_INCREMENT = 4;

const UserAddressManagement: React.FC<UserAddressManagementProps> = ({ userId }) => {
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [displayAddresses, setDisplayAddresses] = useState<UserAddress[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Address modal states
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);
  
  // Pagination states
  const [displayLimit, setDisplayLimit] = useState(INITIAL_DISPLAY_LIMIT);
  const [hasMore, setHasMore] = useState(false);

  const fetchUserAddresses = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      
      const response = await userAddressApi.getUserAddresses(userId);
      
      // KHỚP: BE trả {success: true, data: addresses[]}
      if (response.data?.success) {
        const addressesData = response.data.data || [];
        
        console.log('User addresses:', addressesData);
        
        // BE đã ORDER BY is_default DESC, created_at DESC nên không cần sort lại
        setAddresses(addressesData);
        setDisplayAddresses(addressesData.slice(0, displayLimit));
        setHasMore(addressesData.length > displayLimit);
      } else {
        // BE luôn trả success: true nếu không lỗi
        throw new Error('Invalid response format');
      }
    } catch (err: unknown) {
      console.error('Fetch user addresses error:', err);
      
      let errorMessage = 'Không thể tải danh sách địa chỉ';
      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError<ApiErrorResponse>;
        
        // Nếu lỗi 404, user không tồn tại
        if (axiosError.response?.status === 404) {
          errorMessage = 'Người dùng không tồn tại';
        } else {
          errorMessage = axiosError.response?.data?.message || errorMessage;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      Swal.fire({
        title: 'Lỗi',
        text: errorMessage,
        icon: 'error',
        confirmButtonColor: '#6d5cae'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMoreAddresses = () => {
    const newLimit = displayLimit + LOAD_MORE_INCREMENT;
    setDisplayLimit(newLimit);
    setDisplayAddresses(addresses.slice(0, newLimit));
    setHasMore(addresses.length > newLimit);
  };

  const showAllAddresses = () => {
    setDisplayLimit(addresses.length);
    setDisplayAddresses(addresses);
    setHasMore(false);
  };

  useEffect(() => {
    fetchUserAddresses();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Cập nhật displayAddresses khi addresses hoặc displayLimit thay đổi
  useEffect(() => {
    setDisplayAddresses(addresses.slice(0, displayLimit));
    setHasMore(addresses.length > displayLimit);
  }, [addresses, displayLimit]);

  const handleAddAddress = () => {
    setEditingAddress(null);
    setShowAddressModal(true);
  };

  const handleEditAddress = (address: UserAddress) => {
    setEditingAddress(address);
    setShowAddressModal(true);
  };

  // Thêm hàm validate phone theo BE (digits:10)
  const validatePhone = (phone: string): boolean => {
    return /^\d{10}$/.test(phone);
  };

  const handleSaveAddress = async (data: {
    label?: string | null;
    receiver_name: string;
    phone: string;
    street_address: string;
    commune_id?: number | null; // KHỚP: có thể null
    is_default?: boolean;
  }) => {
    if (!userId) return;

    // Validate phone theo BE
    if (!validatePhone(data.phone)) {
      Swal.fire({
        title: 'Lỗi',
        text: 'Số điện thoại phải có đúng 10 chữ số',
        icon: 'error',
        confirmButtonColor: '#6d5cae'
      });
      return;
    }

    const confirmed = await Swal.fire({
      title: editingAddress ? 'Xác nhận cập nhật' : 'Xác nhận thêm mới',
      text: editingAddress 
        ? 'Bạn có chắc chắn muốn cập nhật địa chỉ này?'
        : 'Bạn có chắc chắn muốn thêm địa chỉ mới?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#6d5cae',
      cancelButtonColor: '#ff6b6b',
      confirmButtonText: editingAddress ? 'Cập nhật' : 'Thêm mới',
      cancelButtonText: 'Hủy'
    });

    if (!confirmed.isConfirmed) return;

    try {
      setSaving(true);
      
      Swal.fire({
        title: editingAddress ? 'Đang cập nhật...' : 'Đang thêm mới...',
        text: 'Vui lòng chờ trong giây lát',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      let response;
      if (editingAddress) {
        // UPDATE - KHỚP: UpdateAddressPayload tất cả fields optional
        const updateData: UpdateAddressPayload = {
          label: data.label || null,
          receiver_name: data.receiver_name,
          phone: data.phone,
          street_address: data.street_address,
          commune_id: data.commune_id || null, // Cho phép null
          is_default: data.is_default,
        };
        
        // Cập nhật địa chỉ
        response = await userAddressApi.updateAddress(userId, editingAddress.id, updateData);
      } else {
        // CREATE - KHỚP: CreateAddressPayload
        const createData: CreateAddressPayload = {
          label: data.label || null,
          receiver_name: data.receiver_name, // required
          phone: data.phone, // required, digits:10
          street_address: data.street_address, // required
          commune_id: data.commune_id || null, // nullable
          is_default: data.is_default,
        };
        
        // Thêm địa chỉ mới
        response = await userAddressApi.addAddress(userId, createData);
      }

      // KHỚP: BE trả {success: true, message: string, data: address}
      if (response.data.success) {
        Swal.fire({
          title: 'Thành công!',
          text: response.data.message || (editingAddress ? 'Cập nhật địa chỉ thành công' : 'Thêm địa chỉ thành công'),
          icon: 'success',
          confirmButtonColor: '#6d5cae',
          confirmButtonText: 'OK'
        }).then(() => {
          setShowAddressModal(false);
          fetchUserAddresses(); // Load lại danh sách địa chỉ
          // Reset display limit về ban đầu sau khi thêm/xóa
          setDisplayLimit(INITIAL_DISPLAY_LIMIT);
        });
      } else {
        throw new Error(response.data?.message || editingAddress ? 'Cập nhật địa chỉ thất bại' : 'Thêm địa chỉ thất bại');
      }
    } catch (err: unknown) {
      console.error('Save address error:', err);
      
      let errorMessage = 'Lỗi khi lưu địa chỉ';
      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError<ApiErrorResponse>;
        const errorData = axiosError.response?.data;
        
        if (errorData?.message) {
          errorMessage = errorData.message;
        } else if (errorData?.errors) {
          const errors = errorData.errors;
          errorMessage = Object.values(errors).flat().join(', ');
        }
        
        // Xử lý lỗi 404 từ BE
        if (axiosError.response?.status === 404) {
          if (errorData?.message?.includes('Người dùng')) {
            errorMessage = 'Người dùng không tồn tại';
          } else if (errorData?.message?.includes('Địa chỉ')) {
            errorMessage = 'Địa chỉ không tồn tại';
          }
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      Swal.fire({
        title: 'Lỗi',
        text: errorMessage,
        icon: 'error',
        confirmButtonColor: '#6d5cae'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAddress = async (addressId: number) => {
    const addressToDelete = addresses.find(addr => addr.id === addressId);
    if (!addressToDelete) return;

    const confirmed = await Swal.fire({
      title: 'Xác nhận xóa',
      text: 'Bạn có chắc chắn muốn xóa địa chỉ này?' + 
            (addressToDelete.is_default ? '\n(Địa chỉ mặc định sau khi xóa sẽ được thay thế bằng địa chỉ mới nhất)' : ''),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ff6b6b',
      cancelButtonColor: '#6d5cae',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    });

    if (!confirmed.isConfirmed) return;

    try {
      setSaving(true);
      
      Swal.fire({
        title: 'Đang xóa...',
        text: 'Vui lòng chờ trong giây lát',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Xóa địa chỉ - KHỚP: BE trả {success: true, message: string}
      const response = await userAddressApi.deleteAddress(userId, addressId);
      if (response.data.success) {
        Swal.fire({
          title: 'Thành công!',
          text: response.data.message || 'Xóa địa chỉ thành công',
          icon: 'success',
          confirmButtonColor: '#6d5cae',
          confirmButtonText: 'OK'
        }).then(() => {
          fetchUserAddresses(); // Load lại danh sách địa chỉ
          // Reset display limit về ban đầu sau khi thêm/xóa
          setDisplayLimit(INITIAL_DISPLAY_LIMIT);
        });
      } else {
        throw new Error(response.data?.message || 'Xóa địa chỉ thất bại');
      }
    } catch (err: unknown) {
      console.error('Delete address error:', err);
      
      let errorMessage = 'Lỗi khi xóa địa chỉ';
      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError<ApiErrorResponse>;
        errorMessage = axiosError.response?.data?.message || errorMessage;
        
        // Xử lý lỗi 404 từ BE
        if (axiosError.response?.status === 404) {
          if (errorMessage.includes('Người dùng')) {
            errorMessage = 'Người dùng không tồn tại';
          } else if (errorMessage.includes('Địa chỉ')) {
            errorMessage = 'Địa chỉ không tồn tại hoặc đã bị xóa';
          }
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      Swal.fire({
        title: 'Lỗi',
        text: errorMessage,
        icon: 'error',
        confirmButtonColor: '#6d5cae'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefaultAddress = async (addressId: number) => {
    // Kiểm tra đã là mặc định chưa
    const address = addresses.find(addr => addr.id === addressId);
    if (address?.is_default) {
      Swal.fire({
        title: 'Thông báo',
        text: 'Địa chỉ này đã là mặc định',
        icon: 'info',
        confirmButtonColor: '#6d5cae'
      });
      return;
    }

    const confirmed = await Swal.fire({
      title: 'Xác nhận đặt mặc định',
      text: 'Bạn có chắc chắn muốn đặt địa chỉ này làm mặc định?\nĐịa chỉ mặc định hiện tại sẽ bị thay thế.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#6d5cae',
      cancelButtonColor: '#ff6b6b',
      confirmButtonText: 'Đặt mặc định',
      cancelButtonText: 'Hủy'
    });

    if (!confirmed.isConfirmed) return;

    try {
      setSaving(true);
      
      Swal.fire({
        title: 'Đang xử lý...',
        text: 'Vui lòng chờ trong giây lát',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Đặt làm mặc định - KHỚP: BE trả {success: true, message: string}
      const response = await userAddressApi.setDefaultAddress(userId, addressId);
      if (response.data.success) {
        Swal.fire({
          title: 'Thành công!',
          text: response.data.message || 'Đã đặt làm địa chỉ mặc định',
          icon: 'success',
          confirmButtonColor: '#6d5cae',
          confirmButtonText: 'OK'
        }).then(() => {
          fetchUserAddresses(); // Load lại danh sách địa chỉ
        });
      } else {
        throw new Error(response.data?.message || 'Đặt địa chỉ mặc định thất bại');
      }
    } catch (err: unknown) {
      console.error('Set default address error:', err);
      
      let errorMessage = 'Lỗi khi đặt địa chỉ mặc định';
      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError<ApiErrorResponse>;
        errorMessage = axiosError.response?.data?.message || errorMessage;
        
        // Xử lý lỗi 404 từ BE
        if (axiosError.response?.status === 404) {
          if (errorMessage.includes('Người dùng')) {
            errorMessage = 'Người dùng không tồn tại';
          } else if (errorMessage.includes('Địa chỉ')) {
            errorMessage = 'Địa chỉ không tồn tại';
          }
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      Swal.fire({
        title: 'Lỗi',
        text: errorMessage,
        icon: 'error',
        confirmButtonColor: '#6d5cae'
      });
    } finally {
      setSaving(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return dayjs(dateString).format('DD/MM/YYYY HH:mm');
    } catch {
      return 'Định dạng không hợp lệ';
    }
  };

  const formatAddress = (address: UserAddress) => {
    // Ưu tiên dùng full_address từ API
    if (address.full_address) {
      return address.full_address;
    }
    
    const parts = [];
    if (address.street_address) parts.push(address.street_address);
    if (address.commune_name) parts.push(address.commune_name);
    if (address.province_name) parts.push(address.province_name);
    return parts.join(', ') || 'Chưa cập nhật địa chỉ';
  };

  // Thêm hàm format phone để hiển thị đẹp
  const formatPhoneNumber = (phone: string): string => {
    if (!phone) return '';
    // Format: 0123 456 789
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
  };

  return (
    <div className="manage-addresses-content">
      <div className="d-flex justify-content-between align-items-center mb-4 manage-section-header">
        <h4 className="mb-0 fw-bold text-primary manage-section-title">
          <i className="bi bi-geo-alt-fill me-2"></i>
          Quản lý địa chỉ
        </h4>
        <div>
          <Badge bg="secondary" className="fs-6 px-3 py-2 manage-badge manage-badge-secondary manage-count-badge me-2">
            {addresses.length} địa chỉ
          </Badge>
          <Button 
            variant="primary"
            onClick={handleAddAddress}
            className="manage-btn manage-btn-primary manage-btn-add-address"
            disabled={loading || saving}
          >
            <i className="bi bi-plus-circle me-1"></i>
            Thêm địa chỉ
          </Button>
        </div>
      </div>
      
      {loading && addresses.length === 0 ? (
        <div className="text-center py-5 manage-loading-state">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Đang tải danh sách địa chỉ...</p>
        </div>
      ) : displayAddresses.length > 0 ? (
        <>
          <Row>
            {displayAddresses.map((address) => (
              <Col md={6} key={address.id} className="mb-4">
                <Card className={`h-100 ${address.is_default ? 'border-primary border-3 manage-address-default' : 'border-light'} manage-hover-lift shadow-sm manage-address-card`}>
                  <Card.Body className="p-3 manage-address-body">
                    <div className="d-flex justify-content-between align-items-start mb-3 manage-address-header">
                      <Card.Title className="mb-0 d-flex align-items-center manage-address-title">
                        <i className="bi bi-geo me-2 text-primary manage-address-icon"></i>
                        {address.label || 'Địa chỉ không có nhãn'}
                      </Card.Title>
                      <div className="d-flex gap-1 manage-address-actions">
                        {address.is_default ? (
                          <Badge bg="primary" className="px-3 py-2 manage-badge manage-badge-primary manage-default-badge">
                            <i className="bi bi-star-fill me-1"></i>
                            Mặc định
                          </Badge>
                        ) : (
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            onClick={() => handleSetDefaultAddress(address.id)}
                            disabled={saving}
                            className="manage-btn manage-btn-default"
                          >
                            <i className="bi bi-star me-1"></i>
                            Đặt mặc định
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="mb-3 manage-address-details">
                      <div className="d-flex align-items-center mb-2 manage-address-field">
                        <i className="bi bi-person text-muted me-2 manage-detail-icon"></i>
                        <strong className="me-2 manage-detail-label">Người nhận:</strong>
                        <span className="manage-detail-value">{address.receiver_name}</span>
                      </div>
                      
                      <div className="d-flex align-items-center mb-2 manage-address-field">
                        <i className="bi bi-telephone text-muted me-2 manage-detail-icon"></i>
                        <strong className="me-2 manage-detail-label">SĐT:</strong>
                        <span className="manage-detail-value">{formatPhoneNumber(address.phone)}</span>
                      </div>
                      
                      <div className="d-flex align-items-start mb-3 manage-address-field">
                        <i className="bi bi-house text-muted me-2 mt-1 manage-detail-icon"></i>
                        <div>
                          <strong className="me-2 manage-detail-label">Địa chỉ:</strong>
                          <span className="manage-detail-value">{formatAddress(address)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="d-flex justify-content-between align-items-center border-top pt-3 manage-address-footer">
                      <div className="text-muted small d-flex align-items-center manage-timestamp">
                        <i className="bi bi-clock me-2 manage-time-icon"></i>
                        <span className="manage-time-value">
                          Thêm: {formatDateTime(address.created_at)}
                          {address.updated_at && ` - Cập nhật: ${formatDateTime(address.updated_at)}`}
                        </span>
                      </div>
                      <div className="d-flex gap-1 manage-footer-actions">
                        <Button 
                          variant="outline-warning" 
                          size="sm"
                          onClick={() => handleEditAddress(address)}
                          disabled={saving}
                          className="manage-btn manage-btn-edit"
                        >
                          <i className="bi bi-pencil me-1"></i>
                          Sửa
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => handleDeleteAddress(address.id)}
                          disabled={saving}
                          className="manage-btn manage-btn-delete"
                          title={address.is_default ? "Có thể xóa, hệ thống sẽ tự đặt địa chỉ khác làm mặc định" : ""}
                        >
                          <i className="bi bi-trash me-1"></i>
                          Xóa
                        </Button>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
          
          {hasMore && (
            <div className="text-center mt-4">
              {addresses.length - displayAddresses.length > LOAD_MORE_INCREMENT ? (
                <>
                  <Button 
                    variant="outline-primary" 
                    onClick={loadMoreAddresses}
                    disabled={loading || saving}
                    className="me-2"
                  >
                    <i className="bi bi-chevron-down me-1"></i>
                    Xem thêm {LOAD_MORE_INCREMENT} địa chỉ
                  </Button>
                  <Button 
                    variant="outline-secondary" 
                    onClick={showAllAddresses}
                    disabled={loading || saving}
                  >
                    <i className="bi bi-list-check me-1"></i>
                    Hiển thị tất cả ({addresses.length})
                  </Button>
                </>
              ) : (
                <Button 
                  variant="outline-primary" 
                  onClick={showAllAddresses}
                  disabled={loading || saving}
                >
                  <i className="bi bi-list-check me-1"></i>
                  Hiển thị tất cả {addresses.length} địa chỉ
                </Button>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-5 manage-empty-state">
          <div className="mb-4">
            <i className="bi bi-geo-alt text-muted display-1 manage-empty-icon"></i>
          </div>
          <h5 className="text-muted mb-3 manage-empty-title">Người dùng chưa có địa chỉ nào</h5>
          <p className="text-muted manage-empty-message mb-4">Hãy thêm địa chỉ đầu tiên cho người dùng</p>
          <Button 
            variant="primary"
            onClick={handleAddAddress}
            className="manage-btn manage-btn-add-first"
            disabled={loading || saving}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Thêm địa chỉ đầu tiên
          </Button>
        </div>
      )}

      {/* Address Modal */}
      <AddressModal
        show={showAddressModal}
        onHide={() => setShowAddressModal(false)}
        editingAddress={editingAddress}
        onSave={handleSaveAddress}
        saving={saving}
        userId={userId}
      />
    </div>
  );
};

export default UserAddressManagement;