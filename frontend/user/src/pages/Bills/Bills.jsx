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
    if (statusFilter === 'all') {
      return billsList;
    }
    
    return billsList.filter((bill) => {
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
  };

  const filteredBills = filterBills(bills);

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

              return (
                <BillItem
                  key={bill._id}
                  billType={billType}
                  amount={amount}
                  status={status}
                  createdAt={createdAt}
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
