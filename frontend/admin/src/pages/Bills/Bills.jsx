import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import BillItem from '../../components/billItem/billItem';
import BillPopup from '../../components/billPopup/billPopup';
import './Bills.css';

const Bills = () => {
  const [bills, setBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [searchId, setSearchId] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'paid', 'unpaid'
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const headerMenuRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchBills();
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

  useEffect(() => {
    filterBills();
  }, [bills, statusFilter, searchId]);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/bills/get-bills`);
      
      if (response.data && response.data.bills) {
        setBills(response.data.bills);
      }
    } catch (error) {
      console.error('Error fetching bills:', error);
      alert('Không thể tải danh sách hóa đơn. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const filterBills = () => {
    let filtered = bills;

    // Filter by search ID
    if (searchId.trim()) {
      filtered = filtered.filter(bill => 
        bill.houseHold?.identification_head?.toLowerCase().includes(searchId.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      const isPaid = statusFilter === 'paid';
      filtered = filtered.map(bill => {
        const filteredItems = bill.billItem.filter(item => item.status === isPaid);
        if (filteredItems.length > 0) {
          return { ...bill, billItem: filteredItems };
        }
        return null;
      }).filter(bill => bill !== null);
    }

    setFilteredBills(filtered);
  };

  const handleSearch = () => {
    filterBills();
  };

  const handleCreateBill = async (billData) => {
    try {
      const response = await axios.post(`${API_URL}/bills/create-bill`, billData);
      
      if (response.data && response.data.bill) {
        alert('Tạo hóa đơn thành công!');
        setIsPopupOpen(false);
        fetchBills();
      }
    } catch (error) {
      console.error('Error creating bill:', error);
      const errorMessage = error.response?.data?.message || 'Không thể tạo hóa đơn. Vui lòng thử lại.';
      alert(errorMessage);
    }
  };

  const handleToggleStatus = async (billId, billItemId, newStatus) => {
    try {
      const response = await axios.patch(
        `${API_URL}/bills/update-bill-item/${billId}/${billItemId}`,
        { status: newStatus }
      );

      if (response.data && response.data.bill) {
        // Update local state
        setBills(prevBills => 
          prevBills.map(bill => {
            if (bill._id === billId) {
              return response.data.bill;
            }
            return bill;
          })
        );
      }
    } catch (error) {
      console.error('Error updating bill status:', error);
      const errorMessage = error.response?.data?.message || 'Không thể cập nhật trạng thái. Vui lòng thử lại.';
      alert(errorMessage);
    }
  };

  const handleStatusFilter = (filter) => {
    setStatusFilter(filter);
    setHeaderMenuOpen(false);
  };

  // Flatten bills to show all billItems
  const allBillItems = filteredBills.flatMap(bill => 
    bill.billItem.map(item => ({
      billItem: item,
      billType: bill.type,
      householdInfo: bill.houseHold,
      billId: bill._id
    }))
  );

  return (
    <div className="bills-page">
      <div className="bills-header">
        <h1>Quản lý hóa đơn</h1>
        <div className="header-actions">
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Tìm kiếm theo mã định danh chủ hộ..."
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button className="search-btn" onClick={handleSearch}>
              🔍
            </button>
          </div>

          <button 
            className="add-bill-btn"
            onClick={() => setIsPopupOpen(true)}
          >
            + Thêm hóa đơn
          </button>

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
                  className={`menu-item ${statusFilter === 'all' ? 'active' : ''}`}
                  onClick={() => handleStatusFilter('all')}
                >
                  <span className="menu-icon">📋</span>
                  Tất cả hóa đơn
                </button>
                <button
                  className={`menu-item ${statusFilter === 'unpaid' ? 'active' : ''}`}
                  onClick={() => handleStatusFilter('unpaid')}
                >
                  <span className="menu-icon">○</span>
                  Chưa thanh toán
                </button>
                <button
                  className={`menu-item ${statusFilter === 'paid' ? 'active' : ''}`}
                  onClick={() => handleStatusFilter('paid')}
                >
                  <span className="menu-icon">✓</span>
                  Đã thanh toán
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bills-container">
        {loading ? (
          <div className="loading-indicator">
            <div className="loading-spinner"></div>
            <p>Đang tải danh sách hóa đơn...</p>
          </div>
        ) : allBillItems.length === 0 ? (
          <div className="empty-state">
            <p>
              {searchId.trim() 
                ? 'Không tìm thấy hóa đơn nào với mã định danh này.'
                : statusFilter !== 'all'
                ? `Không có hóa đơn ${statusFilter === 'paid' ? 'đã' : 'chưa'} thanh toán.`
                : 'Chưa có hóa đơn nào.'}
            </p>
          </div>
        ) : (
          <div className="bills-grid">
            {allBillItems.map(({ billItem, billType, householdInfo, billId }, index) => (
              <BillItem
                key={`${billId}-${billItem._id}-${index}`}
                billItem={billItem}
                billType={billType}
                householdInfo={householdInfo}
                billId={billId}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>
        )}
      </div>

      {isPopupOpen && (
        <BillPopup
          onClose={() => setIsPopupOpen(false)}
          onSave={handleCreateBill}
        />
      )}
    </div>
  );
};

export default Bills;
