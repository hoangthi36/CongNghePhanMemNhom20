import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3 className="footer-title">Ban Quản Lý</h3>
          <div className="footer-info">
            <div className="footer-item">
              <span className="footer-icon">📞</span>
              <span className="footer-label">Số điện thoại:</span>
              <a href="tel:0392907087" className="footer-value">0000</a>
            </div>
            <div className="footer-item">
              <span className="footer-icon">🏢</span>
              <span className="footer-label">Văn phòng làm việc:</span>
              <span className="footer-value">P101 tòa A</span>
            </div>
          </div>
        </div>
        <div className="footer-copyright">
          <p>&copy; 2025 Blue Moon. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
