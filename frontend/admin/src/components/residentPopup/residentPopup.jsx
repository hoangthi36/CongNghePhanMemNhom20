import React, { useState, useEffect } from 'react';
import './residentPopup.css';

const ResidentPopup = ({ household, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    members: []
  });

  const isEditMode = !!household;

  useEffect(() => {
    if (household) {
      setFormData({
        name: household.namehousehold || '',
        address: household.address || '',
        members: household.members || []
      });
    } else {
      setFormData({
        name: '',
        address: '',
        members: []
      });
    }
  }, [household]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.address.trim()) {
      alert('Vui lòng điền đầy đủ tên hộ và địa chỉ');
      return;
    }

    // Format data according to API requirements
    const submitData = {
      namehousehold: formData.name,
      address: formData.address,
      members: formData.members
    };

    onSave(submitData);
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
          <h2>{isEditMode ? 'Sửa hộ gia đình' : 'Thêm hộ gia đình mới'}</h2>
          <button className="popup-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form className="popup-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Tên hộ gia đình *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nhập tên hộ gia đình"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">Địa chỉ *</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Nhập địa chỉ"
              required
            />
          </div>

          <div className="form-note">
            <p>💡 Lưu ý: Thành viên có thể được thêm sau khi tạo hộ gia đình.</p>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn-submit">
              {isEditMode ? 'Lưu thay đổi' : 'Tạo hộ gia đình'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResidentPopup;
