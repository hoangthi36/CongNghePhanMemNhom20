import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const [identification, setIdentification] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  // Kiểm tra nếu đã đăng nhập thì redirect
  useEffect(() => {
    const isAuth = sessionStorage.getItem("isAuth");
    if (isAuth) {
      navigate("/profile", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setToast("");
    setLoading(true);

    // Validation
    if (!identification || !password) {
      setError("Vui lòng nhập đầy đủ thông tin.");
      setLoading(false);
      return;
    }

    try {
      // Gọi API login
      const response = await axios.post(`${API_URL}/auth/login`, {
        identification,
        password,
      });

      if (response.data && response.data.user) {
        // Lưu thông tin vào sessionStorage
        sessionStorage.setItem("isAuth", "true");
        sessionStorage.setItem("userId", response.data.user.id.toString());
        sessionStorage.setItem("identification", response.data.user.identification || identification);
        
        setToast("Đăng nhập thành công! Đang chuyển hướng...");
        
        // Chuyển hướng sau 1 giây
        setTimeout(() => {
          navigate("/profile", { replace: true });
        }, 1000);
      } else {
        setError("Đăng nhập thất bại. Vui lòng thử lại.");
      }
    } catch (err) {
      // Xử lý lỗi từ API
      const errorMessage =
        err.response?.data?.message ||
        "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h2 className="login-title">Đăng nhập cư dân</h2>
            <p className="login-subtitle">Nhập thông tin để truy cập hệ thống</p>
          </div>

          {error && (
            <div className="login-error">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {toast && (
            <div className="login-toast">
              <span className="toast-icon">✓</span>
              <span>{toast}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">🆔</span>
                CCCD / CMND
              </label>
              <input
                className="form-input"
                type="text"
                value={identification}
                onChange={(e) => setIdentification(e.target.value)}
                placeholder="Nhập số CCCD/CMND"
                disabled={loading}
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">🔒</span>
                Mật khẩu
              </label>
              <input
                className="form-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="button-spinner">⏳</span>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <span className="button-icon">→</span>
                  Đăng nhập
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
