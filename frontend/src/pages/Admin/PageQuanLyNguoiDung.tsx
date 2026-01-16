// src/pages/PageQuanLyNguoiDung.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import UserListTable from '../../components/Users/UserListTable';
import type { UserWithRelations } from '../../api/users.api';
import { userApi } from '../../api/users.api';
import type { ApiResponse } from '../../api/auth.api';

// Type cho lỗi axios
interface AxiosError {
  response?: {
    data?: ApiResponse;
    status?: number;
  };
  message?: string;
  isAxiosError?: boolean;
}

const PageQuanLyNguoiDung: React.FC = () => {
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [, setIsDeleting] = useState<string | null>(null);

  // Xử lý khi click xem chi tiết user
  const handleViewUser = (user: UserWithRelations): void => {
    navigate(`/nguoi-dung/chi-tiet/${user.id}`);
  };

  // Xử lý khi click chỉnh sửa user
  const handleEditUser = (user: UserWithRelations): void => {
    navigate(`/nguoi-dung/chinh-sua/${user.id}`);
  };

  // Xử lý khi click xóa user - QUYỀN ĐƯỢC KIỂM TRA TỪ BACKEND
  const handleDeleteUser = async (user: UserWithRelations): Promise<void> => {
    try {
      const userName = user.full_name || user.username || 'Người dùng này';
      const userRoleName = user.role_id === 'A' ? 'Quản trị viên' : 
                          user.role_id === 'S' ? 'Nhân viên' : 
                          user.role_id === 'C' ? 'Khách hàng' : 'Chưa phân quyền';
      
      const result = await Swal.fire({
        title: 'Xác nhận xóa người dùng',
        html: `
          <div>
            <p>Bạn có chắc chắn muốn xóa người dùng <strong>"${userName}"</strong>?</p>
            <p>Vai trò: ${userRoleName}</p>
            <p class="text-danger">Hành động này không thể hoàn tác!</p>
          </div>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy',  
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        allowOutsideClick: false
      });

      if (result.isConfirmed) {
        setIsDeleting(user.id);
        
        // Thêm loading
        Swal.fire({
          title: 'Đang xóa...',
          html: '<div class="spinner-border text-primary" role="status"></div>',
          allowOutsideClick: false,
          showConfirmButton: false
        });
        
        // CHỈNH SỬA Ở ĐÂY: response.data đã là ApiResponse
        const response = await userApi.deleteUser(user.id);
        
        Swal.close();
        
        // CHỈNH SỬA: response đã là ApiResponse, không cần .data nữa
        if (response.success) {
          await Swal.fire({
            title: 'Thành công!',
            text: `Đã xóa người dùng "${userName}"`,
            icon: 'success',
            confirmButtonText: 'OK'
          });
          setRefreshKey(prev => prev + 1);
        } else {
          throw new Error(response.message || 'Xóa thất bại');
        }
      }
    } catch (error: unknown) {
      console.error('Delete error:', error);
      
      let errorMessage = 'Có lỗi xảy ra khi xóa người dùng';
      let errorTitle = 'Lỗi!';
      
      // Xử lý lỗi từ deleteUser
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Kiểm tra các message đặc biệt
        if (error.message.includes('Phiên đăng nhập')) {
          errorTitle = 'Phiên đăng nhập hết hạn';
        } else if (error.message.includes('Không có quyền')) {
          errorTitle = 'Không có quyền';
        } else if (error.message.includes('Không thể xác định')) {
          errorTitle = 'Lỗi xác thực';
        }
      } 
      // Xử lý lỗi axios
      else if (error && typeof error === 'object') {
        const axiosError = error as AxiosError;
        
        if (axiosError.response?.status === 403) {
          errorTitle = 'Không có quyền';
          errorMessage = 'Bạn không có quyền xóa người dùng này';
        } else if (axiosError.response?.status === 404) {
          errorMessage = 'Người dùng không tồn tại';
        } else if (axiosError.response?.status === 409) {
          errorMessage = 'Không thể xóa người dùng vì có dữ liệu liên quan';
        } else if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        } else if (axiosError.message) {
          errorMessage = axiosError.message;
        }
      }
      
      await Swal.fire({
        title: errorTitle,
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setIsDeleting(null);
    }
  };

  // Xử lý tạo mới user
  const handleCreateUser = (): void => {
    navigate('/nguoi-dung/tao-moi');
  };

  return (
    <div className="container-fluid mt-4">
      <div className="row mb-4">
        <div className="col">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-0">
                <i className="bi bi-people-fill me-2 text-primary"></i>
                Quản lý người dùng
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <UserListTable
            key={refreshKey}
            initialFilters={{
              per_page: 10,
              sort_field: 'created_at',
              sort_order: 'desc'
            }}
            onViewUser={handleViewUser}
            onEditUser={handleEditUser}
            onDeleteUser={handleDeleteUser}
            onCreateUser={handleCreateUser}
            externalRefresh={refreshKey > 0}
            showSearch={true}
            showRoleFilter={true}
            showCreateButton={true}
            height="550px"
          />
        </div>
      </div>
    </div>
  );
};

export default PageQuanLyNguoiDung;