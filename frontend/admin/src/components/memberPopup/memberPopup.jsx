import React, { useState, useEffect } from 'react';
import './memberPopup.css';

const MemberPopup = ({ member, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    identification: '',
    name: '',
    relationship: ''
  });

  const isEditMode = !!member;

  useEffect(() => {
    if (member) {
      setFormData({
        identification: member.identification || '',
        name: member.name || '',
        relationship: member.relationship || ''
      });
    } else {
      setFormData({
        identification: '',
        name: '',
        relationship: ''
      });
    }
  }, [member]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.identification.trim() || !formData.name.trim() || !formData.relationship.trim()) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }
    onSave(formData);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="popup-overlay" onClick={handleOverlayClick}>
      <div className="popup-content">
        <div className="popup-header">
          <h2>{isEditMode ? 'Sửa thành viên' : 'Thêm thành viên mới'}</h2>
          <button className="popup-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form className="popup-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="identification">ID (CCCD/CMND) *</label>
            <input
              type="text"
              id="identification"
              name="identification"
              value={formData.identification}
              onChange={handleChange}
              placeholder="Nhập số CCCD/CMND"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="name">Họ và tên *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nhập họ và tên"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="relationship">Quan hệ với chủ hộ *</label>
            <select
              id="relationship"
              name="relationship"
              value={formData.relationship}
              onChange={handleChange}
              required
            >
              <option value="">Chọn quan hệ</option>
              <option value="vo">Vợ</option>
              <option value="chong">Chồng</option>
              <option value="con">Con</option>
              <option value="cha">Cha</option>
              <option value="me">Mẹ</option>
              <option value="anh">Anh</option>
              <option value="chi">Chị</option>
              <option value="em">Em</option>
              <option value="khac">Khác</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn-submit">
              {isEditMode ? 'Lưu thay đổi' : 'Thêm thành viên'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MemberPopup;
