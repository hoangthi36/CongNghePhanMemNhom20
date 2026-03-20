import React from "react";
import Sidebar from "../Sidebar/Sidebar";
import Footer from "../Footer/Footer";
import "./Layout.css";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="layout">
      <Sidebar />
      <div className="layout-content">
        <main className="main-content">
          <Outlet />
          </main>
        <Footer />
      </div>
    </div>
    
  );
}



