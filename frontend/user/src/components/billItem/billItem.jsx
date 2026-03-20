import React from 'react';
import './billItem.css';

const BillItem = ({ billType, amount, status, createdAt }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isPaid = status === 'Đã thanh toán';

  return (
    <div className={`bill-item-card ${isPaid ? 'paid' : 'unpaid'}`}>
      <div className="bill-item-header">
        <div className="bill-item-type">
          <span className="type-icon">
            {billType === 'Tiền điện' && '⚡'}
            {billType === 'Tiền nước' && '💧'}
            {billType === 'Tiền rác' && '🗑️'}
            {billType === 'Phí quản lý' && '🏢'}
            {billType === 'Phí gửi xe' && '🚗'}
            {!['Tiền điện', 'Tiền nước', 'Tiền rác', 'Phí quản lý', 'Phí gửi xe'].includes(billType) && '📄'}
          </span>
          <span className="type-label">{billType}</span>
        </div>
        <div className={`bill-item-status ${isPaid ? 'status-paid' : 'status-unpaid'}`}>
          <span className="status-icon">{isPaid ? '✓' : '○'}</span>
          <span className="status-text">{status}</span>
        </div>
      </div>

      <div className="bill-item-body">
        <div className="bill-item-amount">
          <span className="amount-label">Số tiền:</span>
          <span className="amount-value">{formatCurrency(amount)}</span>
        </div>
        {createdAt && (
          <div className="bill-item-date">
            <span className="date-label">Ngày tạo:</span>
            <span className="date-value">{formatDate(createdAt)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillItem;
