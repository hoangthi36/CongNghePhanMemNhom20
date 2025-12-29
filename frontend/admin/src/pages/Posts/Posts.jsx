import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import PostItem from '../../components/postItem/postItem';
import PostPopup from '../../components/postPopup/postPopup';
import './Posts.css';

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [editingPost, setEditingPost] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const observerRef = useRef(null);
  const loadingRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || '';
  const POSTS_PER_PAGE = 10;

  const fetchPosts = useCallback(async (pageNum, append = false) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/posts/posts`, {
        params: {
          page: pageNum,
          limit: POSTS_PER_PAGE
        }
      });

      const newPosts = response.data.posts || response.data || [];
      
      if (append) {
        setPosts(prev => [...prev, ...newPosts]);
      } else {
        setPosts(newPosts);
      }

      if (newPosts.length < POSTS_PER_PAGE) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchPosts(1, false);
  }, [fetchPosts]);

  const handleObserver = useCallback((entries) => {
    const [target] = entries;
    if (target.isIntersecting && hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPosts(nextPage, true);
    }
  }, [hasMore, loading, page, fetchPosts]);

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.1
    });

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => {
      if (loadingRef.current) {
        observer.unobserve(loadingRef.current);
      }
    };
  }, [handleObserver]);

  const handleDelete = async (postId) => {
    try {
      await axios.delete(`${API_URL}/posts/posts/delete/${postId}`);
      setPosts(prev => prev.filter(p => p._id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Không thể xóa bài viết. Vui lòng thử lại.');
    }
  };

  const handleTogglePin = async (postId) => {
    try {
      await axios.patch(`${API_URL}/posts/posts/toggle-pin/${postId}`);
      
      const post = posts.find(p => p._id === postId);
      const wasPinned = post?.isPinned;
      
      setPosts(prev => {
        const updated = prev.map(p => 
          p._id === postId ? { ...p, isPinned: !p.isPinned } : p
        );
        
        if (!wasPinned) {
          const pinnedPost = updated.find(p => p._id === postId);
          const others = updated.filter(p => p._id !== postId);
          return [pinnedPost, ...others];
        } else {
          const unpinnedPost = updated.find(p => p._id === postId);
          const others = updated.filter(p => p._id !== postId);
          const pinnedPosts = others.filter(p => p.isPinned);
          const unpinnedPosts = others.filter(p => !p.isPinned);
          return [...pinnedPosts, unpinnedPost, ...unpinnedPosts];
        }
      });
    } catch (error) {
      console.error('Error toggling pin:', error);
      alert('Không thể thay đổi trạng thái ghim. Vui lòng thử lại.');
    }
  };

  const handleUpdate = (post) => {
    setEditingPost(post);
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setEditingPost(null);
  };

  const handleCreatePost = () => {
    setEditingPost(null);
    setIsPopupOpen(true);
  };

  const handleSavePost = async (postData) => {
    try {
      if (editingPost) {
        // Update existing post
        await axios.patch(`${API_URL}/posts/posts/update/${editingPost._id}`, postData);
        setPosts(prev => prev.map(p => 
          p._id === editingPost._id ? { ...p, ...postData } : p
        ));
      } else {
        // Create new post
        const response = await axios.post(`${API_URL}/posts/create-post`, postData);
        const newPost = response.data.post || response.data;
        // Refresh posts list to show the new post
        setPage(1);
        fetchPosts(1, false);
      }
      handleClosePopup();
    } catch (error) {
      console.error('Error saving post:', error);
      alert(editingPost 
        ? 'Không thể cập nhật bài viết. Vui lòng thử lại.' 
        : 'Không thể tạo bài viết. Vui lòng thử lại.');
    }
  };

  return (
    <div className="posts-page">
      <div className="posts-header">
        <h1>Quản lý bài viết</h1>
        <button className="btn-create-post" onClick={handleCreatePost} title="Tạo bài viết mới">
          <span className="btn-plus">+</span>
          <span className="btn-text">Tạo bài viết</span>
        </button>
      </div>

      <div className="posts-container">
        {posts.length === 0 && !loading && (
          <div className="empty-state">
            <p>Chưa có bài viết nào.</p>
          </div>
        )}

        {posts.map((post) => (
          <PostItem
            key={post._id}
            post={post}
            onDelete={handleDelete}
            onTogglePin={handleTogglePin}
            onUpdate={handleUpdate}
          />
        ))}

        {loading && (
          <div ref={loadingRef} className="loading-indicator">
            <div className="loading-spinner"></div>
            <p>Đang tải...</p>
          </div>
        )}

        {!hasMore && posts.length > 0 && (
          <div className="end-message">
            <p>Đã hiển thị tất cả bài viết</p>
          </div>
        )}
      </div>

      {isPopupOpen && (
        <PostPopup
          post={editingPost}
          onClose={handleClosePopup}
          onSave={handleSavePost}
        />
      )}
    </div>
  );
};

export default Posts;

