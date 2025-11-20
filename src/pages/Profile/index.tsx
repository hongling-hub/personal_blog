import React from 'react';
import { Avatar, Button, Tabs, message, Spin } from 'antd';
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useUser } from '../../contexts/UserContext';
import authService from '../../services/auth';
import articlesService from '../../services/articles';
import commentsService from '../../services/comments';
import ArticleList from '../../components/ArticleList';

// 定义文章类型
interface ArticleItem {
  _id: string;
  title: string;
  desc: string;
  content: string;
  author: { username: string; avatar: string };
  views: number;
  likeCount: number;
  coverImage: string;
  tags: string[];
  publishTime: string;
}
import styles from './index.module.scss';
import articleListStyles from '../../components/ArticleList/index.module.scss';

// 定义评论类型
interface CommentItem {
  _id: string;
  content: string;
  articleId: string;
  articleTitle: string;
  createdAt: string;
  articleAuthor?: { username: string; avatar: string };
}

// 定义用户信息类型
interface UserProfile {
  username: string;
  avatar: string;
  bioItems: string[];
  joinDate: string;
  stats: {
    posts: number;
    followers: number;
    following: number;
    collections: number;
    tags: number;
    likes: number;
  };
}

// 定义关注用户类型
interface FollowingUser {
  _id: string;
  username: string;
  avatar: string;
  bio?: string;
  isVerified?: boolean;
  createdAt: string;
}



const ProfilePage: React.FC = () => {
  const { user, updateUser } = useUser();
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [likedArticles, setLikedArticles] = useState<ArticleItem[]>([]);
  const [likedArticlesLoading, setLikedArticlesLoading] = useState(false);
  const [userArticles, setUserArticles] = useState<ArticleItem[]>([]);
  const [userArticlesLoading, setUserArticlesLoading] = useState(false);
  const [collectedArticles, setCollectedArticles] = useState<ArticleItem[]>([]);
  const [collectedArticlesLoading, setCollectedArticlesLoading] = useState(false);
  const [followingUsers, setFollowingUsers] = useState<FollowingUser[]>([]);
  const [followingUsersLoading, setFollowingUsersLoading] = useState(false);
  const [myComments, setMyComments] = useState<CommentItem[]>([]);
  const [myCommentsLoading, setMyCommentsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');

  // 获取用户信息
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const data = await authService.getUserInfo();
        setUserData({
          ...data,
          bioItems: ['+ 你从事什么职业？', '+ 你有哪些爱好？'],
          joinDate: data.createdAt || new Date().toISOString()
        });
        
        // 获取用户点赞的文章
        fetchLikedArticles();
        // 获取用户自己的文章
        fetchUserArticles();
        // 获取用户收藏的文章
        fetchCollectedArticles();
        // 获取用户自己的评论
        fetchMyComments();
        // 获取用户关注的用户
        fetchFollowingUsers();
      } catch (error) {
        message.error('获取用户信息失败');
        console.error('获取用户信息失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);
  
  // 获取用户点赞的文章
  const fetchLikedArticles = async () => {
    try {
      setLikedArticlesLoading(true);
      // 尝试使用API获取数据，如果失败则使用fallback
      try {
        const data = await articlesService.getLikedArticles();
        
        // 检查data是否为数组
        if (Array.isArray(data)) {
          // 转换数据格式以匹配ArticleItem接口
          const formattedArticles: ArticleItem[] = data.map((article: any) => ({
            _id: article._id,
            title: article.title,
            desc: article.desc || (article.content ? article.content.substring(0, 150) + '...' : ''),
            content: article.content,
            author: {
              username: article.author?.username || '匿名用户',
              avatar: article.author?.avatar || 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png'
            },
            views: article.views || 0,
            likeCount: article.likeCount || 0,
            coverImage: article.coverImage || '',
            tags: article.tags || [],
            publishTime: article.publishTime || new Date(article.createdAt || Date.now()).toISOString().split('T')[0]
          }));
          
          setLikedArticles(formattedArticles);
        } else {
          // 如果data不是数组，使用空数组
          setLikedArticles([]);
        }
      } catch (apiError) {
        console.log('API调用失败，使用fallback方案');
        // 由于后端API不存在或出错，使用空数组作为fallback
        setLikedArticles([]);
      }
    } catch (error) {
      message.error('获取点赞文章失败');
      console.error('获取点赞文章失败:', error);
      // 确保即使外层catch也能设置空数组
      setLikedArticles([]);
    } finally {
      setLikedArticlesLoading(false);
    }
  };

  // 获取用户自己的文章
  const fetchUserArticles = async () => {
    try {
      setUserArticlesLoading(true);
      // 尝试使用API获取数据，如果失败则使用fallback
      try {
        const data = await articlesService.getUserArticles();
        
        // 检查data是否为数组
        if (Array.isArray(data)) {
          // 转换数据格式以匹配ArticleItem接口
          const formattedArticles: ArticleItem[] = data.map((article: any) => ({
            _id: article._id,
            title: article.title,
            desc: article.desc || (article.content ? article.content.substring(0, 150) + '...' : ''),
            content: article.content,
            author: {
              username: article.author?.username || '匿名用户',
              avatar: article.author?.avatar || 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png'
            },
            views: article.views || 0,
            likeCount: article.likeCount || 0,
            coverImage: article.coverImage || '',
            tags: article.tags || [],
            publishTime: article.publishTime || new Date(article.createdAt || Date.now()).toISOString().split('T')[0]
          }));
          
          setUserArticles(formattedArticles);
        } else {
          // 如果data不是数组，使用空数组
          setUserArticles([]);
        }
      } catch (apiError) {
        console.log('获取用户文章API调用失败，使用fallback方案');
        // 由于后端API不存在或出错，使用空数组作为fallback
        setUserArticles([]);
      }
    } catch (error) {
      message.error('获取用户文章失败');
      console.error('获取用户文章失败:', error);
      // 确保即使外层catch也能设置空数组
      setUserArticles([]);
    } finally {
      setUserArticlesLoading(false);
    }
  };
  
  // 获取用户收藏的文章
  const fetchCollectedArticles = async () => {
    try {
      setCollectedArticlesLoading(true);
      // 尝试使用API获取数据，如果失败则使用fallback
      try {
        const data = await articlesService.getCollectedArticles();
        
        // 检查data是否为数组
        if (Array.isArray(data)) {
          // 转换数据格式以匹配ArticleItem接口
          const formattedArticles: ArticleItem[] = data.map((article: any) => ({
            _id: article._id,
            title: article.title,
            desc: article.desc || (article.content ? article.content.substring(0, 150) + '...' : ''),
            content: article.content,
            author: {
              username: article.author?.username || '匿名用户',
              avatar: article.author?.avatar || 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png'
            },
            views: article.views || 0,
            likeCount: article.likeCount || 0,
            coverImage: article.coverImage || '',
            tags: article.tags || [],
            publishTime: article.publishTime || new Date(article.createdAt || Date.now()).toISOString().split('T')[0]
          }));
          
          setCollectedArticles(formattedArticles);
          // 更新收藏集数量
          if (userData) {
            setUserData(prev => prev ? {
              ...prev,
              stats: {
                ...prev.stats,
                collections: formattedArticles.length
              }
            } : null);
          }
        } else {
          // 如果data不是数组，使用空数组
          setCollectedArticles([]);
          // 更新收藏集数量为0
          if (userData) {
            setUserData(prev => prev ? {
              ...prev,
              stats: {
                ...prev.stats,
                collections: 0
              }
            } : null);
          }
        }
      } catch (apiError) {
        console.log('获取收藏文章API调用失败，使用fallback方案');
        // 由于后端API不存在或出错，使用空数组作为fallback
        setCollectedArticles([]);
        // 更新收藏集数量为0
        if (userData) {
          setUserData(prev => prev ? {
            ...prev,
            stats: {
              ...prev.stats,
              collections: 0
            }
          } : null);
        }
      }
    } catch (error) {
      message.error('获取收藏文章失败');
      console.error('获取收藏文章失败:', error);
      // 确保即使外层catch也能设置空数组
      setCollectedArticles([]);
      // 更新收藏集数量为0
      if (userData) {
        setUserData(prev => prev ? {
          ...prev,
          stats: {
            ...prev.stats,
            collections: 0
          }
        } : null);
      }
    } finally {
      setCollectedArticlesLoading(false);
    }
  };

  // 获取用户关注的用户列表
  const fetchFollowingUsers = async () => {
    try {
      setFollowingUsersLoading(true);
      // 尝试使用API获取数据，如果失败则使用fallback
      try {
        const data = await authService.getFollowingUsers();
        
        // 检查data是否为数组
        if (Array.isArray(data)) {
          // 转换数据格式以匹配FollowingUser接口
          const formattedUsers: FollowingUser[] = data.map((user: any) => ({
            _id: user._id,
            username: user.username || '匿名用户',
            avatar: user.avatar || 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png',
            bio: user.bio || '',
            isVerified: user.isVerified || false,
            createdAt: user.createdAt || new Date().toISOString()
          }));
          
          setFollowingUsers(formattedUsers);
        } else {
          // 如果data不是数组，使用空数组
          setFollowingUsers([]);
        }
      } catch (apiError) {
        console.log('获取关注用户API调用失败，使用fallback方案');
        // 由于后端API不存在或出错，使用空数组作为fallback
        setFollowingUsers([]);
      }
    } catch (error) {
      message.error('获取关注用户失败');
      console.error('获取关注用户失败:', error);
      // 确保即使外层catch也能设置空数组
      setFollowingUsers([]);
    } finally {
      setFollowingUsersLoading(false);
    }
  };

  // 获取用户自己的评论
  const fetchMyComments = async () => {
    try {
      setMyCommentsLoading(true);
      // 尝试使用API获取数据，如果失败则使用fallback
      try {
        const data = await commentsService.getMyComments();
        
        // 检查data是否为数组
        if (Array.isArray(data)) {
          // 转换数据格式以匹配CommentItem接口
          const formattedComments: CommentItem[] = data.map((comment: any) => ({
            _id: comment._id,
            content: comment.content || '',
            articleId: comment.articleId || '',
            articleTitle: comment.articleTitle || '未知文章',
            createdAt: comment.createdAt || new Date().toISOString(),
            articleAuthor: comment.articleAuthor ? {
              username: comment.articleAuthor.username || '匿名用户',
              avatar: comment.articleAuthor.avatar || 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png'
            } : undefined
          }));
          
          setMyComments(formattedComments);
        } else {
          // 如果data不是数组，使用空数组
          setMyComments([]);
        }
      } catch (apiError) {
        console.log('获取用户评论API调用失败，使用fallback方案');
        // 由于后端API不存在或出错，使用空数组作为fallback
        setMyComments([]);
      }
    } catch (error) {
      message.error('获取用户评论失败');
      console.error('获取用户评论失败:', error);
      // 确保即使外层catch也能设置空数组
      setMyComments([]);
    } finally {
      setMyCommentsLoading(false);
    }
  };
  
  // 处理文章点击
  const handleArticleClick = (id: string) => {
    window.location.href = `/article/${id}`;
  };

  // 处理头像点击
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  // 处理文件选择
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 简单验证文件类型和大小
    if (!file.type.startsWith('image/')) {
      message.error('请选择图片文件');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      message.error('图片大小不能超过5MB');
      return;
    }

    try {
      const hideLoading = message.loading('上传中...', 0);
      const newAvatarUrl = await authService.uploadAvatar(file);
      
      setUserData(prev => prev ? {...prev, avatar: newAvatarUrl} : prev);
      // 确保user不为null且包含必需的属性
      if (user && user.id && user.username) {
        updateUser({ ...user, avatar: newAvatarUrl });
      } else {
        console.error('无法更新用户头像：用户信息不完整');
      }
      message.success('头像上传成功');
      hideLoading();
    } catch (error) {
      message.error('头像上传失败');
      console.error('头像上传失败:', error);
    }

    // 清空input值，允许重复选择同一文件
    e.target.value = '';
  };

  // 处理用户名保存
  const handleUsernameSave = async () => {
    if (newUsername.trim() && userData && newUsername !== userData.username) {
      try {
        const result = await authService.updateUsername(newUsername);
        if (result.success) {
          setIsEditingUsername(false);
          setUserData(prev => prev ? {...prev, username: newUsername} : prev);
          message.success('用户名更新成功');
        }
      } catch (error) {
        console.error('更新用户名失败:', error);
        message.error('用户名更新失败，请重试');
      }
    } else {
      setIsEditingUsername(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>加载中...</div>;
  }

  if (!userData) {
    return <div className={styles.error}>无法加载用户信息</div>;
  }

  return (
    <div className={styles.Page}>
      {/* 内容区 */}
      <div className={styles.contentArea}>
        <div className={styles.profilePage}>
          {/* 返回首页按钮 */}
          <div className={styles.backButton}>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/')}
              type="text"
            >
              返回首页
            </Button>
          </div>
          {/* 顶部信息区域 */}
          <div className={styles.topSection}>
            <div className={styles.avatarWrapper} onClick={handleAvatarClick}>
              <Avatar src={userData.avatar} size={80} className={styles.avatar} />
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
            <div className={styles.userInfo}>
              {isEditingUsername ? (
                <div className={styles.usernameEditContainer}>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    onBlur={handleUsernameSave}
                    onKeyPress={(e) => e.key === 'Enter' && handleUsernameSave()}
                    autoFocus
                    className={styles.usernameInput}
                  />
                </div>
              ) : (
                <h2
                  className={styles.username}
                  onClick={() => setIsEditingUsername(true)}
                >
                  {userData.username}
                </h2>
              )}
              <div className={styles.bio}>
                {userData.bioItems.map((item, index) => (
                  <p key={index}>{item}</p>
                ))}
              </div>
              <Button type="primary" className={styles.settingBtn}>
                设置
              </Button>
            </div>
          </div>

          {/* 徽章区域 */}
          <div className={styles.badgeSection}>
            <span>获得徽章</span>
            <div className={styles.badgeList}>
              {/* 这里可以动态渲染徽章，暂时放一个示例 */}
              {Array.from({ length: userData.stats.posts }).map((_, i) => (
                <span key={i} className={styles.badge}>{i + 1}</span>
              ))}
            </div>
          </div>

          {/* 标签栏区域 */}
          <Tabs 
            className={styles.tabs}
            items={[
              {
                key: '1',
                label: '动态',
                children: (
                  <div className={styles.emptyState}>
                    <img
                      src="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                      alt="empty"
                      className={styles.emptyImg}
                    />
                    <p>这里什么都没有</p>
                  </div>
                ),
              },
              {
                key: '2',
                label: `我的文章 ${userArticles.length}`,
                children: (
                  <div className={articleListStyles.articleContainer}>
                    <ArticleList
                      articles={userArticles}
                      loading={userArticlesLoading}
                      onArticleClick={handleArticleClick}
                      emptyText="暂无文章内容"
                      showAction={true}
                      showDeleteButton={false}
                      showEditButton={false}
                      showViewButton={false}
                    />
                  </div>
                ),
              },
              {
                key: '3',
                label: `我的收藏 ${collectedArticles.length}`,
                children: (
                  <div className={articleListStyles.articleContainer}>
                    <ArticleList
                      articles={collectedArticles}
                      loading={collectedArticlesLoading}
                      onArticleClick={handleArticleClick}
                      emptyText="暂无收藏内容"
                      showAction={true}
                      showDeleteButton={false}
                      showEditButton={false}
                      showViewButton={false}
                    />
                  </div>
                ),
              },
              {
                key: '4',
                label: `我的关注 ${followingUsers.length}`,
                children: (
                  <div className={styles.followingContainer}>
                    {followingUsersLoading ? (
                      <div className={styles.loadingState}>
                        <Spin size="large" />
                        <p>加载中...</p>
                      </div>
                    ) : followingUsers.length > 0 ? (
                      <div className={styles.followingList}>
                        {followingUsers.map((user) => (
                          <div key={user._id} className={styles.followingItem}>
                            <Avatar 
                              src={user.avatar} 
                              size={48} 
                              className={styles.followingAvatar}
                              onClick={() => window.location.href = `/user/${user._id}`}
                            />
                            <div className={styles.followingInfo}>
                              <div className={styles.followingUsername}>
                                <span>{user.username}</span>
                                {user.isVerified && (
                                  <span className={styles.verifiedBadge}>✓</span>
                                )}
                              </div>
                              <div className={styles.followingBio}>
                                {user.bio || '这个人很懒，什么都没有写'}
                              </div>
                              <div className={styles.followingMeta}>
                                加入于 {new Date(user.createdAt).toLocaleDateString('zh-CN')}
                              </div>
                            </div>
                            <Button 
                              type="default" 
                              size="small"
                              className={styles.followingAction}
                              onClick={() => window.location.href = `/user/${user._id}`}
                            >
                              查看主页
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className={styles.emptyState}>
                        <img
                          src="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                          alt="empty"
                          className={styles.emptyImg}
                        />
                        <p>暂无关注用户</p>
                      </div>
                    )}
                  </div>
                ),
              },
              {
                key: '5',
                label: `我的点赞 ${likedArticles.length}`,
                children: (
                  <div className={articleListStyles.articleContainer}>
                    <ArticleList
                      articles={likedArticles}
                      loading={likedArticlesLoading}
                      onArticleClick={handleArticleClick}
                      emptyText="暂无点赞内容"
                      showAction={true}
                      showDeleteButton={false}
                      showEditButton={false}
                      showViewButton={false}
                    />
                  </div>
                ),
              },
              {
                key: '6',
                label: `我的评论 ${myComments.length}`,
                children: (
                  <div className={styles.commentsContainer}>
                    {myCommentsLoading ? (
                      <div className={styles.loadingState}>
                        <Spin size="large" />
                        <p>加载中...</p>
                      </div>
                    ) : myComments.length > 0 ? (
                      <div className={styles.commentsList}>
                        {myComments.map((comment) => (
                          <div key={comment._id} className={styles.commentItem}>
                            <div className={styles.commentContent}>
                              {comment.content}
                            </div>
                            <div className={styles.commentArticleInfo}>
                              <span className={styles.commentTime}>
                                {new Date(comment.createdAt).toLocaleString('zh-CN')}
                              </span>
                              <span className={styles.commentSeparator}>·</span>
                              <a 
                                href={`/article/${comment.articleId}`}
                                className={styles.commentArticleLink}
                                onClick={(e) => {
                                  e.preventDefault();
                                  window.location.href = `/article/${comment.articleId}`;
                                }}
                              >
                                查看文章：{comment.articleTitle}
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className={styles.emptyState}>
                        <img
                          src="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                          alt="empty"
                          className={styles.emptyImg}
                        />
                        <p>暂无评论内容</p>
                      </div>
                    )}
                  </div>
                ),
              },
            ]}
          />
        </div>
      </div>

      {/* 侧边栏 */}
      <div className={styles.sidebar}>
        <div className={styles.statsSide}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>关注了</span>
            <span className={styles.statValue}>{userData.stats.following}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>关注者</span>
            <span className={styles.statValue}>{userData.stats.followers}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>收藏集</span>
            <span className={styles.statValue}>{userData.stats.collections}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>加入于</span>
            <span className={styles.statValue}>
              {new Date(userData.joinDate).toLocaleString('zh-CN', {
                timeZone: 'Asia/Shanghai',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              }).replace(/\//g, '-')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;