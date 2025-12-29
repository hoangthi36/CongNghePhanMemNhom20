import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ResidentItem from '../../components/residentItem/residentItem';
import ResidentPopup from '../../components/residentPopup/residentPopup';
import MemberPopup from '../../components/memberPopup/memberPopup';
import './Residents.css';

const Residents = () => {
  const [households, setHouseholds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchId, setSearchId] = useState('');
  const [isResidentPopupOpen, setIsResidentPopupOpen] = useState(false);
  const [isMemberPopupOpen, setIsMemberPopupOpen] = useState(false);
  const [editingHousehold, setEditingHousehold] = useState(null);
  const [editingMember, setEditingMember] = useState(null);
  const [selectedHousehold, setSelectedHousehold] = useState(null);
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const headerMenuRef = useRef(null);
  const searchInputRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || '';

  useEffect(() => {
    fetchHouseholds();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (headerMenuRef.current && !headerMenuRef.current.contains(event.target)) {
        setHeaderMenuOpen(false);
      }
    };

    if (headerMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [headerMenuOpen]);

  const fetchHouseholds = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/house-hold/all-households`);
      const data = response.data.households || response.data || [];
      setHouseholds(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching households:', error);
      alert('Không thể tải danh sách hộ gia đình. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchId.trim()) return;
    
    const household = households.find(h => 
      h.identification_head?.toLowerCase() === searchId.trim().toLowerCase()
    );

    if (household) {
      const element = document.getElementById(`household-${household._id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        element.style.backgroundColor = '#fff3cd';
        setTimeout(() => {
          element.style.backgroundColor = '';
        }, 2000);
      }
    } else {
      alert('Không tìm thấy hộ gia đình với ID này.');
    }
  };

  const handleCreateHousehold = () => {
    setEditingHousehold(null);
    setIsResidentPopupOpen(true);
    setHeaderMenuOpen(false);
  };

  const handleDeleteAllHouseholds = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tất cả hộ gia đình? Hành động này không thể hoàn tác!')) {
      return;
    }

    try {
      // Note: API endpoint might need to be adjusted based on actual backend implementation
      await axios.delete(`${API_URL}/house-hold/delete-all-households`);
      setHouseholds([]);
      alert('Đã xóa tất cả hộ gia đình.');
    } catch (error) {
      console.error('Error deleting all households:', error);
      alert('Không thể xóa tất cả hộ gia đình. Vui lòng thử lại.');
    }
    setHeaderMenuOpen(false);
  };

  const handleSaveHousehold = async (householdData) => {
    try {
      if (editingHousehold) {
        // Update household - might need to check if this API exists
        await axios.patch(`${API_URL}/house-hold/update-household/${editingHousehold._id}`, householdData);
        setHouseholds(prev => prev.map(h => 
          h._id === editingHousehold._id ? { ...h, ...householdData } : h
        ));
      } else {
        // Create new household
        await axios.post(`${API_URL}/house-hold/create-household`, householdData);
        fetchHouseholds();
      }
      setIsResidentPopupOpen(false);
      setEditingHousehold(null);
    } catch (error) {
      console.error('Error saving household:', error);
      alert(editingHousehold 
        ? 'Không thể cập nhật hộ gia đình. Vui lòng thử lại.' 
        : 'Không thể tạo hộ gia đình. Vui lòng thử lại.');
    }
  };

  const handleDeleteHousehold = async (householdId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa hộ gia đình này?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/house-hold/delete-household`, {
        data: { householdId }
      });
      setHouseholds(prev => prev.filter(h => h._id !== householdId));
    } catch (error) {
      console.error('Error deleting household:', error);
      alert('Không thể xóa hộ gia đình. Vui lòng thử lại.');
    }
  };

  const handleAddMember = (household) => {
    setSelectedHousehold(household);
    setEditingMember(null);
    setIsMemberPopupOpen(true);
  };

  const handleEditMember = (household, member) => {
    setSelectedHousehold(household);
    setEditingMember(member);
    setIsMemberPopupOpen(true);
  };

  const handleDeleteMember = async (householdId, memberId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa thành viên này?')) {
      return;
    }

    try {
      await axios.patch(`${API_URL}/house-hold/remove-member`, {
        householdId,
        memberId
      });
      fetchHouseholds();
    } catch (error) {
      console.error('Error deleting member:', error);
      alert('Không thể xóa thành viên. Vui lòng thử lại.');
    }
  };

  const handleSaveMember = async (memberData) => {
    try {
      if (editingMember) {
        // Update member - might need custom endpoint
        await axios.patch(`${API_URL}/house-hold/update-member`, {
          householdId: selectedHousehold._id,
          memberId: editingMember._id,
          ...memberData
        });
      } else {
        // Add new member
        await axios.patch(`${API_URL}/house-hold/add-member`, {
          householdId: selectedHousehold._id,
          ...memberData
        });
      }
      fetchHouseholds();
      setIsMemberPopupOpen(false);
      setSelectedHousehold(null);
      setEditingMember(null);
    } catch (error) {
      console.error('Error saving member:', error);
      alert(editingMember 
        ? 'Không thể cập nhật thành viên. Vui lòng thử lại.' 
        : 'Không thể thêm thành viên. Vui lòng thử lại.');
    }
  };

  return (
    <div className="residents-page">
      <div className="residents-header">
        <h1>Quản lý hộ gia đình</h1>
        <div className="header-actions">
          <div className="search-container">
            <input
              ref={searchInputRef}
              type="text"
              className="search-input"
              placeholder="Tìm kiếm theo ID chủ hộ (CCCD)..."
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button className="search-btn" onClick={handleSearch}>
              🔍
            </button>
          </div>
          <div className="header-menu-container" ref={headerMenuRef}>
            <button 
              className="header-menu-toggle"
              onClick={() => setHeaderMenuOpen(!headerMenuOpen)}
            >
              <span className="menu-dots">⋯</span>
            </button>
            {headerMenuOpen && (
              <div className="header-menu-dropdown">
                <button 
                  className="menu-item menu-item-add"
                  onClick={handleCreateHousehold}
                >
                  <span className="menu-icon">➕</span>
                  <span>Thêm hộ gia đình</span>
                </button>
                <button 
                  className="menu-item menu-item-delete-all"
                  onClick={handleDeleteAllHouseholds}
                >
                  <span className="menu-icon">🗑️</span>
                  <span>Xóa tất cả hộ</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="residents-container">
        {loading && (
          <div className="loading-indicator">
            <div className="loading-spinner"></div>
            <p>Đang tải...</p>
          </div>
        )}

        {!loading && households.length === 0 && (
          <div className="empty-state">
            <p>Chưa có hộ gia đình nào.</p>
          </div>
        )}

        {!loading && households.map((household) => (
          <ResidentItem
            key={household._id}
            household={household}
            onDelete={handleDeleteHousehold}
            onAddMember={handleAddMember}
            onEditMember={handleEditMember}
            onDeleteMember={handleDeleteMember}
          />
        ))}
      </div>

      {isResidentPopupOpen && (
        <ResidentPopup
          household={editingHousehold}
          onClose={() => {
            setIsResidentPopupOpen(false);
            setEditingHousehold(null);
          }}
          onSave={handleSaveHousehold}
        />
      )}

      {isMemberPopupOpen && selectedHousehold && (
        <MemberPopup
          member={editingMember}
          onClose={() => {
            setIsMemberPopupOpen(false);
            setSelectedHousehold(null);
            setEditingMember(null);
          }}
          onSave={handleSaveMember}
        />
      )}
    </div>
  );
};

export default Residents;
