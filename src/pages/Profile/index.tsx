import React from 'react';
import { Avatar, Button, Tabs, message } from 'antd';
import { useEffect, useState, useRef } from 'react';
import { useUser } from '../../contexts/UserContext';
import authService from '../../services/auth';
import styles from './index.module.scss';

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

const { TabPane } = Tabs;

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useUser();
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
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
          bioItems: ['+ 你从事什么职业？', '+ 你有哪些爱好？']
        });
      } catch (error) {
        message.error('获取用户信息失败');
        console.error('获取用户信息失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

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
      updateUser({ ...user, avatar: newAvatarUrl });
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
          <Tabs className={styles.tabs}>
            <TabPane tab="动态" key="1">
              <div className={styles.emptyState}>
                <img
                  src="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                  alt="empty"
                  className={styles.emptyImg}
                />
                <p>这里什么都没有</p>
              </div>
            </TabPane>
            <TabPane tab="文章" key="2">
              <div className={styles.emptyState}>
                <p>暂无文章内容</p>
              </div>
            </TabPane>
            <TabPane tab="专栏" key="3">
              <div className={styles.emptyState}>
                <p>暂无专栏内容</p>
              </div>
            </TabPane>
            <TabPane tab="沸点" key="4">
              <div className={styles.emptyState}>
                <p>暂无沸点内容</p>
              </div>
            </TabPane>
            <TabPane tab="收藏集" key="5">
              <div className={styles.emptyState}>
                <p>可查看已收藏内容</p>
              </div>
            </TabPane>
            <TabPane tab="关注" key="6">
              <div className={styles.emptyState}>
                <p>暂无关注内容</p>
              </div>
            </TabPane>
            <TabPane tab="作品" key="7">
              <div className={styles.emptyState}>
                <p>暂无作品内容</p>
              </div>
            </TabPane>
            <TabPane tab={`赞 ${userData.stats.likes}`} key="8">
              <div className={styles.emptyState}>
                <p>暂无点赞内容</p>
              </div>
            </TabPane>
          </Tabs>
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
            <span className={styles.statLabel}>关注标签</span>
            <span className={styles.statValue}>{userData.stats.tags}</span>
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