import styles from './index.module.scss';
import { Layout, Card, List, Tabs, Menu } from 'antd';
import { FireOutlined, StarOutlined, ThunderboltOutlined } from '@ant-design/icons';

const { Header, Content, Sider } = Layout;

export default function Home() {
  const articleData = [
    {
      title: 'STM32--USART串口通信的应用（第一节串口通信的概念）',
      desc: '我们在发送的数据的时候，比如说我们的微控制器往外发送的时候，通过这。好，如果说你这个校验位你配置好了之后...',
      author: '金星娃儿',
      date: '2023-06-15',
      views: 158,
      likes: 3,
      image: 'https://img-blog.csdnimg.cn/img_convert/3a7a4a5f9e8d7a6b8c7d1e2f3a4b5c6d.png'
    },
    {
      title: 'C语言32个关键字',
      desc: '一共32个关键字分为。',
      author: '慈悲不渡自绝的人',
      date: '2023-06-10',
      views: 1200,
      likes: 17,
      image: 'https://img-blog.csdnimg.cn/img_convert/4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e.png'
    },
    {
      title: '蓝桥杯 第十六届（2025）真题思路复盘解析',
      desc: '本文以洛谷平台所提供的题目描述及评测数据为基础进行讲解。前言：这是本人的蓝桥杯试卷...',
      author: 'apcipot_rain',
      date: '2023-06-05',
      views: 5400,
      likes: 63,
      image: 'https://img-blog.csdnimg.cn/img_convert/5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f.png'
    }
  ];

  return (
    <Layout className={styles.layout}>
      
      <Content className={styles.content}>
        <Tabs
          defaultActiveKey="1"
          className={styles.articleTabs}
          items={[
            { key: '1', icon: <FireOutlined />, label: '推荐' },
            { key: '2', icon: <ThunderboltOutlined />, label: '最新' },
            { key: '3', icon: <StarOutlined />, label: '热门' }
          ]}
        />
        
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
                  actions={[
                    <span>{item.date}</span>,
                    <span>{item.views}浏览</span>,
                    <span>{item.likes}点赞</span>
                  ]}
                >
                  <List.Item.Meta
                    title={<a href="#">{item.title}</a>}
                    description={item.desc}
                  />
                  {item.image && (
                    <div className={styles.articleImage}>
                      <img src={item.image} alt={item.title} />
                    </div>
                  )}
                </List.Item>
              )}
            />
          </div>
          
          <Sider width={280} className={styles.sidebar}>
            <Card title="热门作者" className={styles.sideCard}>
              <List
                dataSource={['技术大牛', '前端专家', '全栈工程师']}
                renderItem={item => (
                  <List.Item>
                    <List.Item.Meta
                      title={<a href="#">{item}</a>}
                    />
                  </List.Item>
                )}
              />
            </Card>
            
            <Card title="热门标签" className={styles.sideCard}>
              <div className={styles.tagContainer}>
                {[{'name':'React','size':18,'color':'#f5222d'},{'name':'TypeScript','size':16,'color':'#1890ff'},{'name':'Node.js','size':20,'color':'#52c41a'},{'name':'Vue','size':17,'color':'#fa8c16'},{'name':'Python','size':19,'color':'#722ed1'},{'name':'Java','size':21,'color':'#f5222d'},{'name':'前端','size':15,'color':'#1890ff'},{'name':'后端','size':18,'color':'#52c41a'},{'name':'人工智能','size':16,'color':'#722ed1'},{'name':'机器学习','size':14,'color':'#fa8c16'},{'name':'深度学习','size':17,'color':'#f5222d'},{'name':'大数据','size':15,'color':'#1890ff'},{'name':'云计算','size':16,'color':'#52c41a'},{'name':'区块链','size':14,'color':'#fa8c16'},{'name':'微服务','size':15,'color':'#722ed1'}].map((tag, index) => (
                  <span key={index} className={styles.tag} style={{fontSize: `${tag.size}px`, color: tag.color}}>{tag.name}</span>
                ))}
              </div>
            </Card>
          </Sider>
        </div>
      </Content>
    </Layout>
  );
}