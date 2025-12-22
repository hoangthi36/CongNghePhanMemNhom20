import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/Context/AuthContext.jsx";
import Login from "./pages/Login/Login.jsx";
import Register from "./pages/Register/Register.jsx";
import Home from "./pages/Home/Home.jsx";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute.jsx";
import React from "react";  


export default function App() {
return (
<AuthProvider>
<Routes>
	<Route path="/" element={<Home />} />
	<Route path="/login" element={<Login />} />
	<Route path="/register" element={<Register />} />
	<Route
		path="/*"
		element={
			<ProtectedRoute>
                <Home/>
			</ProtectedRoute>
		}
	/>
</Routes>
</AuthProvider>
);
}