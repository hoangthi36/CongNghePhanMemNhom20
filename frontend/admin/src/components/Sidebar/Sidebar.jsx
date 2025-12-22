import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import "./Sidebar.css";

export default function Sidebar() {
  const { pathname } = useLocation();
  const [residentsOpen, setResidentsOpen] = useState(pathname.startsWith("/residents"));

  return (
    <aside className="admin-sidebar" aria-label="sidebar">
      <div className="sidebar-inner">
        <div className="brand">Admin</div>

        <nav className="nav">
          <NavLink to="/statistics" className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}>Thống kê</NavLink>

          <div className={`nav-section ${residentsOpen ? "open" : ""}`}>
            <button
              type="button"
              className="nav-section-toggle"
              onClick={() => setResidentsOpen((v) => !v)}
              aria-expanded={residentsOpen}
            >
              <span>Cư dân</span>
              <span className={`chev ${residentsOpen ? "open" : ""}`}>▾</span>
            </button>

            {residentsOpen && (
              <>
                <NavLink to="/residents" end className={({ isActive }) => (isActive ? "nav-item nav-child active" : "nav-item nav-child")}>List cư dân</NavLink>
                <NavLink to="/residents/add" className={() => (pathname.startsWith("/residents/add") || pathname.startsWith("/residents/edit") ? "nav-item nav-child active" : "nav-item nav-child")}>Thao tác</NavLink>
              </>
            )}
          </div>

          <NavLink to="/meters" className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}>Chỉ số điện nước</NavLink>
          <NavLink to="/posts" className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}>Bài đăng</NavLink>
          <NavLink to="/bills" className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}>Hóa đơn</NavLink>
        </nav>
      </div>
    </aside>
  );
}
