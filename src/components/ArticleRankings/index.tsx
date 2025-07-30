 import React, { useState, useEffect } from 'react';
import { Card, List, Avatar, Button, Divider } from 'antd';
import { TrophyOutlined, ReloadOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import styles from './ArticleRankings.module.scss';

// 定义文章项类型
export interface ArticleItem {
  _id: string;
  title: string;
  author: {
    avatar?: string;
    username: string;
  };
  views: number;
  likeCount: number;
  publishTime: string;
}

// 文章榜组件props类型
interface ArticleRankingsProps {
  articles: ArticleItem[];
}

const ArticleRankings: React.FC<ArticleRankingsProps> = ({ articles }) => {
  const [rankedArticles, setRankedArticles] = useState<ArticleItem[]>([]);

  useEffect(() => {
    // 按热度(这里假设按浏览量)排序
    const sortedArticles = [...articles].sort((a, b) => b.views - a.views);
    setRankedArticles(sortedArticles);
  }, [articles]);

  // 换一换功能 - 随机打乱前5篇文章
  const handleRefresh = () => {
    const newArticles = [...rankedArticles];
    // 仅打乱前5篇
    for (let i = 4; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArticles[i], newArticles[j]] = [newArticles[j], newArticles[i]];
    }
    setRankedArticles(newArticles);
  };

  return (
    <Card className={styles.rankCard}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
          <TrophyOutlined style={{ color: '#faad14', marginRight: 8 }} />
          文章榜
        </h3>
        <Button size="small" icon={<ReloadOutlined />} onClick={handleRefresh}>换一换</Button>
      </div>
      <List
        dataSource={rankedArticles.slice(0, 5)} // 取前5篇
        renderItem={(item: ArticleItem, index: number) => (
          <List.Item key={item._id} style={{ padding: '8px 0' }}>
            <Link to={`/article/${item._id}`} style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <span style={{ width: 20, textAlign: 'center', marginRight: 12, fontWeight: 'bold', color: index < 3 ? '#faad14' : '#888' }}>
                {index + 1}
              </span>
              <Avatar size={24} src={item.author.avatar || 'https://picsum.photos/id/1005/200'} />
              <span style={{ marginLeft: 8, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.title}
              </span>
            </Link>
          </List.Item>
        )}
      />
      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <a href="/rankings" style={{ color: '#1890ff' }}>查看更多</a>
      </div>
    </Card>
  );
};

export default ArticleRankings;