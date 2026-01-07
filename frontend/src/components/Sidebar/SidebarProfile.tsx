import { NavLink } from "react-router-dom";

const SidebarProfile = () => {
  return (
    <nav className="sb-sidenav accordion sb-sidenav-light" style={{ width: "250px", minHeight: "100vh" }}>
      <div className="sb-sidenav-menu">
        <div className="nav">

          {/* --- HEADER: AVATAR + TEXT --- */}
          <div className="p-3 d-flex align-items-center border-bottom">
            <img
              src="../../public/img/69ac12ab-e056-47b3-b0f1-e27966d80ce0.jpg"
              alt="avatar"
              className="rounded-circle me-3"
              width={50}
              height={50}
            />
            <div className="text-start">
              <p className="mb-0 text-muted" style={{ fontSize: "0.75rem" }}>Tài khoản của</p>
              <strong>Lê Đức Thiện</strong>
            </div>
          </div>

          {/* --- TÀI KHOẢN --- */}
          <div className="sb-sidenav-menu-heading mt-3">Tài khoản</div>
          <NavLink
            to="/thong-tin-tai-khoan"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            <i className="bi bi-person me-2"></i> Thông tin tài khoản
          </NavLink>
          <NavLink
            to="/thay-doi-thong-tin"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            <i className="bi bi-pencil-square me-2"></i> Thay đổi thông tin
          </NavLink>
          <NavLink
            to="/doi-mat-khau"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            <i className="bi bi-lock me-2"></i> Đổi mật khẩu
          </NavLink>

          {/* --- THÔNG BÁO --- */}
          <div className="sb-sidenav-menu-heading mt-3">Thông báo</div>
          <NavLink
            to="/thong-bao/lich-trinh"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            <i className="bi bi-calendar-event me-2"></i> Lịch trình
          </NavLink>
          <NavLink
            to="/thong-bao/phan-cong-lai-tau"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            <i className="bi bi-clipboard-check me-2"></i> Phân công lái tàu
          </NavLink>
        </div>
      </div>

      {/* Footer nhỏ phía dưới */}
      <div className="sb-sidenav-footer mt-auto p-2 border-top">
        <div className="small">Logged in as:</div>
        Nhân viên điều hành ga
      </div>
    </nav>
  );
};

export default SidebarProfile;
