import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import articlesService from '../../services/articles';
import { Layout, Card, List, Tabs, Menu, Tag, Button, Divider, Avatar } from 'antd';
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
  const [activeTab, setActiveTab] = useState('1');
  const [activeMenu, setActiveMenu] = useState('comprehensive');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const data = await articlesService.getList();
        setArticles(data);
      } catch (error) {
        console.error('获取文章列表失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  // 根据当前标签页排序文章
  const getSortedArticles = () => {
    if (!articles.length) return [];

    switch (activeTab) {
      case '1': // 推荐
        return [...articles].sort((a, b) => {
          // 先按阅读量降序
          if (a.views !== b.views) {
            return b.views - a.views;
          }
          // 阅读量相同时按点赞量降序
          return b.likes - a.likes;
        });
      case '2': // 最新
        return [...articles].sort((a, b) => {
          return new Date(b.publishTime).getTime() - new Date(a.publishTime).getTime();
        });
      case '3': // 热门
        return [...articles].sort((a, b) => {
          return b.likes - a.likes;
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
          onArticleClick={(id) => navigate(`/article/${id}`)}
          showAction={true}
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
          onArticleClick={(id) => navigate(`/article/${id}`)}
          showAction={false}
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
          onArticleClick={(id) => navigate(`/article/${id}`)}
          showAction={false}
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