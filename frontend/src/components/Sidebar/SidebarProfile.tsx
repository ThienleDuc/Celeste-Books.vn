import { NavLink } from "react-router-dom";

const SidebarProfile = () => {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `nav-link ${isActive ? "active" : ""}`;

  return (
    <nav
      className="sb-sidenav accordion sb-sidenav-light"
      style={{ width: "250px", minHeight: "100vh" }}
    >
      <div className="sb-sidenav-menu">
        <div className="nav">

          {/* ===== HEADER: AVATAR ===== */}
          <div className="p-3 d-flex align-items-center border-bottom">
            <img
              src="/img/69ac12ab-e056-47b3-b0f1-e27966d80ce0.jpg"
              alt="avatar"
              className="rounded-circle me-3"
              width={50}
              height={50}
            />
            <div className="text-start">
              <p className="mb-0 text-muted" style={{ fontSize: "0.75rem" }}>
                Tài khoản của
              </p>
              <strong>Lê Đức Thiện</strong>
            </div>
          </div>

          {/* ===== TÀI KHOẢN ===== */}
          <div className="sb-sidenav-menu-heading">Tài khoản</div>

          <NavLink to="/thong-tin-tai-khoan" className={linkClass}>
            <i className="bi bi-person me-2"></i>
            Thông tin tài khoản
          </NavLink>

          <NavLink to="/thay-doi-thong-tin" className={linkClass}>
            <i className="bi bi-pencil-square me-2"></i>
            Thay đổi thông tin
          </NavLink>

          <NavLink to="/doi-mat-khau" className={linkClass}>
            <i className="bi bi-lock me-2"></i>
            Đổi mật khẩu
          </NavLink>

          {/* 🔥 MỚI: ĐỊA CHỈ GIAO HÀNG */}
          <NavLink to="/dia-chi-giao-hang" className={linkClass}>
            <i className="bi bi-geo-alt me-2"></i>
            Địa chỉ giao hàng
          </NavLink>

          {/* ===== THÔNG BÁO ===== */}
          <div className="sb-sidenav-menu-heading">Thông báo</div>

          <NavLink to="/thong-bao/nguoi-dung" className={linkClass}>
            <i className="bi bi-bell me-2"></i>
            Thông báo người dùng
          </NavLink>

          <NavLink to="/thong-bao/he-thong" className={linkClass}>
            <i className="bi bi-bell me-2"></i>
            Thông báo hệ thống
          </NavLink>

          {/* ===== ĐƠN HÀNG ===== */}
          <div className="sb-sidenav-menu-heading">Đơn hàng</div>

          <NavLink to="/don-hang-cua-toi" className={linkClass}>
            <i className="bi bi-receipt me-2"></i>
            Đơn hàng
          </NavLink>

          {/* ===== VOUCHER ===== */}
          <div className="sb-sidenav-menu-heading">Voucher</div>

          <NavLink to="/voucher-cua-toi" className={linkClass}>
            <i className="bi bi-ticket-perforated me-2"></i>
            Voucher
          </NavLink>

        </div>
      </div>

      {/* ===== FOOTER ===== */}
      <div className="sb-sidenav-footer mt-auto p-2 border-top">
        <div className="small">Logged in as:</div>
        Nhân viên điều hành ga
      </div>
    </nav>
  );
};

export default SidebarProfile;
