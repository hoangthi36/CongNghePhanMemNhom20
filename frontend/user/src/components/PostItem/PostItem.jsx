import React from 'react';
import './PostItem.css';

const PostItem = ({ post }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`post-card ${post?.isPinned ? 'pinned' : ''}`}>
      {post?.isPinned && (
        <div className="pinned-badge">
          <span>📌 Đã ghim</span>
        </div>
      )}
      <div className="post-header">
        <h3 className="post-title">{post?.title}</h3>
        {post?.createdAt && (
          <span className="post-date">{formatDate(post.createdAt)}</span>
        )}
      </div>
      <div className="post-content">
        <p>{post?.content}</p>
      </div>
      {post?.imageUrl && (
        <div className="post-image-container">
          <img src={post.imageUrl} alt={post?.title || 'post'} className="post-image" />
        </div>
      )}
    </div>
  );
};

export default PostItem;