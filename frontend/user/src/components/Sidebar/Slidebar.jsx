import { NavLink } from "react-router-dom";


export default function Sidebar() {
return (
<aside className="sidebar">
<h2>Blue Moon</h2>
<nav>
    <li><NavLink to="/home" className={({ isActive }) => isActive ? "active" : ""}>Home</NavLink></li>
    <li><NavLink to="/profile" className={({ isActive }) => isActive ? "active" : ""}>Profile</NavLink></li>
    <li><NavLink to="/members" className={({ isActive }) => isActive ? "active" : ""}>Members</NavLink></li>
    <li><NavLink to="/bills" className={({ isActive }) => isActive ? "active" : ""}>Bills</NavLink></li>
    <li><NavLink to="/history" className={({ isActive }) => isActive ? "active" : ""}>History</NavLink></li>
    <li><NavLink to="/notifications" className={({ isActive }) => isActive ? "active" : ""}>Notifications</NavLink></li>
    <li><NavLink to="/contact" className={({ isActive }) => isActive ? "active" : ""}>Contact</NavLink></li>
</nav>
</aside>

);
}