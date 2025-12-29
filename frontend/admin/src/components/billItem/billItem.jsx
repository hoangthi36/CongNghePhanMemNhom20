import React from 'react';
import './billItem.css';

const BillItem = ({ billItem, billType, householdInfo, billId, onToggleStatus }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
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

  const isPaid = billItem.status;
  const showIndex = billType === 'electricity' || billType === 'water';

  return (
    <div className={`bill-item ${isPaid ? 'paid' : 'unpaid'}`}>
      <div className="bill-item-header">
        <div className="bill-type-badge">
          <span className="bill-type-icon">{getBillTypeIcon(billType)}</span>
          <span className="bill-type-text">{getBillTypeLabel(billType)}</span>
        </div>
        <div className={`bill-status ${isPaid ? 'status-paid' : 'status-unpaid'}`}>
          {isPaid ? '✓ Đã thanh toán' : '○ Chưa thanh toán'}
        </div>
      </div>

      <div className="bill-item-body">
        {householdInfo && (
          <div className="bill-info-row">
            <span className="info-label">Chủ hộ:</span>
            <span className="info-value">{householdInfo.namehousehold || 'N/A'}</span>
          </div>
        )}

        {householdInfo && (
          <div className="bill-info-row">
            <span className="info-label">Mã định danh:</span>
            <span className="info-value">{householdInfo.identification_head || 'N/A'}</span>
          </div>
        )}

        {showIndex && (
          <>
            <div className="bill-info-row">
              <span className="info-label">Chỉ số cũ:</span>
              <span className="info-value">{billItem.oldIndex}</span>
            </div>
            <div className="bill-info-row">
              <span className="info-label">Chỉ số mới:</span>
              <span className="info-value">{billItem.newIndex}</span>
            </div>
            <div className="bill-info-row">
              <span className="info-label">Số lượng tiêu thụ:</span>
              <span className="info-value">{billItem.newIndex - billItem.oldIndex} đơn vị</span>
            </div>
          </>
        )}

        <div className="bill-info-row">
          <span className="info-label">Đơn giá:</span>
          <span className="info-value">{formatCurrency(billItem.unitPrice)}</span>
        </div>

        <div className="bill-info-row highlight">
          <span className="info-label">Tổng tiền:</span>
          <span className="info-value amount">{formatCurrency(billItem.amount)}</span>
        </div>

        <div className="bill-info-row">
          <span className="info-label">Hạn nộp:</span>
          <span className="info-value">{formatDate(billItem.dueDate)}</span>
        </div>

        {isPaid && billItem.paidAt && (
          <div className="bill-info-row">
            <span className="info-label">Ngày thanh toán:</span>
            <span className="info-value">{formatDate(billItem.paidAt)}</span>
          </div>
        )}

        <div className="bill-info-row">
          <span className="info-label">Ngày tạo:</span>
          <span className="info-value">{formatDate(billItem.createdAt)}</span>
        </div>
      </div>

      <div className="bill-item-footer">
        <button
          className={`toggle-status-btn ${isPaid ? 'btn-unpaid' : 'btn-paid'}`}
          onClick={() => onToggleStatus(billId, billItem._id, !isPaid)}
        >
          {isPaid ? 'Đánh dấu chưa thanh toán' : 'Đánh dấu đã thanh toán'}
        </button>
      </div>
    </div>
  );
};

export default BillItem;
