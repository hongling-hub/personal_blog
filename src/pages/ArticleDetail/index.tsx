import React, { useState, useEffect, useRef } from 'react';
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
  Badge,
  Tree
} from 'antd';

// Tree组件的节点接口定义
interface TreeDataNode {
  title: React.ReactNode;
  key: string;
  children?: TreeDataNode[];
}
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
import commentService from '@/services/comments';

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
  const [tocContent, setTocContent] = useState<string>('');
  const [isSidebarFixed, setIsSidebarFixed] = useState(false);
  const [isTocExpanded, setIsTocExpanded] = useState(true);
  const articleContentRef = useRef<HTMLDivElement>(null);
  const tocRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const recommendedReadingRef = useRef<HTMLDivElement>(null);
  // 添加新状态来跟踪用户是否发表了评论
  const [userHasCommented, setUserHasCommented] = useState(false);

  // 定义评论类型接口
  interface UserComment {
    _id: string;
    content: string;
    articleId: string;
    articleTitle?: string;
    articleAuthor?: string;
    createdAt: string;
  }

  // 检查用户是否对当前文章发表了评论
  const checkUserCommentStatus = async () => {
    if (!user || !article) return;
    
    try {
      // 获取用户的所有评论
      const userComments = await commentService.getMyComments();
      // 检查是否有对当前文章的评论
      const hasComment = userComments.some((comment: UserComment) => comment.articleId === article._id);
      setUserHasCommented(hasComment);
    } catch (error) {
      console.error('检查用户评论状态失败:', error);
      // 出错时默认设置为false
      setUserHasCommented(false);
    }
  };

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
      // 评论成功后，设置用户已评论状态为true
      setUserHasCommented(true);
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
      
      // 使用后端返回的点赞和收藏状态，确保状态正确
      setIsLiked(data.isLiked || false);
      setIsCollected(data.isCollected || false);
      
      // 同步更新localStorage中的状态，确保与后端一致
      if (user) {
        const likedArticles = JSON.parse(localStorage.getItem('likedArticles') || '[]');
        const collectedArticles = JSON.parse(localStorage.getItem('collectedArticles') || '[]');
        
        // 更新点赞状态
        if (data.isLiked) {
          if (!likedArticles.includes(id)) {
            likedArticles.push(id);
          }
        } else {
          const likeIndex = likedArticles.indexOf(id);
          if (likeIndex > -1) {
            likedArticles.splice(likeIndex, 1);
          }
        }
        
        // 更新收藏状态
        if (data.isCollected) {
          if (!collectedArticles.includes(id)) {
            collectedArticles.push(id);
          }
        } else {
          const collectIndex = collectedArticles.indexOf(id);
          if (collectIndex > -1) {
            collectedArticles.splice(collectIndex, 1);
          }
        }
        
        localStorage.setItem('likedArticles', JSON.stringify(likedArticles));
        localStorage.setItem('collectedArticles', JSON.stringify(collectedArticles));
        
        console.log('同步后的localStorage点赞状态:', data.isLiked);
        console.log('同步后的localStorage收藏状态:', data.isCollected);
      }
      
      setLikeCount(data.likeCount || 0);
      setCollectCount(data.collectCount || 0);
        
        // 检查用户是否发表了评论
        if (user) {
          checkUserCommentStatus();
        }
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
        const recommended = data.articles
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
  }, [id]);

  // 当用户变化时，重新检查评论状态
  useEffect(() => {
    if (user && article) {
      checkUserCommentStatus();
    } else {
      // 如果用户未登录，设置为未评论状态
      setUserHasCommented(false);
    }
  }, [user, article]);

  // 当用户变化时，重新检查评论状态
  useEffect(() => {
    if (user && article) {
      checkUserCommentStatus();
    } else {
      // 如果用户未登录，设置为未评论状态
      setUserHasCommented(false);
    }
  }, [user, article]);

  // 滚动监听：当推荐阅读卡片完全滚动出视口时，固定整个侧边栏
  useEffect(() => {
    let ticking = false;
    let timeoutId: NodeJS.Timeout;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (recommendedReadingRef.current && sidebarRef.current) {
            const cardRect = recommendedReadingRef.current.getBoundingClientRect();
            // 当推荐阅读卡片底部完全滚出视口时，固定侧边栏
            const shouldFix = cardRect.bottom <= 0;
            setIsSidebarFixed(shouldFix);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    // 防抖处理
    const debouncedScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleScroll, 16); // 约60fps
    };

    window.addEventListener('scroll', debouncedScroll, { passive: true });
    
    // 初始检查一次
    handleScroll();

    return () => {
      window.removeEventListener('scroll', debouncedScroll);
      clearTimeout(timeoutId);
    };
  }, []);

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

  // 提取和更新目录内容 - 使用Ant Design Tree组件
  const [treeData, setTreeData] = useState<TreeDataNode[]>([]);
  
  useEffect(() => {
    // 调试信息：检查文章内容
    console.log('=== ArticleDetail 调试信息 ===');
    console.log('文章内容长度:', article?.content?.length || 0);
    console.log('是否包含@TOC:', article?.content?.includes('@TOC') || false);
    console.log('是否包含[toc]:', article?.content?.includes('[toc]') || false);
    console.log('文章内容前100字符:', article?.content?.substring(0, 100) || '');
    console.log('===========================');
    
    // 延迟执行以确保RenderKatex有足够时间渲染内容
    const timer = setTimeout(() => {
      if (articleContentRef.current) {
        // 查找由markdown-it-toc-done-right生成的目录元素
        const generatedToc = articleContentRef.current.querySelector('.article-toc') as HTMLElement | null;
        
        if (generatedToc) {
          // 从原始内容中移除目录，避免重复显示
          generatedToc.style.display = 'none';
        }
        
        // 检查是否存在@TOC、@[TOC](目录)或[toc]标记
        const hasTocMarker = article && article.content && 
          (article.content.includes('@TOC') || article.content.includes('[toc]') || 
           article.content.includes('@[TOC]'));
        
        if (hasTocMarker) {
          // 提取标题并构建Tree数据
          const headings = articleContentRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6');
          if (headings.length > 0) {
            // 使用全局定义的TreeDataNode接口
            const newTreeData: TreeDataNode[] = [];
            const headingMap = new Map<number, TreeDataNode[]>(); // 用于跟踪每个级别的节点数组
            
            // 初始化根级别
            headingMap.set(0, newTreeData);
            
            headings.forEach((heading, index) => {
              const level = parseInt(heading.tagName.substring(1));
              const text = heading.textContent || '';
              
              // 生成更友好的ID：使用文本内容创建slug，添加索引确保唯一
              let id = heading.id;
              if (!id) {
                // 尝试使用文本内容创建slug，并添加索引确保唯一性
                const slug = text.trim()
                  .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
                  .replace(/^-+|-+$/g, '');
                // 总是为ID添加索引，确保即使文本相同也能生成唯一ID
                id = slug ? `${slug}-${index}` : `heading-${index}`;
              }
              
              // 确保ID是URL编码的，与目录链接保持一致
              const encodedId = encodeURIComponent(id);
              
              // 设置标题元素的ID为编码后的ID，确保与目录链接匹配
              heading.id = encodedId;
              
              // 创建树节点 - 使用唯一ID作为key
              const node: TreeDataNode = {
                title: <a href={`#${encodedId}`} className="article-toc-link" onClick={(e) => handleTocClick(e)}>{text}</a>,
                key: encodedId,
                children: []
              };
              
              // 确定父级节点数组
              let parentLevel = level - 1;
              while (!headingMap.has(parentLevel) && parentLevel >= 0) {
                parentLevel--;
              }
              
              const parentNodes = headingMap.get(parentLevel) || newTreeData;
              parentNodes.push(node);
              
              // 更新当前级别的节点数组引用为刚添加节点的children
              headingMap.set(level, node.children!);
            });
            
            setTreeData(newTreeData);
            setTocContent(''); // 清空原HTML内容
          } else {
            setTocContent('<div class="no-headings">文章中没有找到标题</div>');
            setTreeData([]);
          }
        } else {
          setTocContent('<div class="no-toc">暂无目录</div>');
          setTreeData([]);
        }
      } else {
        setTocContent('<div class="no-toc">暂无目录</div>');
        setTreeData([]);
      }
    }, 300); // 增加延迟时间确保内容完全渲染
    
    return () => clearTimeout(timer);
  }, [article?.content]);

  // 处理目录链接点击事件，兼容Tree组件和普通目录
  const handleTocClick = (e: React.MouseEvent) => {
    // 对于Tree组件中的链接，只阻止冒泡，让浏览器默认处理锚点跳转
    if (e.target instanceof HTMLElement && e.target.closest('.article-toc-tree')) {
      e.stopPropagation(); // 阻止冒泡，避免Tree节点展开/折叠
      // 不阻止默认行为，让浏览器处理锚点跳转
      return;
    } 
    
    // 原有增强版本的目录处理逻辑
    e.preventDefault();
    e.stopPropagation(); // 阻止事件冒泡，避免触发Tree节点的默认行为
    const target = e.target as HTMLElement;
    
    // 检查点击的是链接还是链接内的文本
    const link = target.tagName === 'A' ? target as HTMLAnchorElement : target.closest('a') as HTMLAnchorElement;
    
    if (link && link.hash) {
      // 解码URL编码的hash值后再使用querySelector
      const hash = link.hash;
      const encodedId = hash.substring(1); // 提取编码后的ID（不包含#号）
      const decodedId = decodeURIComponent(encodedId); // 解码ID
      console.log(`目录点击: 原始hash=${hash}, 编码ID=${encodedId}, 解码ID=${decodedId}`);
      
      // 尝试多种方式查找元素
      let element = document.getElementById(decodedId);
      
      // 如果找不到，尝试使用编码的ID查找
      if (!element) {
        element = document.getElementById(encodedId);
        console.log('尝试使用编码ID查找:', encodedId, '结果:', element ? '找到' : '未找到');
      }
      
      // 如果还是找不到，尝试在所有标题中查找匹配的文本
      if (!element) {
        const allHeadings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        for (const heading of allHeadings) {
          if (heading.textContent?.trim() === decodedId) {
            element = heading as HTMLElement;
            console.log('通过文本内容找到标题:', decodedId);
            break;
          }
        }
      }
      
      if (element) {
        // 添加一些偏移量，避免被固定头部遮挡
        const offset = 80;
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - offset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
        
        // 添加高亮效果
        element.classList.add('toc-highlight');
        setTimeout(() => {
          element.classList.remove('toc-highlight');
        }, 2000);
      } else {
        console.warn('找不到对应的标题元素:', decodedId);
        console.warn('尝试查找所有标题:', document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
        
        // 提供更详细的调试信息
        const allHeadings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        console.warn('页面中所有标题的ID和文本内容:');
        allHeadings.forEach((heading, i) => {
          console.warn(`标题${i + 1}: ID="${heading.id}", 文本="${heading.textContent}"`);
        });
        
        // 尝试使用原始滚动方式作为备用方案
        try {
          window.location.hash = hash;
          console.log('使用原生hash跳转作为备用方案');
        } catch (error) {
          console.error('备用跳转方案也失败:', error);
        }
      }
    }
  };
  
  // 为Tree组件添加全局样式
  useEffect(() => {
    // 添加Tree组件的自定义样式
    const style = document.createElement('style');
    style.textContent = `
      .article-toc-tree .ant-tree-node-content-wrapper:hover {
        background-color: #f5f7fa;
        border-radius: 4px;
      }
      .article-toc-tree .ant-tree-node-selected > .ant-tree-node-content-wrapper {
        background-color: #e6f7ff;
        color: #1890ff;
        font-weight: 500;
      }
      .article-toc-link {
        color: inherit;
        display: block;
        padding: 2px 0;
        text-decoration: none;
      }
      .article-toc-link:hover {
        color: #1890ff;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // 滚动监听：当滚动到对应标题时，目录中对应的标题高亮
  useEffect(() => {
    if (!articleContentRef.current || treeData.length === 0) return;

    const handleScroll = () => {
      const headings = articleContentRef.current?.querySelectorAll('h1, h2, h3, h4, h5, h6') || [];
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      
      let activeHeadingId = '';
      let minDistance = Infinity;
      
      // 找到当前视图中最接近顶部的标题
      for (let i = 0; i < headings.length; i++) {
        const heading = headings[i] as HTMLElement;
        const rect = heading.getBoundingClientRect();
        const headingTop = rect.top + scrollTop;
        
        // 计算标题距离顶部的距离
        const distanceFromTop = Math.abs(rect.top - 100); // 距离顶部100px的位置
        
        // 如果标题在视图中，并且距离顶部最近
        if (rect.top < windowHeight && rect.bottom > 0 && distanceFromTop < minDistance) {
          minDistance = distanceFromTop;
          activeHeadingId = heading.id;
        }
      }
      
      // 如果没找到可见标题，使用最后一个滚过的标题
      if (!activeHeadingId && headings.length > 0) {
        for (let i = headings.length - 1; i >= 0; i--) {
          const heading = headings[i] as HTMLElement;
          const rect = heading.getBoundingClientRect();
          if (rect.top < 0) {
            activeHeadingId = heading.id;
            break;
          }
        }
      }
      
      // 更新Tree组件的选中状态
      if (activeHeadingId) {
        // 清除所有高亮状态
        const allTreeNodes = document.querySelectorAll('.article-toc-tree .ant-tree-node-content-wrapper');
        allTreeNodes.forEach(node => {
          node.classList.remove('ant-tree-node-selected');
        });
        
        // 找到包含对应ID的链接并高亮
        const targetLinks = document.querySelectorAll(`.article-toc-link[href="#${activeHeadingId}"]`);
        targetLinks.forEach(link => {
          const treeNode = link.closest('.ant-tree-node-content-wrapper');
          if (treeNode) {
            treeNode.classList.add('ant-tree-node-selected');
            
            // 滚动到可见区域（如果需要）
            const treeContainer = treeNode.closest('.ant-tree');
            if (treeContainer) {
              const containerRect = treeContainer.getBoundingClientRect();
              const nodeRect = treeNode.getBoundingClientRect();
              
              // 如果节点不在容器可见区域内，滚动到节点位置
              if (nodeRect.top < containerRect.top || nodeRect.bottom > containerRect.bottom) {
                treeNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }
          }
        });
      }
    };

    // 添加滚动监听（使用防抖优化性能）
    let ticking = false;
    const debouncedScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', debouncedScroll, { passive: true });
    
    // 初始执行一次
    setTimeout(() => handleScroll(), 100);
    
    return () => {
      window.removeEventListener('scroll', debouncedScroll);
    };
  }, [treeData, article?.content]);

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
                className={`${styles.actionButton} ${userHasCommented ? 'active' : ''}`}
                onClick={() => scrollToComments()}
              >
                <Badge count={commentStats[article?._id || ''] || 0} showZero onClick={() => scrollToComments()}>
                  {userHasCommented ? <MessageFilled /> : <MessageOutlined />}
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
            <div className={styles.articleContent} ref={articleContentRef}>
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
                icon={userHasCommented ? <MessageFilled /> : <MessageOutlined />}
                className={`${styles.mobileActionButton} ${userHasCommented ? 'active' : ''}`}
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
            {/* 作者信息卡片 - 始终正常滚动 */}
            <AuthorCard article={{ ...article, author: { ...article.author, id: article.author._id } }} isAuthor={isAuthor} />

            {/* 正常滚动的侧边栏（目录+推荐阅读） */}
            <div 
              className={`${styles.normalSidebar} ${isSidebarFixed ? styles.hiddenSidebar : ''}`}
              ref={sidebarRef}
            >
              {/* 文章目录 */}
              <div className={styles.tableOfContents}>
                <div className={styles.tocTitle}>
                  目录
                  <span 
                    className={styles.tocToggle} 
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsTocExpanded(!isTocExpanded);
                    }}
                  >
                    {isTocExpanded ? '收起 ▲' : '展开 ▼'}
                  </span>
                </div>
                <div 
                  className={`${styles.tocContent} ${!isTocExpanded ? styles.tocContentCollapsed : ''}`} 
                  ref={tocRef}
                >
                  {treeData.length > 0 ? (
                    <Tree
                      className="article-toc-tree"
                      treeData={treeData}
                      defaultExpandAll
                      showLine={false}
                      titleRender={(node) => {
                        // 直接返回节点的title，它已经是React元素
                        return node.title;
                      }}
                    />
                  ) : tocContent ? (
                    <div dangerouslySetInnerHTML={{ __html: tocContent }} />
                  ) : (
                    <div className={styles.noToc}>暂无目录</div>
                  )}
                </div>
              </div>

              {/* 推荐阅读 */}
              <div ref={recommendedReadingRef}>
                <RecommendedReading articles={recommendedArticles} />
              </div>
            </div>
          </div>

          {/* 固定版本的侧边栏（目录+推荐阅读） */}
          <div 
            className={`${styles.sidebar} ${styles.fixedSidebar} ${isSidebarFixed ? styles.fixedSidebarActive : ''}`}
          >
            {/* 文章目录 */}
              <div className={styles.tableOfContents}>
                <div className={styles.tocTitle}>
                  目录
                  <span 
                    className={styles.tocToggle} 
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsTocExpanded(!isTocExpanded);
                    }}
                  >
                    {isTocExpanded ? '收起 ▲' : '展开 ▼'}
                  </span>
                </div>
                <div 
                  className={`${styles.tocContent} ${!isTocExpanded ? styles.tocContentCollapsed : ''}`}
                >
                {treeData.length > 0 ? (
                  <Tree
                    className="article-toc-tree"
                    treeData={treeData}
                    defaultExpandAll
                    showLine={false}
                    titleRender={(node) => {
                      // 直接返回节点的title，它已经是React元素
                      return node.title;
                    }}
                  />
                ) : tocContent ? (
                  <div dangerouslySetInnerHTML={{ __html: tocContent }} />
                ) : (
                  <div className={styles.noToc}>暂无目录</div>
                )}
              </div>
            </div>

            {/* 推荐阅读 */}
            <div>
              <RecommendedReading articles={recommendedArticles} />
            </div>
          </div>
        </div>
      </div>


    </div>
  );
}