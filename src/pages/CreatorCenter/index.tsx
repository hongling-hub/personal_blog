import React, { useState } from 'react';
import { Layout, Menu, Card, Button, Empty, Typography, Input, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import { HomeOutlined, FileTextOutlined, BarChartOutlined } from '@ant-design/icons';
import styles from './index.module.scss';

const { Sider, Content } = Layout;
const { Title, Text } = Typography;

// 首页组件
const HomePage = () => (
  <div className={styles.homePage}>
    <div className={styles.userInfo}>
      <img
        src="https://cdn-icons-png.flaticon.com/512/2650/2650869.png"
        alt="用户头像"
        className={styles.avatar}
      />
      <Title level={3}>用户879455850472</Title>
      <Text>0 粉丝 | 0 关注 | 0 掘力值 | 在掘金创作的第 0 天</Text>
    </div>
    
    <div className={styles.dataCards}>
      <Card className={styles.dataCard}>
        <Title level={2}>0</Title>
        <Text>总粉丝数</Text>
        <Text type="secondary">较前日 --</Text>
      </Card>
      <Card className={styles.dataCard}>
        <Title level={2}>0</Title>
        <Text>文章展现数</Text>
        <Text type="secondary">较前日 --</Text>
      </Card>
      <Card className={styles.dataCard}>
        <Title level={2}>0</Title>
        <Text>文章阅读数</Text>
        <Text type="secondary">较前日 --</Text>
      </Card>
      <Card className={styles.dataCard}>
        <Title level={2}>0</Title>
        <Text>文章点赞数</Text>
        <Text type="secondary">较前日 --</Text>
      </Card>
      <Card className={styles.dataCard}>
        <Title level={2}>0</Title>
        <Text>文章评论数</Text>
        <Text type="secondary">较前日 --</Text>
      </Card>
      <Card className={styles.dataCard}>
        <Title level={2}>0</Title>
        <Text>文章收藏数</Text>
        <Text type="secondary">较前日 --</Text>
      </Card>
    </div>
  </div>
);

// 内容管理页面组件 - 支持状态切换
const ContentManagementPage = () => {
  // 定义文章状态类型
  type ArticleStatus = 'all' | 'published' | 'reviewing' | 'rejected';
  
  // 状态管理
  const [activeStatus, setActiveStatus] = useState<ArticleStatus>('all');
  const [articles, setArticles] = useState<any[]>([]); // 实际项目中应定义具体类型

  // 状态标签配置
  const statusTabs = [
    { key: 'all', label: '全部', count: 0 },
    { key: 'published', label: '已发布', count: 0 },
    { key: 'reviewing', label: '审核中', count: 0 },
    { key: 'rejected', label: '未通过', count: 0 },
  ];

  // 切换状态
  const handleStatusChange = (status: ArticleStatus) => {
    setActiveStatus(status);
    // 实际项目中这里可以根据状态请求对应数据
    // 示例: fetchArticlesByStatus(status).then(data => setArticles(data))
  };

  return (
    <div className={styles.contentManagementPage}>
      <div className={styles.header}>
        <div>
          <Title level={2}>文章</Title>
          <div className={styles.statusTabs}>
            {statusTabs.map((tab) => (
              <Tag
                key={tab.key}
                className={`${styles.statusTag} ${activeStatus === tab.key ? styles.activeTag : ''}`}
                onClick={() => handleStatusChange(tab.key as ArticleStatus)}
              >
                {tab.label} ({tab.count})
              </Tag>
            ))}
          </div>
        </div>
        <Button type="primary" className={styles.writeButton}>
          写文章
        </Button>
      </div>
      
      <Input
        placeholder="请输入标题关键字"
        prefix={<FileTextOutlined />}
        className={styles.searchInput}
      />
      
      {articles.length === 0 ? (
        <Empty
          description={`暂无${statusTabs.find(t => t.key === activeStatus)?.label}内容`}
          image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
        >
          <Button type="primary">开始创作</Button>
        </Empty>
      ) : (
        <div className={styles.articleList}>
          {/* 文章列表渲染 - 实际项目中根据articles数据渲染 */}
        </div>
      )}
    </div>
  );
};

// 内容数据页面组件
const ArticleDataPage = () => (
  <div className={styles.articleDataPage}>
    <div className={styles.header}>
      <Title level={2}>文章数据</Title>
      <Text>2025-07-20 数据表现</Text>
    </div>
    
    <div className={styles.dataCards}>
      <Card className={styles.dataCard}>
        <Title level={2}>0</Title>
        <Text>总文章数</Text>
        <Text type="secondary">较前日 --</Text>
      </Card>
      <Card className={styles.dataCard}>
        <Title level={2}>0</Title>
        <Text>文章展现数</Text>
        <Text type="secondary">较前日 --</Text>
      </Card>
      <Card className={styles.dataCard}>
        <Title level={2}>0</Title>
        <Text>文章阅读数</Text>
        <Text type="secondary">较前日 --</Text>
      </Card>
      <Card className={styles.dataCard}>
        <Title level={2}>0</Title>
        <Text>文章点赞数</Text>
        <Text type="secondary">较前日 --</Text>
      </Card>
      <Card className={styles.dataCard}>
        <Title level={2}>0</Title>
        <Text>文章评论数</Text>
        <Text type="secondary">较前日 --</Text>
      </Card>
      <Card className={styles.dataCard}>
        <Title level={2}>0</Title>
        <Text>文章收藏数</Text>
        <Text type="secondary">较前日 --</Text>
      </Card>
    </div>
  </div>
);

// 粉丝数据页面组件
const FanDataPage = () => (
  <div className={styles.fanDataPage}>
    <div className={styles.header}>
      <Title level={2}>粉丝数据</Title>
      <Text>2025-07-20 数据表现</Text>
    </div>
    
    <div className={styles.dataCards}>
      <Card className={styles.dataCard}>
        <Title level={2}>0</Title>
        <Text>总粉丝</Text>
        <Text type="secondary">较前日 --</Text>
      </Card>
      <Card className={styles.dataCard}>
        <Title level={2}>0</Title>
        <Text>互动粉丝</Text>
        <Text type="secondary">较前日 --</Text>
      </Card>
      <Card className={styles.dataCard}>
        <Title level={2}>0</Title>
        <Text>新增粉丝</Text>
        <Text type="secondary">较前日 --</Text>
      </Card>
      <Card className={styles.dataCard}>
        <Title level={2}>0</Title>
        <Text>取消关注</Text>
        <Text type="secondary">较前日 --</Text>
      </Card>
      <Card className={styles.dataCard}>
        <Title level={2}>0</Title>
        <Text>净增关注</Text>
        <Text type="secondary">较前日 --</Text>
      </Card>
    </div>
  </div>
);

const CreatorCenter: React.FC = () => {
  const navigate = useNavigate();
  const [selectedKey, setSelectedKey] = useState('home');

  const handleMenuClick = (e: { key: string }) => {
    setSelectedKey(e.key);
  };

  return (
    <Layout className={styles.layout}>
      <Sider width={200} theme="light" className={styles.sider}>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          onClick={handleMenuClick}
          className={styles.menu}
        >
          <Menu.Item key="home" icon={<HomeOutlined />}>首页</Menu.Item>
          <Menu.Item key="contentManagement" icon={<FileTextOutlined />}>内容管理</Menu.Item>
          <Menu.SubMenu key="dataCenter" icon={<BarChartOutlined />} title="数据中心">
            <Menu.Item key="articleData">内容数据</Menu.Item>
            <Menu.Item key="fanData">粉丝数据</Menu.Item>
          </Menu.SubMenu>
        </Menu>
      </Sider>
      <Layout className={styles.mainLayout}>
        <Content className={styles.content}>
          {selectedKey === 'home' && <HomePage />}
          {selectedKey === 'contentManagement' && <ContentManagementPage />}
          {selectedKey === 'articleData' && <ArticleDataPage />}
          {selectedKey === 'fanData' && <FanDataPage />}
        </Content>
      </Layout>
    </Layout>
  );
};

export default CreatorCenter;