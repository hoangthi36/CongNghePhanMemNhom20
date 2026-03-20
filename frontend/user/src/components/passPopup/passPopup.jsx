import React, { useState } from "react";
import axios from "axios";
import "./passPopup.css";

const PassPopup = ({ onClose, onSuccess }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu mới và xác nhận mật khẩu không khớp");
      return;
    }

    if (newPassword.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    setLoading(true);

    try {
      const identification = sessionStorage.getItem("identification");
      if (!identification) {
        setError("Không tìm thấy thông tin đăng nhập");
        setLoading(false);
        return;
      }

      const response = await axios.patch(`${API_URL}/user/update-profile`, {
        identification,
        currentPassword,
        newPassword,
      });

      if (response.data) {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        onSuccess();
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Đổi mật khẩu thất bại";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pass-popup-overlay" onClick={onClose}>
      <div className="pass-popup-container" onClick={(e) => e.stopPropagation()}>
        <div className="pass-popup-header">
          <h3 className="pass-popup-title">Đổi mật khẩu</h3>
          <button className="pass-popup-close" onClick={onClose}>
            ×
          </button>
        </div>

        {error && (
          <div className="pass-popup-error">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="pass-popup-form">
          <div className="pass-popup-form-group">
            <label className="pass-popup-label">
              <span className="label-icon">🔒</span>
              Mật khẩu cũ
            </label>
            <input
              className="pass-popup-input"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Nhập mật khẩu cũ"
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          <div className="pass-popup-form-group">
            <label className="pass-popup-label">
              <span className="label-icon">🔐</span>
              Mật khẩu mới
            </label>
            <input
              className="pass-popup-input"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nhập mật khẩu mới"
              disabled={loading}
              autoComplete="new-password"
            />
          </div>

          <div className="pass-popup-form-group">
            <label className="pass-popup-label">
              <span className="label-icon">🔐</span>
              Xác nhận mật khẩu mới
            </label>
            <input
              className="pass-popup-input"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu mới"
              disabled={loading}
              autoComplete="new-password"
            />
          </div>

          <div className="pass-popup-actions">
            <button
              type="button"
              className="btn btn-cancel"
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn btn-confirm"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="button-spinner">⏳</span>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <span className="button-icon">✓</span>
                  Xác nhận
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PassPopup;
