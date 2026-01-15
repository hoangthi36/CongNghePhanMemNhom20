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
  const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'electricity', 'water', 'garbage', 'management', 'parking', 'other'
  const [monthFilter, setMonthFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
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
  }, [bills, statusFilter, searchId, typeFilter, monthFilter, yearFilter]);

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

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(bill => bill.type === typeFilter);
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

    // Filter by month and year based on createdAt
    filtered = filtered.map(bill => {
      const filteredItems = bill.billItem.filter(item => {
        if (!item.createdAt) return true;
        
        const itemDate = new Date(item.createdAt);
        const itemMonth = itemDate.getMonth() + 1; // getMonth() returns 0-11
        const itemYear = itemDate.getFullYear();

        let matchesMonth = true;
        let matchesYear = true;

        if (monthFilter && monthFilter !== '') {
          matchesMonth = itemMonth === parseInt(monthFilter);
        }

        if (yearFilter && yearFilter !== '') {
          matchesYear = itemYear === parseInt(yearFilter);
        }

        return matchesMonth && matchesYear;
      });

      if (filteredItems.length > 0) {
        return { ...bill, billItem: filteredItems };
      }
      return null;
    }).filter(bill => bill !== null);

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

  const handleTypeFilter = (type) => {
    setTypeFilter(type);
  };

  // Get current year and month for defaults
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  
  // Generate year options (last 5 years and next 2 years)
  const yearOptions = [];
  for (let i = currentYear - 5; i <= currentYear + 2; i++) {
    yearOptions.push(i);
  }

  const getBillTypeLabel = (type) => {
    const labels = {
      electricity: 'Điện',
      water: 'Nước',
      garbage: 'Rác',
      management: 'Quản lý',
      parking: 'Gửi xe',
      other: 'Khác'
    };
    return labels[type] || type;
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

        {/* Filter bar for type, month, and year */}
        <div className="filters-bar">
          <div className="type-filters">
            <button
              className={`type-filter-btn ${typeFilter === 'all' ? 'active' : ''}`}
              onClick={() => handleTypeFilter('all')}
            >
              Tất cả
            </button>
            <button
              className={`type-filter-btn ${typeFilter === 'electricity' ? 'active' : ''}`}
              onClick={() => handleTypeFilter('electricity')}
            >
              ⚡ Điện
            </button>
            <button
              className={`type-filter-btn ${typeFilter === 'water' ? 'active' : ''}`}
              onClick={() => handleTypeFilter('water')}
            >
              💧 Nước
            </button>
            <button
              className={`type-filter-btn ${typeFilter === 'garbage' ? 'active' : ''}`}
              onClick={() => handleTypeFilter('garbage')}
            >
              🗑️ Rác
            </button>
            <button
              className={`type-filter-btn ${typeFilter === 'management' ? 'active' : ''}`}
              onClick={() => handleTypeFilter('management')}
            >
              🏢 Quản lý
            </button>
            <button
              className={`type-filter-btn ${typeFilter === 'parking' ? 'active' : ''}`}
              onClick={() => handleTypeFilter('parking')}
            >
              🚗 Gửi xe
            </button>
            <button
              className={`type-filter-btn ${typeFilter === 'other' ? 'active' : ''}`}
              onClick={() => handleTypeFilter('other')}
            >
              📄 Khác
            </button>
          </div>

          <div className="date-filters">
            <div className="date-filter-group">
              <label htmlFor="month-filter">Tháng:</label>
              <select
                id="month-filter"
                className="date-select"
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
              >
                <option value="">Tất cả</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                  <option key={month} value={month}>
                    Tháng {month}
                  </option>
                ))}
              </select>
            </div>

            <div className="date-filter-group">
              <label htmlFor="year-filter">Năm:</label>
              <select
                id="year-filter"
                className="date-select"
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
              >
                <option value="">Tất cả</option>
                {yearOptions.map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
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
