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
import AuthorCard from '@/components/AuthorCard';
import {
  LikeOutlined,
  LikeFilled,
  MessageOutlined,
  MessageFilled,
  StarOutlined,
  StarFilled,
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
import { format } from 'date-fns';

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
    articleCount: number;
    readCount: number;
    followerCount: number;
  };
  tags: string[];
  likeCount: number;
  commentCount: number;
  collectCount: number;
  createdAt: string;
  readTime: number;
  publishTime: string;
  readCount: number;
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
  const [commentCount, setCommentCount] = useState(0);

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
        setCollectCount(prev => Math.max(0, prev - 1));
      } else {
        await articlesService.collect(id!);
        setCollectCount(prev => prev + 1);
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

  const formatDate = (dateString: string): string => {
    return format(new Date(dateString), 'yyyy-MM-dd HH:mm');
  };

  const scrollToComments = (): void => {
    const commentsElement = document.getElementById('comments');
    if (commentsElement) {
      commentsElement.scrollIntoView({ behavior: 'smooth' });
      // 滚动后聚焦评论框
      setTimeout(() => {
        const textarea = commentsElement.querySelector('textarea');
        if (textarea) {
          textarea.focus();
        }
      }, 100);
    }
  };

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

  const isAuthor = !!user && article.author._id === user._id;

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


        {/* 文章封面 */}
        {/* {article.coverImage && (
          <div className={styles.coverImageContainer}>
            <img
              src={article.coverImage}
              alt="文章封面"
              className={styles.coverImage}
            />
          </div>
        )} */}

        {/* 文章内容 */}
        <div className={styles.articleContainer}>
          {/* PC端左侧操作区 - 仅在大屏幕显示 */}
          <div className={styles.pcSideActions}>
            <div className={styles.actionButtonGroup}>
              <Button
                onClick={handleLike}
                className={`${styles.actionButton} ${isLiked ? 'liked' : ''}`}
              >
                <Badge count={likeCount} showZero>
                  {isLiked ? <LikeFilled /> : <LikeOutlined />}
                </Badge>
              </Button>

              <Button
                className={
                  `${styles.actionButton} ${commentCount > 0 ? 'commented' : ''}`
                }
                onClick={() => scrollToComments()}
              >
                <Badge count={commentCount} showZero onClick={() => scrollToComments()}>
                  {commentCount > 0 ? <MessageFilled /> : <MessageOutlined />}
                </Badge>
              </Button>

              <Button
                onClick={handleCollect}
                className={`${styles.actionButton} ${isCollected ? 'collected' : ''}`}
              >
                <Badge count={collectCount} showZero>
                  {isCollected ? <StarFilled /> : <StarOutlined />}
                </Badge>
              </Button>

              <Button
                onClick={handleShare}
                className={styles.actionButton}
              >
                <ShareAltOutlined />
              </Button>
            </div>
          </div>

          {/* 主内容区 - 在所有设备上显示 */}
          <div className={styles.mainContent}>
            <div style={{ backgroundColor: '#fff' }} className={styles.article}>
            {/* 文章头部 */}
            <div className={styles.articleHeader}>
              <h1 className={styles.title}>{article.title}</h1>


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
                      <span>{dayjs(article.publishTime).format('YYYY-MM-DD')}</span>
                      <span className={styles.separator}>·</span>
                      <span><EyeOutlined /> {article.readCount} 阅读</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 文章内容 */}
            <div className={styles.articleContent}>
              <RenderKatex content={article.content} />
              <div className={styles.tags}>标签：
                <div>
                {article.tags.map(tag => (
                  <Tag key={tag} className={styles.tag}>{tag}</Tag>
                ))}
              </div>
              </div>
            </div>

            {/* 移动端操作栏 - 仅在小屏幕显示 */}
            <div className={styles.mobileActions}>
              <Button 
                icon={isLiked ? <LikeFilled /> : <LikeOutlined />} 
                onClick={handleLike} 
                className={`${styles.mobileActionButton} ${isLiked ? styles.liked : ''}`} 
              >
                <span className={styles.mobileActionText}>{likeCount}</span>
              </Button>

              <Button
                icon={commentCount > 0 ? <MessageFilled /> : <MessageOutlined />}
                className={
                  `${styles.mobileActionButton} ${commentCount > 0 ? styles.commented : ''}`
                }
                onClick={() => scrollToComments()}
              >
                <span className={styles.mobileActionText}>{commentCount}</span>
              </Button>

              <Button 
                icon={isCollected ? <StarFilled /> : <StarOutlined />} 
                onClick={handleCollect} 
                className={`${styles.mobileActionButton} ${isCollected ? styles.collected : ''}`} 
              >
                <span className={styles.mobileActionText}>{collectCount}</span>
              </Button>

              <Button
                icon={<ShareAltOutlined />}
                onClick={handleShare}
                className={styles.mobileActionButton}
              >
                <span className={styles.mobileActionText}>分享</span>
              </Button>

              {isAuthor && (
                <Dropdown overlay={renderAuthorMenu} placement="bottomRight">
                  <Button icon={<MoreOutlined />} className={styles.moreButton} type="text" />
                </Dropdown>
              )}
            </div>
            </div>
            <Divider className={styles.divider} />

            {/* 评论区 */}
            <div id="comments">
              {article && (
                <CommentList
                  articleId={article._id}
                  onCommentCountChange={setCommentCount}
                />
              )}
            </div>
          </div>

          {/* PC端右侧边栏 - 仅在大屏幕显示 */}
          <div className={styles.sidebar}>
            {/* 作者信息卡片 */}
            <AuthorCard article={{ ...article, author: { ...article.author, id: article.author._id } }} isAuthor={isAuthor} />

            {/* 文章目录 */}
            <div className={styles.tableOfContents}>
              <div className={styles.tocTitle}>目录</div>
              <div className={styles.tocContent}>
                {/* 目录内容将通过JavaScript动态生成 */}
              </div>
            </div>

              {/* 右侧边栏 */}
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
        </div>
      </div>


    </div>
  );
}