import { useState, useEffect } from "react";
import "../../assets/css/header.css";
import CartDropdown from "./CartDropdown";
import UserDropdown from "./UserDropdown";
import NotificationDropdown from "./NotificationDropdown";
import ProductNav from "./ProductNav";
import HeaderSearch from "./ProductHeaderSearch";

const ProductHeader = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      // Nếu scroll > 150px thì collapse header
      setIsCollapsed(scrollY > 150);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`sb-topnav sb-topnav-product navbar navbar-expand navbar-light bg-light d-flex flex-column px-3 gap-2 mb-1 ${
        isCollapsed ? "collapsed" : ""
      }`}
    >
      <div className="sb-topnav-container">
        {/* Navbar chính */}
        <div className={`sb-topnav-main d-flex align-items-center justify-content-between w-100 ${isCollapsed ? "d-none" : ""}`}>
          {/* Brand */}
          <a className="brand-header" href="index.html">
            <img src="../../public/img/Logo_branch.png" alt="Logo" height="40" width="40" />
            <span className="brand-text">Celeste Books</span>
          </a>

          <div className="d-flex align-items-center">
            <HeaderSearch />

            {/* Dropdowns */}
            <NotificationDropdown />
            <CartDropdown />
            <UserDropdown />
          </div>
        </div>

        {/* ProductNav luôn hiển thị */}
        <div className="sb-topnav-productnav">
          <ProductNav />
        </div>
      </div>
    </nav>
  );
};

export default ProductHeader;
