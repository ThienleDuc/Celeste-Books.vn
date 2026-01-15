import type { ReactNode } from "react";
import "../assets/css/auth-layout.css";

interface AuthenticationLayoutProps {
  children: ReactNode;
  className?: string; // cho phép thêm class tùy biến
}

const AuthenticationLayout = ({ children, className }: AuthenticationLayoutProps) => {
  return (
    <div className="auth-layout">
      <div className={`auth-card ${className || ""}`}>
        <div className="auth-card-body">{children}</div>
      </div>
    </div>
  );
};

export default AuthenticationLayout;
