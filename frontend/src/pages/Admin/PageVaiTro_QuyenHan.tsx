import { useEffect, useState, useCallback } from "react";
import rolesApi, { type CreateRolePayload, type Role, type RoleDetailResponse, type RoleListResponse, type UpdateRolePayload } from "../../api/roles.api";
import permissionsApi, { type CreatePermissionPayload, type Permission, type PermissionDetailResponse, type PermissionListResponse, type UpdatePermissionPayload } from "../../api/permissions.api";
import rolePersApi, { type SimplePermission } from "../../api/rolePer.api";
import { Helmet } from "react-helmet";
import "../../assets/css/RolePermission.css";

// Định nghĩa type cho API error
interface ApiError {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
}

// Type cho API response
interface ApiResult<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

// Type cho axios error
interface AxiosError {
  response?: {
    status: number;
    data?: {
      message?: string;
      errors?: Record<string, string[]>;
      data?: unknown;
    };
  };
  request?: unknown;
  message?: string;
}

// Type guard để kiểm tra nếu object có response property
const isAxiosError = (error: unknown): error is AxiosError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    ('response' in error || 'request' in error || 'message' in error)
  );
};

// Interface cho form thêm mới
interface AddFormData {
  name: string;
  description: string;
  slug?: string;
}

export default function RolePermissionPage() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [assignedPermissions, setAssignedPermissions] = useState<SimplePermission[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // State cho tìm kiếm
    const [roleSearch, setRoleSearch] = useState("");
    const [permissionSearch, setPermissionSearch] = useState("");
    const [assignedPermissionSearch, setAssignedPermissionSearch] = useState("");
    const [filteredRoles, setFilteredRoles] = useState<Role[]>([]);
    const [filteredPermissions, setFilteredPermissions] = useState<Permission[]>([]);
    const [filteredAssignedPermissions, setFilteredAssignedPermissions] = useState<SimplePermission[]>([]);
    const [searchingAssigned, setSearchingAssigned] = useState(false);
    
    // State cho dialog và hover
    const [showRoleDialog, setShowRoleDialog] = useState(false);
    const [showPermissionDialog, setShowPermissionDialog] = useState(false);
    const [hoveredRoleId, setHoveredRoleId] = useState<string | null>(null);
    const [hoveredPermissionId, setHoveredPermissionId] = useState<number | null>(null);
    const [showRoleEditDialog, setShowRoleEditDialog] = useState(false);
    const [showPermissionEditDialog, setShowPermissionEditDialog] = useState(false);
    const [editingItem, setEditingItem] = useState<Role | Permission | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{ type: 'role' | 'permission', id: string | number } | null>(null);

    // Form data
    const [roleFormData, setRoleFormData] = useState<AddFormData>({
        name: '',
        description: '',
        slug: ''
    });
    
    const [permissionFormData, setPermissionFormData] = useState<AddFormData>({
        name: '',
        description: '',
        slug: ''
    });

    // Helper function để xử lý API errors
    const handleApiError = useCallback((error: unknown, defaultMessage: string): ApiError => {
        if (isAxiosError(error)) {
            if (error.response) {
                // Server trả về error response
                const apiError: ApiError = {
                    message: error.response.data?.message || defaultMessage,
                    status: error.response.status,
                    errors: error.response.data?.errors
                };
                return apiError;
            } else if (error.request) {
                // Request được gửi nhưng không nhận được response
                return {
                    message: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.'
                };
            } else {
                // Lỗi khi thiết lập request
                return {
                    message: `Lỗi: ${error.message || defaultMessage}`
                };
            }
        } else if (error instanceof Error) {
            // Lỗi JavaScript thông thường
            return {
                message: error.message || defaultMessage
            };
        } else {
            // Lỗi không xác định
            return {
                message: defaultMessage
            };
        }
    }, []);

    // Helper function để gọi API với error handling
    const callApiWithHandling = useCallback(async <T,>(
        apiCall: () => Promise<{ data: T }>,
        errorMessage: string
    ): Promise<ApiResult<T>> => {
        try {
            const response = await apiCall();
            return { success: true, data: response.data };
        } catch (error: unknown) {
            const apiError = handleApiError(error, errorMessage);
            return { success: false, error: apiError };
        }
    }, [handleApiError]);

    // Load roles và permissions ban đầu
    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            setError(null);
            
            try {
                const [rolesResult, permissionsResult] = await Promise.all([
                    callApiWithHandling<RoleListResponse>(() => rolesApi.getAll(), "Lỗi khi tải danh sách vai trò"),
                    callApiWithHandling<PermissionListResponse>(() => permissionsApi.getAll(), "Lỗi khi tải danh sách quyền hạn")
                ]);
                
                // Xử lý kết quả roles
                if (rolesResult.success && rolesResult.data) {
                    const rolesData = rolesResult.data.data;
                    setRoles(rolesData);
                    setFilteredRoles(rolesData);
                    
                    if (rolesData.length > 0) {
                        setSelectedRole(rolesData[0]);
                    }
                } else if (rolesResult.error) {
                    setError(`Lỗi vai trò: ${rolesResult.error.message}`);
                }
                
                // Xử lý kết quả permissions
                if (permissionsResult.success && permissionsResult.data) {
                    const permissionsData = permissionsResult.data.data;
                    setPermissions(permissionsData);
                    setFilteredPermissions(permissionsData);
                } else if (permissionsResult.error) {
                    const errorMsg = permissionsResult.error.message;
                    setError(prev => prev ? `${prev}\nLỗi quyền hạn: ${errorMsg}` : `Lỗi quyền hạn: ${errorMsg}`);
                }
                
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
                setError("Lỗi không xác định khi tải dữ liệu: " + errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [callApiWithHandling]);

    // Load permissions theo role khi role được chọn
    useEffect(() => {
        if (!selectedRole) return;

        const fetchRolePermissions = async () => {
            try {
                const result = await callApiWithHandling<{ success: boolean; data: SimplePermission[] }>(
                    () => rolePersApi.getByRole(selectedRole.id),
                    "Lỗi khi tải quyền hạn của vai trò"
                );
                
                if (result.success && result.data) {
                    setAssignedPermissions(result.data.data);
                    setFilteredAssignedPermissions(result.data.data);
                } else if (result.error) {
                    console.error("Lỗi khi tải quyền hạn:", result.error.message);
                }
            } catch (error) {
                console.error("Error fetching role permissions:", error);
            }
        };

        fetchRolePermissions();
    }, [selectedRole, callApiWithHandling]);

    // Tìm kiếm roles - gọi API với keyword
    const handleRoleSearch = useCallback(async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        
        try {
            const result = await callApiWithHandling<RoleListResponse>(
                () => rolesApi.getAll(roleSearch.trim()),
                "Lỗi khi tìm kiếm vai trò"
            );
            
            if (result.success && result.data) {
                setFilteredRoles(result.data.data);
            } else if (result.error) {
                console.error("Lỗi tìm kiếm vai trò:", result.error.message);
                // Fallback: tìm kiếm cục bộ
                if (roleSearch.trim()) {
                    const searchTerm = roleSearch.toLowerCase().trim();
                    const filtered = roles.filter(role => 
                        role.name.toLowerCase().includes(searchTerm) ||
                        (role.description && role.description.toLowerCase().includes(searchTerm)) ||
                        (role.slug && role.slug.toLowerCase().includes(searchTerm))
                    );
                    setFilteredRoles(filtered);
                } else {
                    setFilteredRoles(roles);
                }
            }
        } catch (error) {
            console.error("Error in role search:", error);
        }
    }, [roleSearch, roles, callApiWithHandling]);

    // Tìm kiếm permissions - gọi API với keyword
    const handlePermissionSearch = useCallback(async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        
        try {
            const result = await callApiWithHandling<PermissionListResponse>(
                () => permissionsApi.getAll(permissionSearch.trim()),
                "Lỗi khi tìm kiếm quyền hạn"
            );
            
            if (result.success && result.data) {
                setFilteredPermissions(result.data.data);
            } else if (result.error) {
                console.error("Lỗi tìm kiếm quyền hạn:", result.error.message);
                // Fallback: tìm kiếm cục bộ
                if (permissionSearch.trim()) {
                    const searchTerm = permissionSearch.toLowerCase().trim();
                    const filtered = permissions.filter(permission => 
                        permission.name.toLowerCase().includes(searchTerm) ||
                        (permission.description && permission.description.toLowerCase().includes(searchTerm)) ||
                        (permission.slug && permission.slug.toLowerCase().includes(searchTerm))
                    );
                    setFilteredPermissions(filtered);
                } else {
                    setFilteredPermissions(permissions);
                }
            }
        } catch (error) {
            console.error("Error in permission search:", error);
        }
    }, [permissionSearch, permissions, callApiWithHandling]);

    // Tìm kiếm assigned permissions - Gọi API với filter per_name
    const handleAssignedPermissionSearch = useCallback(async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        
        if (!selectedRole) {
            console.error("Chưa chọn vai trò để tìm kiếm");
            return;
        }
        
        setSearchingAssigned(true);
        
        try {
            if (!assignedPermissionSearch.trim()) {
                // Nếu không có từ khóa, load lại toàn bộ permissions của role
                const result = await callApiWithHandling<{ success: boolean; data: SimplePermission[] }>(
                    () => rolePersApi.getByRole(selectedRole.id),
                    "Lỗi khi tải quyền hạn"
                );
                
                if (result.success && result.data) {
                    setFilteredAssignedPermissions(result.data.data);
                } else if (result.error) {
                    console.error("Lỗi:", result.error.message);
                }
            } else {
                // Gọi API để tìm kiếm assigned permissions với filter per_name
                const result = await callApiWithHandling<{ success: boolean; data: Array<{
                    role_id: string;
                    role_name: string;
                    per_id: number;
                    permission_name: string;
                    permission_slug: string;
                }>}>(
                    () => rolePersApi.getAll({
                        role_id: selectedRole.id,
                        per_name: assignedPermissionSearch.trim()
                    }),
                    "Lỗi khi tìm kiếm quyền hạn đã gán"
                );
                
                if (result.success && result.data) {
                    // Chuyển đổi từ RolePermission[] sang SimplePermission[]
                    const filteredData = result.data.data.map(item => ({
                        id: item.per_id,
                        name: item.permission_name,
                        slug: item.permission_slug,
                        description: null
                    }));
                    setFilteredAssignedPermissions(filteredData);
                } else if (result.error) {
                    console.error("Lỗi tìm kiếm:", result.error.message);
                    // Fallback: tìm kiếm cục bộ
                    const searchTerm = assignedPermissionSearch.toLowerCase().trim();
                    const filtered = assignedPermissions.filter(per => 
                        per.name.toLowerCase().includes(searchTerm) ||
                        (per.description && per.description.toLowerCase().includes(searchTerm))
                    );
                    setFilteredAssignedPermissions(filtered);
                }
            }
        } catch (error) {
            console.error("Error in assigned permission search:", error);
        } finally {
            setSearchingAssigned(false);
        }
    }, [assignedPermissionSearch, selectedRole, assignedPermissions, callApiWithHandling]);

    // Xử lý tìm kiếm khi nhấn Enter
    const handleRoleKeyPress = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleRoleSearch();
        }
    }, [handleRoleSearch]);

    const handlePermissionKeyPress = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handlePermissionSearch();
        }
    }, [handlePermissionSearch]);

    const handleAssignedPermissionKeyPress = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAssignedPermissionSearch();
        }
    }, [handleAssignedPermissionSearch]);

    // Reset tìm kiếm roles
    const handleResetRoleSearch = useCallback(async () => {
        setRoleSearch("");
        try {
            const result = await callApiWithHandling<RoleListResponse>(
                () => rolesApi.getAll(),
                "Lỗi khi reset tìm kiếm vai trò"
            );
            
            if (result.success && result.data) {
                setFilteredRoles(result.data.data);
            } else if (result.error) {
                console.error("Lỗi reset:", result.error.message);
                setFilteredRoles(roles);
            }
        } catch (error) {
            console.error("Error resetting role search:", error);
            setFilteredRoles(roles);
        }
    }, [roles, callApiWithHandling]);

    // Reset tìm kiếm permissions
    const handleResetPermissionSearch = useCallback(async () => {
        setPermissionSearch("");
        try {
            const result = await callApiWithHandling<PermissionListResponse>(
                () => permissionsApi.getAll(),
                "Lỗi khi reset tìm kiếm quyền hạn"
            );
            
            if (result.success && result.data) {
                setFilteredPermissions(result.data.data);
            } else if (result.error) {
                console.error("Lỗi reset:", result.error.message);
                setFilteredPermissions(permissions);
            }
        } catch (error) {
            console.error("Error resetting permission search:", error);
            setFilteredPermissions(permissions);
        }
    }, [permissions, callApiWithHandling]);

    // Reset tìm kiếm assigned permissions
    const handleResetAssignedPermissionSearch = useCallback(async () => {
        setAssignedPermissionSearch("");
        
        if (!selectedRole) {
            setFilteredAssignedPermissions(assignedPermissions);
            return;
        }
        
        try {
            // Gọi API để load lại toàn bộ permissions của role
            const result = await callApiWithHandling<{ success: boolean; data: SimplePermission[] }>(
                () => rolePersApi.getByRole(selectedRole.id),
                "Lỗi khi reset tìm kiếm quyền hạn đã gán"
            );
            
            if (result.success && result.data) {
                setFilteredAssignedPermissions(result.data.data);
            } else if (result.error) {
                console.error("Lỗi reset:", result.error.message);
                setFilteredAssignedPermissions(assignedPermissions);
            }
        } catch (error) {
            console.error("Error resetting assigned permission search:", error);
            setFilteredAssignedPermissions(assignedPermissions);
        }
    }, [assignedPermissions, selectedRole, callApiWithHandling]);

    // Gán permission
    const handleAssign = useCallback(async (perId: number) => {
        if (!selectedRole) return;

        try {
            await rolePersApi.assign({
                role_id: selectedRole.id,
                per_id: perId,
            });

            // Tải lại danh sách assigned permissions
            const response = await rolePersApi.getByRole(selectedRole.id);
            const newAssignedPermissions = response.data.data;
            setAssignedPermissions(newAssignedPermissions);
            setFilteredAssignedPermissions(newAssignedPermissions);
            
            alert("Gán quyền thành công!");
        } catch (error: unknown) {
            const apiError = handleApiError(error, "Lỗi khi gán quyền");
            console.error("Lỗi gán quyền:", apiError.message);
            alert(`Lỗi: ${apiError.message}`);
        }
    }, [selectedRole, handleApiError]);

    // Xóa permission
    const handleRemovePermission = useCallback(async (perId: number) => {
        if (!selectedRole) return;

        try {
            await rolePersApi.remove({
                role_id: selectedRole.id,
                per_id: perId,
            });

            // Tải lại danh sách assigned permissions
            const response = await rolePersApi.getByRole(selectedRole.id);
            const newAssignedPermissions = response.data.data;
            setAssignedPermissions(newAssignedPermissions);
            setFilteredAssignedPermissions(newAssignedPermissions);
            
            alert("Xóa quyền thành công!");
        } catch (error: unknown) {
            const apiError = handleApiError(error, "Lỗi khi xóa quyền");
            console.error("Lỗi xóa quyền:", apiError.message);
            alert(`Lỗi: ${apiError.message}`);
        }
    }, [selectedRole, handleApiError]);

    // Thêm role mới
    const handleAddRole = useCallback(async () => {
        if (!roleFormData.name.trim()) {
            alert("Vui lòng nhập tên vai trò");
            return;
        }

        try {
            const createData: CreateRolePayload = {
                name: roleFormData.name,
                ...(roleFormData.description.trim() && { description: roleFormData.description }),
                ...(roleFormData.slug?.trim() && { slug: roleFormData.slug })
            };

            const result = await callApiWithHandling<RoleDetailResponse>(
                () => rolesApi.create(createData),
                "Lỗi khi thêm vai trò"
            );
            
            if (result.success && result.data) {
                // Thêm role mới vào danh sách
                const newRole = result.data.data;
                setRoles(prev => [...prev, newRole]);
                setFilteredRoles(prev => [...prev, newRole]);
                
                // Đóng dialog và reset form
                setShowRoleDialog(false);
                setRoleFormData({ name: '', description: '', slug: '' });
                
                // Chọn role mới thêm
                setSelectedRole(newRole);
                
                alert("Thêm vai trò thành công!");
            } else if (result.error) {
                alert(`Lỗi: ${result.error.message}`);
            }
        } catch (error: unknown) {
            const apiError = handleApiError(error, "Lỗi không xác định");
            alert(`Lỗi: ${apiError.message}`);
        }
    }, [roleFormData, callApiWithHandling, handleApiError]);

    // Thêm permission mới
    const handleAddPermission = useCallback(async () => {
        if (!permissionFormData.name.trim()) {
            alert("Vui lòng nhập tên quyền hạn");
            return;
        }

        try {
            const createData: CreatePermissionPayload = {
                name: permissionFormData.name,
                ...(permissionFormData.description.trim() && { description: permissionFormData.description }),
                ...(permissionFormData.slug?.trim() && { slug: permissionFormData.slug })
            };

            const result = await callApiWithHandling<PermissionDetailResponse>(
                () => permissionsApi.create(createData),
                "Lỗi khi thêm quyền hạn"
            );
            
            if (result.success && result.data) {
                // Thêm permission mới vào danh sách
                const newPermission = result.data.data;
                setPermissions(prev => [...prev, newPermission]);
                setFilteredPermissions(prev => [...prev, newPermission]);
                
                // Đóng dialog và reset form
                setShowPermissionDialog(false);
                setPermissionFormData({ name: '', description: '', slug: '' });
                
                alert("Thêm quyền hạn thành công!");
            } else if (result.error) {
                alert(`Lỗi: ${result.error.message}`);
            }
        } catch (error: unknown) {
            const apiError = handleApiError(error, "Lỗi không xác định");
            alert(`Lỗi: ${apiError.message}`);
        }
    }, [permissionFormData, callApiWithHandling, handleApiError]);

    // Mở dialog chỉnh sửa
    const handleOpenEditDialog = useCallback((item: Role | Permission, type: 'role' | 'permission') => {
        setEditingItem(item);
        if (type === 'role') {
            const role = item as Role;
            setShowRoleEditDialog(true);
            setRoleFormData({
                name: role.name,
                description: role.description || '',
                slug: role.slug || ''
            });
        } else {
            const permission = item as Permission;
            setShowPermissionEditDialog(true);
            setPermissionFormData({
                name: permission.name,
                description: permission.description || '',
                slug: permission.slug || ''
            });
        }
    }, []);

    // Cập nhật role
    const handleUpdateRole = useCallback(async () => {
        if (!editingItem || !roleFormData.name.trim()) return;

        try {
            // Type cast để đảm bảo editingItem là Role
            const roleToUpdate = editingItem as Role;
            
            // Tạo data với optional fields
            const updateData: UpdateRolePayload = {
                name: roleFormData.name,
                ...(roleFormData.description.trim() && { description: roleFormData.description }),
                ...(roleFormData.slug?.trim() && { slug: roleFormData.slug })
            };

            const result = await callApiWithHandling<RoleDetailResponse>(
                () => rolesApi.update(roleToUpdate.id, updateData),
                "Lỗi khi cập nhật vai trò"
            );
            
            if (result.success && result.data) {
                // Cập nhật role trong danh sách
                const updatedRole = result.data.data;
                setRoles(prev => prev.map(role => 
                    role.id === roleToUpdate.id ? updatedRole : role
                ));
                setFilteredRoles(prev => prev.map(role => 
                    role.id === roleToUpdate.id ? updatedRole : role
                ));
                
                // Cập nhật selectedRole nếu đang được chọn
                if (selectedRole?.id === roleToUpdate.id) {
                    setSelectedRole(updatedRole);
                }
                
                // Đóng dialog và reset
                setShowRoleEditDialog(false);
                setEditingItem(null);
                setRoleFormData({ name: '', description: '', slug: '' });
                
                alert("Cập nhật vai trò thành công!");
            } else if (result.error) {
                alert(`Lỗi: ${result.error.message}`);
            }
        } catch (error: unknown) {
            const apiError = handleApiError(error, "Lỗi không xác định");
            alert(`Lỗi: ${apiError.message}`);
        }
    }, [editingItem, roleFormData, selectedRole, callApiWithHandling, handleApiError]);

    // Cập nhật permission
    const handleUpdatePermission = useCallback(async () => {
        if (!editingItem || !permissionFormData.name.trim()) return;

        try {
            // Type cast để đảm bảo editingItem là Permission
            const permissionToUpdate = editingItem as Permission;
            
            // Tạo data với optional fields
            const updateData: UpdatePermissionPayload = {
                name: permissionFormData.name,
                ...(permissionFormData.description.trim() && { description: permissionFormData.description }),
                ...(permissionFormData.slug?.trim() && { slug: permissionFormData.slug })
            };

            const result = await callApiWithHandling<PermissionDetailResponse>(
                () => permissionsApi.update(permissionToUpdate.id, updateData),
                "Lỗi khi cập nhật quyền hạn"
            );
            
            if (result.success && result.data) {
                // Cập nhật permission trong danh sách
                const updatedPermission = result.data.data;
                setPermissions(prev => prev.map(per => 
                    per.id === permissionToUpdate.id ? updatedPermission : per
                ));
                setFilteredPermissions(prev => prev.map(per => 
                    per.id === permissionToUpdate.id ? updatedPermission : per
                ));
                
                // Đóng dialog và reset
                setShowPermissionEditDialog(false);
                setEditingItem(null);
                setPermissionFormData({ name: '', description: '', slug: '' });
                
                alert("Cập nhật quyền hạn thành công!");
            } else if (result.error) {
                alert(`Lỗi: ${result.error.message}`);
            }
        } catch (error: unknown) {
            const apiError = handleApiError(error, "Lỗi không xác định");
            alert(`Lỗi: ${apiError.message}`);
        }
    }, [editingItem, permissionFormData, callApiWithHandling, handleApiError]);

    // Xác nhận xóa
    const handleConfirmDelete = useCallback(async () => {
        if (!itemToDelete) return;

        try {
            if (itemToDelete.type === 'role') {
                const result = await callApiWithHandling(
                    () => rolesApi.delete(itemToDelete.id as string),
                    "Lỗi khi xóa vai trò"
                );
                
                if (result.success) {
                    // Xóa role khỏi danh sách
                    setRoles(prev => prev.filter(role => role.id !== itemToDelete.id));
                    setFilteredRoles(prev => prev.filter(role => role.id !== itemToDelete.id));
                    
                    // Nếu role đang được chọn bị xóa, chọn role đầu tiên
                    if (selectedRole?.id === itemToDelete.id) {
                        const remainingRoles = roles.filter(role => role.id !== itemToDelete.id);
                        setSelectedRole(remainingRoles.length > 0 ? remainingRoles[0] : null);
                    }
                    
                    alert("Xóa vai trò thành công!");
                } else if (result.error) {
                    alert(`Lỗi: ${result.error.message}`);
                }
            } else {
                const result = await callApiWithHandling(
                    () => permissionsApi.delete(itemToDelete.id as number),
                    "Lỗi khi xóa quyền hạn"
                );
                
                if (result.success) {
                    // Xóa permission khỏi danh sách
                    setPermissions(prev => prev.filter(per => per.id !== itemToDelete.id));
                    setFilteredPermissions(prev => prev.filter(per => per.id !== itemToDelete.id));
                    
                    alert("Xóa quyền hạn thành công!");
                } else if (result.error) {
                    alert(`Lỗi: ${result.error.message}`);
                }
            }
        } catch (error: unknown) {
            const apiError = handleApiError(error, "Lỗi không xác định");
            alert(`Lỗi: ${apiError.message}`);
        } finally {
            setShowDeleteConfirm(false);
            setItemToDelete(null);
        }
    }, [itemToDelete, selectedRole, roles, callApiWithHandling, handleApiError]);

    const assignedIds = assignedPermissions.map((p) => p.id);

    if (loading) {
        return (
            <div className="role-permission-page loading">
                <div className="loading-spinner">Đang tải...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="role-permission-page error">
                <div className="error-message">
                    <h5>Đã xảy ra lỗi</h5>
                    <p>{error}</p>
                    <button 
                        className="btn btn-primary mt-3"
                        onClick={() => window.location.reload()}
                    >
                        Tải lại trang
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>Phân quyền</title>
            </Helmet>
            <div className="role-permission-page">
                <div className="container-fluid">
                    <div className="row g-3">
                        {/* COL 1: MENU VAI TRÒ */}
                        <div className="col-md-3">
                            <div className="role-menu-card">
                                <div className="role-menu-content">
                                    <div className="d-flex align-items-center mb-3">
                                        <h5 className="role-menu-title">Menu vai trò</h5>
                                        <button
                                            className="expand-btn"
                                            onClick={() => setShowRoleDialog(true)}
                                            title="Thêm vai trò mới"
                                        >
                                            <i className="bi bi-plus-lg"></i>
                                        </button>
                                    </div>
                                    
                                    {/* Form tìm kiếm roles */}
                                    <div className="search-container">
                                        <form onSubmit={handleRoleSearch} className="search-form">
                                            <div className="input-group">
                                                <input
                                                    type="text"
                                                    className="search-input"
                                                    placeholder="Tìm kiếm vai trò..."
                                                    value={roleSearch}
                                                    onChange={(e) => setRoleSearch(e.target.value)}
                                                    onKeyDown={handleRoleKeyPress}
                                                />
                                                <button
                                                    type="submit"
                                                    className="search-btn"
                                                    title="Tìm kiếm"
                                                >
                                                    <i className="bi bi-search"></i>
                                                </button>
                                                {roleSearch && (
                                                    <button
                                                        type="button"
                                                        className="reset-btn"
                                                        onClick={handleResetRoleSearch}
                                                        title="Xóa tìm kiếm"
                                                    >
                                                        <i className="bi bi-x-lg"></i>
                                                    </button>
                                                )}
                                            </div>
                                        </form>
                                        {roleSearch && (
                                            <div className="search-result-info">
                                                Tìm thấy {filteredRoles.length} kết quả
                                            </div>
                                        )}
                                    </div>

                                    <div className="scroll-wrapper">
                                        <div className="scroll-content">
                                            {filteredRoles.length === 0 ? (
                                                <p className="no-data-text">
                                                    {roleSearch ? "Không tìm thấy vai trò phù hợp" : "Không có vai trò nào"}
                                                </p>
                                            ) : (
                                                filteredRoles.map((role) => (
                                                    <div
                                                        key={role.id}
                                                        className={`role-item ${selectedRole?.id === role.id ? "role-item-selected" : ""}`}
                                                        onClick={() => setSelectedRole(role)}
                                                        onMouseEnter={() => setHoveredRoleId(role.id)}
                                                        onMouseLeave={() => setHoveredRoleId(null)}
                                                    >
                                                        <div className="role-item-content">
                                                            <span className="role-item-name">{role.name}</span>
                                                            {role.description && (
                                                                <span 
                                                                    className="role-item-desc"
                                                                    title={role.description}
                                                                >
                                                                    {role.description}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {hoveredRoleId === role.id && (
                                                            <div className="role-item-actions">
                                                                <button
                                                                    className="action-btn edit-btn"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleOpenEditDialog(role, 'role');
                                                                    }}
                                                                    title="Chỉnh sửa"
                                                                >
                                                                    <i className="bi bi-pencil"></i>
                                                                </button>
                                                                <button
                                                                    className="action-btn delete-btn"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setItemToDelete({ type: 'role', id: role.id });
                                                                        setShowDeleteConfirm(true);
                                                                    }}
                                                                    title="Xóa"
                                                                >
                                                                    <i className="bi bi-trash"></i>
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* COL 2: CHI TIẾT VAI TRÒ */}
                        <div className="col-md-6">
                            <div className="role-detail-card">
                                <div className="role-detail-content">
                                    <h5 className="role-detail-title">Tên vai trò</h5>
                                    <div className="scroll-wrapper">
                                        <div className="scroll-content">
                                            {selectedRole ? (
                                                <>
                                                    <div className="role-info">
                                                        <p className="role-name">{selectedRole.name}</p>
                                                        <p className="role-description">
                                                            {selectedRole.description || "Không có mô tả"}
                                                        </p>
                                                        {selectedRole.slug && (
                                                            <p className="role-slug">Slug: {selectedRole.slug}</p>
                                                        )}
                                                    </div>
                                                    <div className="role-divider"></div>
                                                    <div className="role-permissions-section">
                                                        <h6 className="permission-list-title">
                                                            Danh sách quyền hạn của vai trò
                                                            <span className="permission-count">
                                                                ({filteredAssignedPermissions.length})
                                                            </span>
                                                        </h6>
                                                        
                                                        {/* Form tìm kiếm assigned permissions */}
                                                        <div className="search-container px-0">
                                                            <form onSubmit={handleAssignedPermissionSearch} className="search-form">
                                                                <div className="input-group">
                                                                    <input
                                                                        type="text"
                                                                        className="search-input"
                                                                        placeholder="Tìm kiếm quyền hạn đã gán..."
                                                                        value={assignedPermissionSearch}
                                                                        onChange={(e) => setAssignedPermissionSearch(e.target.value)}
                                                                        onKeyDown={handleAssignedPermissionKeyPress}
                                                                        disabled={searchingAssigned}
                                                                    />
                                                                    <button
                                                                        type="submit"
                                                                        className="search-btn"
                                                                        title="Tìm kiếm"
                                                                        disabled={searchingAssigned}
                                                                    >
                                                                        {searchingAssigned ? (
                                                                            <i className="bi bi-hourglass-split"></i>
                                                                        ) : (
                                                                            <i className="bi bi-search"></i>
                                                                        )}
                                                                    </button>
                                                                    {assignedPermissionSearch && (
                                                                        <button
                                                                            type="button"
                                                                            className="reset-btn"
                                                                            onClick={handleResetAssignedPermissionSearch}
                                                                            title="Xóa tìm kiếm"
                                                                            disabled={searchingAssigned}
                                                                        >
                                                                            <i className="bi bi-x-lg"></i>
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </form>
                                                            {assignedPermissionSearch && (
                                                                <div className="search-result-info">
                                                                    Tìm thấy {filteredAssignedPermissions.length} kết quả
                                                                </div>
                                                            )}
                                                        </div>

                                                        {filteredAssignedPermissions.length > 0 ? (
                                                            <ul className="permission-list">
                                                                {filteredAssignedPermissions.map((per) => (
                                                                    <li
                                                                        key={per.id}
                                                                        className="permission-item"
                                                                    >
                                                                        <div className="permission-info">
                                                                            <span className="permission-name">{per.name}</span>
                                                                            {per.description && (
                                                                                <span className="permission-desc">{per.description}</span>
                                                                            )}
                                                                        </div>
                                                                        <button
                                                                            className="remove-permission-btn"
                                                                            title="Xóa quyền"
                                                                            onClick={() => handleRemovePermission(per.id)}
                                                                            type="button"
                                                                        >
                                                                            ✕
                                                                        </button>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        ) : (
                                                            <p className="no-permission-text">
                                                                {assignedPermissionSearch ? 
                                                                    "Không tìm thấy quyền hạn phù hợp" : 
                                                                    "Vai trò này chưa có quyền hạn"}
                                                            </p>
                                                        )}
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="no-role-selected">
                                                    <p className="select-role-text">Vui lòng chọn vai trò</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* COL 3: MENU QUYỀN HẠN */}
                        <div className="col-md-3">
                            <div className="permission-menu-card">
                                <div className="permission-menu-content">
                                    <div className="d-flex align-items-center mb-3">
                                        <h5 className="permission-menu-title">
                                            Menu quyền hạn
                                        </h5>
                                        <button
                                            className="expand-btn"
                                            onClick={() => setShowPermissionDialog(true)}
                                            title="Thêm quyền hạn mới"
                                        >
                                            <i className="bi bi-plus-lg"></i>
                                        </button>
                                    </div>
                                    
                                    {/* Form tìm kiếm permissions */}
                                    <div className="search-container">
                                        <form onSubmit={handlePermissionSearch} className="search-form">
                                            <div className="input-group">
                                                <input
                                                    type="text"
                                                    className="search-input"
                                                    placeholder="Tìm kiếm quyền hạn..."
                                                    value={permissionSearch}
                                                    onChange={(e) => setPermissionSearch(e.target.value)}
                                                    onKeyDown={handlePermissionKeyPress}
                                                />
                                                <button
                                                    type="submit"
                                                    className="search-btn"
                                                    title="Tìm kiếm"
                                                >
                                                    <i className="bi bi-search"></i>
                                                </button>
                                                {permissionSearch && (
                                                    <button
                                                        type="button"
                                                        className="reset-btn"
                                                        onClick={handleResetPermissionSearch}
                                                        title="Xóa tìm kiếm"
                                                    >
                                                        <i className="bi bi-x-lg"></i>
                                                    </button>
                                                )}
                                            </div>
                                        </form>
                                        {permissionSearch && (
                                            <div className="search-result-info">
                                                Tìm thấy {filteredPermissions.length} kết quả
                                            </div>
                                        )}
                                    </div>

                                    <div className="scroll-wrapper">
                                        <div className="scroll-content">
                                            {filteredPermissions.length === 0 ? (
                                                <p className="no-data-text">
                                                    {permissionSearch ? "Không tìm thấy quyền hạn phù hợp" : "Không có quyền hạn nào"}
                                                </p>
                                            ) : (
                                                filteredPermissions.map((per) => {
                                                    const assigned = assignedIds.includes(per.id);
                                                    return (
                                                        <div
                                                            key={per.id}
                                                            className="permission-item-container"
                                                            onMouseEnter={() => setHoveredPermissionId(per.id)}
                                                            onMouseLeave={() => setHoveredPermissionId(null)}
                                                        >
                                                            <div className="permission-info">
                                                                <span className="permission-item-name">{per.name}</span>
                                                                {per.description && (
                                                                    <span 
                                                                        className="permission-item-desc"
                                                                        title={per.description}
                                                                    >
                                                                        {per.description}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="permission-item-actions">
                                                                <button
                                                                    className={`add-permission-btn ${assigned ? "disabled" : ""}`}
                                                                    disabled={assigned || !selectedRole}
                                                                    onClick={() => handleAssign(per.id)}
                                                                    type="button"
                                                                >
                                                                    {assigned ? "Đã có" : "Thêm"}
                                                                </button>
                                                                {hoveredPermissionId === per.id && (
                                                                    <>
                                                                        <button
                                                                            className="action-btn edit-btn"
                                                                            onClick={() => handleOpenEditDialog(per, 'permission')}
                                                                            title="Chỉnh sửa"
                                                                        >
                                                                            <i className="bi bi-pencil"></i>
                                                                        </button>
                                                                        <button
                                                                            className="action-btn delete-btn"
                                                                            onClick={() => {
                                                                                setItemToDelete({ type: 'permission', id: per.id });
                                                                                setShowDeleteConfirm(true);
                                                                            }}
                                                                            title="Xóa"
                                                                        >
                                                                            <i className="bi bi-trash"></i> 
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dialog thêm vai trò mới */}
                {showRoleDialog && (
                    <div className="dialog-overlay">
                        <div className="dialog-content">
                            <div className="dialog-header">
                                <h5 className="dialog-title">Thêm vai trò mới</h5>
                                <button 
                                    className="dialog-close-btn"
                                    onClick={() => {
                                        setShowRoleDialog(false);
                                        setRoleFormData({ name: '', description: '', slug: '' });
                                    }}
                                >
                                    <i className="bi bi-x-lg"></i>
                                </button>
                            </div>
                            <div className="dialog-body">
                                <div className="form-group">
                                    <label>Tên vai trò *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={roleFormData.name}
                                        onChange={(e) => setRoleFormData(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="Nhập tên vai trò"
                                        autoFocus
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Mô tả</label>
                                    <textarea
                                        className="form-control"
                                        value={roleFormData.description}
                                        onChange={(e) => setRoleFormData(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Nhập mô tả"
                                        rows={3}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Slug</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={roleFormData.slug || ''}
                                        onChange={(e) => setRoleFormData(prev => ({ ...prev, slug: e.target.value }))}
                                        placeholder="Nhập slug (tùy chọn)"
                                    />
                                </div>
                            </div>
                            <div className="dialog-footer">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setShowRoleDialog(false);
                                        setRoleFormData({ name: '', description: '', slug: '' });
                                    }}
                                >
                                    Hủy
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleAddRole}
                                >
                                    Thêm
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Dialog thêm quyền hạn mới */}
                {showPermissionDialog && (
                    <div className="dialog-overlay">
                        <div className="dialog-content">
                            <div className="dialog-header">
                                <h5 className="dialog-title">Thêm quyền hạn mới</h5>
                                <button 
                                    className="dialog-close-btn"
                                    onClick={() => {
                                        setShowPermissionDialog(false);
                                        setPermissionFormData({ name: '', description: '', slug: '' });
                                    }}
                                >
                                    <i className="bi bi-x-lg"></i>
                                </button>
                            </div>
                            <div className="dialog-body">
                                <div className="form-group">
                                    <label>Tên quyền hạn *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={permissionFormData.name}
                                        onChange={(e) => setPermissionFormData(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="Nhập tên quyền hạn"
                                        autoFocus
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Mô tả</label>
                                    <textarea
                                        className="form-control"
                                        value={permissionFormData.description}
                                        onChange={(e) => setPermissionFormData(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Nhập mô tả"
                                        rows={3}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Slug</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={permissionFormData.slug || ''}
                                        onChange={(e) => setPermissionFormData(prev => ({ ...prev, slug: e.target.value }))}
                                        placeholder="Nhập slug (tùy chọn)"
                                    />
                                </div>
                            </div>
                            <div className="dialog-footer">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setShowPermissionDialog(false);
                                        setPermissionFormData({ name: '', description: '', slug: '' });
                                    }}
                                >
                                    Hủy
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleAddPermission}
                                >
                                    Thêm
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Dialog chỉnh sửa vai trò */}
                {showRoleEditDialog && (
                    <div className="dialog-overlay">
                        <div className="dialog-content">
                            <div className="dialog-header">
                                <h5 className="dialog-title">Chỉnh sửa vai trò</h5>
                                <button 
                                    className="dialog-close-btn"
                                    onClick={() => {
                                        setShowRoleEditDialog(false);
                                        setEditingItem(null);
                                        setRoleFormData({ name: '', description: '', slug: '' });
                                    }}
                                >
                                    <i className="bi bi-x-lg"></i>
                                </button>
                            </div>
                            <div className="dialog-body">
                                <div className="form-group">
                                    <label>Tên vai trò *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={roleFormData.name}
                                        onChange={(e) => setRoleFormData(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="Nhập tên vai trò"
                                        autoFocus
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Mô tả</label>
                                    <textarea
                                        className="form-control"
                                        value={roleFormData.description}
                                        onChange={(e) => setRoleFormData(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Nhập mô tả"
                                        rows={3}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Slug</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={roleFormData.slug || ''}
                                        onChange={(e) => setRoleFormData(prev => ({ ...prev, slug: e.target.value }))}
                                        placeholder="Nhập slug (tùy chọn)"
                                    />
                                </div>
                            </div>
                            <div className="dialog-footer">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setShowRoleEditDialog(false);
                                        setEditingItem(null);
                                        setRoleFormData({ name: '', description: '', slug: '' });
                                    }}
                                >
                                    Hủy
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleUpdateRole}
                                >
                                    Cập nhật
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Dialog chỉnh sửa quyền hạn */}
                {showPermissionEditDialog && (
                    <div className="dialog-overlay">
                        <div className="dialog-content">
                            <div className="dialog-header">
                                <h5 className="dialog-title">Chỉnh sửa quyền hạn</h5>
                                <button 
                                    className="dialog-close-btn"
                                    onClick={() => {
                                        setShowPermissionEditDialog(false);
                                        setEditingItem(null);
                                        setPermissionFormData({ name: '', description: '', slug: '' });
                                    }}
                                >
                                    <i className="bi bi-x-lg"></i>
                                </button>
                            </div>
                            <div className="dialog-body">
                                <div className="form-group">
                                    <label>Tên quyền hạn *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={permissionFormData.name}
                                        onChange={(e) => setPermissionFormData(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="Nhập tên quyền hạn"
                                        autoFocus
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Mô tả</label>
                                    <textarea
                                        className="form-control"
                                        value={permissionFormData.description}
                                        onChange={(e) => setPermissionFormData(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Nhập mô tả"
                                        rows={3}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Slug</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={permissionFormData.slug || ''}
                                        onChange={(e) => setPermissionFormData(prev => ({ ...prev, slug: e.target.value }))}
                                        placeholder="Nhập slug (tùy chọn)"
                                    />
                                </div>
                            </div>
                            <div className="dialog-footer">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setShowPermissionEditDialog(false);
                                        setEditingItem(null);
                                        setPermissionFormData({ name: '', description: '', slug: '' });
                                    }}
                                >
                                    Hủy
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleUpdatePermission}
                                >
                                    Cập nhật
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Dialog xác nhận xóa */}
                {showDeleteConfirm && itemToDelete && (
                    <div className="dialog-overlay">
                        <div className="dialog-content">
                            <div className="dialog-header">
                                <h5 className="dialog-title">Xác nhận xóa</h5>
                                <button 
                                    className="dialog-close-btn"
                                    onClick={() => {
                                        setShowDeleteConfirm(false);
                                        setItemToDelete(null);
                                    }}
                                >
                                    <i className="bi bi-x-lg"></i>
                                </button>
                            </div>
                            <div className="dialog-body">
                                <p>Bạn có chắc chắn muốn xóa {itemToDelete.type === 'role' ? 'vai trò' : 'quyền hạn'} này? Hành động này không thể hoàn tác.</p>
                            </div>
                            <div className="dialog-footer">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setShowDeleteConfirm(false);
                                        setItemToDelete(null);
                                    }}
                                >
                                    Hủy
                                </button>
                                <button
                                    className="btn btn-danger"
                                    onClick={handleConfirmDelete}
                                >
                                    Xóa
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}