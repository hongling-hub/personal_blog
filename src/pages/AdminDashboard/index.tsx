import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Table, Tabs } from 'antd';
import { BarChartOutlined, CommentOutlined, LikeOutlined, UserOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { adminService } from '@/services/admin';
import styles from './index.module.scss';

// 类型定义
interface StatisticsData {
  articleCount?: number;
  commentCount?: number;
  likeCount?: number;
  userCount?: number;
  tagDistribution?: Array<{
    name: string;
    value: number;
  }>;
  popularArticles?: Array<{
    _id: string;
    title: string;
    author: string;
    commentCount: number;
    likeCount: number;
  }>;
}

type TabKey = 'overview' | 'articles';

const { TabPane } = Tabs;

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState<StatisticsData>({});
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  // 从路由路径中获取当前激活的tab (例如: /admin/overview -> 'overview')
  const activeKey = (location.pathname.split('/').pop() as TabKey) || 'overview';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await adminService.getStatistics();
        setStatistics(data);
      } catch (error) {
        setError('获取统计数据失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleTabChange = (key: string) => {
    navigate(`/admin/${key}`);
  };

  // 柱状图配置
  const barOption = {
    title: {
      text: '文章数据统计'
    },
    tooltip: {},
    legend: {
      data: ['数量']
    },
    xAxis: {
      data: ['文章总数', '评论总数', '点赞总数', '用户总数']
    },
    yAxis: {},
    series: [
      {
        name: '数量',
        type: 'bar',
        data: [
          statistics.articleCount || 0,
          statistics.commentCount || 0,
          statistics.likeCount || 0,
          statistics.userCount || 0
        ],
        itemStyle: {
          color: '#1890ff' // 设置柱状图颜色
        }
      }
    ]
  };

  // 饼图配置
  const pieOption = {
    title: {
      text: '文章分类统计'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    series: [
      {
        name: '分类',
        type: 'pie',
        radius: ['50%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: statistics.tagDistribution || [],
        roseType: 'radius' // 南丁格尔图效果
      }
    ]
  };

  // 表格列配置
  const columns = [
    {
      title: '文章标题',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => <a>{text}</a> // 可点击的标题
    },
    {
      title: '作者',
      dataIndex: 'author',
      key: 'author'
    },
    {
      title: '评论数',
      dataIndex: 'commentCount',
      key: 'commentCount',
      sorter: (a: any, b: any) => a.commentCount - b.commentCount // 排序功能
    },
    {
      title: '点赞数',
      dataIndex: 'likeCount',
      key: 'likeCount',
      sorter: (a: any, b: any) => a.likeCount - b.likeCount
    }
  ];

  // 统计卡片组件
  const StatisticCard: React.FC<{
    title: string;
    value: number;
    icon: React.ReactNode;
  }> = ({ title, value, icon }) => (
    <Card hoverable>
      <div className={styles.statisticCard}>
        <span className={styles.icon}>{icon}</span>
        <div className={styles.content}>
          <div className={styles.title}>{title}</div>
          <div className={styles.value}>{value}</div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className={styles.container}>
      <Tabs activeKey={activeKey} onChange={handleTabChange}>
        <TabPane tab="数据概览" key="overview">
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Card title="数据统计" loading={loading}>
                <Row gutter={16}>
                  <Col span={6}>
                    <StatisticCard
                      title="用户总数"
                      value={statistics.userCount || 0}
                      icon={<UserOutlined />}
                    />
                  </Col>
                  <Col span={6}>
                    <StatisticCard
                      title="文章总数"
                      value={statistics.articleCount || 0}
                      icon={<BarChartOutlined />}
                    />
                  </Col>
                  <Col span={6}>
                    <StatisticCard
                      title="评论总数"
                      value={statistics.commentCount || 0}
                      icon={<CommentOutlined />}
                    />
                  </Col>
                  <Col span={6}>
                    <StatisticCard
                      title="点赞总数"
                      value={statistics.likeCount || 0}
                      icon={<LikeOutlined />}
                    />
                  </Col>
                </Row>
              </Card>
            </Col>
            
            <Col xs={24} md={12}>
              <Card title="文章数据" loading={loading}>
                <ReactECharts option={barOption} style={{ height: 400 }} />
              </Card>
            </Col>
            
            <Col xs={24} md={12}>
              <Card title="分类统计" loading={loading}>
                <ReactECharts option={pieOption} style={{ height: 400 }} />
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="文章管理" key="articles">
          <Card title="热门文章" loading={loading}>
            <Table 
              columns={columns} 
              dataSource={statistics.popularArticles || []} 
              rowKey="_id"
              pagination={{ pageSize: 5 }}
              scroll={{ x: true }}
            />
          </Card>
        </TabPane>
      </Tabs>

      {/* 子路由出口 */}
      <Outlet />
    </div>
  );
};

export default AdminDashboard;