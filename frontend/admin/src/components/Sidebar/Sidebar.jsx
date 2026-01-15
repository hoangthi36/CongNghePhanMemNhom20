  import React from "react";
  import { NavLink } from "react-router-dom";
  import "./Sidebar.css";

  export default function Sidebar() {
    const navItems = [
      { path: "/statistics", label: "Thống kê", icon: "📊" },
      { path: "/residents", label: "Cư dân", icon: "👥" },
      { path: "/register", label: "Đăng ký", icon: "📝" },
      { path: "/posts", label: "Bài đăng", icon: "📰" },
      { path: "/bills", label: "Hóa đơn", icon: "💰" },
      { path: "/overdue", label: "Quá hạn", icon: "⚠️" },
    ];

    return (
      <aside className="admin-sidebar" aria-label="sidebar">
        <div className="sidebar-inner">
          <div className="brand">
            <span className="brand-icon">⚡</span>
            <span>Admin</span>
          </div>

          <nav className="nav">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `nav-item ${isActive ? "active" : ""}`
                }
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>
    );
  }