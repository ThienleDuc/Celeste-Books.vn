// ./User/role.model.ts
/* =======================
   ROLES TABLE
   ======================= */
export interface Role {
  id: string;            // VARCHAR(10)
  name: string;          // VARCHAR(50)
  description: string;   // VARCHAR(255)
  slug: string;          // VARCHAR(255)
}

/* =======================
   PERMISSIONS TABLE
   ======================= */
export interface Permission {
  id: number;            // INT
  name: string;          // VARCHAR(100)
  describe: string;      // VARCHAR(255)
  slug: string;          // VARCHAR(255)
}

/* =======================
   ROLE_PER TABLE
   ======================= */
export interface RolePermission {
  perId: string;         // VARCHAR(10)
  roleId: number;        // INT
}

export const sampleRoles: Role[] = [
  {
    id: "admin",
    name: "Admin",
    description: "Quản trị hệ thống",
    slug: "admin",
  },
  {
    id: "user",
    name: "User",
    description: "Người dùng thông thường",
    slug: "user",
  },
];

export const samplePermissions: Permission[] = [
  {
    id: 1,
    name: "Xem sản phẩm",
    describe: "Cho phép xem danh sách và chi tiết sách",
    slug: "view_product",
  },
  {
    id: 2,
    name: "Thêm sản phẩm",
    describe: "Cho phép thêm sách mới",
    slug: "create_product",
  },
  {
    id: 3,
    name: "Cập nhật sản phẩm",
    describe: "Cho phép chỉnh sửa thông tin sách",
    slug: "update_product",
  },
  {
    id: 4,
    name: "Xóa sản phẩm",
    describe: "Cho phép xóa sách khỏi hệ thống",
    slug: "delete_product",
  },
  {
    id: 5,
    name: "Quản lý đơn hàng",
    describe: "Cho phép xem và cập nhật đơn hàng",
    slug: "manage_order",
  },
  {
    id: 6,
    name: "Quản lý người dùng",
    describe: "Cho phép xem và quản lý tài khoản người dùng",
    slug: "manage_user",
  },
];

export const sampleRolePermissions: RolePermission[] = [
  // Admin có toàn quyền
  { perId: "admin", roleId: 1 },
  { perId: "admin", roleId: 2 },
  { perId: "admin", roleId: 3 },
  { perId: "admin", roleId: 4 },
  { perId: "admin", roleId: 5 },
  { perId: "admin", roleId: 6 },

  // User chỉ có quyền xem sản phẩm
  { perId: "user", roleId: 1 },
];

