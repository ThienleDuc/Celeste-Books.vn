import React, { useEffect, useState } from "react";

// Component nút toggle sidebar
const SidebarToggle = () => {
  const [toggled, setToggled] = useState<boolean>(
    localStorage.getItem("sb|sidebar-toggle") === "true"
  );

  useEffect(() => {
    // Khi trạng thái thay đổi, cập nhật class cho body
    if (toggled) {
      document.body.classList.add("sb-sidenav-toggled");
    } else {
      document.body.classList.remove("sb-sidenav-toggled");
    }
    localStorage.setItem("sb|sidebar-toggle", toggled.toString());
  }, [toggled]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setToggled(!toggled);
  };

  return (
    <button
      className="btn btn-light btn-sm order-1 order-lg-0  me-lg-0"
      onClick={handleClick}
    >
      <i className="fas fa-bars" ></i>
    </button>
  );
};

export default SidebarToggle;
