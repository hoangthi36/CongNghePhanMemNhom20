import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PassPopup from '../../components/passPopup/passPopup';
import './Profile.css';

const Profile = () => {
  const [userData, setUserData] = useState({
    identification: '',
    name: '',
    phone: '',
    address: '',
    dob: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassPopup, setShowPassPopup] = useState(false);
  const [passChangeLoading, setPassChangeLoading] = useState(false);
  const [passChangeError, setPassChangeError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Lấy thông tin người dùng khi component mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError('');
      
      const userId = sessionStorage.getItem('userID');
      
      if (!userId) {
        setError('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.');
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_URL}/user/my-profile`, {
        params: { userId }
      });

      if (response.data && response.data.user) {
        const user = response.data.user;
        setUserData({
          identification: user.identification || '',
          name: user.name || '',
          phone: user.phone || '',
          address: user.address || '',
          dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
        });
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        'Không thể tải thông tin người dùng. Vui lòng thử lại.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (e) => {
    setUserData({ ...userData, phone: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const response = await axios.patch(`${API_URL}/user/update-profile`, {
        identification: userData.identification,
        phone: userData.phone,
      });

      if (response.data) {
        setSuccess('Cập nhật thông tin thành công!');
        // Cập nhật lại dữ liệu từ server
        await fetchUserProfile();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        'Không thể cập nhật thông tin. Vui lòng thử lại.';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleOpenPassPopup = () => {
    setShowPassPopup(true);
  };

  const handleClosePassPopup = () => {
    setShowPassPopup(false);
    setPassChangeError('');
    setPassChangeLoading(false);
  };

  const handlePasswordChange = async (formData) => {
    setPassChangeError('');
    setPassChangeLoading(true);

    // Validation
    if (!formData.currentPassword || !formData.newPassword) {
      setPassChangeError('Vui lòng nhập đầy đủ thông tin.');
      setPassChangeLoading(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      setPassChangeError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      setPassChangeLoading(false);
      return;
    }

    try {
      const response = await axios.patch(`${API_URL}/user/update-profile`, {
        identification: formData.identification,
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      if (response.data) {
        setShowPassPopup(false);
        setSuccess('Đổi mật khẩu thành công!');
        setPassChangeError('');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        'Không thể đổi mật khẩu. Vui lòng thử lại.';
      setPassChangeError(errorMessage);
    } finally {
      setPassChangeLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Đang tải thông tin...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-header">
            <h2 className="profile-title">Thông tin cá nhân</h2>
            <p className="profile-subtitle">Quản lý thông tin tài khoản của bạn</p>
          </div>

          {error && (
            <div className="profile-error">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="profile-success">
              <span className="success-icon">✓</span>
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">🆔</span>
                CCCD / CMND
              </label>
              <input
                className="form-input"
                type="text"
                value={userData.identification}
                disabled
                readOnly
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">👤</span>
                Họ và tên
              </label>
              <input
                className="form-input"
                type="text"
                value={userData.name}
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
                className="form-input editable"
                type="text"
                value={userData.phone}
                onChange={handlePhoneChange}
                placeholder="Nhập số điện thoại"
                disabled={saving}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">📍</span>
                Địa chỉ
              </label>
              <input
                className="form-input"
                type="text"
                value={userData.address || ''}
                disabled
                readOnly
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">📅</span>
                Ngày sinh
              </label>
              <input
                className="form-input"
                type="date"
                value={userData.dob}
                disabled
                readOnly
              />
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="save-button"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="button-spinner">⏳</span>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <span className="button-icon">💾</span>
                    Lưu thay đổi
                  </>
                )}
              </button>

              <button
                type="button"
                className="change-password-button"
                onClick={handleOpenPassPopup}
              >
                <span className="button-icon">🔒</span>
                Đổi mật khẩu
              </button>
            </div>
          </form>
        </div>
      </div>

      {showPassPopup && (
        <PassPopup
          identification={userData.identification}
          phone={userData.phone}
          onClose={handleClosePassPopup}
          onSubmit={handlePasswordChange}
          loading={passChangeLoading}
          error={passChangeError}
        />
      )}
    </div>
  );
};

export default Profile;
