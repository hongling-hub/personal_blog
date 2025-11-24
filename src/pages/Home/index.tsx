import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef, useCallback } from 'react';
import articlesService from '../../services/articles';
import { Layout, Card, List, Tabs, Menu, Tag, Button, Divider, Avatar, Spin } from 'antd';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import ArticleList from '../../components/ArticleList';
import ArticleRankings from '../../components/ArticleRankings';
import Follow from '../../components/Follow';
import dayjs from 'dayjs';
import { useUser } from '../../contexts/UserContext';
import { FireOutlined, StarOutlined, ThunderboltOutlined, AppstoreOutlined, CodeOutlined, MonitorOutlined, PhoneOutlined, AppleOutlined, RobotOutlined, ToolOutlined, BookOutlined, TrophyOutlined, ReloadOutlined } from '@ant-design/icons';
import styles from './index.module.scss';

const { Header: AntHeader, Content, Sider } = Layout;

interface ArticleItem {
  _id: string;
  title: string;
  desc: string;
  content: string;
  author: { username: string; avatar: string };
  views: number;
  likes: number;
  likeCount: number;
  coverImage: string;
  tags: string[];
  publishTime: string;
}

export default function Home() {
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('1');
  const [activeMenu, setActiveMenu] = useState('comprehensive');
  const navigate = useNavigate();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // 获取文章列表
  const fetchArticles = useCallback(async (page = 1, append = false) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      // 根据当前标签页设置排序参数
      let sortBy = 'publishTime'; // 默认按发布时间排序
      if (activeTab === '1') {
        sortBy = 'views'; // 推荐按阅读量排序
      } else if (activeTab === '3') {
        sortBy = 'likes'; // 热门按点赞量排序
      }
      
      const response = await articlesService.getList(page, 10, sortBy);
      
      if (append) {
        setArticles(prev => [...prev, ...response.articles]);
      } else {
        setArticles(response.articles);
      }
      
      setHasMore(response.pagination.hasMore);
      setCurrentPage(page);
    } catch (error) {
      console.error('获取文章列表失败:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [activeTab]);

  // 初始加载
  useEffect(() => {
    fetchArticles(1, false);
  }, [fetchArticles]);

  // 滚动加载更多
  const loadMoreArticles = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    
    const nextPage = currentPage + 1;
    
    // 直接调用fetchArticles，避免依赖问题
    try {
      setLoadingMore(true);
      
      // 根据当前标签页设置排序参数
      let sortBy = 'publishTime'; // 默认按发布时间排序
      if (activeTab === '1') {
        sortBy = 'views'; // 推荐按阅读量排序
      } else if (activeTab === '3') {
        sortBy = 'likes'; // 热门按点赞量排序
      }
      
      const response = await articlesService.getList(nextPage, 10, sortBy);
      
      setArticles(prev => [...prev, ...response.articles]);
      setHasMore(response.pagination.hasMore);
      setCurrentPage(nextPage);
    } catch (error) {
      console.error('加载更多文章失败:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [currentPage, hasMore, loadingMore, activeTab]);

  // 监听滚动到底部
  useEffect(() => {
    if (!loadMoreRef.current || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore) {
          loadMoreArticles();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadMoreRef.current);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, loadingMore, loadMoreArticles]);

  // 切换标签页时重置数据
  useEffect(() => {
    if (activeMenu === 'comprehensive') {
      // 重置分页状态
      setCurrentPage(1);
      setHasMore(true);
      setArticles([]);
      fetchArticles(1, false);
    }
  }, [activeTab, activeMenu, fetchArticles]);

  // 根据当前标签页排序文章
  const getSortedArticles = () => {
    if (!articles.length) return [];

    // 由于后端API已经按指定字段排序，这里只需要处理二级排序
    switch (activeTab) {
      case '1': // 推荐 - 后端已按阅读量排序，这里处理阅读量相同时按点赞数排序
        return [...articles].sort((a, b) => {
          // 如果阅读量相同，按点赞数降序
          if (a.views === b.views) {
            return b.likes - a.likes;
          }
          // 否则保持后端排序（阅读量降序）
          return 0;
        });
      case '2': // 最新 - 后端已按发布时间排序，无需额外处理
        return articles;
      case '3': // 热门 - 后端已按点赞数排序，这里处理点赞数相同时按阅读量排序
        return [...articles].sort((a, b) => {
          // 如果点赞数相同，按阅读量降序
          if (a.likes === b.likes) {
            return b.views - a.views;
          }
          // 否则保持后端排序（点赞数降序）
          return 0;
        });
      default:
        return articles;
    }
  };

  const items = [
    {
      key: '1',
      label: (
        <>
          <FireOutlined /> 推荐
        </>
      ),
      children: (
        <ArticleList
          articles={getSortedArticles()}
          loading={loading}
          loadingMore={loadingMore}
          hasMore={hasMore}
          onArticleClick={(id) => navigate(`/article/${id}`)}
          showAction={true}
          loadMoreRef={loadMoreRef}
        />
      )
    },
    {
      key: '2',
      label: (
        <>
          <ThunderboltOutlined /> 最新
        </>
      ),
      children: (
        <ArticleList
          articles={getSortedArticles()}
          loading={loading}
          loadingMore={loadingMore}
          hasMore={hasMore}
          onArticleClick={(id) => navigate(`/article/${id}`)}
          showAction={false}
          loadMoreRef={loadMoreRef}
        />
      )
    },
    {
      key: '3',
      label: (
        <>
          <StarOutlined /> 热门
        </>
      ),
      children: (
        <ArticleList
          articles={getSortedArticles()}
          loading={loading}
          loadingMore={loadingMore}
          hasMore={hasMore}
          onArticleClick={(id) => navigate(`/article/${id}`)}
          showAction={false}
          loadMoreRef={loadMoreRef}
        />
      )
    }
  ];

  const menuItems = [
    { key: 'follow', icon: <StarOutlined />, label: '关注' },
    { key: 'comprehensive', icon: <AppstoreOutlined />, label: '综合' },
    { key: 'backend', icon: <CodeOutlined />, label: '后端' },
    { key: 'frontend', icon: <MonitorOutlined />, label: '前端' },
    { key: 'android', icon: <PhoneOutlined />, label: 'Android' },
    { key: 'ios', icon: <AppleOutlined />, label: 'iOS' },
    { key: 'ai', icon: <RobotOutlined />, label: '人工智能' },
    { key: 'tools', icon: <ToolOutlined />, label: '开发工具' },
    { key: 'life', icon: <BookOutlined />, label: '代码人生' },
    { key: 'reading', icon: <BookOutlined />, label: '阅读' },
    { key: 'ranking', icon: <TrophyOutlined />, label: '排行榜' },
  ];

  // 处理菜单点击
  const handleMenuClick = ({ key }: { key: string }) => {
    setActiveMenu(key);
    // 重置标签页为默认值
    setActiveTab('1');
  };

  // 根据activeMenu渲染不同内容
  const renderContent = () => {
    switch (activeMenu) {
      case 'follow':
        return <Follow />;
      case 'comprehensive':
        return (
          <Tabs
            defaultActiveKey="1"
            activeKey={activeTab}
            onChange={(key) => setActiveTab(key)}
            tabBarStyle={{ 
              paddingLeft: '2vw' 
            }}
            className={styles.articleTabs}
            items={items}
          />
        );
      // 其他菜单的内容可以在这里添加
      default:
        return (
          <Tabs
            defaultActiveKey="1"
            activeKey={activeTab}
            onChange={(key) => setActiveTab(key)}
            tabBarStyle={{ 
              paddingLeft: '2vw' 
            }}
            className={styles.articleTabs}
            items={items}
          />
        );
    }
  };

  return (
    <Layout className={styles.layout}>
      <Sider width={"15%"} className={styles.sider}>
        <Menu
          mode="vertical"
          items={menuItems}
          selectedKeys={[activeMenu]}
          onClick={handleMenuClick}
          style={{ height: '100%', borderRight: 0 }}
        />
      </Sider>
      <Layout>
        <Content className={styles.content}>
          <Header />
          {renderContent()}
        </Content>
        <Sider width={"20%"} className={styles.rightSider}>
          <ArticleRankings articles={articles} />
          <Footer className={styles.sidebarFooter} />
        </Sider>
      </Layout>
    </Layout>
  );
}