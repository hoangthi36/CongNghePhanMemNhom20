import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import PostItem from '../../components/PostItem/PostItem';
import './Posts.css';



const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);
  const loadingRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const POSTS_PER_PAGE = 10;

  const fetchPosts = useCallback(async (pageNum, append = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_URL}/posts/getall`, {
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

      // Kiểm tra xem còn bài viết nào không
      if (newPosts.length < POSTS_PER_PAGE || (response.data.totalPages && pageNum >= response.data.totalPages)) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError(error.response?.data?.message || error.message || 'Không thể tải bài viết. Vui lòng thử lại sau.');
      if (!append) {
        setPosts([]);
      }
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

  return (
    <div className="posts-page">
      <div className="posts-header">
        <h2>Bài viết</h2>
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
    </div>
  );
};

export default Posts;
