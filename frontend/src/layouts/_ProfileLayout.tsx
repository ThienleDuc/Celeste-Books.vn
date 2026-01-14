import type { ReactNode } from "react";
import Footer from "../components/Footer/Footer";
import SidebarProfile from "../components/Sidebar/SidebarProfile";
import Header from "../components/Header/Header";

interface ProfileLayoutProps {
  children: ReactNode;
}

const ProfileLayout = ({ children }: ProfileLayoutProps) => {
  return (
    <div className="sb-nav-fixed">
      <Header />
      <div id="layoutSidenav">
        <div id="layoutSidenav_nav">
          <SidebarProfile />
        </div>
        <div id="layoutSidenav_content">
          <main>{children}</main>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default ProfileLayout;
