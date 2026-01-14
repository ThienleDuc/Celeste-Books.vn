import { NavLink } from "react-router-dom";

const Sidebar = () => {
  return (
    <nav className="sb-sidenav accordion sb-sidenav-light" id="sidenavAccordion">
      <div className="sb-sidenav-menu">
        <div className="nav">

          
          <div className="sb-sidenav-menu-heading">Sản phẩm</div>

          <NavLink to="/admin/products" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            <i className="bi bi-train-front me-2"></i> Quản lý sản phẩm
          </NavLink>

          <NavLink to="/admin/products/add" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            <i className="bi bi-window-sidebar me-2"></i> Thêm sản phẩm
          </NavLink>

          <div className="sb-sidenav-menu-heading">Thống kê</div>

          <NavLink to="/admin/statistics/sales" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            <i className="bi bi-train-freight-front me-2"></i> Thống kê bán hàng
          </NavLink>

          <NavLink to="/admin/statistics/inventory" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            <i className="bi bi-train-freight-front me-2"></i> Thống kê nhập hàng
          </NavLink>

        </div>
      </div>

      <div className="sb-sidenav-footer">
        <div className="small">Logged in as:</div>
        Start Bootstrap Admin
      </div>
    </nav>
  );
};

export default Sidebar;
