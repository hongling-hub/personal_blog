import React, { useState, useEffect } from 'react';
import { Avatar, Tooltip, Badge, Button, message } from 'antd';
import authService from '../../services/auth';
import styles from './AuthorCard.module.scss';

type AuthorCardProps = {
  article: {
    author: {
      id: string;
      avatar: string;
      username: string;
      isVerified: boolean;
      bio?: string;
    };
  };
  isAuthor: boolean;
};

const AuthorCard: React.FC<AuthorCardProps> = ({ article, isAuthor }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [articleCount, setArticleCount] = useState(0);
  const [totalViews, setTotalViews] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 检查用户是否已登录
  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem('token');
      setIsLoggedIn(!!token);
    };

    checkLoginStatus();
    // 监听storage变化，以便在用户登录/注销时更新状态
    window.addEventListener('storage', checkLoginStatus);
    return () => window.removeEventListener('storage', checkLoginStatus);
  }, []);

  // 获取作者统计信息
  useEffect(() => {
    const getAuthorStats = async () => {
      if (!article.author.id) return;
      try {
        const response = await fetch(`/api/users/stats/${article.author.id}`);
        const data = await response.json();
        if (data.success) {
          setArticleCount(data.data.articleCount);
          setTotalViews(data.data.totalViews);
          setFollowerCount(data.data.followerCount);
        }
      } catch (error) {
        console.error('获取作者统计信息失败:', error);
      }
    };

    getAuthorStats();
  }, [article.author.id]);

  // 检查是否已经关注该作者
  useEffect(() => {
    const checkFollowingStatus = async () => {
      if (!isLoggedIn || !article.author.id) return;
      try {
        const response = await authService.checkFollowing(article.author.id);
        setIsFollowing(response.isFollowing);
      } catch (error) {
        console.error('检查关注状态失败:', error);
      }
    };

    checkFollowingStatus();
  }, [isLoggedIn, article.author.id]);

  const handleFollow = async () => {
    if (!isLoggedIn) {
      message.warning('请先登录');
      return;
    }

    setLoading(true);
    try {
      if (isFollowing) {
        // 取消关注逻辑
        const response = await authService.unfollow(article.author.id);
        setIsFollowing(false);
        setFollowerCount(prevCount => prevCount - 1);
        message.success(response.message || '已取消关注');
      } else {
        // 关注逻辑
        const response = await authService.follow(article.author.id);
        setIsFollowing(true);
        setFollowerCount(prevCount => prevCount + 1);
        message.success(response.message || '关注成功');
      }
    } catch (error) {
      console.error('关注操作失败:', error);
      const errorMessage = error instanceof Error ? error.message : '操作失败，请稍后重试';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authorCard}>
      <div className={styles.authorInfoLine}>
        <div>
          <Avatar src={article.author.avatar} alt={article.author.username} className={styles.authorAvatar} />
        </div>
        <div>
          <div className={styles.authorName}>{article.author.username}</div>
        </div>
      </div>
      <div className={styles.authorInfo}>
        <div className={styles.authorNameContainer}>
          {article.author.isVerified && (
            <Tooltip title="已认证">
              <Badge status="success" className={styles.verifiedBadge} />
            </Tooltip>
          )}
        </div>
        {article.author.bio && <div className={styles.authorBio}>{article.author.bio}</div>}
        <div className={styles.authorStats}>
            <div className={styles.statItem}>
              <div style={{paddingBottom: '5px'}}>文章</div>
              <div>{articleCount || 0}</div>
            </div>
            <div className={styles.statItem}>
              <div style={{paddingBottom: '5px'}}>阅读</div>
              <div>{totalViews ? totalViews.toLocaleString() : '0'}</div>
            </div>
            <div className={styles.statItem}>
              <div style={{paddingBottom: '5px'}}>粉丝</div>
              <div>{followerCount ? followerCount.toLocaleString() : '0'}</div>
          </div>
        </div>
        {!isAuthor && (
          <div className={styles.authorInfoLineButton}>
            <Button 
              type={isFollowing ? 'default' : 'primary'} 
              size="small" 
              className={`${styles.followButton} ${isFollowing ? styles.followed : ''}`}
              onClick={handleFollow}
              loading={loading}
            >
              {isFollowing ? '已关注' : '关注'}
            </Button>
            <Button size="small" className={styles.messageButton}>私信</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthorCard;