import React, { useState, useRef, useEffect } from 'react';
import './residentItem.css';

const ResidentItem = ({ household, onDelete, onAddMember, onEditMember, onDeleteMember }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const handleMenuToggle = (e) => {
    e.stopPropagation();
    setMenuOpen(!menuOpen);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    onDelete(household._id);
  };

  const handleShowMembers = (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    setShowMembers(!showMembers);
  };

  const handleAddMember = (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    onAddMember(household);
  };

  return (
    <div id={`household-${household._id}`} className="resident-item">
      <div className="resident-header">
        <div className="resident-info">
          <h3 className="resident-name">{household.namehousehold || 'Chưa có tên'}</h3>
          <p className="resident-address">📍 {household.address || 'Chưa có địa chỉ'}</p>
        </div>
        <div className="resident-menu-container" ref={menuRef}>
          <button 
            className="menu-toggle"
            onClick={handleMenuToggle}
            title="Menu"
          >
            <span className="menu-dots">⋯</span>
          </button>
          
          {menuOpen && (
            <div className="menu-dropdown">
              <button 
                className="menu-item menu-item-view"
                onClick={handleShowMembers}
              >
                <span className="menu-icon">👥</span>
                <span>{showMembers ? 'Ẩn' : 'Hiển thị'} thành viên</span>
              </button>
              
              <button 
                className="menu-item menu-item-add-member"
                onClick={handleAddMember}
              >
                <span className="menu-icon">➕</span>
                <span>Thêm thành viên</span>
              </button>
              
              <button 
                className="menu-item menu-item-delete"
                onClick={handleDelete}
              >
                <span className="menu-icon">🗑️</span>
                <span>Xóa hộ gia đình</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="resident-details">
        <div className="detail-row">
          <span className="detail-label">Chủ hộ:</span>
          <span className="detail-value">{household.namehead || 'Chưa có'}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">ID chủ hộ:</span>
          <span className="detail-value">{household.identification_head || 'Chưa có'}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Số thành viên:</span>
          <span className="detail-value">{household.members?.length || 0}</span>
        </div>
      </div>

      {showMembers && (
        <div className="members-section">
          <h4 className="members-title">Danh sách thành viên</h4>
          {household.members && household.members.length > 0 ? (
            <div className="members-list">
              {household.members.map((member) => (
                <div key={member._id} className="member-card">
                  <div className="member-info">
                    <div className="member-detail">
                      <span className="member-label">ID:</span>
                      <span className="member-value">{member.identification || 'N/A'}</span>
                    </div>
                    <div className="member-detail">
                      <span className="member-label">Tên:</span>
                      <span className="member-value">{member.name || 'N/A'}</span>
                    </div>
                    <div className="member-detail">
                      <span className="member-label">Quan hệ:</span>
                      <span className="member-value">{member.relationship || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="member-actions">
                    <button 
                      className="btn-member btn-edit-member"
                      onClick={() => onEditMember(household, member)}
                      title="Sửa thành viên"
                    >
                      ✏️
                    </button>
                    <button 
                      className="btn-member btn-delete-member"
                      onClick={() => onDeleteMember(household._id, member._id)}
                      title="Xóa thành viên"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-members">Chưa có thành viên nào</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ResidentItem;



