import styles from './index.module.scss';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import articlesService from '../../services/articles';
import { Layout, Card, List, Tabs, Menu, Tag, Button, Divider, Avatar } from 'antd';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import ArticleList from '../../components/ArticleList';
import dayjs from 'dayjs';
import { FireOutlined, StarOutlined, ThunderboltOutlined, AppstoreOutlined, CodeOutlined, MonitorOutlined, PhoneOutlined, AppleOutlined, RobotOutlined, ToolOutlined, BookOutlined, TrophyOutlined, ReloadOutlined } from '@ant-design/icons';

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
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const data = await articlesService.getList();
        // 按发布时间倒序排序
        const sortedData = data.sort((a: ArticleItem, b: ArticleItem) => 
          new Date(b.publishTime).getTime() - new Date(a.publishTime).getTime()
        );
        setArticles(sortedData);
      } catch (error) {
        console.error('获取文章列表失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

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
          articles={articles}
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
          articles={articles}
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
          articles={articles}
          loading={loading}
          onArticleClick={(id) => navigate(`/article/${id}`)}
          showAction={false}
        />
      )
    }
  ];

  const menuItems = [
    { key: 'follow', icon: <StarOutlined />, label: '关注' },
    { key: 'comprehensive', icon: <AppstoreOutlined />, label: '综合', className: styles.activeMenu },
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

  return (
    <Layout className={styles.layout}>
      <Sider width={"15%"} className={styles.sider}>
        <Menu
          mode="vertical"
          items={menuItems}
          style={{ height: '100%', borderRight: 0 }}
        />
      </Sider>
      <Layout>
        <Content className={styles.content}>
          <Header />
          <Tabs
            defaultActiveKey="1"
            tabBarStyle={{ 
              paddingLeft: '2vw' 
            }}
            className={styles.articleTabs}
            items={items}
          />
        </Content>
        <Sider width={"20%"} className={styles.rightSider}>
          <Card className={styles.rankCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
                <TrophyOutlined style={{ color: '#faad14', marginRight: 8 }} />
                文章榜
              </h3>
              <Button size="small" icon={<ReloadOutlined />}>换一换</Button>
            </div>
            <List
              dataSource={articles.slice(0, 5)}
              renderItem={(item: ArticleItem, index: number) => (
                <List.Item key={item._id} style={{ padding: '8px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ width: 20, textAlign: 'center', marginRight: 12, fontWeight: 'bold', color: index < 3 ? '#faad14' : '#888' }}>
                      {index + 1}
                    </span>
                    <Avatar size={24} src={item.author.avatar || 'https://picsum.photos/id/1005/200'} />
                    <span style={{ marginLeft: 8, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '120px' }}>
                      {item.title}
                    </span>
                  </div>
                </List.Item>
              )}
            />
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <a href="#" style={{ color: '#1890ff' }}>查看更多</a>
            </div>
          </Card>
          <Footer className={styles.sidebarFooter} />
        </Sider>
      </Layout>
    </Layout>
  );
}