import React, { useState, useEffect } from 'react';
import './passPopup.css';

const PassPopup = ({ identification, phone, onClose, onSubmit, loading, error }) => {
  const [formData, setFormData] = useState({
    identification: identification || '',
    phone: phone || '',
    currentPassword: '',
    newPassword: '',
  });
  const [localError, setLocalError] = useState('');

  // Cập nhật formData khi props thay đổi
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      identification: identification || '',
      phone: phone || '',
    }));
  }, [identification, phone]);

  // Reset local error when form data changes
  useEffect(() => {
    if (localError) {
      setLocalError('');
    }
  }, [formData.currentPassword, formData.newPassword]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError('');
    
    // Validation
    if (!formData.currentPassword || !formData.newPassword) {
      setLocalError('Vui lòng nhập đầy đủ thông tin.');
      return;
    }

    if (formData.newPassword.length < 6) {
      setLocalError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    // Gọi callback từ parent component
    onSubmit(formData);
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

        {(error || localError) && (error !== '' || localError !== '') && (
          <div className="pass-popup-error">
            <span className="error-icon">⚠️</span>
            <span>{error || localError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="pass-popup-form">
          <div className="form-group">
            <label className="form-label">
              <span className="label-icon">🆔</span>
              CCCD / CMND
            </label>
            <input
              className="form-input"
              type="text"
              name="identification"
              value={formData.identification}
              disabled
              readOnly
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <span className="label-icon">📱</span>
              Số điện thoại
            </label>
            <input
              className="form-input"
              type="text"
              name="phone"
              value={formData.phone}
              disabled
              readOnly
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <span className="label-icon">🔒</span>
              Mật khẩu hiện tại
            </label>
            <input
              className="form-input"
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              placeholder="Nhập mật khẩu hiện tại"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <span className="label-icon">🔐</span>
              Mật khẩu mới
            </label>
            <input
              className="form-input"
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Nhập mật khẩu mới"
              disabled={loading}
              required
              minLength={6}
            />
          </div>

          <div className="pass-popup-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="confirm-button"
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
