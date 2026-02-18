import React, { useState } from 'react';
import './billPopup.css';

const BillPopup = ({ onClose, onSave }) => {
  const [selectedType, setSelectedType] = useState('');
  const [formData, setFormData] = useState({
    identification_head: '',
    type: '',
    oldIndex: '',
    newIndex: '',
    dueDate: ''
  });

  const billTypes = [
    { value: 'electricity', label: 'Điện', icon: '⚡' },
    { value: 'water', label: 'Nước', icon: '💧' },
    { value: 'garbage', label: 'Rác', icon: '🗑️' },
    { value: 'management', label: 'Quản lý', icon: '🏢' },
    { value: 'parking', label: 'Gửi xe', icon: '🚗' }
  ];

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setFormData(prev => ({
      ...prev,
      type: type,
      oldIndex: '',
      newIndex: ''
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.identification_head.trim()) {
      alert('Vui lòng nhập mã định danh chủ hộ');
      return;
    }

    if (!formData.type) {
      alert('Vui lòng chọn loại hóa đơn');
      return;
    }

    if (!formData.dueDate) {
      alert('Vui lòng chọn hạn nộp tiền');
      return;
    }

    // Validate index for electricity and water
    if (formData.type === 'electricity' || formData.type === 'water') {
      if (!formData.oldIndex || !formData.newIndex) {
        alert('Vui lòng nhập đầy đủ chỉ số cũ và chỉ số mới');
        return;
      }
      if (parseInt(formData.newIndex) <= parseInt(formData.oldIndex)) {
        alert('Chỉ số mới phải lớn hơn chỉ số cũ');
        return;
      }
    }

    const submitData = {
      identification_head: formData.identification_head,
      type: formData.type,
      dueDate: formData.dueDate,
      ...(formData.type === 'electricity' || formData.type === 'water' ? {
        oldIndex: parseInt(formData.oldIndex),
        newIndex: parseInt(formData.newIndex)
      } : {
        oldIndex: 0,
        newIndex: 0
      })
    };

    onSave(submitData);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const needsIndex = selectedType === 'electricity' || selectedType === 'water';

  return (
    <div className="popup-overlay" onClick={handleOverlayClick}>
      <div className="popup-content">
        <div className="popup-header">
          <h2>Thêm hóa đơn mới</h2>
          <button className="popup-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form className="popup-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="identification_head">Mã định danh chủ hộ *</label>
            <input
              type="text"
              id="identification_head"
              name="identification_head"
              value={formData.identification_head}
              onChange={handleChange}
              placeholder="Nhập mã định danh (VD: ID2001)"
              required
            />
          </div>

          <div className="form-group">
            <label>Chọn loại hóa đơn *</label>
            <div className="bill-type-selector">
              {billTypes.map((type) => (
                <div
                  key={type.value}
                  className={`bill-type-card ${selectedType === type.value ? 'selected' : ''}`}
                  onClick={() => handleTypeSelect(type.value)}
                >
                  <span className="bill-type-icon">{type.icon}</span>
                  <span className="bill-type-label">{type.label}</span>
                </div>
              ))}
            </div>
          </div>

          {selectedType && needsIndex && (
            <>
              <div className="form-group">
                <label htmlFor="oldIndex">Chỉ số cũ *</label>
                <input
                  type="number"
                  id="oldIndex"
                  name="oldIndex"
                  value={formData.oldIndex}
                  onChange={handleChange}
                  placeholder="Nhập chỉ số cũ"
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="newIndex">Chỉ số mới *</label>
                <input
                  type="number"
                  id="newIndex"
                  name="newIndex"
                  value={formData.newIndex}
                  onChange={handleChange}
                  placeholder="Nhập chỉ số mới"
                  min="0"
                  required
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="dueDate">Hạn nộp tiền *</label>
            <input
              type="date"
              id="dueDate"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn-submit">
              Tạo hóa đơn
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BillPopup;


