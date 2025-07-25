import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  message, 
  Spin, 
  Avatar, 
  Tag, 
  Button, 
  Divider, 
  Input, 
  Tooltip, 
  Dropdown, 
  Menu, 
  Badge 
} from 'antd';
import {
  LikeOutlined,
  MessageOutlined,
  StarOutlined,
  ShareAltOutlined,
  BookOutlined,
  MoreOutlined,
  ArrowLeftOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  UserOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import styles from './index.module.scss';
import articlesService from '../../services/articles';
import { useUser } from '../../contexts/UserContext';
import CommentList from '../../components/CommentList';
import RenderKatex from '../../components/RenderKatex';

dayjs.extend(relativeTime);

interface ArticleData {
  _id: string;
  title: string;
  content: string;
  coverImage?: string;
  author: {
    _id: string;
    username: string;
    avatar: string;
    isVerified: boolean;
    bio?: string;
  };
  publishTime: string;
  readCount: number;
  likeCount: number;
  commentCount: number;
  collectCount: number;
  tags: string[];
  isLiked: boolean;
  isCollected: boolean;
}

export default function ArticleDetail() {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [collectCount, setCollectCount] = useState(0);
  const [isCollected, setIsCollected] = useState(false);
  const { user } = useUser();
  const navigate = useNavigate();
  const [commentText, setCommentText] = useState('');

  const handleSendComment = async () => {
    if (!commentText.trim()) {
      message.warning('请输入评论内容');
      return;
    }

    if (!user) {
      message.info('请先登录');
      return;
    }

    try {
      await articlesService.addComment(article?._id || '', { content: commentText.trim() });
      message.success('评论成功');
      setCommentText('');
      // 刷新评论列表可以在这里实现
    } catch (error) {
      console.error('Failed to send comment:', error);
      message.error('评论失败，请重试');
    }
  };

  useEffect(() => {
    if (!id) return;

    const fetchArticleDetail = async () => {
      try {
        setLoading(true);
        const data = await articlesService.getById(id);
        setArticle(data);
        setLikeCount(data.likeCount);
        setIsLiked(data.isLiked);
        setCollectCount(data.collectCount || 0);
        setIsCollected(data.isCollected || false);
      } catch (error) {
        console.error('Failed to fetch article:', error);
        message.error('获取文章失败，请重试');
      } finally {
        setLoading(false);
      }
    };

    fetchArticleDetail();
  }, [id]);

  const handleLike = async () => {
    if (!user) {
      message.info('请先登录');
      return;
    }

    try {
      if (isLiked) {
        await articlesService.cancelLike(id!);
        setLikeCount(prev => Math.max(0, prev - 1));
      } else {
        await articlesService.like(id!);
        setLikeCount(prev => prev + 1);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Failed to like article:', error);
      message.error('操作失败，请重试');
    }
  };

  const handleCollect = async () => {
    if (!user) {
      message.info('请先登录');
      return;
    }

    try {
      if (isCollected) {
        await articlesService.cancelCollect(id!);
      } else {
        await articlesService.collect(id!);
      }
      setIsCollected(!isCollected);
      message.success(isCollected ? '取消收藏成功' : '收藏成功');
    } catch (error) {
      console.error('Failed to collect article:', error);
      message.error('操作失败，请重试');
    }
  };

  const handleShare = () => {
    // 模拟复制链接到剪贴板
    navigator.clipboard.writeText(window.location.href);
    message.success('链接已复制到剪贴板');
  };

  const handleEdit = () => {
    navigate(`/write-article?id=${id}`);
  };

  const handleDelete = async () => {
    if (!window.confirm('确定要删除这篇文章吗？')) return;

    try {
      await articlesService.delete(id!);
      message.success('文章删除成功');
      navigate('/');
    } catch (error) {
      console.error('Failed to delete article:', error);
      message.error('删除失败，请重试');
    }
  };

  const renderAuthorMenu = () => (
    <Menu>
      <Menu.Item key="edit" icon={<EditOutlined />} onClick={handleEdit}>
        编辑文章
      </Menu.Item>
      <Menu.Item key="delete" icon={<DeleteOutlined />} onClick={handleDelete} danger>
        删除文章
      </Menu.Item>
    </Menu>
  );

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spin size="large" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className={styles.notFoundContainer}>
        <h2>文章不存在或已被删除</h2>
        <Button onClick={() => navigate('/')} type="primary" icon={<ArrowLeftOutlined />}>
          返回首页
        </Button>
      </div>
    );
  }

  const isAuthor = user && article.author._id === user._id;

  return (
    <div className={styles.container}>
      <div className={styles.backButton}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/')}
          type="text"
        >
          返回首页
        </Button>
      </div>

      <div className={styles.articleWrapper}>
        {/* 文章头部 */}
        <div className={styles.articleHeader}>
          <h1 className={styles.title}>{article.title}</h1>

          <div className={styles.tags}>
            {article.tags.map(tag => (
              <Tag key={tag} className={styles.tag}>{tag}</Tag>
            ))}
          </div>

          <div className={styles.meta}>
            <div className={styles.authorInfo}>
              <Avatar src={article.author.avatar} alt={article.author.username} />
              <div className={styles.authorDetails}>
                <div className={styles.authorName}>
                  {article.author.username}
                  {article.author.isVerified && (
                    <Tooltip title="已认证">
                      <Badge status="success" className={styles.verifiedBadge} />
                    </Tooltip>
                  )}
                </div>
                <div className={styles.publishInfo}>
                  <span>{dayjs(article.publishTime).format('YYYY-MM-DD HH:mm')}</span>
                  <span className={styles.separator}>·</span>
                  <span><EyeOutlined /> {article.readCount} 阅读</span>
                </div>
              </div>
              {!isAuthor && (
                <Button type="primary" size="small" className={styles.followButton}>关注</Button>
              )}
            </div>
          </div>
        </div>

        {/* 文章封面 */}
        {article.coverImage && (
          <div className={styles.coverImageContainer}>
            <img
              src={article.coverImage}
              alt="文章封面"
              className={styles.coverImage}
            />
          </div>
        )}

        {/* 文章内容 */}
        <div className={styles.articleContent}>
          <RenderKatex content={article.content} />
        </div>

        {/* 文章底部操作区 */}
        <div className={styles.actions}>
          <Button
            icon={<LikeOutlined />}
            onClick={handleLike}
            className={`${styles.actionButton} ${isLiked ? styles.liked : ''}`}
          >
            <span className={styles.actionText}>{likeCount}</span>
          </Button>

          <Button
            icon={<MessageOutlined />}
            className={styles.actionButton}
          >
            <span className={styles.actionText}>{article.commentCount}</span>
          </Button>

          <Button
            icon={<StarOutlined />}
            onClick={handleCollect}
            className={`${styles.actionButton} ${isCollected ? styles.collected : ''}`}
          >
            <span className={styles.actionText}>{collectCount}</span>
          </Button>

          <Button
            icon={<ShareAltOutlined />}
            onClick={handleShare}
            className={styles.actionButton}
          >
            <span className={styles.actionText}>分享</span>
          </Button>

          {isAuthor && (
            <Dropdown overlay={renderAuthorMenu} placement="bottomRight">
              <Button icon={<MoreOutlined />} className={styles.moreButton} type="text" />
            </Dropdown>
          )}
        </div>

        <Divider className={styles.divider} />

        {/* 作者信息卡片 */}
        <div className={styles.authorCard}>
          <Avatar src={article.author.avatar} alt={article.author.username} className={styles.authorAvatar} />
          <div className={styles.authorCardDetails}>
            <div className={styles.authorCardName}>
              {article.author.username}
              {article.author.isVerified && (
                <Tooltip title="已认证">
                  <Badge status="success" className={styles.verifiedBadge} />
                </Tooltip>
              )}
            </div>
            {article.author.bio && <div className={styles.authorBio}>{article.author.bio}</div>}
            {!isAuthor && (
              <Button type="primary" size="small" className={styles.followButtonCard}>关注</Button>
            )}
          </div>
        </div>

        <Divider className={styles.divider} />

        {/* 评论区 */}
        <div className={styles.commentSection}>
          <h3 className={styles.commentTitle}>{article.commentCount} 条评论</h3>

          <div className={styles.commentInputContainer}>
            {user ? (
              <Avatar src={user.avatar} alt={user.username} className={styles.commentAvatar} />
            ) : (
              <Avatar className={styles.commentAvatar} icon={<UserOutlined />} />
            )}
            <Input
              placeholder={user ? '写下你的评论...' : '登录后发表评论'}
              className={styles.commentInput}
              disabled={!user}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onPressEnter={handleSendComment}
            />
            <Button
              type="primary"
              className={styles.sendCommentButton}
              disabled={!user}
              onClick={handleSendComment}
            >
              发送
            </Button>
          </div>

          <CommentList articleId={article._id} />
        </div>
      </div>

      {/* 侧边栏 */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarCard}>
          <div className={styles.sidebarTitle}>推荐阅读</div>
          <div className={styles.recommendedArticles}>
            {/* 这里可以添加推荐文章列表 */}
            <div className={styles.recommendedArticle}>
              <div className={styles.recommendedTitle}>如何高效学习React</div>
              <div className={styles.recommendedMeta}>作者名称 · 2.3k阅读</div>
            </div>
            <div className={styles.recommendedArticle}>
              <div className={styles.recommendedTitle}>TypeScript高级类型技巧</div>
              <div className={styles.recommendedMeta}>作者名称 · 1.8k阅读</div>
            </div>
            <div className={styles.recommendedArticle}>
              <div className={styles.recommendedTitle}>前端性能优化实践</div>
              <div className={styles.recommendedMeta}>作者名称 · 3.5k阅读</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}