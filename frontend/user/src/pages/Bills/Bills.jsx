import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BillItem from '../../components/billItem/billItem';
import './Bills.css';

const Bills = () => {
  const [bills, setBills] = useState([]);
  const [household, setHousehold] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'paid', 'unpaid'
  const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'electricity', 'water', 'garbage', 'management', 'parking', 'other'
  const [monthFilter, setMonthFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      setLoading(true);
      setError('');
      
      const userId = sessionStorage.getItem('userId');
      if (!userId) {
        setError('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.');
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_URL}/bills/user/${userId}/bills`);
      
      if (response.data) {
        setHousehold(response.data.household);
        setBills(response.data.bills || []);
      }
    } catch (err) {
      console.error('Error fetching bills:', err);
      const errorMessage = err.response?.data?.message || 'Không thể tải danh sách hóa đơn. Vui lòng thử lại sau.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };


  const getBillTypeLabel = (type) => {
    const typeMap = {
      electricity: 'Tiền điện',
      water: 'Tiền nước',
      garbage: 'Tiền rác',
      management: 'Phí quản lý',
      parking: 'Phí gửi xe',
      other: 'Khác'
    };
    return typeMap[type] || type;
  };

  const getStatusLabel = (status) => {
    if (status === true || status === 'paid') {
      return 'Đã thanh toán';
    }
    return 'Chưa thanh toán';
  };

  const getBillStatus = (billItemStatus) => {
    return billItemStatus === true || billItemStatus === 'paid';
  };

  const filterBills = (billsList) => {
    let filtered = billsList;

    // Lọc theo trạng thái thanh toán
    if (statusFilter !== 'all') {
      filtered = filtered.filter((bill) => {
        const firstBillItem = Array.isArray(bill.billItem) && bill.billItem.length > 0 
          ? bill.billItem[0] 
          : null;
        
        if (!firstBillItem) {
          return false;
        }

        const isPaid = getBillStatus(firstBillItem.status);
        
        if (statusFilter === 'paid') {
          return isPaid;
        } else if (statusFilter === 'unpaid') {
          return !isPaid;
        }
        
        return true;
      });
    }

    // Lọc theo loại bill
    if (typeFilter !== 'all') {
      filtered = filtered.filter((bill) => bill.type === typeFilter);
    }

    // Lọc theo tháng và năm dựa vào createdAt
    if (monthFilter || yearFilter) {
      filtered = filtered.filter((bill) => {
        const firstBillItem = Array.isArray(bill.billItem) && bill.billItem.length > 0 
          ? bill.billItem[0] 
          : null;
        
        if (!firstBillItem || !firstBillItem.createdAt) {
          return false;
        }

        const billDate = new Date(firstBillItem.createdAt);
        const billMonth = billDate.getMonth() + 1; // getMonth() returns 0-11
        const billYear = billDate.getFullYear();

        if (monthFilter && parseInt(monthFilter) !== billMonth) {
          return false;
        }

        if (yearFilter && parseInt(yearFilter) !== billYear) {
          return false;
        }

        return true;
      });
    }

    return filtered;
  };

  const filteredBills = filterBills(bills);

  // Lấy danh sách tháng và năm đầy đủ
  const getAvailableMonthsAndYears = () => {
    // Tháng: luôn hiển thị tất cả 12 tháng
    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    // Năm: từ năm hiện tại trở về trước 10 năm và thêm 2 năm tương lai
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= currentYear - 10; year--) {
      years.push(year);
    }

    return {
      months,
      years
    };
  };

  const { months, years } = getAvailableMonthsAndYears();

  return (
    <div className="bills-page">
      <div className="bills-container">
        <div className="bills-header">
          <h1 className="bills-title">
            <span className="title-icon">📄</span>
            Hóa đơn của tôi
          </h1>
          {household && (
            <div className="household-info">
              <p className="household-name">{household.name}</p>
              <p className="household-address">{household.address}</p>
            </div>
          )}
        </div>

        {/* Filter Buttons */}
        {!loading && !error && bills.length > 0 && (
          <>
            <div className="bills-filter">
              <button
                className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
                onClick={() => setStatusFilter('all')}
              >
                <span className="filter-icon">📋</span>
                <span>Toàn bộ</span>
              </button>
              <button
                className={`filter-btn ${statusFilter === 'paid' ? 'active' : ''}`}
                onClick={() => setStatusFilter('paid')}
              >
                <span className="filter-icon">✓</span>
                <span>Đã thanh toán</span>
              </button>
              <button
                className={`filter-btn ${statusFilter === 'unpaid' ? 'active' : ''}`}
                onClick={() => setStatusFilter('unpaid')}
              >
                <span className="filter-icon">○</span>
                <span>Chưa thanh toán</span>
              </button>
            </div>

            {/* Type Filter */}
            <div className="bills-filter">
              <button
                className={`filter-btn ${typeFilter === 'all' ? 'active' : ''}`}
                onClick={() => setTypeFilter('all')}
              >
                <span>Tất cả loại</span>
              </button>
              <button
                className={`filter-btn ${typeFilter === 'electricity' ? 'active' : ''}`}
                onClick={() => setTypeFilter('electricity')}
              >
                <span>⚡ Tiền điện</span>
              </button>
              <button
                className={`filter-btn ${typeFilter === 'water' ? 'active' : ''}`}
                onClick={() => setTypeFilter('water')}
              >
                <span>💧 Tiền nước</span>
              </button>
              <button
                className={`filter-btn ${typeFilter === 'garbage' ? 'active' : ''}`}
                onClick={() => setTypeFilter('garbage')}
              >
                <span>🗑️ Tiền rác</span>
              </button>
              <button
                className={`filter-btn ${typeFilter === 'management' ? 'active' : ''}`}
                onClick={() => setTypeFilter('management')}
              >
                <span>🏢 Phí quản lý</span>
              </button>
              <button
                className={`filter-btn ${typeFilter === 'parking' ? 'active' : ''}`}
                onClick={() => setTypeFilter('parking')}
              >
                <span>🚗 Phí gửi xe</span>
              </button>
              <button
                className={`filter-btn ${typeFilter === 'other' ? 'active' : ''}`}
                onClick={() => setTypeFilter('other')}
              >
                <span>📄 Khác</span>
              </button>
            </div>

            {/* Month and Year Filter */}
            <div className="bills-date-filter">
              <div className="date-filter-item">
                <label htmlFor="month-filter">Tháng:</label>
                <select
                  id="month-filter"
                  value={monthFilter}
                  onChange={(e) => setMonthFilter(e.target.value)}
                  className="date-select"
                >
                  <option value="">Tất cả</option>
                  {months.map((month) => (
                    <option key={month} value={month}>
                      Tháng {month}
                    </option>
                  ))}
                </select>
              </div>
              <div className="date-filter-item">
                <label htmlFor="year-filter">Năm:</label>
                <select
                  id="year-filter"
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  className="date-select"
                >
                  <option value="">Tất cả</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </>
        )}

        {loading ? (
          <div className="loading-indicator">
            <div className="loading-spinner"></div>
            <p>Đang tải danh sách hóa đơn...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <span className="error-icon">⚠️</span>
            <p>{error}</p>
          </div>
        ) : bills.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📋</span>
            <p>Chưa có hóa đơn nào.</p>
          </div>
        ) : filteredBills.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🔍</span>
            <p>Không tìm thấy hóa đơn nào với bộ lọc đã chọn.</p>
          </div>
        ) : (
          <div className="bills-list">
            {filteredBills.map((bill) => {
              // Lấy billItem đầu tiên từ mảng billItem
              const firstBillItem = Array.isArray(bill.billItem) && bill.billItem.length > 0 
                ? bill.billItem[0] 
                : null;

              if (!firstBillItem) {
                return null;
              }

              const billType = getBillTypeLabel(bill.type);
              const amount = firstBillItem.amount || 0;
              const status = getStatusLabel(firstBillItem.status);
              const createdAt = firstBillItem.createdAt;
              const dueDate = firstBillItem.dueDate;
              const paidAt = firstBillItem.paidAt;
              const oldIndex = firstBillItem.oldIndex;
              const newIndex = firstBillItem.newIndex;
              const unitPrice = firstBillItem.unitPrice;

              return (
                <BillItem
                  key={bill._id}
                  billType={billType}
                  billTypeCode={bill.type}
                  amount={amount}
                  status={status}
                  createdAt={createdAt}
                  dueDate={dueDate}
                  paidAt={paidAt}
                  oldIndex={oldIndex}
                  newIndex={newIndex}
                  unitPrice={unitPrice}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bills;
