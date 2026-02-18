import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Statistics.css';

const Statistics = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [totalHouseholds, setTotalHouseholds] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [overdueHouseholds, setOverdueHouseholds] = useState(0);
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || '';

  // Generate year options (current year and 2 years before)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 3 }, (_, i) => currentYear - i);

  useEffect(() => {
    fetchStatistics();
  }, [selectedYear, selectedMonth]);

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      // Fetch total households
      const householdsResponse = await axios.get(`${API_URL}/house-hold/statistics`);
      setTotalHouseholds(householdsResponse.data.totalHouseholds || 0);

      // Fetch monthly revenue
      const revenueResponse = await axios.get(`${API_URL}/bills/revenue/specific-month`, {
        params: {
          year: selectedYear,
          month: selectedMonth
        }
      });
      setMonthlyRevenue(revenueResponse.data.summary?.totalRevenue || 0);

      // Fetch overdue households
      const overdueResponse = await axios.get(`${API_URL}/bills/count-unpaid-households`, {
        params: {
          year: selectedYear,
          month: selectedMonth
        }
      });
      setOverdueHouseholds(overdueResponse.data.totalHouseholdsWithUnpaidBills || 0);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      alert('Không thể tải dữ liệu thống kê. Vui lòng thử lại.');
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

  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  return (
    <div className="stats-page">
      <div className="stats-header">
        <h1 className="stats-title">
          <span className="title-icon">📊</span>
          Thống kê
        </h1>
        
        {/* Month and Year Selector */}
        <div className="stats-selector">
          <div className="selector-group">
            <span className="selector-icon">📅</span>
            <label htmlFor="month-select">Tháng:</label>
            <select
              id="month-select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="selector-input"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                <option key={month} value={month}>
                  {monthNames[month - 1]}
                </option>
              ))}
            </select>
          </div>
          
          <div className="selector-group">
            <label htmlFor="year-select">Năm:</label>
            <select
              id="year-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="selector-input"
            >
              {years.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {loading ? (
        <div className="loading-indicator">
          <div className="loading-spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : (
        <div className="stats-grid">
          <div className="stat-card stat-card-primary">
            <div className="stat-card-header">
              <div className="stat-icon stat-icon-primary">🏠</div>
            </div>
            <div className="stat-content">
              <div className="stat-label">Tổng số hộ gia đình</div>
              <div className="stat-value">{totalHouseholds.toLocaleString('vi-VN')}</div>
              <div className="stat-unit">hộ</div>
            </div>
          </div>

          <div className="stat-card stat-card-success">
            <div className="stat-card-header">
              <div className="stat-icon stat-icon-success">💰</div>
            </div>
            <div className="stat-content">
              <div className="stat-label">Doanh thu {monthNames[selectedMonth - 1]}/{selectedYear}</div>
              <div className="stat-value">{formatCurrency(monthlyRevenue)}</div>
            </div>
          </div>

          <div className="stat-card stat-card-warning">
            <div className="stat-card-header">
              <div className="stat-icon stat-icon-warning">⚠️</div>
            </div>
            <div className="stat-content">
              <div className="stat-label">Số hộ quá hạn ({monthNames[selectedMonth - 1]}/{selectedYear})</div>
              <div className="stat-value">{overdueHouseholds.toLocaleString('vi-VN')}</div>
              <div className="stat-unit">hộ</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Statistics;