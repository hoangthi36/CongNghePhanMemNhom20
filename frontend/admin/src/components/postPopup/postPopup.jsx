import React, { useState, useEffect } from 'react';
import './postPopup.css';

const PostPopup = ({ post, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    imageUrl: '',
    isPinned: false
  });

  const isEditMode = !!post;

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title || '',
        content: post.content || '',
        imageUrl: post.imageUrl || '',
        isPinned: post.isPinned || false
      });
    } else {
      // Reset form for new post
      setFormData({
        title: '',
        content: '',
        imageUrl: '',
        isPinned: false
      });
    }
  }, [post]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Vui lòng điền đầy đủ tiêu đề và nội dung');
      return;
    }
    onSave(formData);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="popup-overlay" onClick={handleOverlayClick}>
      <div className="popup-content">
        <div className="popup-header">
          <h2>{isEditMode ? 'Sửa bài viết' : 'Tạo bài viết mới'}</h2>
          <button className="popup-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form className="popup-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Tiêu đề *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Nhập tiêu đề bài viết"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="content">Nội dung *</label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Nhập nội dung bài viết"
              rows="6"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="imageUrl">URL hình ảnh</label>
            <input
              type="url"
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isPinned"
                checked={formData.isPinned}
                onChange={handleChange}
              />
              <span>Ghim bài viết</span>
            </label>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn-submit">
              {isEditMode ? 'Lưu thay đổi' : 'Đăng bài'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostPopup;
