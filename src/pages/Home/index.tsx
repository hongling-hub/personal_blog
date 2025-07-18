import styles from './index.module.scss';
import { Layout, Card, List, Tabs, Menu, Tag, Button, Divider, Avatar } from 'antd';
import Footer from '../../components/Footer';
import { FireOutlined, StarOutlined, ThunderboltOutlined, AppstoreOutlined, CodeOutlined, MonitorOutlined, PhoneOutlined, AppleOutlined, RobotOutlined, ToolOutlined, BookOutlined, TrophyOutlined, ReloadOutlined } from '@ant-design/icons';

const { Header, Content, Sider } = Layout;

export default function Home() {
  interface ArticleItem {
  title: string;
  desc: string;
  author: string;
  authorAvatar: string;
  date: string;
  views: number;
  likes: number;
  image: string;
  tags: string[];
}

const articleData: ArticleItem[] = [
    {
      title: 'STM32--USART串口通信的应用（第一节串口通信的概念）',
      desc: '我们在发送的数据的时候，比如说我们的微控制器往外发送的时候，通过这。好，如果说你这个校验位你配置好了之后...',
      author: '金星娃儿',
      authorAvatar: 'https://picsum.photos/id/1/40/40',
      date: '2023-06-15',
      views: 158,
      likes: 3,
      image: 'https://img-blog.csdnimg.cn/img_convert/3a7a4a5f9e8d7a6b8c7d1e2f3a4b5c6d.png',
      tags: ['嵌入式', 'STM32', '串口通信']
    },
    {
      title: 'C语言32个关键字',
      desc: '一共32个关键字分为。',
      author: '慈悲不渡自绝的人',
      authorAvatar: 'https://picsum.photos/id/2/40/40',
      date: '2023-06-10',
      views: 1200,
      likes: 17,
      image: 'https://img-blog.csdnimg.cn/img_convert/4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e.png',
      tags: ['C语言', '编程基础', '关键字']
    },
    {
      title: '蓝桥杯 第十六届（2025）真题思路复盘解析',
      desc: '本文以洛谷平台所提供的题目描述及评测数据为基础进行讲解。前言：这是本人的蓝桥杯试卷...',
      author: 'apcipot_rain',
      authorAvatar: 'https://picsum.photos/id/3/40/40',
      date: '2023-06-05',
      views: 5400,
      likes: 63,
      image: 'https://img-blog.csdnimg.cn/img_convert/5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f.png',
      tags: ['算法', '蓝桥杯', '竞赛']
    }
  ];

  const items = [
    {
      key: '1',
      label: (
        <>
          <FireOutlined /> 推荐
        </>
      ),
      children: (
        <div className={styles.articleContainer}>
          <div className={styles.mainContent}>
            <List
              itemLayout="vertical"
              size="large"
              dataSource={articleData}
              renderItem={item => (
                  <List.Item
                    key={item.title}
                    className={styles.articleItem}
                  >
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <List.Item.Meta
                          title={<a href="#">{item.title}</a>}
                          description={
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <div>{item.author}</div>
                              <div style={{ 
                                display: '-webkit-box', 
                                WebkitLineClamp: 3, 
                                WebkitBoxOrient: 'vertical', 
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}>{item.desc}</div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <span>{item.date}</span>
                                <span>{item.author}</span>
                                <span>{item.views}浏览</span>
                                <span>{item.likes}点赞</span>
                              </div>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                {item.tags.slice(0, 3).map(tag => (
                                  <Tag key={tag} style={{ marginRight: '4px' }}>{tag}</Tag>
                                ))}
                                {item.tags.length > 3 && <Tag>...</Tag>}
                              </div>
                            </div>
                          }
                        />
                      </div>
                      {item.image && (
                        <div className={styles.articleImage} style={{ flexShrink: 0, width: '200px' }}>
                          <img src={item.image} alt={item.title} style={{ width: '100%', height: 'auto' }} />
                        </div>
                      )}
                    </div>
                  </List.Item>
                )}
            />
          </div>
        </div>
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
        <div className={styles.articleContainer}>
          <div className={styles.mainContent}>
            <List
              itemLayout="vertical"
              size="large"
              dataSource={articleData}
              renderItem={item => (
                  <List.Item
                    key={item.title}
                    className={styles.articleItem}
                  >
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <List.Item.Meta
                          title={<a href="#">{item.title}</a>}
                          description={
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <div>{item.author}</div>
                              <div style={{ 
                                display: '-webkit-box', 
                                WebkitLineClamp: 3, 
                                WebkitBoxOrient: 'vertical', 
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}>{item.desc}</div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <span>{item.date}</span>
                                <span>{item.author}</span>
                                <span>{item.views}浏览</span>
                                <span>{item.likes}点赞</span>
                              </div>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                {item.tags.slice(0, 3).map(tag => (
                                  <Tag key={tag} style={{ marginRight: '4px' }}>{tag}</Tag>
                                ))}
                                {item.tags.length > 3 && <Tag>...</Tag>}
                              </div>
                            </div>
                          }
                        />
                      </div>
                      {item.image && (
                        <div className={styles.articleImage} style={{ flexShrink: 0, width: '200px' }}>
                          <img src={item.image} alt={item.title} style={{ width: '100%', height: 'auto' }} />
                        </div>
                      )}
                    </div>
                  </List.Item>
                )}
            />
          </div>
        </div>
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
        <div className={styles.articleContainer}>
          <div className={styles.mainContent}>
            <List
              itemLayout="vertical"
              size="large"
              dataSource={articleData}
              renderItem={item => (
                  <List.Item
                    key={item.title}
                    className={styles.articleItem}
                  >
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <List.Item.Meta
                          title={<a href="#">{item.title}</a>}
                          description={
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <div>{item.author}</div>
                              <div style={{ 
                                display: '-webkit-box', 
                                WebkitLineClamp: 3, 
                                WebkitBoxOrient: 'vertical', 
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}>{item.desc}</div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <span>{item.date}</span>
                                <span>{item.author}</span>
                                <span>{item.views}浏览</span>
                                <span>{item.likes}点赞</span>
                              </div>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                {item.tags.slice(0, 3).map(tag => (
                                  <Tag key={tag} style={{ marginRight: '4px' }}>{tag}</Tag>
                                ))}
                                {item.tags.length > 3 && <Tag>...</Tag>}
                              </div>
                            </div>
                          }
                        />
                      </div>
                      {item.image && (
                        <div className={styles.articleImage} style={{ flexShrink: 0, width: '200px' }}>
                          <img src={item.image} alt={item.title} style={{ width: '100%', height: 'auto' }} />
                        </div>
                      )}
                    </div>
                  </List.Item>
                )}
            />
          </div>
        </div>
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
              dataSource={articleData.slice(0, 5)}
              renderItem={(item, index) => (
                <List.Item key={item.title} style={{ padding: '8px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ width: 20, textAlign: 'center', marginRight: 12, fontWeight: 'bold', color: index < 3 ? '#faad14' : '#888' }}>
                      {index + 1}
                    </span>
                    <Avatar size={24} src={item.authorAvatar || 'https://picsum.photos/id/1005/200'} />
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
