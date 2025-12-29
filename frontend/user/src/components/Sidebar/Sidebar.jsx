import { NavLink } from "react-router-dom";
import React from "react";
import "./Slidebar.css";
import { Images } from "../../assets/assets";

export default function Sidebar() {
    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <h2 className="sb-brand">Blue Moon</h2>
                <img src={Images.logo} alt="Blue Moon logo" className="sb-logo" />
            </div>
            <nav className="sidebar-nav">
                <ul>
                    <li>
                        <NavLink 
                            to="/profile" 
                            className={({ isActive }) => (isActive ? "active" : "")}
                        >
                            <span className="nav-icon">👤</span>
                            <span>Hồ sơ</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink 
                            to="/bills" 
                            className={({ isActive }) => (isActive ? "active" : "")}
                        >
                            <span className="nav-icon">📄</span>
                            <span>Hóa đơn</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink 
                            to="/posts" 
                            className={({ isActive }) => (isActive ? "active" : "")}
                        >
                            <span className="nav-icon">📢</span>
                            <span>Thông báo</span>
                        </NavLink>
                    </li>
                </ul>
            </nav>
        </aside>
    );
}