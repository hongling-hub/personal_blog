import { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import articlesService from '../../services/articles';
import { Empty } from 'antd';
import ArticleList from '../ArticleList';
import { useNavigate } from 'react-router-dom';

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

export default function Follow() {
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasFollowing, setHasFollowing] = useState(true);
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFollowingArticles = async () => {
      try {
        setLoading(true);
        if (!user) {
          // 用户未登录，重定向到登录页
          navigate('/auth');
          return;
        }

        const data = await articlesService.getFollowingArticles();
        setArticles(data);
        // 检查是否有关注的文章
        setHasFollowing(data.length > 0);
      } catch (error) {
          console.error('获取关注文章失败:', error);
          // 确保articles始终是数组
          setArticles([]);
          // 假设错误是因为没有关注人
          setHasFollowing(false);
        } finally {
        setLoading(false);
      }
    };

    fetchFollowingArticles();
  }, [user, navigate]);

  // 按最新排序
  const sortedArticles = [...articles].sort((a, b) => {
    return new Date(b.publishTime).getTime() - new Date(a.publishTime).getTime();
  });

  return (
    <div>
      {loading ? (
        <div>加载中...</div>
      ) : hasFollowing ? (
        <ArticleList
          articles={sortedArticles}
          loading={loading}
          onArticleClick={(id) => navigate(`/article/${id}`)}
          showAction={true}
          emptyText="暂无关注人发布的文章"
        />
      ) : (
        <Empty
          image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
          imageStyle={{ height: 120 }}
          description="暂无关注人发布的文章"
        />
      )}
    </div>
  );
}