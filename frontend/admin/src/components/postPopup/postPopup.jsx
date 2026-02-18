import React, { useState, useEffect, useRef } from 'react';
import './postPopup.css';

const PostPopup = ({ post, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    imageUrl: '',
    isPinned: false
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [fileError, setFileError] = useState('');
  const fileInputRef = useRef(null);

  const isEditMode = !!post;
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title || '',
        content: post.content || '',
        imageUrl: post.imageUrl || '',
        isPinned: post.isPinned || false
      });
      setImagePreview(post.imageUrl || null);
      setSelectedFile(null);
    } else {
      // Reset form for new post
      setFormData({
        title: '',
        content: '',
        imageUrl: '',
        isPinned: false
      });
      setImagePreview(null);
      setSelectedFile(null);
    }
    setFileError('');
  }, [post]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFileError('');

    if (!file) {
      setSelectedFile(null);
      setImagePreview(null);
      return;
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setFileError('Chỉ chấp nhận file ảnh định dạng JPG, JPEG hoặc PNG');
      setSelectedFile(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setFileError('Kích thước file quá lớn. Tối đa 5MB');
      setSelectedFile(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview(isEditMode && post?.imageUrl ? post.imageUrl : null);
    setFileError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Vui lòng điền đầy đủ tiêu đề và nội dung');
      return;
    }
    
    if (fileError) {
      alert(fileError);
      return;
    }

    // Pass both formData and selectedFile to parent
    onSave({
      ...formData,
      file: selectedFile
    });
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
            <label htmlFor="image">Hình ảnh</label>
            <div className="file-upload-container">
              <input
                type="file"
                id="image"
                name="image"
                ref={fileInputRef}
                accept="image/jpeg,image/jpg,image/png"
                onChange={handleFileChange}
                className="file-input"
              />
              <label htmlFor="image" className="file-input-label">
                <span className="file-input-icon">📷</span>
                <span className="file-input-text">
                  {selectedFile ? selectedFile.name : 'Chọn file ảnh từ máy (JPG, PNG - tối đa 5MB)'}
                </span>
              </label>
              {fileError && (
                <p className="file-error">{fileError}</p>
              )}
              {imagePreview && (
                <div className="image-preview-container">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="image-preview"
                  />
                  <button
                    type="button"
                    className="remove-image-btn"
                    onClick={handleRemoveImage}
                    title="Xóa ảnh"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
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
