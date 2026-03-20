import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login/Login.jsx";
import Profile from "./pages/Profile/Profile.jsx";
import Bills from "./pages/Bills/Bills.jsx";
import Posts from "./pages/Posts/Posts.jsx";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute.jsx";
import Layout from "./components/Layout/Layout.jsx";
import React from "react";

export default function App() {
  return (
    <Routes>
      {/* Login - Trang đầu tiên */}
      <Route path="/login" element={<Login />} />

      {/* Protected system - Chỉ truy cập được sau khi login */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/profile" replace/>} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/bills" element={<Bills />} />
          <Route path="/posts" element={<Posts />} />
        </Route>
      </Route>

      {/* Fallback - Redirect về login nếu chưa đăng nhập */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
