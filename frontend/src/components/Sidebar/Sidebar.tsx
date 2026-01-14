import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `nav-link ${isActive ? "active" : ""}`;

  return (
    <nav className="sb-sidenav accordion sb-sidenav-light" id="sidenavAccordion">
      <div className="sb-sidenav-menu">
        <div className="nav">

          {/* ===== THỐNG KÊ ===== */}
          <div className="sb-sidenav-menu-heading">Thống kê</div>

          <NavLink to="/admin/statistics/inventory" className={linkClass}>
            <i className="bi bi-box-arrow-in-down me-2"></i>
            Sản phẩm nhập vào
          </NavLink>

          <NavLink to="/admin/statistics/sales" className={linkClass}>
            <i className="bi bi-graph-up-arrow me-2"></i>
            Sản phẩm bán ra
          </NavLink>

          {/* ===== HỆ THỐNG ===== */}
          <div className="sb-sidenav-menu-heading">Hệ thống</div>

          <NavLink to="/phan-quyen" className={linkClass}>
            <i className="bi bi-shield-lock me-2"></i>
            Phân quyền
          </NavLink>

          <NavLink to="/nguoi-dung" className={linkClass}>
            <i className="bi bi-people me-2"></i>
            Người dùng
          </NavLink>

          {/* ===== QUẢN LÝ SẢN PHẨM ===== */}
          <div className="sb-sidenav-menu-heading">Quản lý sản phẩm</div>

          <NavLink to="/admin/products" className={linkClass}>
            <i className="bi bi-box-seam me-2"></i>
            Sản phẩm
          </NavLink>

          <NavLink to="/khoi-luong-dinh-muc" className={linkClass}>
            <i className="bi bi-speedometer2 me-2"></i>
            Khối lượng định mức
          </NavLink>

          <NavLink to="/voucher" className={linkClass}>
            <i className="bi bi-ticket-perforated me-2"></i>
            Voucher
          </NavLink>

          {/* ===== ĐƠN HÀNG ===== */}
          <div className="sb-sidenav-menu-heading">Đơn hàng</div>

          <NavLink to="/xac-nhan-don-hang" className={linkClass}>
            <i className="bi bi-check2-square me-2"></i>
            Xác nhận đơn hàng
          </NavLink>

        </div>
      </div>

      <div className="sb-sidenav-footer">
        <div className="small">Logged in as:</div>
        Admin
      </div>
    </nav>
  );
};

export default Sidebar;
