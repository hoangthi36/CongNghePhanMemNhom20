import { Navigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext.jsx";


export default function ProtectedRoute({ children }) {
const { user, loading } = useAuth();
if (loading) {
  return <div>Loading...</div>;
}
return user ? children : <Navigate to="/login" />;
}