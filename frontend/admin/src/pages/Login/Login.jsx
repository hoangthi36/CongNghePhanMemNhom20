import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export default function Login({ onLogin = () => {} }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Demo: always succeed
    onLogin();
    navigate("/statistics");
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit} aria-label="login-form">
        <h2 className="login-title">Admin Login</h2>

        <label className="label">
          Tên đăng nhập
          <input
            className="input"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Nhập tên đăng nhập"
            required
          />
        </label>

        <label className="label">
          Mật khẩu
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nhập mật khẩu"
            required
          />
        </label>

        <button className="btn-login" type="submit">
          Đăng nhập
        </button>
      </form>
    </div>
  );
}
