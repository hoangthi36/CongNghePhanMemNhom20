import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
  const isAuth = sessionStorage.getItem("isAuth");

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}