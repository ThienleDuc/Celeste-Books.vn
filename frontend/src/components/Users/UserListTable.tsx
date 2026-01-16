// src/components/users/UserListTable.tsx
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  DataGrid, 
  type GridSortModel, 
  type GridPaginationModel, 
  type GridColDef,
  type GridSlots 
} from '@mui/x-data-grid';
import { LinearProgress } from '@mui/material';
import { userApi } from '../../api/users.api';
import { rolesApi } from '../../api/roles.api';
import type {
  UserWithRelations,
  UserPaginationParams,
} from '../../api/users.api';
import type { Role } from '../../api/roles.api';
import dayjs from 'dayjs';
import '../../assets/css/UserListTable.css';

// ========== Helper Components ==========

interface StatusBadgeProps {
  active: boolean;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ active }) => (
  <span className={`user-status-badge ${active ? 'badge-active' : 'badge-inactive'}`}>
    <i className={`bi ${active ? 'bi-check-circle' : 'bi-x-circle'}`}></i>
    {active ? ' Hoạt động' : ' Đã khóa'}
  </span>
);

interface RoleBadgeProps {
  roleName?: string | null;
}

const RoleBadge: React.FC<RoleBadgeProps> = ({ roleName }) => {
  const getRoleClass = () => {
    if (roleName === 'Admin') return 'role-admin';
    if (roleName === 'User') return 'role-user';
    return 'role-default';
  };

  const getRoleIcon = () => {
    if (roleName === 'Admin') return 'bi-shield-fill-check';
    if (roleName === 'User') return 'bi-person-fill';
    return 'bi-person';
  };

  return (
    <span className={`role-badge ${getRoleClass()}`}>
      <i className={`bi ${getRoleIcon()}`}></i>
      {roleName ? ` ${roleName}` : ' Chưa phân quyền'}
    </span>
  );
};

// ========== User Actions Dropdown Component ==========

interface UserActionsDropdownProps {
  user: UserWithRelations;
  onViewUser?: (user: UserWithRelations) => void;
  onEditUser?: (user: UserWithRelations) => void;
  onDeleteUser?: (user: UserWithRelations) => void;
}

const UserActionsDropdown: React.FC<UserActionsDropdownProps> = React.memo(({
  user,
  onViewUser,
  onEditUser,
  onDeleteUser,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewUser?.(user);
    setIsOpen(false);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEditUser?.(user);
    setIsOpen(false);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    onDeleteUser?.(user);
  };

  return (
    <div className="user-actions-dropdown-container" ref={dropdownRef}>
      <button
        className="btn btn-sm btn-actions-toggle"
        type="button"
        onClick={toggleDropdown}
        aria-expanded={isOpen}
        disabled={!onViewUser && !onEditUser && !onDeleteUser}
        title="Thao tác"
      >
        <i className="bi bi-three-dots-vertical"></i>
      </button>
      
      {isOpen && (
        <div className="dropdown-menu show user-actions-dropdown-menu">
          {onViewUser && (
            <button
              className="dropdown-item user-action-item"
              type="button"
              onClick={handleViewClick}
            >
              <i className="bi bi-eye me-2"></i>
              Xem chi tiết
            </button>
          )}
          
          {onEditUser && (
            <button
              className="dropdown-item user-action-item"
              type="button"
              onClick={handleEditClick}
            >
              <i className="bi bi-pencil me-2"></i>
              Chỉnh sửa
            </button>
          )}
          
          {onDeleteUser && (
            <button
              className="dropdown-item user-action-item text-danger"
              type="button"
              onClick={handleDeleteClick}
            >
              <i className="bi bi-trash me-2"></i>
              Xóa
            </button>
          )}
        </div>
      )}
    </div>
  );
});

UserActionsDropdown.displayName = 'UserActionsDropdown';

// ========== Main Component ==========

export interface UserListTableProps {
  initialFilters?: Partial<UserPaginationParams>;
  onViewUser?: (user: UserWithRelations) => void;
  onEditUser?: (user: UserWithRelations) => void;
  onDeleteUser?: (user: UserWithRelations) => void;
  onCreateUser?: () => void;
  showSearch?: boolean;
  pageSizeOptions?: number[];
  height?: number | string;
  externalRefresh?: boolean;
  onRefreshComplete?: () => void;
  showRoleFilter?: boolean;
  showCreateButton?: boolean;
}

const UserListTable: React.FC<UserListTableProps> = ({
  initialFilters = {
    search: '',
    page: 1,
    per_page: 10,
    sort_field: 'created_at',
    sort_order: 'desc'
  },
  onViewUser,
  onEditUser,
  onDeleteUser,
  onCreateUser,
  showSearch = true,
  pageSizeOptions = [10, 25, 50],
  height = '100vh',
  externalRefresh = false,
  onRefreshComplete,
  showRoleFilter = true,
  showCreateButton = true
}) => {
  // ========== State ==========
  const [users, setUsers] = useState<UserWithRelations[]>([]);
  const [roles, setRoles] = useState<Role[]>([{ 
    id: '', 
    name: 'Tất cả vai trò', 
    description: null, 
    slug: '' 
  }]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: initialFilters.per_page || 10
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([
    { field: 'created_at', sort: 'desc' }
  ]);
  const [rowCount, setRowCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState(initialFilters.search || '');
  const [selectedRoleId, setSelectedRoleId] = useState<string>(
    initialFilters.role_id ? String(initialFilters.role_id) : ''
  );

  // ========== Refs ==========
  const searchValueRef = useRef(searchValue);
  const selectedRoleIdRef = useRef(selectedRoleId);
  const paramsRef = useRef({
    page: 1,
    per_page: initialFilters.per_page || 10,
    sort_field: 'created_at',
    sort_order: 'desc' as 'asc' | 'desc',
    search: initialFilters.search || '',
    role_id: initialFilters.role_id || ''
  });

  // ========== Effects ==========

  // Update refs
  useEffect(() => {
    searchValueRef.current = searchValue;
    selectedRoleIdRef.current = selectedRoleId;
  }, [searchValue, selectedRoleId]);

  // ========== API Functions ==========

  const fetchRoles = useCallback(async () => {
    if (!showRoleFilter) return;
    
    setRolesLoading(true);
    try {
      const response = await rolesApi.getAll();
      if (response.data?.success && response.data.data) {
        const allRolesOption = { 
          id: '', 
          name: 'Tất cả vai trò', 
          description: null, 
          slug: '' 
        };
        setRoles([allRolesOption, ...response.data.data]);
      }
    } catch (err) {
      console.error('Error fetching roles:', err);
    } finally {
      setRolesLoading(false);
    }
  }, [showRoleFilter]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await userApi.getAllUsersWithPagination(paramsRef.current);
      
      if (response.data?.success && response.data.data) {
        const data = response.data.data;
        
        const transformedUsers = data.items.map(user => {
          const avatarUrl = user.avatar_url || user.profile?.avatar_url;
          let processedAvatarUrl = '/img/linh_vat_logo.png';
          
          if (avatarUrl) {
            if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
              processedAvatarUrl = avatarUrl;
            } else {
              const cleanPath = avatarUrl.startsWith('/') ? 
                avatarUrl.substring(1) : avatarUrl;
              processedAvatarUrl = `/img/${cleanPath}`;
            }
          }
          
          return {
            ...user,
            is_active: Boolean(user.is_active),
            full_name: user.full_name || user.profile?.full_name || '',
            phone: user.phone || user.profile?.phone || '',
            avatar_url: processedAvatarUrl,
            role_name: user.role_name || user.role?.name || '',
            created_at: user.created_at || null,
            created_at_raw: user.created_at_raw || user.created_at || null
          };
        });
        
        setUsers(transformedUsers);
        setRowCount(data.pagination.total);
      } else {
        setError(response.data?.message || 'Không thể tải danh sách người dùng');
        setUsers([]);
        setRowCount(0);
      }
    } catch (err: unknown) {
      console.error('Fetch users error:', err);
      setError('Lỗi kết nối đến server');
      setUsers([]);
      setRowCount(0);
    } finally {
      setLoading(false);
      onRefreshComplete?.();
    }
  }, [onRefreshComplete]);

  // ========== Data Fetching Effects ==========

  // Effect cho pagination và sort changes
  useEffect(() => {
    paramsRef.current = {
      ...paramsRef.current,
      page: paginationModel.page + 1,
      per_page: paginationModel.pageSize,
      sort_field: sortModel[0]?.field || 'created_at',
      sort_order: (sortModel[0]?.sort as 'asc' | 'desc') || 'desc',
    };

    fetchUsers();
  }, [paginationModel.page, paginationModel.pageSize, sortModel, fetchUsers]);

  // Effect cho search value changes (chỉ thay đổi giá trị input, không gọi API)
  useEffect(() => {
    paramsRef.current = {
      ...paramsRef.current,
      search: searchValue.trim(),
    };
  }, [searchValue]);

  // Effect cho role filter changes (gọi API ngay khi thay đổi)
  useEffect(() => {
    paramsRef.current = {
      ...paramsRef.current,
      role_id: selectedRoleId || '',
      page: 1, // Reset về trang 1 khi đổi role
    };

    setPaginationModel(prev => ({ ...prev, page: 0 }));
    fetchUsers();
  }, [selectedRoleId, fetchUsers]);

  // Initial fetch
  useEffect(() => {
    paramsRef.current = {
      page: 1,
      per_page: initialFilters.per_page || 10,
      sort_field: initialFilters.sort_field || 'created_at',
      sort_order: (initialFilters.sort_order as 'asc' | 'desc') || 'desc',
      search: initialFilters.search || '',
      role_id: initialFilters.role_id || '',
    };

    fetchUsers();
    fetchRoles();
  }, [fetchRoles, fetchUsers]);

  // External refresh
  useEffect(() => {
    if (externalRefresh) {
      fetchUsers();
    }
  }, [externalRefresh, fetchUsers]);

  // Update when initialFilters change
  useEffect(() => {
    setSearchValue(initialFilters.search || '');
    setSelectedRoleId(initialFilters.role_id ? String(initialFilters.role_id) : '');
    setPaginationModel(prev => ({
      ...prev,
      page: 0,
      pageSize: initialFilters.per_page || prev.pageSize
    }));
    setSortModel([
      { 
        field: initialFilters.sort_field || 'created_at', 
        sort: (initialFilters.sort_order as 'asc' | 'desc') || 'desc' 
      }
    ]);
  }, [initialFilters]);

  // ========== Event Handlers ==========

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  }, []);

  const handleSearchSubmit = useCallback(() => {
    paramsRef.current = {
      ...paramsRef.current,
      search: searchValue.trim(),
      page: 1,
    };

    setPaginationModel(prev => ({ ...prev, page: 0 }));
    fetchUsers();
  }, [searchValue, fetchUsers]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  }, [handleSearchSubmit]);

  const handleResetFilters = useCallback(() => {
    setSearchValue('');
    setSelectedRoleId('');
    
    paramsRef.current = {
      ...paramsRef.current,
      search: '',
      role_id: '',
      page: 1,
    };

    setPaginationModel(prev => ({ ...prev, page: 0 }));
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleFilterChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const roleId = e.target.value;
    setSelectedRoleId(roleId);
  }, []);

  const handleClearRoleFilter = useCallback(() => {
    setSelectedRoleId('');
  }, []);

  const handleRefreshAll = useCallback(() => {
    fetchUsers();
    fetchRoles();
  }, [fetchUsers, fetchRoles]);

  const handleCreateUser = useCallback(() => {
    onCreateUser?.();
  }, [onCreateUser]);

  const handleSortModelChange = useCallback((model: GridSortModel) => {
    setSortModel(model);
  }, []);

  const handlePaginationModelChange = useCallback((model: GridPaginationModel) => {
    setPaginationModel(model);
  }, []);

  // ========== Helper Functions ==========

  const getSelectedRoleName = useCallback(() => {
    if (!selectedRoleId) return null;
    const role = roles.find(r => r.id === selectedRoleId);
    return role ? role.name : null;
  }, [selectedRoleId, roles]);

  const hasActiveFilters = searchValue || selectedRoleId;

  // ========== Columns Definition ==========

  const columns = useMemo<GridColDef<UserWithRelations>[]>(() => [
    {
      field: 'full_name',
      headerName: 'Họ tên',
      width: 180,
      valueGetter: (_, row) => row.full_name || row.profile?.full_name || 'Chưa cập nhật',
      cellClassName: 'user-fullname-cell'
    },
    { 
      field: 'username', 
      headerName: 'Tên đăng nhập', 
      width: 150,
      valueGetter: (_, row) => row.username || 'N/A'
    },
    { 
      field: 'email', 
      headerName: 'Email', 
      width: 220,
      valueGetter: (_, row) => row.email || 'Chưa cập nhật',
      cellClassName: 'user-email-cell'
    },
    {
      field: 'role_name',
      headerName: 'Vai trò',
      width: 150,
      valueGetter: (_, row) => row.role_name || row.role?.name || 'N/A',
      renderCell: (params) => <RoleBadge roleName={params.value} />,
      cellClassName: 'user-role-cell'
    },
    {
      field: 'is_active',
      headerName: 'Trạng thái',
      width: 130,
      valueGetter: (_, row) => Boolean(row.is_active),
      renderCell: (params) => <StatusBadge active={Boolean(params.value)} />,
      cellClassName: 'user-status-cell'
    },
    {
      field: 'created_at',
      headerName: 'Ngày tạo',
      width: 180,
      valueGetter: (_, row) => {
        const dateStr = row.created_at_raw || row.created_at;
        return dateStr ? dayjs(dateStr).format('DD/MM/YYYY HH:mm') : 'N/A';
      },
      cellClassName: 'user-createdat-cell'
    },
    {
      field: 'actions',
      headerName: 'Thao tác',
      width: 80,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <UserActionsDropdown
          user={params.row}
          onViewUser={onViewUser}
          onEditUser={onEditUser}
          onDeleteUser={onDeleteUser}
        />
      ),
      cellClassName: 'user-actions-cell'
    }
  ], [onViewUser, onEditUser, onDeleteUser]);

  // ========== Memoized Components ==========

  const SearchHeader = useMemo(() => {
    if (!showSearch) return null;
    
    return (
      <div className="user-list-header">
        <div className="d-flex justify-content-between align-items-center w-100">
          <h5 className="user-list-title mb-0">
            <i className="bi bi-people me-2"></i>
            Danh sách người dùng
          </h5>
          <div className="user-search-controls">
            {/* Search input */}
            <div className="user-search-input-group">
              <input
                type="text"
                className="form-control user-search-input"
                placeholder="Tìm kiếm người dùng..."
                value={searchValue}
                onChange={handleSearchChange}
                onKeyPress={handleKeyPress}
                disabled={loading}
              />
              <button
                className="btn btn-primary user-search-btn"
                type="button"
                onClick={handleSearchSubmit}
                disabled={loading}
              >
                <i className="bi bi-search"></i>
              </button>
            </div>

            {/* Role filter dropdown */}
            {showRoleFilter && (
              <div className="user-role-filter-group">
                <select
                  className="form-select user-role-filter"
                  value={selectedRoleId}
                  onChange={handleRoleFilterChange}
                  disabled={rolesLoading || loading}
                  style={{ height: '40px' }}
                >
                  <option value="" disabled>Chọn vai trò</option>
                  {roles.map((role) => (
                    <option key={role.id || 'all'} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
                {selectedRoleId && (
                  <button
                    className="btn btn-outline-secondary user-filter-clear"
                    type="button"
                    onClick={handleClearRoleFilter}
                    disabled={loading}
                    title="Xóa lọc vai trò"
                  >
                    <i className="bi bi-x"></i>
                  </button>
                )}
              </div>
            )}

            {/* Clear all filters button */}
            {hasActiveFilters && (
              <button
                className="btn btn-outline-danger user-clear-all-filters"
                type="button"
                onClick={handleResetFilters}
                disabled={loading}
                title="Xóa tất cả bộ lọc"
              >
                <i className="bi bi-filter-circle me-1"></i> Xóa lọc
              </button>
            )}

            {/* Action buttons group */}
            <div className="user-action-buttons-group">
              {/* Create new user button */}
              {showCreateButton && onCreateUser && (
                <button
                  className="btn btn-success user-create-btn"
                  onClick={handleCreateUser}
                  disabled={loading}
                  title="Thêm người dùng mới"
                >
                  <i className="bi bi-plus-lg me-1"></i>
                  Thêm mới
                </button>
              )}
              
              {/* Refresh button */}
              <button
                className="btn btn-outline-secondary user-refresh-btn"
                onClick={handleRefreshAll}
                disabled={loading || rolesLoading}
                title="Làm mới dữ liệu"
              >
                <i className={`bi bi-arrow-clockwise ${loading ? 'spinner-border spinner-border-sm' : ''}`}></i>
              </button>
            </div>
          </div>
        </div>

        {/* Active filters info */}
        {hasActiveFilters && (
          <div className="user-active-filters mt-2">
            <small className="text-muted">
              Bộ lọc đang áp dụng:
              {searchValue && (
                <span className="badge bg-primary ms-2">
                  <i className="bi bi-search me-1"></i> "{searchValue}"
                </span>
              )}
              {selectedRoleId && getSelectedRoleName() && (
                <span className="badge bg-info ms-2">
                  <i className="bi bi-person-badge me-1"></i> {getSelectedRoleName()}
                </span>
              )}
            </small>
          </div>
        )}
      </div>
    );
  }, [
    showSearch, showRoleFilter, showCreateButton, onCreateUser,
    searchValue, selectedRoleId, roles, loading, rolesLoading,
    hasActiveFilters, handleSearchChange, handleKeyPress,
    handleSearchSubmit, handleRoleFilterChange, handleClearRoleFilter,
    handleResetFilters, handleCreateUser, handleRefreshAll,
    getSelectedRoleName
  ]);

  const FooterInfo = useMemo(() => {
    if (users.length === 0) return null;
    
    return (
      <div className="user-list-footer">
        <div className="row align-items-center">
          <div className="col-md-6">
            <small className="user-list-info">
              Hiển thị {users.length} người dùng (từ {paginationModel.page * paginationModel.pageSize + 1} đến{' '}
              {Math.min((paginationModel.page + 1) * paginationModel.pageSize, rowCount)})
            </small>
          </div>
          <div className="col-md-6 text-end">
            <small className="user-list-total">
              Tổng cộng: <strong>{rowCount}</strong> người dùng
              {selectedRoleId && getSelectedRoleName() && (
                <>
                  {' '}· Vai trò: <strong>{getSelectedRoleName()}</strong>
                </>
              )}
            </small>
          </div>
        </div>
      </div>
    );
  }, [users.length, paginationModel, rowCount, selectedRoleId, getSelectedRoleName]);

  const EmptyState = useMemo(() => {
    if (loading || users.length > 0) return null;
    
    return (
      <div className="user-list-empty">
        <div className="user-list-empty-icon">
          <img 
            src="/img/linh_vat_logo.png" 
            alt="Không có người dùng"
            className="user-list-empty-image"
          />
        </div>
        <h5 className="user-list-empty-title">Không tìm thấy người dùng nào</h5>
        <p className="user-list-empty-message">
          {hasActiveFilters ? (
            <>
              Không tìm thấy kết quả
              {searchValue && ` cho "${searchValue}"`}
              {selectedRoleId && getSelectedRoleName() && ` với vai trò "${getSelectedRoleName()}"`}
            </>
          ) : (
            'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc'
          )}
        </p>
        {hasActiveFilters && (
          <button
            className="btn btn-outline-primary mt-2"
            onClick={handleResetFilters}
            disabled={loading}
          >
            <i className="bi bi-arrow-counterclockwise me-1"></i>
            Xóa bộ lọc
          </button>
        )}
        {onCreateUser && showCreateButton && (
          <button
            className="btn btn-success mt-2 ms-2"
            onClick={handleCreateUser}
            disabled={loading}
          >
            <i className="bi bi-plus-lg me-1"></i>
            Thêm người dùng mới
          </button>
        )}
      </div>
    );
  }, [
    loading, users.length, hasActiveFilters, searchValue,
    selectedRoleId, getSelectedRoleName, handleResetFilters,
    onCreateUser, showCreateButton, handleCreateUser
  ]);

  const ErrorDisplay = useMemo(() => {
    if (!error) return null;
    
    return (
      <div className="user-list-error-container">
        <div className="alert alert-danger user-list-error-alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
        <button 
          className="btn btn-primary user-list-retry-btn"
          onClick={() => fetchUsers()}
        >
          <i className="bi bi-arrow-clockwise me-2"></i>
          Thử lại
        </button>
      </div>
    );
  }, [error, fetchUsers]);

  // ========== Render ==========

  if (error) {
    return ErrorDisplay;
  }

  return (
    <div className="user-list-card">
      {SearchHeader}

      <div className="user-list-body">
        <div className="user-datagrid-container" style={{ height }}>
          <DataGrid
            rows={users}
            columns={columns}
            loading={loading}
            rowCount={rowCount}
            pageSizeOptions={pageSizeOptions}
            paginationModel={paginationModel}
            sortModel={sortModel}
            paginationMode="server"
            sortingMode="server"
            onPaginationModelChange={handlePaginationModelChange}
            onSortModelChange={handleSortModelChange}
            slots={{
              loadingOverlay: LinearProgress as GridSlots['loadingOverlay']
            }}
            slotProps={{
              toolbar: {
                showQuickFilter: false
              }
            }}
            sx={{
              border: 'none',
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid var(--bs-gray-300)',
                display: 'flex',
                alignItems: 'center'
              },
              '& .MuiDataGrid-row:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)'
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: 'var(--bs-gray-100)',
                borderBottom: '2px solid var(--bs-gray-300)'
              },
              '& .MuiDataGrid-footerContainer': {
                backgroundColor: 'var(--bs-gray-100)',
                borderTop: '1px solid var(--bs-gray-300)'
              }
            }}
            getRowId={(row) => row.id || Math.random().toString()}
          />
        </div>
      </div>

      {FooterInfo}
      {EmptyState}
    </div>
  );
};

export default UserListTable;