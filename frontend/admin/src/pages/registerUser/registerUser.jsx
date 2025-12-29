import React, { useState } from 'react';
import axios from 'axios';
import './registerUser.css';

const RegisterUser = () => {
  const [formData, setFormData] = useState({
    identification: '',
    name: '',
    password: '',
    dob: '',
    address: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    setErrorMessage('');
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.identification.trim()) {
      newErrors.identification = 'Số CCCD/CMND là bắt buộc';
    } else if (formData.identification.length < 9 || formData.identification.length > 12) {
      newErrors.identification = 'Số CCCD/CMND phải từ 9-12 số';
    }
    
    if (!formData.name.trim()) {
      newErrors.name = 'Họ và tên là bắt buộc';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Họ và tên phải có ít nhất 2 ký tự';
    }
    
    if (!formData.password) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    
    if (formData.dob && new Date(formData.dob) > new Date()) {
      newErrors.dob = 'Ngày sinh không thể lớn hơn ngày hiện tại';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccess(false);

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/register`, formData);
      
      if (response.status === 201) {
        setSuccess(true);
        setFormData({
          identification: '',
          name: '',
          password: '',
          dob: '',
          address: ''
        });
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      }
    } catch (error) {
      if (error.response) {
        setErrorMessage(error.response.data.message || 'Đã có lỗi xảy ra khi đăng ký');
      } else if (error.request) {
        setErrorMessage('Không thể kết nối đến server. Vui lòng thử lại sau.');
      } else {
        setErrorMessage('Đã có lỗi xảy ra. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-header">
          <h1 className="register-title">
            <span className="register-icon">📝</span>
            Đăng ký cư dân mới
          </h1>
          <p className="register-subtitle">Vui lòng điền đầy đủ thông tin để đăng ký</p>
        </div>

        <form className="register-form" onSubmit={handleSubmit}>
          {success && (
            <div className="alert alert-success">
              <span className="alert-icon">✓</span>
              <span>Đăng ký thành công!</span>
            </div>
          )}

          {errorMessage && (
            <div className="alert alert-error">
              <span className="alert-icon">✕</span>
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="identification" className="form-label">
              Số CCCD/CMND <span className="required">*</span>
            </label>
            <input
              type="text"
              id="identification"
              name="identification"
              value={formData.identification}
              onChange={handleChange}
              className={`form-input ${errors.identification ? 'error' : ''}`}
              placeholder="Nhập số CCCD/CMND (9-12 số)"
              maxLength="12"
            />
            {errors.identification && (
              <span className="error-message">{errors.identification}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Họ và tên <span className="required">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`form-input ${errors.name ? 'error' : ''}`}
              placeholder="Nhập họ và tên"
            />
            {errors.name && (
              <span className="error-message">{errors.name}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Mật khẩu <span className="required">*</span>
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`form-input ${errors.password ? 'error' : ''}`}
              placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
            />
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="dob" className="form-label">
              Ngày sinh
            </label>
            <input
              type="date"
              id="dob"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              className={`form-input ${errors.dob ? 'error' : ''}`}
              max={new Date().toISOString().split('T')[0]}
            />
            {errors.dob && (
              <span className="error-message">{errors.dob}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="address" className="form-label">
              Địa chỉ
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="form-input"
              placeholder="Nhập địa chỉ"
            />
          </div>

          <button 
            type="submit" 
            className="btn-submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                <span>Đang xử lý...</span>
              </>
            ) : (
              <>
                <span>✓</span>
                <span>Đăng ký</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterUser;
