import React, { useState } from 'react';
import './residentPopup.css';

const ResidentPopup = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    identification_head: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

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
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tên hộ gia đình là bắt buộc';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Địa chỉ là bắt buộc';
    }

    if (!formData.identification_head.trim()) {
      newErrors.identification_head = 'CCCD/CMND chủ hộ là bắt buộc';
    } else if (formData.identification_head.length < 9 || formData.identification_head.length > 12) {
      newErrors.identification_head = 'CCCD/CMND phải từ 9-12 số';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      // Reset form after successful submission
      setFormData({
        name: '',
        address: '',
        identification_head: ''
      });
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Error creating household:', error);
      setErrors({ submit: error.response?.data?.message || 'Có lỗi xảy ra khi tạo hộ gia đình' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      address: '',
      identification_head: ''
    });
    setErrors({});
    onClose();
  };

  return (
    <div className="popup-overlay" onClick={handleClose}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <div className="popup-header">
          <h2>Thêm hộ gia đình mới</h2>
          <button className="popup-close" onClick={handleClose}>×</button>
        </div>
        <form className="popup-form" onSubmit={handleSubmit}>
          <div className="form-note">
            <p>⚠️ Lưu ý: Chủ hộ phải đã có tài khoản trong hệ thống với CCCD/CMND tương ứng.</p>
          </div>

          <div className="form-group">
            <label htmlFor="name">Tên hộ gia đình *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ví dụ: Ho Nguyen"
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="address">Địa chỉ *</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Ví dụ: 12 Nguyen Trai, Ha Noi"
              className={errors.address ? 'error' : ''}
            />
            {errors.address && <span className="error-message">{errors.address}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="identification_head">CCCD/CMND chủ hộ *</label>
            <input
              type="text"
              id="identification_head"
              name="identification_head"
              value={formData.identification_head}
              onChange={handleChange}
              placeholder="Ví dụ: ID1001"
              className={errors.identification_head ? 'error' : ''}
            />
            {errors.identification_head && <span className="error-message">{errors.identification_head}</span>}
          </div>

          {errors.submit && (
            <div className="form-note" style={{ background: '#ffebee', borderLeftColor: '#c62828' }}>
              <p style={{ color: '#c62828' }}>{errors.submit}</p>
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={handleClose} disabled={loading}>
              Hủy
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Đang tạo...' : 'Thêm hộ gia đình'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResidentPopup;
