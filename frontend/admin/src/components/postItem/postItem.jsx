import React, { useState, useRef, useEffect } from 'react';
import './postItem.css';

const PostItem = ({ post, onDelete, onTogglePin, onUpdate }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const handleMenuToggle = (e) => {
    e.stopPropagation();
    setMenuOpen(!menuOpen);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
      onDelete(post._id);
    }
  };

  const handleTogglePin = (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    onTogglePin(post._id);
  };

  const handleUpdate = (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    onUpdate(post);
  };

  return (
    <div className={`post-item ${post.isPinned ? 'pinned' : ''}`}>
      <div className="post-header">
        {post.isPinned && <span className="pin-badge">📌 Ghim</span>}
        <div className="post-menu-container" ref={menuRef}>
          <button 
            className="menu-toggle"
            onClick={handleMenuToggle}
            title="Menu"
          >
            <span className="menu-dots">⋯</span>
          </button>
          
          {menuOpen && (
            <div className="menu-dropdown">
              <button 
                className="menu-item menu-item-pin"
                onClick={handleTogglePin}
              >
                <span className="menu-icon">{post.isPinned ? '📌' : '📍'}</span>
                <span>{post.isPinned ? 'Bỏ ghim' : 'Ghim bài viết'}</span>
              </button>
              
              <button 
                className="menu-item menu-item-edit"
                onClick={handleUpdate}
              >
                <span className="menu-icon">✏️</span>
                <span>Sửa bài viết</span>
              </button>
              
              <button 
                className="menu-item menu-item-delete"
                onClick={handleDelete}
              >
                <span className="menu-icon">🗑️</span>
                <span>Xóa bài viết</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {post.imageUrl && (
        <img 
          src={post.imageUrl.startsWith('http') ? post.imageUrl : `${import.meta.env.VITE_API_URL || ''}${post.imageUrl}`} 
          alt={post.title} 
          className="post-image"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      )}

      <div className="post-body">
        <h3 className="post-title">{post.title}</h3>
        <p className="post-content">{post.content}</p>
        
        <div className="post-meta">
          <span className="post-date">
            {new Date(post.createdAt).toLocaleDateString('vi-VN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PostItem;
