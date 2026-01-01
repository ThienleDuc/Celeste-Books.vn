import SidebarToggle from "../Sidebar/SidebarToggle";
import "../../assets/css/header.css";
import UserDropdown from "./UserDropdown";
import NotificationDropdown from "./NotificationDropdown";
import CartDropdown from "./CartDropdown";
import HeaderSearch from "./ProductHeaderSearch";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <nav className="sb-topnav navbar navbar-expand navbar-light bg-light px-3">
      <SidebarToggle />

      {/* Brand */}
      <Link to="/" className="brand-header">
        <img src="/img/Logo_branch.png" alt="Logo" height="40" width="40" />
        <span className="brand-text">Celeste Books</span>
      </Link>

      <div className="ms-auto d-flex align-items-center">
        <HeaderSearch/>

        <NotificationDropdown />
        <CartDropdown />
        <UserDropdown />
      </div>
    </nav>
  );
};

export default Header;
