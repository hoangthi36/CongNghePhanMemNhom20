import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './OverDue.css';

const OverDue = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedBillType, setSelectedBillType] = useState(null);
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchOverdueData();
  }, [month, year]);

  const fetchOverdueData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {};
      if (month) params.month = month;
      if (year) params.year = year;

      const response = await axios.get(`${API_URL}/bills/overdue-households`, { params });
      
      if (response.data) {
        setData(response.data);
        // Reset selected bill type when data changes
        setSelectedBillType(null);
      }
    } catch (error) {
      console.error('Error fetching overdue data:', error);
      setError('Không thể tải dữ liệu quá hạn. Vui lòng thử lại sau.');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

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

  const getBillTypeIcon = (type) => {
    const icons = {
      electricity: '⚡',
      water: '💧',
      garbage: '🗑️',
      management: '🏢',
      parking: '🚗',
      other: '📄'
    };
    return icons[type] || '📄';
  };

  const handleBillTypeClick = (billType) => {
    if (selectedBillType === billType) {
      setSelectedBillType(null);
    } else {
      setSelectedBillType(billType);
    }
  };

  // Get current year and month for defaults
  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let i = currentYear - 5; i <= currentYear + 2; i++) {
    yearOptions.push(i);
  }

  // Filter data based on selected bill type
  const displayData = selectedBillType
    ? data?.data.filter(item => item.billType === selectedBillType)
    : data?.data;

  return (
    <div className="overdue-page">
      <div className="overdue-header">
        <h1>Quản lý hộ quá hạn</h1>
        
        {/* Month/Year Filter */}
        <div className="date-filter-bar">
          <div className="date-filter-group">
            <label htmlFor="month-select">Tháng:</label>
            <select
              id="month-select"
              className="date-select"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            >
              <option value="">Tất cả</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>
                  Tháng {m}
                </option>
              ))}
            </select>
          </div>

          <div className="date-filter-group">
            <label htmlFor="year-select">Năm:</label>
            <select
              id="year-select"
              className="date-select"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            >
              <option value="">Tất cả</option>
              {yearOptions.map(y => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-indicator">
          <div className="loading-spinner"></div>
          <p>Đang tải dữ liệu quá hạn...</p>
        </div>
      ) : error ? (
        <div className="error-state">
          <p>{error}</p>
        </div>
      ) : !data || !data.data || data.data.length === 0 ? (
        <div className="empty-state">
          <p>Không có hộ nào quá hạn.</p>
        </div>
      ) : (
        <>
          {/* Summary */}
          {data.summary && (
            <div className="summary-card">
              <h2>Tổng quan</h2>
              <div className="summary-grid">
                <div className="summary-item">
                  <span className="summary-label">Tổng số tiền quá hạn:</span>
                  <span className="summary-value">{formatCurrency(data.summary.totalOverdueAmount)}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Tổng số hộ quá hạn:</span>
                  <span className="summary-value">{data.summary.totalHouseholds}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Số loại hóa đơn:</span>
                  <span className="summary-value">{data.summary.totalBillTypes}</span>
                </div>
              </div>
            </div>
          )}

          {/* Bill Type Categories */}
          <div className="bill-types-section">
            <h2>Phân loại theo loại hóa đơn</h2>
            <div className="bill-types-grid">
              {data.data.map((item) => (
                <div
                  key={item._id}
                  className={`bill-type-card ${selectedBillType === item.billType ? 'active' : ''}`}
                  onClick={() => handleBillTypeClick(item.billType)}
                >
                  <div className="bill-type-header">
                    <span className="bill-type-icon">{getBillTypeIcon(item.billType)}</span>
                    <span className="bill-type-name">{getBillTypeLabel(item.billType)}</span>
                  </div>
                  <div className="bill-type-stats">
                    <div className="stat-item">
                      <span className="stat-label">Số hộ:</span>
                      <span className="stat-value">{item.totalHouseholds}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Tổng tiền:</span>
                      <span className="stat-value">{formatCurrency(item.totalOverdueAmount)}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Số hóa đơn:</span>
                      <span className="stat-value">{item.totalOverdueItems}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Households List */}
          {selectedBillType && displayData && displayData.length > 0 && displayData[0]?.households && displayData[0].households.length > 0 && (
            <div className="households-section">
              <h2>
                Danh sách hộ quá hạn - {getBillTypeLabel(selectedBillType)}
              </h2>
              <div className="households-grid">
                {displayData[0].households.map((household, index) => (
                  <div key={index} className="household-card">
                    <div className="household-header">
                      <h3>{household.householdName}</h3>
                      {household.overdueCount > 2 && (
                        <div className="multiple-bills-badge">
                          {household.overdueCount} hóa đơn
                        </div>
                      )}
                    </div>
                    <div className="household-body">
                      <div className="household-info-row">
                        <span className="info-label">Mã định danh:</span>
                        <span className="info-value">{household.identification_head}</span>
                      </div>
                      <div className="household-info-row">
                        <span className="info-label">Địa chỉ:</span>
                        <span className="info-value">{household.address}</span>
                      </div>
                      <div className="household-info-row">
                        <span className="info-label">Loại hóa đơn:</span>
                        <span className="info-value">{getBillTypeLabel(household.billType)}</span>
                      </div>
                      {household.overdueCount > 2 && (
                        <>
                          <div className="household-info-row highlight">
                            <span className="info-label">Tổng tiền cộng dồn:</span>
                            <span className="info-value amount">{formatCurrency(household.totalOverdueAmount)}</span>
                          </div>
                          <div className="household-info-row highlight">
                            <span className="info-label">Số lượng hóa đơn:</span>
                            <span className="info-value">{household.overdueCount}</span>
                          </div>
                        </>
                      )}
                      {household.overdueCount <= 2 && (
                        <div className="household-info-row highlight">
                          <span className="info-label">Số tiền quá hạn:</span>
                          <span className="info-value amount">{formatCurrency(household.totalOverdueAmount)}</span>
                        </div>
                      )}
                      <div className="household-info-row">
                        <span className="info-label">Hạn nộp gần nhất:</span>
                        <span className="info-value">{formatDate(household.latestDueDate)}</span>
                      </div>
                      <div className="household-info-row">
                        <span className="info-label">Số ngày quá hạn:</span>
                        <span className="info-value overdue-days">{Math.round(household.daysOverdue)} ngày</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Show message when a bill type is selected but no households */}
          {selectedBillType && displayData && displayData.length > 0 && (!displayData[0]?.households || displayData[0].households.length === 0) && (
            <div className="empty-state">
              <p>Không có hộ nào quá hạn cho loại hóa đơn này.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OverDue;
