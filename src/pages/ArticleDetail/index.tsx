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
import AuthorCard from '../../components/AuthorCard';
import RecommendedReading from '../../components/RecommendedReading';
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
import { useComment } from '../../contexts/CommentContext';
import CommentList from '../../components/CommentList';
import RenderKatex from '../../components/RenderKatex';
import { format } from 'date-fns';

dayjs.extend(relativeTime);

interface ArticleData {
  _id: string;
  title: string;
  content: string;
  coverImage?: string;
  views: number;
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

interface RecommendedArticle {
  id: string;
  title: string;
  author: string;
  views: number;
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
  const { commentStats } = useComment();
  const navigate = useNavigate();
  const [commentText, setCommentText] = useState('');
  const [recommendedArticles, setRecommendedArticles] = useState<RecommendedArticle[]>([]);

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

  // 提取为独立函数以便复用
  const fetchArticleDetail = async () => {
    if (!id) {
      console.error('Article ID is undefined');
      message.error('文章ID不存在');
      setLoading(false);
      return;
    }

    console.log('Fetching article detail...');
    try {
      setLoading(true);
      const data = await articlesService.getById(id);
      console.log('文章详情数据:', data);
      console.log('初始isLiked状态:', data.isLiked);
      console.log('初始isCollected状态:', data.isCollected);
      setArticle(data);
      
      // 优先使用localStorage中的点赞状态，如果用户已登录
      if (user) {
        const likedArticles = JSON.parse(localStorage.getItem('likedArticles') || '[]');
        const isArticleLiked = likedArticles.includes(id);
        console.log('localStorage点赞状态:', isArticleLiked);
        setIsLiked(isArticleLiked);
        
        // 优先使用localStorage中的收藏状态
        const collectedArticles = JSON.parse(localStorage.getItem('collectedArticles') || '[]');
        const isArticleCollected = collectedArticles.includes(id);
        console.log('localStorage收藏状态:', isArticleCollected);
        setIsCollected(isArticleCollected);
      } else {
        setIsLiked(data.isLiked);
        setIsCollected(data.isCollected || false);
      }
      
      setLikeCount(data.likeCount || 0);
      setCollectCount(data.collectCount || 0);
    } catch (error) {
      console.error('Failed to fetch article:', error);
      message.error('获取文章失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;

    const fetchRecommendedArticles = async () => {
      try {
        // 获取除当前文章外的最新文章作为推荐
        const data = await articlesService.getList();
        const recommended = data
          .filter((item: ArticleData) => item._id !== id)
          .sort((a: ArticleData, b: ArticleData) => new Date(b.publishTime).getTime() - new Date(a.publishTime).getTime())
          .slice(0, 5)
          .map((item: ArticleData) => ({
            id: item._id,
            title: item.title,
            author: item.author.username,
            views: item.views
          }));
        setRecommendedArticles(recommended);
      } catch (error) {
        console.error('Failed to fetch recommended articles:', error);
      }
    };

    fetchArticleDetail();
    fetchRecommendedArticles();
  }, [id]);

  // 用户登录状态变化时重新获取文章详情
  useEffect(() => {
    if (!id) return;
    fetchArticleDetail();
  }, [user]);

  const handleLike = async () => {
    if (!user) {
      message.info('请先登录');
      return;
    }

    try {
      console.log('准备点赞/取消点赞，文章ID:', id);
      const result = await articlesService.toggleLike(id!);
      console.log('点赞/取消点赞结果:', result);
      
      // 更新localStorage中的点赞状态
      const likedArticles = JSON.parse(localStorage.getItem('likedArticles') || '[]');
      if (result.isLiked) {
        // 添加点赞
        if (!likedArticles.includes(id)) {
          likedArticles.push(id);
        }
      } else {
        // 取消点赞
        const index = likedArticles.indexOf(id);
        if (index > -1) {
          likedArticles.splice(index, 1);
        }
      }
      localStorage.setItem('likedArticles', JSON.stringify(likedArticles));
      
      // 用后端返回的 isLiked 和 likeCount 更新本地状态
      setIsLiked(result.isLiked);
      setLikeCount(result.likeCount);
      message.success(result.message);
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
      console.log('准备收藏/取消收藏，文章ID:', id);
      const result = await articlesService.toggleCollect(id!);
      console.log('收藏/取消收藏结果:', result);
      
      // 更新localStorage中的收藏状态
      const collectedArticles = JSON.parse(localStorage.getItem('collectedArticles') || '[]');
      if (result.isCollected) {
        // 添加收藏
        if (!collectedArticles.includes(id)) {
          collectedArticles.push(id);
        }
      } else {
        // 取消收藏
        const index = collectedArticles.indexOf(id);
        if (index > -1) {
          collectedArticles.splice(index, 1);
        }
      }
      localStorage.setItem('collectedArticles', JSON.stringify(collectedArticles));
      
      // 用后端返回的 isCollected 和 collectCount 更新本地状态
      setIsCollected(result.isCollected);
      setCollectCount(result.collectCount);
      message.success(result.message);
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
                className={`${styles.actionButton} ${isLiked ? 'active' : ''}`}
              >
                <Badge count={likeCount} showZero>
                  {isLiked ? <LikeFilled /> : <LikeOutlined />}
                </Badge>
              </Button>

              <Button
                className={
                  `${styles.actionButton} ${(commentStats[article?._id || ''] || 0) > 0 ? 'active' : ''}`
                }
                onClick={() => scrollToComments()}
              >
                <Badge count={commentStats[article?._id || ''] || 0} showZero onClick={() => scrollToComments()}>
                  {(commentStats[article?._id || ''] || 0) > 0 ? <MessageFilled /> : <MessageOutlined />}
                </Badge>
              </Button>

              <Button
                onClick={handleCollect}
                className={`${styles.actionButton} ${isCollected ? 'active' : ''}`}
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
                      <span><EyeOutlined /> {article.views} 阅读</span>
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
                className={`${styles.mobileActionButton} ${isLiked ? 'active' : ''}`} 
              >
                <span className={styles.mobileActionText}>{likeCount}</span>
              </Button>

              <Button
                icon={(commentStats[article?._id || ''] || 0) > 0 ? <MessageFilled /> : <MessageOutlined />}
                className={`${styles.mobileActionButton} ${(commentStats[article?._id || ''] || 0) > 0 ? 'active' : ''}`}
                onClick={() => scrollToComments()}
              >
                <span className={styles.mobileActionText}>{commentStats[article?._id || ''] || 0}</span>
              </Button>

              <Button 
                icon={isCollected ? <StarFilled /> : <StarOutlined />} 
                onClick={handleCollect} 
                className={`${styles.mobileActionButton} ${isCollected ? 'active' : ''}`} 
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
            <div>
                <RecommendedReading articles={recommendedArticles} />
              </div>
          </div>
        </div>
      </div>


    </div>
  );
}