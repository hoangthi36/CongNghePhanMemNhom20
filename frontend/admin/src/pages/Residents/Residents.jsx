import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ResidentItem from '../../components/residentItem/residentItem';
import ResidentPopup from '../../components/residentPopup/residentPopup';
import MemberPopup from '../../components/memberPopup/memberPopup';
import './Residents.css';


const Residents = () => {
  const [households, setHouseholds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isResidentPopupOpen, setIsResidentPopupOpen] = useState(false);
  const [isMemberPopupOpen, setIsMemberPopupOpen] = useState(false);
  const [selectedHouseholdId, setSelectedHouseholdId] = useState(null);
  const householdsRef = useRef([]);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  
  // Helper to build API endpoint URL
  const getApiUrl = (endpoint) => {
    // Remove leading slash from endpoint if present
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    // Check if API_URL already contains /api
    if (API_URL.includes('/api')) {
      return `${API_URL}/${cleanEndpoint}`;
    }
    return `${API_URL}/api/${cleanEndpoint}`;
  };

  // Fetch all households
  const fetchHouseholds = async () => {
    try {
      setLoading(true);
      const response = await axios.get(getApiUrl('house-hold/all-households'), {
        params: { page: 1 }
      });
      const data = response.data || [];
      setHouseholds(data);
      householdsRef.current = data;
    } catch (error) {
      console.error('Error fetching households:', error);
      // Fallback to JSON file if API fails
      try {
        const response = await fetch('/src/pages/Residents/Residents.json');
        const data = await response.json();
        setHouseholds(data);
        householdsRef.current = data;
      } catch (jsonError) {
        console.error('Error loading JSON:', jsonError);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHouseholds();
  }, []);

  // Search functionality - scroll to household
  const handleSearch = () => {
    if (!searchQuery.trim()) return;

    const foundHousehold = households.find(
      h => h.identification_head === searchQuery.trim()
    );

    if (foundHousehold) {
      const element = document.getElementById(`household-${foundHousehold._id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Highlight the element
        element.style.transition = 'all 0.3s';
        element.style.boxShadow = '0 0 20px rgba(102, 126, 234, 0.5)';
        setTimeout(() => {
          element.style.boxShadow = '';
        }, 2000);
      }
    } else {
      alert('Không tìm thấy hộ gia đình với CCCD này');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Create new household
  const handleCreateHousehold = async (formData) => {
    try {
      const response = await axios.post(
        getApiUrl('house-hold/create-household'),
        {
          name: formData.name,
          address: formData.address,
          identification_head: formData.identification_head
        }
      );
      
      // Refresh households list
      await fetchHouseholds();
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  // Add member to household
  const handleAddMember = (householdId) => {
    setSelectedHouseholdId(householdId);
    setIsMemberPopupOpen(true);
  };

  const handleSaveMember = async (memberData) => {
    try {
      // Send member data to add new member
      const response = await axios.patch(
        getApiUrl('house-hold/add-member'),
        {
          houseHoldId: memberData.houseHoldId,
          identification: memberData.identification,
          name: memberData.name,
          relationship: memberData.relationship
        }
      );
      
      await fetchHouseholds();
      return response.data;
    } catch (error) {
      // Provide helpful error message
      const errorMsg = error.response?.data?.message || error.message;
      if (errorMsg.includes('not found') || errorMsg.includes('Invalid')) {
        throw new Error('Không tìm thấy người dùng với CCCD này. Vui lòng kiểm tra lại hoặc đảm bảo người dùng đã được đăng ký trong hệ thống.');
      }
      throw error;
    }
  };

  // Delete member from household
  const handleDeleteMember = async (memberIdentification, householdId, isHead, memberName) => {
    try {
      if (isHead) {
        // Xác nhận xóa chủ hộ - sẽ chuyển quyền cho thành viên thứ 2
        const confirmMessage = `Bạn có chắc chắn muốn xóa chủ hộ "${memberName}"?\n\n` +
          `Hệ thống sẽ tự động chuyển quyền chủ hộ cho thành viên tiếp theo trong hộ gia đình.`;
        
        if (!window.confirm(confirmMessage)) {
          return;
        }

        // Use handle-head-removal endpoint - backend sẽ tự tìm chủ hộ và chuyển quyền
        const response = await axios.delete(
          getApiUrl(`house-hold/handle-head-removal/${householdId}`)
        );
        
        if (response.data) {
          alert(`Đã xóa chủ hộ và chuyển quyền cho ${response.data.newHead || 'thành viên tiếp theo'}`);
        }
      } else {
        // Use remove-member endpoint - backend cần identification (CCCD/CMND)
        await axios.patch(
          getApiUrl('house-hold/remove-member'),
          { identification: memberIdentification }
        );
        alert('Đã xóa thành viên khỏi hộ gia đình');
      }
      
      // Refresh danh sách hộ gia đình
      await fetchHouseholds();
    } catch (error) {
      console.error('Error deleting member:', error);
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi xóa thành viên';
      alert(errorMessage);
    }
  };

  // Delete household
  const handleDeleteHousehold = async (householdId) => {
    try {
      // Backend expects householdId in URL params
      // Backend sẽ tự động xóa householdId khỏi tất cả users thuộc hộ này
      const response = await axios.delete(
        getApiUrl(`house-hold/delete-household/${householdId}`)
      );
      
      if (response.data) {
        alert(`Đã xóa hộ gia đình thành công. ${response.data.affectedMembers || 0} thành viên đã được cập nhật.`);
      }
      
      await fetchHouseholds();
    } catch (error) {
      console.error('Error deleting household:', error);
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi xóa hộ gia đình';
      alert(errorMessage);
    }
  };


  return (
    <div className="residents-page">
      <div className="residents-header">
        <h1>Quản lý hộ gia đình</h1>
        <div className="header-actions">
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Tìm kiếm theo CCCD chủ hộ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button className="search-btn" onClick={handleSearch}>
              🔍
            </button>
          </div>
          <button
            className="header-menu-toggle"
            onClick={() => setIsResidentPopupOpen(true)}
            style={{
              background: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              color: '#667eea',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#f0f4ff';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'white';
              e.target.style.transform = 'scale(1)';
            }}
          >
            ➕ Thêm hộ gia đình
          </button>
        </div>
      </div>

      <div className="residents-container">
        {loading ? (
          <div className="loading-indicator">
            <div className="loading-spinner"></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : households.length === 0 ? (
          <div className="empty-state">
            <p>Chưa có hộ gia đình nào. Hãy thêm hộ gia đình đầu tiên!</p>
          </div>
        ) : (
          households.map((household) => (
            <ResidentItem
              key={household._id}
              household={household}
              onViewMembers={() => {}}
              onAddMember={handleAddMember}
              onDeleteHousehold={handleDeleteHousehold}
              onDeleteMember={handleDeleteMember}
            />
          ))
        )}
      </div>

      <ResidentPopup
        isOpen={isResidentPopupOpen}
        onClose={() => setIsResidentPopupOpen(false)}
        onSubmit={handleCreateHousehold}
      />

      <MemberPopup
        isOpen={isMemberPopupOpen}
        onClose={() => {
          setIsMemberPopupOpen(false);
          setSelectedHouseholdId(null);
        }}
        onSubmit={handleSaveMember}
        householdId={selectedHouseholdId}
      />
    </div>
  );
};

export default Residents;
