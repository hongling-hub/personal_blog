import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import articlesService from '../../services/articles';
import commentService from '../../services/comments';
// 导入authService
import authService from '../../services/auth';
import type { Article } from '../../types';
import { Layout, Menu, Card, Button, Empty, Typography, Input, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import { HomeOutlined, FileTextOutlined, BarChartOutlined, SyncOutlined } from '@ant-design/icons';
import { useUser } from '../../contexts/UserContext';
import { useComment } from '../../contexts/CommentContext';
import styles from './index.module.scss';
import SubHeader from '@/components/SubHeader';
// 导入ArticleList组件和样式
import ArticleList from '../../components/ArticleList';
import articleListStyles from '../../components/ArticleList/index.module.scss';
const { Sider, Content } = Layout;
const { Title, Text } = Typography;

// 首页组件 - 修正了箭头函数语法
const HomePage = () => {
  const { user, updateUser } = useUser();
  // 未使用的函数，已移除
  // const { getTotalComments } = useComment();
  const [articleStats, setArticleStats] = useState<{ views: number; comments: number; likes: number; collections: number }>({ views: 0, comments: 0, likes: 0, collections: 0 });
  const [articleCount, setArticleCount] = useState<number>(0);
  const [previousStats, setPreviousStats] = useState<{
    followers: number;
    views: number;
    likes: number;
    collections: number;
    comments: number;
    articleCount: number;
    date: string;
  } | null>(null);

  // 获取所有文章的评论总数
  const getTotalCommentsForAllArticles = async (articles: Article[]) => {
    let totalComments = 0;
    for (const article of articles) {
      try {
        // 获取单篇文章的评论数
        // 确保传递的是有效的文章ID字符串
        const articleId = typeof article._id === 'string' ? article._id : article.id;
        const comments = await commentService.getComments(articleId);
        totalComments += comments.length;
      } catch (error) {
        console.error(`获取文章 ${article.id} 的评论数失败:`, error);
      }
    }
    return totalComments;
  };

  // 获取文章统计数据
  const fetchArticleStats = async () => {
    try {
      const articles = await articlesService.getUserArticles();
      let totalViews = 0;
      let totalLikes = 0;
      let totalCollections = 0;

      articles.forEach((article: Article) => {
        totalViews += article.views || 0;
        // 处理点赞数（如果是数组则取长度，否则取数值）
        totalLikes += Array.isArray(article.likes) ? article.likes.length : (article.likes || 0);
        // 处理收藏数（如果是数组则取长度，否则取数值）
        totalCollections += Array.isArray(article.collections) ? article.collections.length : (article.collections || 0);
      });

      // 确保获取所有文章的评论数
      const totalComments = await getTotalCommentsForAllArticles(articles);

      // 获取今日日期
      const today = dayjs().format('YYYY-MM-DD');

      // 从localStorage获取前日数据
      const storedStats = localStorage.getItem('articleStats');
      let prevStats = null;

      if (storedStats) {
        const parsed = JSON.parse(storedStats);
        // 检查是否是今日数据
        if (parsed.date === today) {
          prevStats = parsed;
        }
      }

      // 更新前日数据状态
      setPreviousStats(prevStats);

      // 存储今日数据到localStorage
      localStorage.setItem('articleStats', JSON.stringify({
        followers: user?.stats?.followers || 0,
        views: totalViews,
        likes: totalLikes,
        collections: totalCollections,
        comments: totalComments,
        articleCount: articles.length,
        date: today
      }));

      setArticleStats({ views: totalViews, comments: totalComments, likes: totalLikes, collections: totalCollections });
      setArticleCount(articles.length);
    } catch (error) {
      console.error('获取文章统计数据失败:', error);
    }
  };

  // 初始加载和用户变化时获取数据
  useEffect(() => {
    console.log('用户数据:', user);
    if (user) {
      fetchArticleStats();
    }
  }, [user]);

  // 确保组件挂载时获取最新的用户信息（包括粉丝数）
  useEffect(() => {
    const fetchLatestUserInfo = async () => {
      try {
        const userData = await authService.getUserInfo();
        updateUser(userData);
      } catch (error) {
        console.error('获取最新用户信息失败:', error);
      }
    };

    // 组件挂载时立即获取一次用户信息
    fetchLatestUserInfo();
  }, []);

  // 手动刷新数据
  const handleRefresh = async () => {
    if (user) {
      // 刷新文章统计数据
      await fetchArticleStats();
      
      // 刷新用户信息
      try {
        const userData = await authService.getUserInfo();
        updateUser(userData);
      } catch (error) {
        console.error('刷新用户信息失败:', error);
      }
    }
  };



  return (
    <div className={styles.homePage}>
      <div className={styles.userInfo}>
        <div className={styles.refreshButton}>
        <Button type="primary" onClick={handleRefresh} icon={<SyncOutlined />}>刷新数据</Button>
      </div>
      <img
          src={user?.avatar || "../src/assets/images/avatar/default.png"}
          alt="用户头像"
          className={styles.avatar}
        />
        <Title level={3}>{user?.username || "用户879455850472"}</Title>
        <Text>{user?.stats?.followers || 0} 粉丝 | {user?.stats?.following || 0} 关注  | 在掘金创作的第 {user?.createdAt ? dayjs().diff(dayjs(user.createdAt), 'day')+1 : 0} 天</Text>
      </div>
    
      <div className={styles.dataCards}>
        <Card className={styles.dataCard}>
          <Title level={2}>{user?.stats?.followers !== undefined ? user.stats.followers : 0}</Title>
          <Text>总粉丝数</Text>
          <Text type="secondary">较前日 {previousStats ? (
            (user?.stats?.followers || 0) - previousStats.followers > 0 ?
            '+' + ((user?.stats?.followers || 0) - previousStats.followers) :
            (user?.stats?.followers || 0) === previousStats.followers ?
            '--' : ((user?.stats?.followers || 0) - previousStats.followers)
          ) : '--'}</Text>
        </Card>
        <Card className={styles.dataCard}>
          <Title level={2}>{articleCount}</Title>
          <Text>文章展示数</Text>
          <Text type="secondary">较前日 {previousStats ? (
            articleCount - previousStats.articleCount > 0 ?
            '+' + (articleCount - previousStats.articleCount) :
            articleCount === previousStats.articleCount ?
            '--' : (articleCount - previousStats.articleCount)
          ) : '--'}</Text>
        </Card>
        <Card className={styles.dataCard}>
          <Title level={2}>{articleStats.views}</Title>
          <Text>文章阅读数</Text>
          <Text type="secondary">较前日 {previousStats ? (
            articleStats.views - previousStats.views > 0 ?
            '+' + (articleStats.views - previousStats.views) :
            articleStats.views === previousStats.views ?
            '--' : (articleStats.views - previousStats.views)
          ) : '--'}</Text>
        </Card>
        <Card className={styles.dataCard}>
          <Title level={2}>{articleStats.likes}</Title>
          <Text>文章点赞数</Text>
          <Text type="secondary">较前日 {previousStats ? (
            articleStats.likes - previousStats.likes > 0 ?
            '+' + (articleStats.likes - previousStats.likes) :
            articleStats.likes === previousStats.likes ?
            '--' : (articleStats.likes - previousStats.likes)
          ) : '--'}</Text>
        </Card>
        <Card className={styles.dataCard}>
          <Title level={2}>{articleStats.comments}</Title>
          <Text>文章评论数</Text>
          <Text type="secondary">较前日 {previousStats ? (
            articleStats.comments - previousStats.comments > 0 ?
            '+' + (articleStats.comments - previousStats.comments) :
            articleStats.comments === previousStats.comments ?
            '--' : (articleStats.comments - previousStats.comments)
          ) : '--'}</Text>
        </Card>
        <Card className={styles.dataCard}>
          <Title level={2}>{articleStats.collections}</Title>
          <Text>文章收藏数</Text>
          <Text type="secondary">较前日 {previousStats ? (
            articleStats.collections - previousStats.collections > 0 ?
            '+' + (articleStats.collections - previousStats.collections) :
            articleStats.collections === previousStats.collections ?
            '--' : (articleStats.collections - previousStats.collections)
          ) : '--'}</Text>
        </Card>
      </div>
    </div>
  );
};

// 内容管理页面组件 - 支持状态切换
const ContentManagementPage = () => {
  // 定义文章状态类型
  type ArticleStatus = 'all' | 'published' | 'reviewing' | 'rejected';
  type MainTab = 'article' | 'draft';
  // 状态管理
  const [mainTab, setMainTab] = useState<MainTab>('article');
  const [activeStatus, setActiveStatus] = useState<ArticleStatus>('all');
  const [articles, setArticles] = useState<any[]>([]); // 实际项目中应定义具体类型
  const [articleCounts, setArticleCounts] = useState({
    all: 0,
    published: 0,
    reviewing: 0,
    draft: 0
  });
  const { user } = useUser();
  const navigate = useNavigate();

  // 获取并处理文章数据
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const data = await articlesService.getUserArticles();
        const now = dayjs();
        const userArticles = data;
        const counts = {
          all: data.length,
          published: 0,
          reviewing: 0,
          draft: 0
        };

        // 分类统计文章
        userArticles.forEach((article: Article) => {
          if (article.isDraft) {
            if (article.publishTime && dayjs(article.publishTime).isAfter(now)) {
              counts.reviewing++;
            } else {
              counts.draft++;
            }
          } else if (article.isPublic && dayjs(article.publishTime).isBefore(now)) {
            counts.published++;
          }
        });

        setArticles(userArticles);
        setArticleCounts(counts);
      } catch (error) {
        console.error('获取文章失败:', error);
      }
    };

    fetchArticles();
  }, []);

  // 根据状态筛选文章
  const filterArticles = () => {
    const now = dayjs();
    if (mainTab === 'draft') {
      return articles.filter((article: Article) => article.isDraft && (!article.publishTime || dayjs(article.publishTime).isBefore(now)));
    }

    switch (activeStatus) {
      case 'published':
        return articles.filter((article: Article) => !article.isDraft && article.isPublic && dayjs(article.publishTime).isBefore(now));
      case 'reviewing':
        return articles.filter((article: Article) => article.isDraft && article.publishTime && dayjs(article.publishTime).isAfter(now));
      default:
        // '全部'状态下只显示已发布和待发布文章，不显示草稿
        return articles.filter((article: Article) => 
          (!article.isDraft && article.isPublic && dayjs(article.publishTime).isBefore(now)) || 
          (article.isDraft && article.publishTime && dayjs(article.publishTime).isAfter(now))
        );
    }
  }

  // 状态标签配置
  const statusTabs = [
    {
    key: 'all', label: '全部', count: articleCounts.all },
    { key: 'published', label: '已发布', count: articleCounts.published },
    { key: 'reviewing', label: '待发布', count: articleCounts.reviewing },
  ];

  // 切换状态
  const handleStatusChange = (status: ArticleStatus) => {
    setActiveStatus(status);
    // 实际项目中这里可以根据状态请求对应数据
    // 示例: fetchArticlesByStatus(status).then(data => setArticles(data))
  };

  // 主tab切换
  const handleMainTabChange = (tab: MainTab) => {
    setMainTab(tab);
    // 切换到草稿箱时不显示状态tab
    if (tab === 'draft') {
      setActiveStatus('all');
    }
  };

  return (
    <div className={styles.contentManagementPage}>
      <div className={styles.header}>
        <div>
          <div className={styles.mainTabs}>
            <div
              className={mainTab === 'article' ? `${styles.mainTab} ${styles.mainTabActive}` : styles.mainTab}
              onClick={() => handleMainTabChange('article')}
            >
              文章
            </div>
            <div
              className={mainTab === 'draft' ? `${styles.mainTab} ${styles.mainTabActive}` : styles.mainTab}
              onClick={() => handleMainTabChange('draft')}
            >
              草稿箱({articleCounts.draft})
            </div>
          </div>
          {mainTab === 'article' && (
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
          )}
        </div>
        <Button type="primary" className={styles.writeButton}>
          写文章
        </Button>
      </div>
      <Input
        placeholder={mainTab === 'article' ? '请输入标题关键字' : '搜索草稿'}
        prefix={<FileTextOutlined />}
        className={styles.searchInput}
      />
      {mainTab === 'article' ? (
        filterArticles().length === 0 ? (
          <Empty
            description={`暂无${statusTabs.find(t => t.key === activeStatus)?.label}内容`}
            image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
          >
            <Button type="primary">开始创作</Button>
          </Empty>
        ) : (
          <div className={`${styles.articleList} ${articleListStyles.articleContainer}`}>
            <ArticleList
              articles={filterArticles()}
              loading={false}
              onArticleClick={(id) => navigate(`/article/${id}`)}
              showAction={false}
            />
          </div>
        )
      ) : (
        <div className={`${styles.draftList} ${articleListStyles.articleContainer}`}>
          {/* 使用ArticleList组件显示草稿文章 */}
          <ArticleList
              articles={filterArticles()}
              loading={false}
              onArticleClick={(id) => navigate(`/write/${id}`)}
              showAction={false}
            />
        </div>
      )}
    </div>
  );
};

// 内容数据页面组件
interface ArticleDataPageProps {
  user: any; // 实际项目中应定义具体的User类型
  previousStats: { followers: number; articleCount: number; views: number; likes: number; comments: number; collections: number } | null;
  articleCount: number;
  articleStats: { views: number; likes: number; comments: number; collections: number };
}

const ArticleDataPage = ({ user, previousStats, articleCount, articleStats }: ArticleDataPageProps) => (
  <div className={styles.articleDataPage}>
    <div className={styles.header}>
      <Title level={2}>文章数据</Title>
      <Text>{dayjs().format('YYYY-MM-DD')} 数据表现</Text>
    </div>
    
      <div className={styles.dataCards}>
        <Card className={styles.dataCard}>
          <Title level={2}>{user?.stats?.followers !== undefined ? user.stats.followers : 0}</Title>
          <Text>总粉丝数</Text>
          <Text type="secondary">较前日 {previousStats ? (
            (user?.stats?.followers || 0) - previousStats.followers > 0 ?
            '+' + ((user?.stats?.followers || 0) - previousStats.followers) :
            (user?.stats?.followers || 0) === previousStats.followers ?
            '--' : ((user?.stats?.followers || 0) - previousStats.followers)
          ) : '--'}</Text>
        </Card>
        <Card className={styles.dataCard}>
          <Title level={2}>{articleCount}</Title>
          <Text>文章展示数</Text>
          <Text type="secondary">较前日 {previousStats ? (
            articleCount - previousStats.articleCount > 0 ?
            '+' + (articleCount - previousStats.articleCount) :
            articleCount === previousStats.articleCount ?
            '--' : (articleCount - previousStats.articleCount)
          ) : '--'}</Text>
        </Card>
        <Card className={styles.dataCard}>
          <Title level={2}>{articleStats.views}</Title>
          <Text>文章阅读数</Text>
          <Text type="secondary">较前日 {previousStats ? (
            articleStats.views - previousStats.views > 0 ?
            '+' + (articleStats.views - previousStats.views) :
            articleStats.views === previousStats.views ?
            '--' : (articleStats.views - previousStats.views)
          ) : '--'}</Text>
        </Card>
        <Card className={styles.dataCard}>
          <Title level={2}>{articleStats.likes}</Title>
          <Text>文章点赞数</Text>
          <Text type="secondary">较前日 {previousStats ? (
            articleStats.likes - previousStats.likes > 0 ?
            '+' + (articleStats.likes - previousStats.likes) :
            articleStats.likes === previousStats.likes ?
            '--' : (articleStats.likes - previousStats.likes)
          ) : '--'}</Text>
        </Card>
        <Card className={styles.dataCard}>
          <Title level={2}>{articleStats.comments}</Title>
          <Text>文章评论数</Text>
          <Text type="secondary">较前日 {previousStats ? (
            articleStats.comments - previousStats.comments > 0 ?
            '+' + (articleStats.comments - previousStats.comments) :
            articleStats.comments === previousStats.comments ?
            '--' : (articleStats.comments - previousStats.comments)
          ) : '--'}</Text>
        </Card>
        <Card className={styles.dataCard}>
          <Title level={2}>{articleStats.collections}</Title>
          <Text>文章收藏数</Text>
          <Text type="secondary">较前日 {previousStats ? (
            articleStats.collections - previousStats.collections > 0 ?
            '+' + (articleStats.collections - previousStats.collections) :
            articleStats.collections === previousStats.collections ?
            '--' : (articleStats.collections - previousStats.collections)
          ) : '--'}</Text>
        </Card>
      </div>
  </div>
);

// 粉丝数据页面组件
const FanDataPage = () => (
  <div className={styles.fanDataPage}>
    <div className={styles.header}>
      <Title level={2}>粉丝数据</Title>
      <Text>{dayjs().format('YYYY-MM-DD')} 数据表现</Text>
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
  const { user } = useUser();
  const [articleStats, setArticleStats] = useState<{ views: number; comments: number; likes: number; collections: number }>({ views: 0, comments: 0, likes: 0, collections: 0 });
  const [articleCount, setArticleCount] = useState<number>(0);
  const [previousStats, setPreviousStats] = useState<{
    followers: number;
    views: number;
    likes: number;
    collections: number;
    comments: number;
    articleCount: number;
    date: string;
  } | null>(null);

  // 获取所有文章的评论总数
  const getTotalCommentsForAllArticles = async (articles: Article[]) => {
    let totalComments = 0;
    for (const article of articles) {
      try {
        // 获取单篇文章的评论数
        // 确保传递的是有效的文章ID字符串
        const articleId = typeof article._id === 'string' ? article._id : article.id;
        const comments = await commentService.getComments(articleId);
        totalComments += comments.length;
      } catch (error) {
        console.error(`获取文章 ${article.id} 的评论数失败:`, error);
      }
    }
    return totalComments;
  };

  // 获取文章统计数据
  const fetchArticleStats = async () => {
    try {
      const articles = await articlesService.getUserArticles();
      let totalViews = 0;
      let totalLikes = 0;
      let totalCollections = 0;

      articles.forEach((article: Article) => {
        totalViews += article.views || 0;
        // 处理点赞数（如果是数组则取长度，否则取数值）
        totalLikes += Array.isArray(article.likes) ? article.likes.length : (article.likes || 0);
        // 处理收藏数（如果是数组则取长度，否则取数值）
        totalCollections += Array.isArray(article.collections) ? article.collections.length : (article.collections || 0);
      });

      // 确保获取所有文章的评论数
      const totalComments = await getTotalCommentsForAllArticles(articles);

      // 获取今日日期
      const today = dayjs().format('YYYY-MM-DD');

      // 从localStorage获取前日数据
      const storedStats = localStorage.getItem('articleStats');
      let prevStats = null;

      if (storedStats) {
        const parsed = JSON.parse(storedStats);
        // 检查是否是今日数据
        if (parsed.date === today) {
          prevStats = parsed;
        }
      }

      // 更新前日数据状态
      setPreviousStats(prevStats);

      // 存储今日数据到localStorage
      localStorage.setItem('articleStats', JSON.stringify({
        followers: user?.stats?.followers || 0,
        views: totalViews,
        likes: totalLikes,
        collections: totalCollections,
        comments: totalComments,
        articleCount: articles.length,
        date: today
      }));

      setArticleStats({ views: totalViews, comments: totalComments, likes: totalLikes, collections: totalCollections });
      setArticleCount(articles.length);
    } catch (error) {
      console.error('获取文章统计数据失败:', error);
    }
  };

  // 初始加载和用户变化时获取数据
  useEffect(() => {
    if (user) {
      fetchArticleStats();
    }
  }, [user, selectedKey]);

  const handleMenuClick = (e: { key: string }) => {
    setSelectedKey(e.key);
    // 当切换到数据页面时，重新获取数据
    if (e.key === 'articleData') {
      fetchArticleStats();
    }
  };

  return (
    <div>
      <SubHeader />
      <Layout className={styles.layout}>
        <Sider width={200} theme="light" className={styles.sider}>
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            onClick={handleMenuClick}
            className={styles.menu}
            items={[
              {
                key: 'home',
                icon: <HomeOutlined />,
                label: '首页',
              },
              {
                key: 'contentManagement',
                icon: <FileTextOutlined />,
                label: '内容管理',
              },
              {
                key: 'dataCenter',
                icon: <BarChartOutlined />,
                label: '数据中心',
                children: [
                  {
                    key: 'articleData',
                    label: '内容数据',
                  },
                  {
                    key: 'fanData',
                    label: '粉丝数据',
                  },
                ],
              },
            ]}
          />
        </Sider>
        <Layout className={styles.mainLayout}>
          <Content className={styles.content}>
            {selectedKey === 'home' && <HomePage />}
            {selectedKey === 'contentManagement' && <ContentManagementPage />}
            {selectedKey === 'articleData' && <ArticleDataPage user={user} previousStats={previousStats} articleCount={articleCount} articleStats={articleStats} />}
            {selectedKey === 'fanData' && <FanDataPage />}
          </Content>
        </Layout>
      </Layout>
    </div>
  );
};

export default CreatorCenter;