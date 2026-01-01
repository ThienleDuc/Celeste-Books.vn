import { NavLink } from "react-router-dom";

const Sidebar = () => {
  return (
    <nav className="sb-sidenav accordion sb-sidenav-light" id="sidenavAccordion">
      <div className="sb-sidenav-menu">
        <div className="nav">

          {/* --- QUẢN LÝ DANH MỤC --- */}
          <div className="sb-sidenav-menu-heading">Danh mục</div>

          <NavLink to="/loai-tau" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            <i className="bi bi-train-front me-2"></i> Loại tàu
          </NavLink>

          <NavLink to="/loai-toa" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            <i className="bi bi-window-sidebar me-2"></i> Loại toa
          </NavLink>

          <NavLink to="/loai-khoang" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            <i className="bi bi-grid-3x3-gap me-2"></i> Loại khoang
          </NavLink>

          <NavLink to="/loai-ghe" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            <i className="bi bi-credit-card-2-front me-2"></i> Loại ghế
          </NavLink>

          <NavLink to="/ga-tau" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            <i className="bi bi-geo-alt me-2"></i> Ga tàu
          </NavLink>

          <NavLink to="/tuyen-tau" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            <i className="bi bi-signpost-split me-2"></i> Tuyến tàu
          </NavLink>

          <NavLink to="/tuyen-tau-ga" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            <i className="bi bi-link-45deg me-2"></i> Tuyến tàu – Ga
          </NavLink>

          {/* --- CẤU TRÚC TÀU --- */}
          <div className="sb-sidenav-menu-heading">Cấu trúc tàu</div>

          <NavLink to="/doan-tau" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            <i className="bi bi-train-freight-front me-2"></i> Đoàn tàu
          </NavLink>

          <NavLink to="/toa-tau" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            <i className="bi bi-columns me-2"></i> Toa tàu
          </NavLink>

          <NavLink to="/khoang-tau" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            <i className="bi bi-layers me-2"></i> Khoang tàu
          </NavLink>

          <NavLink to="/ghe-ngoi" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            <i className="bi bi-box-seam me-2"></i> Ghế / Giường
          </NavLink>

          <NavLink to="/vi-tri-ngoi" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            <i className="bi bi-layout-sidebar me-2"></i> Vị trí ngồi
          </NavLink>

          {/* --- LỊCH TRÌNH & GIÁ VÉ --- */}
          <div className="sb-sidenav-menu-heading">Lịch trình & Giá vé</div>

          <NavLink to="/lich-trinh" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            <i className="bi bi-calendar-event me-2"></i> Lịch trình
          </NavLink>

          <NavLink to="/gia-tien-khoang-cach" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            <i className="bi bi-cash-coin me-2"></i> Giá theo khoảng cách
          </NavLink>

          <NavLink to="/gia-ve-tham-khao" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            <i className="bi bi-receipt me-2"></i> Giá vé
          </NavLink>

          <NavLink to="/tinh-trang-ve" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            <i className="bi bi-info-circle me-2"></i> Tình trạng vé
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
